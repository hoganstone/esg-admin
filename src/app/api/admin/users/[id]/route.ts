import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  role: z.enum(['USER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, password, role } = parsed.data;

  // Prevent non-SUPER_ADMIN from editing SUPER_ADMIN
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: '用戶不存在' }, { status: 404 });

  const editorRole = (session.user as { role?: string }).role;
  if (target.role === 'SUPER_ADMIN' && editorRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: '無權限修改超級管理員' }, { status: 403 });
  }

  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (email) {
    const conflict = await prisma.user.findFirst({ where: { email, NOT: { id } } });
    if (conflict) return NextResponse.json({ error: '此 Email 已被使用' }, { status: 409 });
    data.email = email;
  }
  if (password && password.length >= 6) {
    data.password = await bcrypt.hash(password, 12);
  }
  if (role) data.role = role;

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Cannot delete yourself
  const selfId = (session.user as { id?: string }).id;
  if (selfId === id) {
    return NextResponse.json({ error: '無法刪除自己的帳號' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: '用戶不存在' }, { status: 404 });

  const editorRole = (session.user as { role?: string }).role;
  if (target.role === 'SUPER_ADMIN' && editorRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: '無權限刪除超級管理員' }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
