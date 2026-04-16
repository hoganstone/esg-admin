import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

const metrics = [
  // GHG - 溫室氣體盤查 (tCO2e)
  { year: 2021, category: 'GHG', label: '範疇一直接排放', value: 1250.5, unit: 'tCO2e', note: '自有設施燃料燃燒' },
  { year: 2021, category: 'GHG', label: '範疇二間接排放', value: 3420.0, unit: 'tCO2e', note: '購入電力' },
  { year: 2022, category: 'GHG', label: '範疇一直接排放', value: 1180.2, unit: 'tCO2e', note: '自有設施燃料燃燒' },
  { year: 2022, category: 'GHG', label: '範疇二間接排放', value: 3105.8, unit: 'tCO2e', note: '購入電力' },
  { year: 2023, category: 'GHG', label: '範疇一直接排放', value: 1050.3, unit: 'tCO2e', note: '自有設施燃料燃燒' },
  { year: 2023, category: 'GHG', label: '範疇二間接排放', value: 2890.4, unit: 'tCO2e', note: '購入電力' },
  { year: 2024, category: 'GHG', label: '範疇一直接排放', value: 980.1, unit: 'tCO2e', note: '自有設施燃料燃燒' },
  { year: 2024, category: 'GHG', label: '範疇二間接排放', value: 2640.0, unit: 'tCO2e', note: '購入電力（再生能源占比提升）' },

  // ENERGY - 能源消耗
  { year: 2021, category: 'ENERGY', label: '總用電量', value: 6850400, unit: 'kWh', note: '含辦公室與廠區' },
  { year: 2022, category: 'ENERGY', label: '總用電量', value: 6521300, unit: 'kWh', note: '含辦公室與廠區' },
  { year: 2023, category: 'ENERGY', label: '總用電量', value: 6102800, unit: 'kWh', note: '含辦公室與廠區' },
  { year: 2024, category: 'ENERGY', label: '總用電量', value: 5780500, unit: 'kWh', note: '導入節能設備後下降' },
  { year: 2024, category: 'ENERGY', label: '再生能源占比', value: 18.5, unit: '%', note: '太陽能板發電' },

  // WATER - 用水
  { year: 2021, category: 'WATER', label: '總用水量', value: 42500, unit: '噸', note: '廠區製程及辦公室' },
  { year: 2022, category: 'WATER', label: '總用水量', value: 40100, unit: '噸' },
  { year: 2023, category: 'WATER', label: '總用水量', value: 38200, unit: '噸' },
  { year: 2024, category: 'WATER', label: '總用水量', value: 35800, unit: '噸', note: '節水設備效益顯現' },

  // GENDER_PAY - 薪酬比例
  { year: 2022, category: 'GENDER_PAY', label: '女性對男性薪酬比', value: 92.3, unit: '%', note: '同職級相同職務比較' },
  { year: 2023, category: 'GENDER_PAY', label: '女性對男性薪酬比', value: 94.1, unit: '%' },
  { year: 2024, category: 'GENDER_PAY', label: '女性對男性薪酬比', value: 96.5, unit: '%', note: '薪酬公平政策實施後' },

  // FEMALE_RATIO - 女性比例
  { year: 2022, category: 'FEMALE_RATIO', label: '女性員工比例', value: 38.4, unit: '%' },
  { year: 2022, category: 'FEMALE_RATIO', label: '女性主管比例', value: 22.1, unit: '%' },
  { year: 2023, category: 'FEMALE_RATIO', label: '女性員工比例', value: 40.2, unit: '%' },
  { year: 2023, category: 'FEMALE_RATIO', label: '女性主管比例', value: 25.8, unit: '%' },
  { year: 2024, category: 'FEMALE_RATIO', label: '女性員工比例', value: 42.5, unit: '%' },
  { year: 2024, category: 'FEMALE_RATIO', label: '女性主管比例', value: 30.0, unit: '%' },

  // TRAINING - 員工訓練
  { year: 2022, category: 'TRAINING', label: '平均訓練時數', value: 24.5, unit: '小時/人', note: '含線上與實體課程' },
  { year: 2023, category: 'TRAINING', label: '平均訓練時數', value: 32.0, unit: '小時/人' },
  { year: 2024, category: 'TRAINING', label: '平均訓練時數', value: 40.8, unit: '小時/人', note: 'ESG專項訓練增加' },

  // WASTE - 廢棄物
  { year: 2022, category: 'WASTE', label: '一般廢棄物', value: 520, unit: '公噸' },
  { year: 2022, category: 'WASTE', label: '事業廢棄物', value: 85, unit: '公噸' },
  { year: 2023, category: 'WASTE', label: '一般廢棄物', value: 490, unit: '公噸' },
  { year: 2023, category: 'WASTE', label: '事業廢棄物', value: 72, unit: '公噸' },
  { year: 2024, category: 'WASTE', label: '一般廢棄物', value: 450, unit: '公噸', note: '資源化率提升' },
  { year: 2024, category: 'WASTE', label: '事業廢棄物', value: 63, unit: '公噸' },
];

async function main() {
  console.log('Seeding ESG metrics...');
  for (const m of metrics) {
    await prisma.esgMetric.create({ data: m });
  }
  console.log(`✅ Created ${metrics.length} ESG metrics`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
