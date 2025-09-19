
### API 라우트 구조
- **1**: Next.js App Router에서 404 오류 발생
- **2**: API 라우트 파일명이 `confirm.ts`로 되어 있음
- **3**: `route.ts`로 파일명 변경 및 폴더 구조 수정
- **최종 구조**: 
  - `src/app/api/toss-payment/confirm/route.ts`
  - `src/app/api/naver-payment/confirm/route.ts`

### Next.js 15 호환성
- **문제**: `searchParams` 사용 시 동기적 접근 오류
- **해결**: `searchParams`를 `await`하여 비동기 처리

### 네이버페이 SDK 통합
- **문제**: 복잡한 SDK 로딩 및 팝업 처리
- **해결**: 컴포넌트 분리 및 코드 단순화

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                           # 메인 페이지 (결제 버튼들)
│   ├── api/
│   │   ├── toss-payment/
│   │   │   └── confirm/
│   │   │       └── route.ts               # 토스 결제 확인 API
│   │   └── naver-payment/
│   │       └── confirm/
│   │           └── route.ts               # 네이버페이 결제 확인 API
│   └── payment-complete/
│       ├── toss/
│       │   └── page.tsx                   # 토스 결제 완료 페이지
│       └── naver/
│           └── page.tsx                   # 네이버페이 결제 완료 페이지
├── components/
│   ├── TossPaymentButton.tsx              # 토스 결제 버튼 컴포넌트
│   └── NaverPaymentButton.tsx             # 네이버페이 결제 버튼 컴포넌트
└── types/
    ├── toss-payment.interface.ts          # 토스 타입 정의
    └── naver-payment.interface.ts         # 네이버페이 타입 정의
```

## 핵심 코드 리뷰

### 1. 메인 페이지 (`src/app/page.tsx`)

```tsx
'use client'; // Client Component로 설정

import TossPaymentButton from '../components/TossPaymentButton';
import NaverPaymentButton from '../components/NaverPaymentButton';

