import { NextRequest, NextResponse } from 'next/server';

type TossPaymentConfirmResponse = {
  orderId: string;
  paymentKey: string;
  orderName: string;
  approvedAt: string;
  method: string;
  totalAmount: number;
};

type TossErrorResponse = {
  message?: string;
  code?: string;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const paymentKey = searchParams.get('paymentKey');
  const amount = searchParams.get('amount');

  if (!orderId || !paymentKey || !amount) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const secretKey = process.env.NEXT_PUBLIC_TOSS_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_TOSS_SECRET_KEY in env' }, { status: 500 });
  }

  const url = 'https://api.tosspayments.com/v1/payments/confirm';
  const basicToken = Buffer.from(`${secretKey}:`, 'utf-8').toString('base64');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        paymentKey,
        amount: Number(amount),
      }),
    });

    const data = (await response.json()) as TossPaymentConfirmResponse | TossErrorResponse;

    if (!response.ok) {
      console.error('Toss confirm error response:', data);
      return NextResponse.json(
        { error: (data as TossErrorResponse).message || 'Payment confirmation failed' },
        { status: response.status },
      );
    }

    // TODO: DB 처리
    const baseUrl = new URL(req.url).origin;
    return NextResponse.redirect(`${baseUrl}/payment-complete/toss?orderId=${orderId}`);
  } catch (error) {
    console.error('Toss Payments confirm error:', error);
    return NextResponse.json({ error: 'Unexpected error during payment confirmation' }, { status: 500 });
  }
}