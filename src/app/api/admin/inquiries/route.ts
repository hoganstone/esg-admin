import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireStaff() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  return ['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(role ?? '') ? session : null;
}

export async function GET() {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(inquiries);
}
