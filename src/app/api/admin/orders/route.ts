import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  return (role === 'ADMIN' || role === 'SUPER_ADMIN') ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json(orders);
}
