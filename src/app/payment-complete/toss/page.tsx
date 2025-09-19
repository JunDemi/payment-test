import { Payment } from '../../../../types/toss-payment.interface';

const paymentComplete = async ({ searchParams }: { searchParams: Promise<{ orderId: string }> }) => {
  const params = await searchParams;
  const tossSecretkey = process.env.NEXT_PUBLIC_TOSS_SECRET_KEY || '';
  const tossBasicToken = Buffer.from(`${tossSecretkey}:`).toString('base64');

  const tossPayments: Payment = await fetch(`https://api.tosspayments.com/v1/payments/orders/${params.orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${tossBasicToken}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());

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
};

export default paymentComplete;