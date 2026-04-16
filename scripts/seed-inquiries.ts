import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

const sampleInquiries = [
  {
    name: '王大明',
    email: 'wang.daming@greentech.com.tw',
    phone: '02-2345-6789',
    company: '綠色科技股份有限公司',
    subject: '碳盤查服務諮詢',
    message: '您好，我們公司目前正在評估進行碳盤查的可行性。主要業務涵蓋製造業，員工約500人，想了解碳盤查的流程、費用以及時程規劃。請問能否安排一次初步說明會議？',
    status: 'IN_PROGRESS' as const,
    reply: '感謝您的詢問！我們的碳盤查服務涵蓋範疇一、二、三的完整盤查，符合ISO 14064標準。針對製造業規模的企業，通常需要3-6個月完成全程驗證。我們將安排顧問在本週內與您聯絡，討論詳細需求與報價。',
    repliedAt: new Date('2026-04-10T09:30:00'),
    createdAt: new Date('2026-04-08T14:22:00'),
  },
  {
    name: '林美華',
    email: 'linda.lin@sunrise-corp.com',
    phone: '04-2567-8901',
    company: '日出企業集團',
    subject: 'ESG報告書撰寫',
    message: '我們集團今年首次需要出具ESG報告書，以符合主管機關要求。公司為上市公司，需要符合GRI準則，並有繁中及英文雙語版本。請問貴公司是否有相關經驗，大概的報告書撰寫週期及費用為何？',
    status: 'PENDING' as const,
    reply: null,
    repliedAt: null,
    createdAt: new Date('2026-04-12T10:15:00'),
  },
  {
    name: '陳志偉',
    email: 'chen.chiwei@future-energy.tw',
    phone: '07-3456-7890',
    company: '未來能源開發公司',
    subject: '永續策略規劃',
    message: '本公司為再生能源業者，希望建立5年永續發展藍圖，並將ESG目標納入公司治理架構。目前已有基本的ESG現況評估，希望進一步做整合性策略規劃。請問貴公司提供哪些永續策略規劃服務？',
    status: 'RESOLVED' as const,
    reply: '謝謝您的詢問！我們已完成永續策略規劃方案的說明，並已將完整的5年永續藍圖提案寄送至您的信箱。如有任何疑問，歡迎隨時與我們聯繫。期待未來合作！',
    repliedAt: new Date('2026-04-05T16:45:00'),
    createdAt: new Date('2026-04-02T09:00:00'),
  },
  {
    name: '張雅婷',
    email: 'ya.zhang@foodco.com.tw',
    phone: '03-8765-4321',
    company: '美食家食品股份有限公司',
    subject: '企業永續培訓',
    message: '我們公司管理層希望提升對ESG的認識，計畫為中高階主管安排一個半天的ESG培訓課程，約20-30人。課程希望包含ESG基礎概念、食品業相關永續議題、以及如何將ESG融入日常營運。請問有適合的培訓方案嗎？',
    status: 'PENDING' as const,
    reply: null,
    repliedAt: null,
    createdAt: new Date('2026-04-14T11:30:00'),
  },
  {
    name: '黃建國',
    email: 'kuo.huang@constructplus.com',
    phone: '02-6789-0123',
    company: '建設加股份有限公司',
    subject: 'SDGs目標對接',
    message: '我們是一家中型建設公司，想了解如何將聯合國SDGs目標與公司業務做有意義的連結，特別是在永續建築、社區發展方面。希望能了解如何在年報或CSR報告中呈現SDGs對接成果，以及相關的實作步驟。',
    status: 'CLOSED' as const,
    reply: '感謝您的來信。我們已於上週完成SDGs對接諮詢服務，並提供了詳細的實作建議報告。本案已圓滿結案，如日後有新的需求，歡迎再次與我們聯繫！',
    repliedAt: new Date('2026-03-28T14:00:00'),
    createdAt: new Date('2026-03-20T08:45:00'),
  },
];

async function main() {
  console.log('Seeding inquiries...');
  for (const inquiry of sampleInquiries) {
    const created = await prisma.inquiry.create({ data: inquiry });
    console.log(`Created inquiry: ${created.id} - ${created.name} (${created.subject})`);
  }
  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
