import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

const newUsers = [
  {
    name: '系統管理員',
    email: 'manager@esg.com',
    password: 'Admin@2026',
    role: 'ADMIN' as const,
  },
  {
    name: '內容編輯員',
    email: 'editor@esg.com',
    password: 'Editor@2026',
    role: 'EDITOR' as const,
  },
  {
    name: '一般用戶',
    email: 'user@esg.com',
    password: 'User@2026',
    role: 'USER' as const,
  },
];

async function main() {
  console.log('Seeding users...\n');
  for (const u of newUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`⚠️  已存在，略過：${u.email} (${existing.role})`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 12);
    const created = await prisma.user.create({
      data: { name: u.name, email: u.email, password: hashed, role: u.role },
    });
    console.log(`✅ 新增：${created.name} <${created.email}> 角色=${created.role}  密碼=${u.password}`);
  }
  console.log('\n完成！');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