const page = () => {
  return (
    <div className='flex flex-col items-start gap-[10px] p-[30px]'>
      <TossPaymentButton />
      <NaverPaymentButton />
      <button className="bg-gray-500">계좌이체</button>
    </div>
  );
};
```

### 2. 토스 페이먼트 버튼 (`src/components/TossPaymentButton.tsx`)

```tsx
const tossClick = useCallback(async () => {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  const tossPayments = await loadTossPayments(clientKey);
  
  await tossPayments.requestPayment('카드', {
    amount: 5000,
    orderId: 'test-' + new Date().getTime(),
    orderName: '테스트 제품',
    successUrl: `${window.location.origin}/api/toss-payment/confirm`,
    failUrl: `${window.location.origin}/api/toss-payment/fail`,
  });
}, []);
```

### 3. 네이버페이 버튼 (`src/components/NaverPaymentButton.tsx`)

```tsx
const initializeNaverPay = () => {
  if (window.Naver && window.Naver.Pay) {
    payInstance.current = window.Naver.Pay.create({
      mode: 'development',
      clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID,
      chainId: process.env.NEXT_PUBLIC_NAVER_CHAIN_ID,
      openType: 'popup',
      onAuthorize: function (oData: any) {
        if (oData.resultCode === 'Success' && oData.paymentId) {
          const confirmUrl = `${window.location.origin}/api/naver-payment/confirm`;
          const params = new URLSearchParams({
            paymentId: oData.paymentId,
            resultCode: oData.resultCode,
          });
          
          const targetWindow = window.opener || window;
          targetWindow.location.href = `${confirmUrl}?${params.toString()}`;
        }
      },
    });
  }
};
```

**Key Point**
- SDK 동적 로딩 및 초기화
- 팝업 결제 처리
- 성공 시 API 승인 플로우

### 4. 토스 결제 확인 API (`src/app/api/toss-payment/confirm/route.ts`)

```tsx
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const paymentKey = searchParams.get('paymentKey');
  const amount = searchParams.get('amount');

  // 토스 페이먼트 서버로 결제 확인 요청
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId, paymentKey, amount: Number(amount) }),
  });

  // 성공 시 완료 페이지로 리다이렉트
  const baseUrl = new URL(req.url).origin;
  return NextResponse.redirect(`${baseUrl}/payment-complete/toss?orderId=${orderId}`);
}
```

**Key Point**
- GET 요청으로 파라미터 수신
- POST 요청으로 결제 확인
- 절대 URL 리다이렉트

### 5. 네이버페이 결제 확인 API (`src/app/api/naver-payment/confirm/route.ts`)

```tsx
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('paymentId');
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
      'X-NaverPay-Chain-Id': chainId,
      'X-NaverPay-Idempotency-Key': `${paymentId}-${Date.now()}`,
    },
    body: new URLSearchParams({ paymentId }),
  });

  // 성공 시 완료 페이지로 리다이렉트
  const baseUrl = new URL(req.url).origin;
  return NextResponse.redirect(`${baseUrl}/payment-complete/naver?paymentId=${paymentId}`);
}
```

**Key Point**
- 멱등성 키 지원
- 네이버페이 전용 헤더 사용
- form-urlencoded 바디 형식

### 6. 결제 완료 페이지들

#### 토스 페이지 (`src/app/payment-complete/toss/page.tsx`)
```tsx
const paymentComplete = async ({ 
  searchParams 
}: { 
  searchParams: Promise<{ orderId: string }> 
}) => {
  const params = await searchParams; // Next.js 15 요구사항
  
  const tossPayments: Payment = await fetch(
    `https://api.tosspayments.com/v1/payments/orders/${params.orderId}`,
    {
      headers: {
        Authorization: `Basic ${tossBasicToken}`,
        'Content-Type': 'application/json',
      },
    }
  ).then((res) => res.json());

  return (
    <div>
      <h1>토스 결제가 완료되었습니다.</h1>
      <ul>
        <li>결제 ID: {tossPayments.paymentKey}</li>
        <li>주문번호: {tossPayments.orderId}</li>
        <li>결제 금액: {tossPayments.totalAmount}</li>
      </ul>
    </div>
  );
};
```

#### 네이버페이 페이지 (`src/app/payment-complete/naver/page.tsx`)
```tsx
const paymentComplete = async ({ searchParams }: PaymentCompleteProps) => {
  const params = await searchParams;
  const paymentHistory = await fetchNaverPaymentHistory(params.paymentId);
  const paymentDetails = paymentHistory?.body?.list?.[0];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Header />
      <PaymentSummary paymentId={params.paymentId} paymentDetails={paymentDetails} />
    </div>
  );
};
```

**Key Point**
- 서버 컴포넌트에서 직접 API 호출

## 환경 변수 설정

```env
# 토스 페이먼트
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
NEXT_PUBLIC_TOSS_SECRET_KEY=your_toss_secret_key

# 네이버페이
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
NEXT_PUBLIC_NAVER_CLIENT_SECRET=your_naver_client_secret
NEXT_PUBLIC_NAVER_CHAIN_ID=your_naver_chain_id
NEXT_PUBLIC_NAVER_PARTNER_ID=your_naver_partner_id
```

## 테스트 결과

### **성공한 기능들:**

#### 토스 페이먼트
- 카드 결제 요청
- 토스 페이먼트 팝업 표시
- 결제 확인 API 호출
- 완료 페이지 리다이렉트
- 결제 상세 정보 표시

#### 네이버페이
- 네이버페이 팝업 결제
- SDK 동적 로딩
- 결제 승인 API 호출
- 결제 내역 조회 API
- 컴포넌트 기반 UI

## 추후 개선 사항

- [ ] 결제 실패 처리 로직 구현
- [ ] 데이터베이스 연동 (결제 내역 저장)
- [ ] 결제 취소 기능
- [ ] 에러 페이지 개선
- [ ] 결제 테스트 자동화
- [ ] 보안 강화 (서버사이드 검증)
- [ ] 테스트 API -> 실서버 API