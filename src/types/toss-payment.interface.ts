export interface Payment {
  version: string;
  paymentKey: string;
  type: 'NORMAL' | 'BILLING' | 'BRANDPAY';
  orderId: string;
  orderName?: string;
  mId: string;
  currency: string;
  method?: 
    | '카드'
    | '가상계좌'
    | '간편결제'
    | '휴대폰'
    | '계좌이체'
    | '문화상품권'
    | '도서문화상품권'
    | '게임문화상품권'
    | null;
  totalAmount: number;
  balanceAmount: number;
  status:
    | 'READY'
    | 'IN_PROGRESS'
    | 'WAITING_FOR_DEPOSIT'
    | 'DONE'
    | 'CANCELED'
    | 'PARTIAL_CANCELED'
    | 'ABORTED'
    | 'EXPIRED';
  requestedAt: string; // ISO 8601
  approvedAt?: string | null; // ISO 8601
  useEscrow: boolean;
  lastTransactionKey?: string | null;
  suppliedAmount?: number;
  vat?: number;
  cultureExpense?: boolean;
  taxFreeAmount?: number;
  taxExemptionAmount?: number;
  cancels?: Cancel[] | null;
  isPartialCancelable: boolean;
  card?: Card | null;
  virtualAccount?: VirtualAccount | null;
  transfer?: Transfer | null;
  mobilePhone?: MobilePhone | null;
  giftCertificate?: GiftCertificate | null;
  metadata?: Record<string, string> | null;
  receipt?: Receipt | null;
  checkout?: Checkout | null;
  easyPay?: EasyPay | null;
  country?: string;
  failure?: Failure | null;
  cashReceipt?: CashReceipt | null;
  cashReceipts?: CashReceiptHistory[] | null;
  discount?: Discount | null;
}

export interface Cancel {
  cancelAmount: number;
  cancelReason: string;
  taxFreeAmount: number;
  taxExemptionAmount: number;
  refundableAmount: number;
  cardDiscountAmount?: number;
  transferDiscountAmount?: number;
  easyPayDiscountAmount?: number;
  canceledAt: string;
  transactionKey: string;
  receiptKey?: string | null;
  cancelStatus: string;
  cancelRequestId?: string | null;
}

export interface Card {
  amount: number;
  issuerCode: string;
  acquirerCode?: string | null;
  number: string;
  installmentPlanMonths: number;
  approveNo: string;
  useCardPoint: boolean;
  cardType: '신용' | '체크' | '기프트' | '미확인';
  ownerType: '개인' | '법인' | '미확인';
  acquireStatus:
    | 'READY'
    | 'REQUESTED'
    | 'COMPLETED'
    | 'CANCEL_REQUESTED'
    | 'CANCELED';
  isInterestFree: boolean;
  interestPayer?: 'BUYER' | 'CARD_COMPANY' | 'MERCHANT' | null;
}

export interface VirtualAccount {
  accountType: '일반' | '고정';
  accountNumber: string;
  bankCode: string;
  customerName: string;
  depositorName?: string;
  dueDate: string;
  refundStatus: 'NONE' | 'PENDING' | 'FAILED' | 'PARTIAL_FAILED' | 'COMPLETED';
  expired: boolean;
  settlementStatus: 'INCOMPLETED' | 'COMPLETED';
  refundReceiveAccount?: RefundReceiveAccount | null;
}

export interface RefundReceiveAccount {
  bankCode: string;
  accountNumber: string;
  holderName: string;
}

export interface Transfer {
  bankCode: string;
  settlementStatus: 'INCOMPLETED' | 'COMPLETED';
}

export interface MobilePhone {
  customerMobilePhone: string;
  settlementStatus: 'INCOMPLETED' | 'COMPLETED';
  receiptUrl?: string;
}

export interface GiftCertificate {
  approveNo: string;
  settlementStatus: 'INCOMPLETED' | 'COMPLETED';
}

export interface Metadata {
  [key: string]: string;
}

export interface Receipt {
  url: string;
}

export interface Checkout {
  url: string;
}

export interface EasyPay {
  provider: string;
  amount: number;
  discountAmount: number;
}

export interface Failure {
  code: string;
  message: string;
}

export interface CashReceipt {
  type: '소득공제' | '지출증빙';
  receiptKey: string;
  issueNumber: string;
  receiptUrl: string;
  amount: number;
  taxFreeAmount: number;
}

export interface CashReceiptHistory {
  receiptKey: string;
  orderId: string;
  orderName: string;
  type: '소득공제' | '지출증빙';
  issueNumber: string;
  receiptUrl: string;
  businessNumber: string;
  transactionType: 'CONFIRM' | 'CANCEL';
  amount: number;
  taxFreeAmount: number;
  issueStatus: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  failure?: Failure;
  customerIdentityNumber: string;
  requestedAt: string;
}

export interface Discount {
  amount: number;
}
