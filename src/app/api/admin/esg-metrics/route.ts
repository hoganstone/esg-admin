import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  year: z.number().int().min(2000).max(2100),
  category: z.string().min(1),
  label: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  note: z.string().optional(),
});

async function requireStaff() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  return ['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(role ?? '') ? session : null;
}

export async function GET() {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const metrics = await prisma.esgMetric.findMany({ orderBy: [{ year: 'desc' }, { category: 'asc' }] });
  return NextResponse.json(metrics);
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const metric = await prisma.esgMetric.create({ data: parsed.data });
  return NextResponse.json(metric, { status: 201 });
}
