export interface NaverPayment {
  code: string;
  message?: string;
  body: {
    list: NaverPaymentItem[];
    totalCount: number;
    responseCount: number;
    totalPageCount: number;
    currentPageNumber: number;
  };
}

interface NaverPaymentItem {
  paymentId: string;
  payHistId: string;
  admissionState: string;
  admissionTypeCode: string;
  admissionYmdt: string;
  tradeConfirmYmdt: string;
  totalPayAmount: number;
  applyPayAmount: number;
  primaryPayAmount: number;
  npointPayAmount: number;
  giftCardPayAmount: number;
  discountPayAmount: number;
  taxScopeAmount: number;
  taxExScopeAmount: number;
  environmentDepositAmount: number;
  merchantName: string;
  merchantId: string;
  merchantPayKey: string;
  merchantUserKey: string;
  primaryPayMeans: string;
  cardCorpCode: string;
  cardNo: string;
  cardAuthNo: string;
  cardInstCount: number;
  usedCardPoint: boolean;
  bankCorpCode: string;
  bankAccountNo: string;
  merchantPayTransactionKey?: string;
  productName: string;
  subMerchantInfo?: Object;
  settleInfo: {
    settleCreated: boolean;
    totalSettleAmount: number;
    totalCommissionAmount: number;
    primarySettleAmount: number;
    primaryCommissionAmount: number;
    npointSettleAmount: number;
    npointCommissionAmount: number;
    giftCardSettleAmount: number;
    giftCardCommissionAmount: number;
    discountSettleAmount: number;
    discountCommissionAmount: number;
  };
  merchantExtraParameter: string;
  extraDeduction: boolean;
  useCfmYmdt: string;
  cancelRequester: string;
}
