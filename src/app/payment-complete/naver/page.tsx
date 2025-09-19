import { NaverPayment } from '../../../../types/naver-payment.interface';

const paymentComplete = async ({ searchParams }: { searchParams: Promise<{ paymentId: string }> }) => {
  const params = await searchParams;

  let paymentHistory: NaverPayment | null = null;

  // 성공한 결제인 경우에만 상세 정보 조회
  if (params.paymentId) {
    try {
      const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
      const clientSecret = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET;
      const chainId = process.env.NEXT_PUBLIC_NAVER_CHAIN_ID;
      const partnerId = process.env.NEXT_PUBLIC_NAVER_PARTNER_ID;

      if (clientId && clientSecret && chainId && partnerId) {
        const apiUrl = `https://dev-pay.paygate.naver.com/naverpay-partner/naverpay/payments/v2.2/list/history/${params.paymentId}?pageNumber=1&rowsPerPage=50`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
            'X-NaverPay-Chain-Id': chainId,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          paymentHistory = await response.json();
        }
      }
    } catch (error) {
      console.error('Failed to fetch Naver Pay history:', error);
    }
  }

  const paymentDetails = paymentHistory?.body?.list?.[0];

  return (
    <div className='p-6'>
      <h1 className='mb-4 text-2xl font-bold'>네이버페이 결제가 완료되었습니다</h1>

      <ul className='space-y-2'>
        <li>
          <strong>결제 ID:</strong> {params.paymentId}
        </li>
        <li>
          <strong>상점 결제 키:</strong> {paymentDetails?.merchantPayKey}
        </li>
        <li>
          <strong>상품명:</strong> {paymentDetails?.productName}
        </li>
        <li>
          <strong>결제 금액:</strong> {paymentDetails?.totalPayAmount?.toLocaleString()}원
        </li>
        <li>
          <strong>승인 상태:</strong> {paymentDetails?.admissionState}
        </li>
        <li>
          <strong>승인 일시:</strong> {paymentDetails?.admissionYmdt}
        </li>
      </ul>
    </div>
  );
};

export default paymentComplete;
