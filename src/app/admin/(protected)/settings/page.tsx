import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Settings, Database } from 'lucide-react';

export default async function SettingsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') redirect('/admin/dashboard');
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">系統設定</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">管理網站基本設定與系統配置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">系統資訊</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: '框架版本', value: 'Next.js 16.2.3' },
              { label: '資料庫', value: 'PostgreSQL (Prisma v7)' },
              { label: '快取', value: 'Redis' },
              { label: '身份驗證', value: 'Auth.js (next-auth@beta)' },
              { label: '金流', value: 'ECPay 綠界科技' },
              { label: '部署平台', value: 'Vercel' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ECPay Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">金流設定 (ECPay)</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: '商家代號 (MerchantID)', key: 'ECPAY_MERCHANT_ID' },
              { label: 'Hash Key', key: 'ECPAY_HASH_KEY' },
              { label: 'Hash IV', key: 'ECPAY_HASH_IV' },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</label>
                <input type="password" placeholder="已設定（在 Vercel 環境變數）" disabled
                  className="w-full px-3 py-2 border border-gray-100 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed" />
              </div>
            ))}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">ECPay 設定請至 Vercel Dashboard → Project Settings → Environment Variables 修改</p>
          </div>
        </div>
      </div>
    </div>
  );
}
