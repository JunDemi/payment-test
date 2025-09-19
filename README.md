### Next.js 15 호환성 문제
- **문제**: `searchParams` 사용 시 동기적 접근 오류
- **해결**: `searchParams`를 `await`하여 비동기 처리

### 구조

```
src/
├── app/
│   ├── page.tsx                           # 메인 페이지 (결제 버튼)
│   ├── api/
│   │   └── toss-payment/
│   │       └── confirm/
│   │           └── route.ts               # 결제 확인 API
│   └── payment-complete/
│       └── toss/
│           └── page.tsx                   # 결제 완료 페이지
└── types/
    └── toss-payment.interface.ts          # 타입 정의
```

### 1. 메인 페이지 (`src/app/page.tsx`)

```tsx
'use client'; // Client Component로 설정

import { loadTossPayments, TossPaymentsInstance } from '@tosspayments/payment-sdk';
import { useCallback } from 'react';

const tossClick = useCallback(async () => {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  
  const tossPayments = await loadTossPayments(clientKey);
  
  await tossPayments.requestPayment('카드', {
    amount: 5000,
    orderId: 'test-order-id-0001',
    orderName: '0001',
    successUrl: `${window.location.origin}/api/toss-payment/confirm`,
    failUrl: `${window.location.origin}/api/toss-payment/fail`,
  });
}, []);
```

**Key Point**
- `'use client'` 지시어로 브라우저 API 사용 가능
- `useCallback`으로 함수 메모이제이션
- 환경 변수를 통한 보안 키 관리
- 동적 URL 생성으로 다양한 환경 대응

### 2. 결제 확인 API (`src/app/api/toss-payment/confirm/route.ts`)

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
- GET 요청으로 토스에서 전달받은 파라미터 처리
- 내부적으로 POST 요청으로 결제 확인
- 절대 URL을 사용한 안전한 리다이렉트
- 적절한 에러 핸들링

### 3. 결제 완료 페이지 (`src/app/payment-complete/toss/page.tsx`)

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
      <h1>결제가 완료되었습니다.</h1>
      {/* 결제 정보 표시 */}
    </div>
  );
};
```

**Key Point**
- Next.js 15 호환성을 위한 `searchParams` await 처리
- 서버 컴포넌트에서 직접 API 호출
- 결제 상세 정보 조회 및 표시

## 환경 변수 설정

```env
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_client_key
NEXT_PUBLIC_TOSS_SECRET_KEY=your_secret_key
```

## 테스트 결과

**성공한 기능들:**
- 카드 결제 요청
- 토스 페이먼트 위젯
- 결제 확인 API 호출
- 완료 페이지 리다이렉트
- 결제 상세 정보 표시