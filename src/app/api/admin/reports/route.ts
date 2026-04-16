import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  fileUrl: z.string().url(),
  fileSize: z.number().int().optional(),
  category: z.string().default('ESG報告書'),
  published: z.boolean().default(true),
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
  const reports = await prisma.report.findMany({ orderBy: { year: 'desc' } });
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const report = await prisma.report.create({ data: parsed.data });
  return NextResponse.json(report, { status: 201 });
}
