import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

const reports = [
  {
    title: '2024 ESG永續報告書',
    year: 2024,
    fileUrl: 'https://www.epa.gov.tw/DisplayFile.aspx?FileId=2B8F4DC4B4A7B8C0',
    fileSize: 8542000,
    category: 'ESG報告書',
    published: true,
  },
  {
    title: '2023 ESG永續報告書',
    year: 2023,
    fileUrl: 'https://www.epa.gov.tw/DisplayFile.aspx?FileId=2B8F4DC4B4A7B8C0',
    fileSize: 7890000,
    category: 'ESG報告書',
    published: true,
  },
  {
    title: '2022 ESG永續報告書',
    year: 2022,
    fileUrl: 'https://www.epa.gov.tw/DisplayFile.aspx?FileId=2B8F4DC4B4A7B8C0',
    fileSize: 7120000,
    category: 'ESG報告書',
    published: true,
  },
  {
    title: '2024 氣候相關財務揭露報告（TCFD）',
    year: 2024,
    fileUrl: 'https://www.epa.gov.tw/DisplayFile.aspx?FileId=2B8F4DC4B4A7B8C0',
    fileSize: 3250000,
    category: '氣候相關財務揭露',
    published: true,
  },
  {
    title: '2023 供應鏈永續管理報告',
    year: 2023,
    fileUrl: 'https://www.epa.gov.tw/DisplayFile.aspx?FileId=2B8F4DC4B4A7B8C0',
    fileSize: 4100000,
    category: '供應鏈報告',
    published: true,
  },
];

async function main() {
  console.log('Seeding reports...');
  for (const r of reports) {
    await prisma.report.create({ data: r });
  }
  console.log(`✅ Created ${reports.length} reports`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
