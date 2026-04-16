import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';

async function requireStaff() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  return ['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(role ?? '') ? session : null;
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: '請選擇檔案' }, { status: 400 });

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: '只支援 PDF、JPG、PNG、WebP 格式' }, { status: 400 });
  }

  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) return NextResponse.json({ error: '檔案大小不能超過 20MB' }, { status: 400 });

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const blob = await put(filename, file, { access: 'public' });

  return NextResponse.json({ url: blob.url, size: file.size, name: file.name });
}
