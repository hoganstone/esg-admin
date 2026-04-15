import crypto from 'crypto';

const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID ?? '2000132';
const HASH_KEY = process.env.ECPAY_HASH_KEY ?? '5294y06JbISpM5x9';
const HASH_IV = process.env.ECPAY_HASH_IV ?? 'v77hoKGq4kWxNNIS';
const IS_SANDBOX = process.env.NODE_ENV !== 'production';

export const ECPAY_PAYMENT_URL = IS_SANDBOX
  ? 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
  : 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';

export interface ECPayParams {
  MerchantTradeNo: string;
  MerchantTradeDate: string;
  TotalAmount: number;
  TradeDesc: string;
  ItemName: string;
  ReturnURL: string;
  OrderResultURL?: string;
  ClientBackURL?: string;
}

function generateCheckMacValue(params: Record<string, string | number>): string {
  const sorted = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const raw = `HashKey=${HASH_KEY}&${sorted}&HashIV=${HASH_IV}`;
  const encoded = encodeURIComponent(raw)
    .toLowerCase()
    .replace(/%20/g, '+')
    .replace(/%21/g, '!')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%2a/g, '*');

  return crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase();
}

export function buildECPayForm(params: ECPayParams): Record<string, string> {
  const now = new Date();
  const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const baseParams: Record<string, string | number> = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: params.MerchantTradeNo,
    MerchantTradeDate: formattedDate,
    PaymentType: 'aio',
    TotalAmount: params.TotalAmount,
    TradeDesc: params.TradeDesc,
    ItemName: params.ItemName,
    ReturnURL: params.ReturnURL,
    ChoosePayment: 'ALL',
    EncryptType: 1,
  };

  if (params.OrderResultURL) baseParams.OrderResultURL = params.OrderResultURL;
  if (params.ClientBackURL) baseParams.ClientBackURL = params.ClientBackURL;

  const checkMacValue = generateCheckMacValue(baseParams);

  return {
    ...Object.fromEntries(Object.entries(baseParams).map(([k, v]) => [k, String(v)])),
    CheckMacValue: checkMacValue,
  };
}

export function verifyECPayCallback(params: Record<string, string>): boolean {
  const checkMacValue = params.CheckMacValue;
  const paramsWithoutMac = { ...params };
  delete paramsWithoutMac.CheckMacValue;
  const computed = generateCheckMacValue(paramsWithoutMac);
  return computed === checkMacValue;
}
