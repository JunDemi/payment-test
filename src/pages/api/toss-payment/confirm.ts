import { NextApiRequest, NextApiResponse } from 'next';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, paymentKey, amount } = req.query;

  if (!orderId || !paymentKey || !amount) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const secretKey = process.env.NEXT_PUBLIC_TOSS_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({ error: 'Missing NEXT_PUBLIC_TOSS_SECRET_KEY in env' });
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
      return res.status(response.status).json({
        error: (data as TossErrorResponse).message || 'Payment confirmation failed'
      });
    }

    res.redirect(`http://localhost:3001/payment-complete/toss?orderId=${orderId}`);
  } catch (error) {
    console.error('Toss Payments confirm error:', error);
    res.status(500).json({ error: 'Unexpected error during payment confirmation' });
  }
}