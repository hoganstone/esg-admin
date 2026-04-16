import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

const testimonials = [
  {
    name: '王大明',
    position: '永續長',
    company: '綠色科技股份有限公司',
    content: '與ESG永續團隊合作碳盤查專案，顧問專業且細心，從範疇一到範疇三的盤查流程清晰完整。最終順利取得ISO 14064認證，對公司未來的永續發展奠定了堅實基礎。',
    rating: 5,
    active: true,
  },
  {
    name: '林美華',
    position: 'CSR主任',
    company: '日出企業集團',
    content: '委託撰寫ESG報告書，團隊對GRI準則嫻熟，繁中英文雙語版本品質都很高。三次審稿修訂都能快速回應，讓我們在截止日前順利完成年度報告，董事會非常滿意。',
    rating: 5,
    active: true,
  },
  {
    name: '陳志偉',
    position: '總經理',
    company: '未來能源開發公司',
    content: '永續策略規劃服務非常專業，5年藍圖規劃清楚具體，KPI設計也貼近實際業務需求。顧問團隊對再生能源產業的了解令人印象深刻，強力推薦給有永續轉型需求的企業。',
    rating: 5,
    active: true,
  },
  {
    name: '張雅婷',
    position: '人資暨企業社會責任主管',
    company: '美食家食品股份有限公司',
    content: '參加企業永續培訓課程，講師深入淺出，將複雜的ESG概念轉化為食品業的實際應用案例，同仁反應熱烈。培訓後團隊對ESG的認識大幅提升，實際導入也更有方向。',
    rating: 4,
    active: true,
  },
  {
    name: '黃建國',
    position: '董事長特助',
    company: '建設加股份有限公司',
    content: 'SDGs目標對接服務幫助我們找到了建設業與聯合國永續目標的具體連結點，報告呈現方式也很有說服力。投資人看到報告後對公司永續治理給予正面評價，非常感謝團隊的協助。',
    rating: 5,
    active: true,
  },
  {
    name: '蔡依玲',
    position: '環安衛主任',
    company: '藥加生技製藥',
    content: '製藥業的排放源複雜，ESG永續團隊對特殊製程排放的處理方式非常專業，盤查結果也通過第三方驗證機構審查。整個合作過程溝通順暢，時程掌控良好，給予五星推薦。',
    rating: 5,
    active: true,
  },
];

async function main() {
  console.log('Seeding testimonials...\n');
  for (const t of testimonials) {
    const created = await prisma.testimonial.create({ data: t });
    console.log(`✅ ${created.name} (${created.company}) ★${created.rating}`);
  }
  console.log(`\n完成！共新增 ${testimonials.length} 筆評論。`);
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
