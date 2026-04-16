import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

function orderNum(n: number) {
  return `ESG-${String(n).padStart(6, '0')}`;
}

const sampleOrders = [
  {
    orderNumber: orderNum(1001),
    amount: 15000,
    currency: 'TWD',
    status: 'PAID' as const,
    paymentMethod: 'credit_card',
    paymentId: 'ecpay_cc_20260401_001',
    items: [{ id: 'diagnostic', name: 'ESG健診套餐', qty: 1, unitPrice: 15000 }],
    metadata: {
      customerName: '王大明',
      customerEmail: 'wang.daming@greentech.com.tw',
      customerPhone: '02-2345-6789',
      company: '綠色科技股份有限公司',
      note: '希望在Q2前完成健診報告',
      adminNotes: '已指派顧問李小姐負責，5/3 預約初次會議',
    },
    createdAt: new Date('2026-04-01T09:15:00'),
  },
  {
    orderNumber: orderNum(1002),
    amount: 50000,
    currency: 'TWD',
    status: 'PAID' as const,
    paymentMethod: 'atm',
    paymentId: 'ecpay_atm_20260403_002',
    items: [{ id: 'report', name: 'ESG報告書撰寫', qty: 1, unitPrice: 50000 }],
    metadata: {
      customerName: '林美華',
      customerEmail: 'linda.lin@sunrise-corp.com',
      customerPhone: '04-2567-8901',
      company: '日出企業集團',
      note: '需繁中、英文雙語版，並符合GRI準則',
      adminNotes: '已確認需求，預計11月完稿',
    },
    createdAt: new Date('2026-04-03T13:40:00'),
  },
  {
    orderNumber: orderNum(1003),
    amount: 80000,
    currency: 'TWD',
    status: 'PENDING' as const,
    paymentMethod: null,
    paymentId: null,
    items: [{ id: 'carbon', name: '碳盤查認證', qty: 1, unitPrice: 80000 }],
    metadata: {
      customerName: '陳志偉',
      customerEmail: 'chen.chiwei@future-energy.tw',
      customerPhone: '07-3456-7890',
      company: '未來能源開發公司',
      note: '需要範疇一至三完整盤查，目標取得ISO 14064認證',
    },
    createdAt: new Date('2026-04-05T10:20:00'),
  },
  {
    orderNumber: orderNum(1004),
    amount: 120000,
    currency: 'TWD',
    status: 'PAID' as const,
    paymentMethod: 'credit_card',
    paymentId: 'ecpay_cc_20260406_004',
    items: [{ id: 'strategy', name: '永續策略規劃', qty: 1, unitPrice: 120000 }],
    metadata: {
      customerName: '張雅婷',
      customerEmail: 'ya.zhang@foodco.com.tw',
      customerPhone: '03-8765-4321',
      company: '美食家食品股份有限公司',
      note: '希望建立5年永續藍圖，並整合SDGs目標',
      adminNotes: '高優先客戶，董事長親自洽談，已安排專案團隊',
    },
    createdAt: new Date('2026-04-06T15:55:00'),
  },
  {
    orderNumber: orderNum(1005),
    amount: 15000,
    currency: 'TWD',
    status: 'CANCELLED' as const,
    paymentMethod: null,
    paymentId: null,
    items: [{ id: 'diagnostic', name: 'ESG健診套餐', qty: 1, unitPrice: 15000 }],
    metadata: {
      customerName: '黃建國',
      customerEmail: 'kuo.huang@constructplus.com',
      customerPhone: '02-6789-0123',
      company: '建設加股份有限公司',
      note: '暫緩，公司內部預算審核中',
      adminNotes: '客戶主動取消，表示Q3再評估',
    },
    createdAt: new Date('2026-04-07T11:00:00'),
  },
  {
    orderNumber: orderNum(1006),
    amount: 50000,
    currency: 'TWD',
    status: 'FAILED' as const,
    paymentMethod: 'credit_card',
    paymentId: 'ecpay_cc_20260408_006_fail',
    items: [{ id: 'report', name: 'ESG報告書撰寫', qty: 1, unitPrice: 50000 }],
    metadata: {
      customerName: '吳俊德',
      customerEmail: 'wujunde@techsol.com.tw',
      customerPhone: '02-9876-5432',
      company: '科技解方股份有限公司',
      note: '刷卡失敗，已通知客戶重新付款',
      adminNotes: '信用卡授權失敗，請客戶確認卡片限額後重試',
    },
    createdAt: new Date('2026-04-08T14:30:00'),
  },
  {
    orderNumber: orderNum(1007),
    amount: 80000,
    currency: 'TWD',
    status: 'PAID' as const,
    paymentMethod: 'atm',
    paymentId: 'ecpay_atm_20260409_007',
    items: [{ id: 'carbon', name: '碳盤查認證', qty: 1, unitPrice: 80000 }],
    metadata: {
      customerName: '蔡依玲',
      customerEmail: 'tsai.yiling@pharmplus.com',
      customerPhone: '02-2111-3344',
      company: '藥加生技製藥',
      note: '製藥業特殊排放源需特別處理',
      adminNotes: '已確認ATM轉帳到帳，安排盤查啟動會議',
    },
    createdAt: new Date('2026-04-09T09:45:00'),
  },
  {
    orderNumber: orderNum(1008),
    amount: 120000,
    currency: 'TWD',
    status: 'REFUNDED' as const,
    paymentMethod: 'credit_card',
    paymentId: 'ecpay_cc_20260310_008',
    items: [{ id: 'strategy', name: '永續策略規劃', qty: 1, unitPrice: 120000 }],
    metadata: {
      customerName: '許文彬',
      customerEmail: 'hsu.wenbin@logistic99.com.tw',
      customerPhone: '04-7890-1234',
      company: '九九物流股份有限公司',
      note: '因公司組織重整暫停此項目',
      adminNotes: '退款已於4/11處理完畢，金額全額退回，已寄確認信',
    },
    createdAt: new Date('2026-03-10T10:00:00'),
  },
  {
    orderNumber: orderNum(1009),
    amount: 15000,
    currency: 'TWD',
    status: 'PENDING' as const,
    paymentMethod: null,
    paymentId: null,
    items: [{ id: 'diagnostic', name: 'ESG健診套餐', qty: 1, unitPrice: 15000 }],
    metadata: {
      customerName: '鄭淑芬',
      customerEmail: 'cheng.shufen@retailhub.com',
      customerPhone: '06-5432-1098',
      company: '零售樞紐股份有限公司',
      note: '零售業ESG現況不清楚，希望先了解自身狀況',
    },
    createdAt: new Date('2026-04-14T16:10:00'),
  },
  {
    orderNumber: orderNum(1010),
    amount: 50000,
    currency: 'TWD',
    status: 'PAID' as const,
    paymentMethod: 'credit_card',
    paymentId: 'ecpay_cc_20260415_010',
    items: [{ id: 'report', name: 'ESG報告書撰寫', qty: 1, unitPrice: 50000 }],
    metadata: {
      customerName: '趙明仁',
      customerEmail: 'chao.mingren@biocare.com.tw',
      customerPhone: '03-2233-4455',
      company: '生物照護科技股份有限公司',
      note: '生技業首份ESG報告，希望對標國際標準',
      adminNotes: '新客戶，已分配給資深顧問王博士負責',
    },
    createdAt: new Date('2026-04-15T11:25:00'),
  },
];

async function main() {
  console.log('Seeding orders...');
  for (const order of sampleOrders) {
    const created = await prisma.order.create({ data: order });
    console.log(`Created order: ${created.orderNumber} — ${(created.metadata as { customerName?: string })?.customerName} — ${created.status} — NT$${created.amount.toLocaleString()}`);
  }
  console.log('\nDone! 10 orders seeded.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
