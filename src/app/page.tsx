'use client';

import { loadTossPayments, TossPaymentsInstance } from '@tosspayments/payment-sdk';
import { useCallback } from 'react';

const page = () => {
  const buttonClassName = 'w-[200px] h-[40px] text-white rounded cursor-pointer';

  const tossClick = useCallback(async () => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey) {
      console.error('Toss Payment Client Key is not defined');
      return;
    }

    let tossPayments: TossPaymentsInstance;

    try {
      tossPayments = await loadTossPayments(clientKey);
    } catch (error) {
      console.error('Failed to load Toss Payments SDK:', error);
      return;
    }

    // "카드"는 변경 가능합니다.
    try {
      await tossPayments.requestPayment('카드', {
        amount: 5000,
        orderId: 'test-' + new Date().getTime(),
        orderName: '테스트 제품',
        successUrl: `${window.location.origin}/api/toss-payment/confirm`,
        failUrl: `${window.location.origin}/api/toss-payment/fail`,
      });
    } catch (error) {
      console.error('Toss Payments request failed:', error);
    }
  }, []);

  return (
    <div className='flex flex-col items-start gap-[10px] p-[30px]'>
      <button className={`${buttonClassName} bg-blue-500`} onClick={() => tossClick()}>카드 결제</button>
      <button className={`${buttonClassName} bg-green-500`}>네이버 페이</button>
      <button className={`${buttonClassName} bg-gray-500`}>계좌이체</button>
    </div>
  );
};

export default page;
