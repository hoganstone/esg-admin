import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyECPayCallback } from '@/lib/ecpay';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => { params[key] = value.toString(); });

    if (!verifyECPayCallback(params)) {
      return new NextResponse('0|CheckMacValue error', { status: 400 });
    }

    const { MerchantTradeNo, RtnCode } = params;
    const isPaid = RtnCode === '1';

    await prisma.order.update({
      where: { orderNumber: MerchantTradeNo },
      data: {
        status: isPaid ? 'PAID' : 'FAILED',
        paymentId: params.TradeNo,
        metadata: params,
      },
    });

    return new NextResponse('1|OK');
  } catch (error) {
    console.error('ECPay callback error:', error);
    return new NextResponse('0|Error', { status: 500 });
  }
}
