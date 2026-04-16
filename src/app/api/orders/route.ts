/**
 * Public order API — called from the frontend (ESG-web).
 * Creates an Order record, then returns ECPay form params.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildECPayForm, ECPAY_PAYMENT_URL } from '@/lib/ecpay';
import { z } from 'zod';

const CORS_ORIGIN = process.env.FRONTEND_URL ?? 'https://esg-frontend-pied.vercel.app';

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

const schema = z.object({
  name:        z.string().min(1),
  email:       z.string().email(),
  phone:       z.string().optional(),
  company:     z.string().optional(),
  serviceName: z.string().min(1),
  price:       z.number().positive(),
  message:     z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const orderNumber = `ESG${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        amount: body.price,
        status: 'PENDING',
        items: [{
          name: body.serviceName,
          price: body.price,
          quantity: 1,
        }],
        metadata: {
          name: body.name,
          email: body.email,
          phone: body.phone ?? '',
          company: body.company ?? '',
          message: body.message ?? '',
        },
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? 'https://esg-admin-backend.vercel.app';
    const ecpayParams = buildECPayForm({
      MerchantTradeNo: orderNumber,
      MerchantTradeDate: '',
      TotalAmount: body.price,
      TradeDesc: 'ESG永續服務',
      ItemName: body.serviceName,
      ReturnURL: `${baseUrl}/api/payment/ecpay/callback`,
      OrderResultURL: `${baseUrl}/payment/result`,
      ClientBackURL: `${CORS_ORIGIN}/`,
    });

    return cors(NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber,
      ecpayUrl: ECPAY_PAYMENT_URL,
      ecpayParams,
    }, { status: 201 }));

  } catch (error) {
    if (error instanceof z.ZodError) {
      return cors(NextResponse.json({ error: error.issues[0]?.message }, { status: 400 }));
    }
    console.error(error);
    return cors(NextResponse.json({ error: 'Server error' }, { status: 500 }));
  }
}
