'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">ESG永續管理平台 API 文件</h1>
          <p className="text-gray-500 mt-1 text-sm">
            OpenAPI 3.0 · 生產環境：
            <a
              href="https://esg-admin-backend.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              esg-admin-backend.vercel.app
            </a>
          </p>
        </div>

        <SwaggerUI
          url="/api/docs"
          docExpansion="list"
          defaultModelsExpandDepth={1}
          tryItOutEnabled={false}
          filter={true}
          displayRequestDuration={true}
        />
      </div>
    </div>
  );
}
