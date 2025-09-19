'use client';

import { loadTossPayments, TossPaymentsInstance } from '@tosspayments/payment-sdk';
import { useCallback } from 'react';

const TossPaymentButton = () => {
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
    <button className={`h-[40px] w-[200px] cursor-pointer rounded bg-blue-500 text-white`} onClick={tossClick}>
      간편/카드 결제
    </button>
  );
};

export default TossPaymentButton;
