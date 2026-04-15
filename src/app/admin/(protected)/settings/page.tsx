import { Settings, Database, Shield, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">系統設定</h1>
        <p className="text-gray-500 mt-1">管理網站基本設定與系統配置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">網站資訊</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">網站名稱</label>
              <input defaultValue="ESG永續發展" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">聯絡Email</label>
              <input defaultValue="contact@esg.com" type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">聯絡電話</label>
              <input defaultValue="+886 2 1234 5678" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
              儲存設定
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">系統資訊</h2>
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
              <div key={item.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-semibold text-gray-900">安全設定</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">新密碼</label>
              <input type="password" placeholder="輸入新密碼" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">確認新密碼</label>
              <input type="password" placeholder="再次輸入新密碼" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
              更新密碼
            </button>
          </div>
        </div>

        {/* ECPay Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="font-semibold text-gray-900">金流設定 (ECPay)</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: '商家代號 (MerchantID)', key: 'ECPAY_MERCHANT_ID' },
              { label: 'Hash Key', key: 'ECPAY_HASH_KEY' },
              { label: 'Hash IV', key: 'ECPAY_HASH_IV' },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-xs text-gray-500 mb-1">{item.label}</label>
                <input type="password" placeholder="已設定（在 Vercel 環境變數）" disabled
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-2">ECPay 設定請至 Vercel Dashboard → Project Settings → Environment Variables 修改</p>
          </div>
        </div>
      </div>
    </div>
  );
}
