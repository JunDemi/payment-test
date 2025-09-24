import { NextApiRequest, NextApiResponse } from 'next';

type NaverPaymentConfirmResponse = {
  code: string;
  message: string;
  body: {
    paymentId: string;
    detail: {
      paymentId: string;
      merchantPayKey: string;
      merchantId: string;
      totalPayAmount: number;
      primaryPayMeans: string;
      // ... 기타 필드들
    };
  };
};

type NaverErrorResponse = {
  code?: string;
  message?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, resultCode } = req.query;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId parameter' });
  }

  if (resultCode !== 'Success') {
    return res.status(400).json({ error: 'Payment was not successful' });
  }

  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET;
  const chainId = process.env.NEXT_PUBLIC_NAVER_CHAIN_ID;
  const partnerId = process.env.NEXT_PUBLIC_NAVER_PARTNER_ID;

  if (!clientId || !clientSecret || !chainId || !partnerId) {
    return res.status(500).json({ 
      error: 'Missing Naver Pay configuration in environment variables' 
    });
  }

  const apiUrl = `https://dev-pay.paygate.naver.com/naverpay-partner/naverpay/payments/v2.2/apply/payment`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'X-NaverPay-Chain-Id': chainId,
        'X-NaverPay-Idempotency-Key': `${paymentId}-${Date.now()}`, // 멱등성 키
      },
      body: new URLSearchParams({
        paymentId: paymentId as string,
      }),
    });

    const data = (await response.json()) as NaverPaymentConfirmResponse | NaverErrorResponse;

    if (!response.ok) {
      console.error('Naver Pay confirm error response:', data);
      return res.status(response.status).json({
        error: (data as NaverErrorResponse).message || 'Payment confirmation failed'
      });
    }

    // TODO: DB 처리 - 결제 정보 저장
    console.log('Naver Pay confirmation successful:', data);

    // 성공 시 완료 페이지로 리다이렉트

    res.redirect(`http://localhost:3001/payment-complete/naver?paymentId=${paymentId}&status=confirmed`);
  } catch (error) {
    console.error('Naver Pay confirm error:', error);
    res.status(500).json({ 
      error: 'Unexpected error during payment confirmation' 
    });
  }
}