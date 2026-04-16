import { prisma } from '@/lib/prisma';
import { FolderOpen, Plus, Star } from 'lucide-react';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">案例管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理網站顯示的成功案例</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          新增案例
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3">案例名稱</th>
                <th className="px-6 py-3">類別</th>
                <th className="px-6 py-3">標籤</th>
                <th className="px-6 py-3">年份</th>
                <th className="px-6 py-3">精選</th>
                <th className="px-6 py-3">狀態</th>
                <th className="px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{project.title}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 max-w-xs truncate">{project.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                      {project.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">{tag}</span>
                      ))}
                      {project.tags.length > 2 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">+{project.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{project.year ?? '-'}</td>
                  <td className="px-6 py-4">
                    {project.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      project.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {project.active ? '顯示中' : '已隱藏'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">編輯</button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500">
                    <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    尚無案例資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
