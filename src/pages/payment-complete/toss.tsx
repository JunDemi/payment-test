import { GetServerSideProps } from 'next';
import { Payment } from '../../types/toss-payment.interface';

interface Props {
  tossPayments: Payment;
  error?: string;
}

export default function TossPaymentComplete({ tossPayments, error }: Props) {
  if (error) {
    return (
      <div>
        <h1>결제 정보를 불러올 수 없습니다</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>토스 결제가 완료되었습니다.</h1>
      <ul>
        <li>결제 ID: {tossPayments.paymentKey}</li>
        <li>결제 상품: {tossPayments.orderName}</li>
        <li>주문번호: {tossPayments.orderId}</li>
        <li>카드사 코드: {tossPayments.card?.issuerCode}</li>
        <li>카드 번호: {tossPayments.card?.number}</li>
        <li>결제 금액: {tossPayments.totalAmount}</li>
        <li>화폐: {tossPayments.currency}</li>
        <li>결제 상태: {tossPayments.status}</li>
        <li>결제 승인 날짜: {tossPayments.approvedAt}</li>
      </ul>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { orderId } = context.query;

  if (!orderId) {
    return {
      props: {
        error: 'Order ID is required',
        tossPayments: null,
      },
    };
  }

  try {
    const tossSecretkey = process.env.NEXT_PUBLIC_TOSS_SECRET_KEY || '';
    const tossBasicToken = Buffer.from(`${tossSecretkey}:`).toString('base64');

    const response = await fetch(`https://api.tosspayments.com/v1/payments/orders/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${tossBasicToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment data');
    }

    const tossPayments = await response.json();

    return {
      props: {
        tossPayments,
      },
    };
  } catch (error) {
    return {
      props: {
        error: 'Failed to load payment information',
        tossPayments: null,
      },
    };
  }
};