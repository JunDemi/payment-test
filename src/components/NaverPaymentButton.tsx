'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Naver: any;
  }
}

const NaverPaymentButton = () => {
  const payInstance = useRef<any>(null);

  const initializeNaverPay = () => {
    if (window.Naver && window.Naver.Pay) {
      payInstance.current = window.Naver.Pay.create({
        mode: 'development',
        clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || '',
        chainId: process.env.NEXT_PUBLIC_NAVER_CHAIN_ID || '',
        openType: 'popup',
        onAuthorize: function (oData: any) {
          // 성공 시 API를 통한 결제 승인 처리
          if (oData.resultCode === 'Success' && oData.paymentId) {
            const confirmUrl = `${window.location.origin}/api/naver-payment/confirm`;
            const params = new URLSearchParams({
              paymentId: oData.paymentId,
              resultCode: oData.resultCode,
              reserveId: oData.reserveId || ''
            });
            
            const targetWindow = window.opener || window;
            targetWindow.location.href = `${confirmUrl}?${params.toString()}`;
          } else {
            // 실패 시 직접 완료 페이지로
            const returnUrl = `${window.location.origin}/payment-complete/naver`;
            const params = new URLSearchParams({
              resultCode: oData.resultCode,
              resultMessage: oData.resultMessage || '',
              reserveId: oData.reserveId || '',
              paymentId: oData.paymentId || ''
            });
            
            const targetWindow = window.opener || window;
            targetWindow.location.href = `${returnUrl}?${params.toString()}`;
          }
          
          if (window.opener) {
            window.close();
          }
        },
      });
    }
  };

  useEffect(() => {
    const scriptId = 'naverpay-sdk';
    
    if (document.getElementById(scriptId)) {
      // 이미 로드된 경우
      initializeNaverPay();
      return;
    }

    // 스크립트 동적 로드
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://nsp.pay.naver.com/sdk/js/naverpay.min.js';
    script.async = true;
    script.onload = initializeNaverPay;
    document.body.appendChild(script);
  }, []);

  const handleClick = () => {
    if (!payInstance.current) {
      alert('네이버페이 SDK가 아직 로드되지 않았습니다.');
      return;
    }

    payInstance.current.open({
      merchantPayKey: '20250919cHOZZP',
      productName: '맛있는거',
      productCount: 1,
      totalPayAmount: 2200,
      taxScopeAmount: 2200,
      taxExScopeAmount: 0,
      returnUrl: `${window.location.origin}/payment-complete/naver`,
    });
  };

  return (
    <button 
      className="h-[40px] w-[200px] cursor-pointer rounded bg-green-500 text-white" 
      onClick={handleClick}
    >
      네이버 페이
    </button>
  );
};

export default NaverPaymentButton;
