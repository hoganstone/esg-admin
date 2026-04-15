import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const newPassword = process.argv[2];
  const email = process.argv[3] ?? 'admin@esg.com';

  if (!newPassword) {
    console.error('用法: npx tsx scripts/change-password.ts <新密碼> [email]');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });
  console.log(`✅ 密碼已更新 - 帳號：${user.email}`);
}

main()
  .catch((e) => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
