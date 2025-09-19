import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('paymentId');
  const resultCode = searchParams.get('resultCode');

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing paymentId parameter' }, { status: 400 });
  }

  if (resultCode !== 'Success') {
    return NextResponse.json({ error: 'Payment was not successful' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET;
  const chainId = process.env.NEXT_PUBLIC_NAVER_CHAIN_ID;
  const partnerId = process.env.NEXT_PUBLIC_NAVER_PARTNER_ID;

  if (!clientId || !clientSecret || !chainId || !partnerId) {
    return NextResponse.json({ 
      error: 'Missing Naver Pay configuration in environment variables' 
    }, { status: 500 });
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
        paymentId: paymentId,
      }),
    });

    const data = (await response.json()) as NaverPaymentConfirmResponse | NaverErrorResponse;

    if (!response.ok) {
      console.error('Naver Pay confirm error response:', data);
      return NextResponse.json(
        { error: (data as NaverErrorResponse).message || 'Payment confirmation failed' },
        { status: response.status },
      );
    }

    // TODO: DB 처리 - 결제 정보 저장
    console.log('Naver Pay confirmation successful:', data);

    // 성공 시 완료 페이지로 리다이렉트
    const baseUrl = new URL(req.url).origin;
    return NextResponse.redirect(`${baseUrl}/payment-complete/naver?paymentId=${paymentId}&status=confirmed`);
  } catch (error) {
    console.error('Naver Pay confirm error:', error);
    return NextResponse.json({ 
      error: 'Unexpected error during payment confirmation' 
    }, { status: 500 });
  }
}