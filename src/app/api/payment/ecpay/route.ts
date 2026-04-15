import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildECPayForm, ECPAY_PAYMENT_URL } from '@/lib/ecpay';
import { z } from 'zod';

const orderSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  })),
  userId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = orderSchema.parse(await req.json());
    const totalAmount = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderNumber = `ESG${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        amount: totalAmount,
        items: body.items,
        userId: body.userId,
        status: 'PENDING',
      },
    });

    const returnURL = `${process.env.NEXTAUTH_URL}/api/payment/ecpay/callback`;
    const itemName = body.items.map(i => `${i.name} x${i.quantity}`).join('#');

    const ecpayParams = buildECPayForm({
      MerchantTradeNo: orderNumber,
      MerchantTradeDate: '',
      TotalAmount: totalAmount,
      TradeDesc: 'ESG永續服務',
      ItemName: itemName,
      ReturnURL: returnURL,
      OrderResultURL: `${process.env.NEXTAUTH_URL}/payment/result`,
      ClientBackURL: `${process.env.NEXTAUTH_URL}/`,
    });

    // Return form data for client-side POST submission
    return NextResponse.json({
      success: true,
      orderId: order.id,
      ecpayUrl: ECPAY_PAYMENT_URL,
      ecpayParams,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
