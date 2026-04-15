import { prisma } from '@/lib/prisma';
import { Briefcase, Plus, Eye, EyeOff } from 'lucide-react';

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">服務項目</h1>
          <p className="text-gray-500 mt-1">管理網站顯示的服務內容</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          新增服務
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{service.title}</h3>
                  <p className="text-xs text-gray-400">{service.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  service.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {service.active ? '顯示中' : '已隱藏'}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{service.description}</p>
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                {service.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {service.active ? '隱藏' : '顯示'}
              </button>
              <span className="text-gray-200">|</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                編輯
              </button>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-2 py-20 text-center text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>尚無服務項目，點擊右上角新增</p>
          </div>
        )}
      </div>
    </div>
  );
}
