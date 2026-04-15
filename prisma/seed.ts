import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123456', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@esg.com' },
    update: {},
    create: {
      email: 'admin@esg.com',
      name: 'ESG管理員',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ 管理員帳號建立：', admin.email);

  // Seed Services
  const services = [
    { title: '環境管理', subtitle: 'Environmental', description: '協助企業建立環境管理系統，降低碳排放，實現綠色轉型。', icon: 'Leaf', order: 1 },
    { title: '社會責任', subtitle: 'Social', description: '關注員工福祉、供應鏈管理與社區參與，創造社會價值。', icon: 'Users', order: 2 },
    { title: '公司治理', subtitle: 'Governance', description: '建立透明健全的治理架構，強化董事會職能與風險管控。', icon: 'Building2', order: 3 },
    { title: '永續創新', subtitle: 'Innovation', description: '運用科技創新推動永續解決方案，開創綠色商業模式。', icon: 'Lightbulb', order: 4 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.title },
      update: {},
      create: service,
    });
  }

  console.log('✅ 服務項目資料建立完成');

  // Seed sample projects
  await prisma.project.createMany({
    skipDuplicates: true,
    data: [
      { title: '台積電碳中和計畫', category: '環境管理', description: '協助半導體龍頭達成2030碳中和目標', tags: ['碳盤查', '能源管理', 'RE100'], year: '2023', featured: true },
      { title: '金融業ESG揭露計畫', category: '公司治理', description: 'GRI準則符合性評估與永續報告書撰寫', tags: ['GRI', 'SASB', '永續報告'], year: '2023', featured: true },
      { title: '供應鏈社會責任稽核', category: '社會責任', description: '跨國企業供應商社會責任管理體系建立', tags: ['供應鏈', 'SA8000', '勞工人權'], year: '2024', featured: false },
    ],
  });

  console.log('✅ 專案案例資料建立完成');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
