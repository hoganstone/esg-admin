import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED']),
  notes: z.string().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  return (role === 'ADMIN' || role === 'SUPER_ADMIN') ? session : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: '訂單不存在' }, { status: 404 });

  const updateData: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.notes !== undefined) {
    updateData.metadata = {
      ...(typeof order.metadata === 'object' && order.metadata !== null ? order.metadata : {}),
      adminNotes: parsed.data.notes,
    };
  }

  const updated = await prisma.order.update({ where: { id }, data: updateData });
  return NextResponse.json(updated);
}
