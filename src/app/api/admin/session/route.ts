import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: Create login record
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 400 });

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = req.headers.get('user-agent') || undefined;

  // Update lastLoginAt on user
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  const record = await prisma.loginRecord.create({
    data: { userId, ipAddress: ip, userAgent },
  });

  return NextResponse.json({ id: record.id });
}

// PATCH: Update logout record
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const record = await prisma.loginRecord.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

  const now = new Date();
  const onlineSec = Math.floor((now.getTime() - record.loginAt.getTime()) / 1000);

  await prisma.loginRecord.update({
    where: { id },
    data: { logoutAt: now, onlineSec },
  });

  return NextResponse.json({ success: true });
}

// GET: Fetch login records (admin only)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const records = await prisma.loginRecord.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { loginAt: 'desc' },
    take: 200,
    include: {
      user: { select: { name: true, email: true, role: true } },
    },
  });

  return NextResponse.json(records);
}
