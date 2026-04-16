import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().optional(),
  coverImage: z.string().nullable().optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
});

async function requireStaff() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  return ['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(role ?? '') ? session : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const existing = await prisma.newsArticle.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.published === true && !existing.publishedAt) data.publishedAt = new Date();
  if (parsed.data.published === false) data.publishedAt = null;
  const updated = await prisma.newsArticle.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.newsArticle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
