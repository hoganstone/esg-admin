export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ESG永續管理平台 API',
    version: '1.0.0',
    description: `## ESG永續管理平台後端 API 文件

### 認證說明
- **公開 API**：無需認證，可直接呼叫
- **管理員 API** \`/api/admin/*\`：需要登入 Session Cookie（透過 \`/admin/login\` 頁面登入後取得）

### 角色權限
| 角色 | 說明 |
|------|------|
| \`SUPER_ADMIN\` | 超級管理員，所有權限 |
| \`ADMIN\` | ESG管理員，管理訂單/用戶 |
| \`EDITOR\` | 編輯人員，管理內容（諮詢/案例/評論/服務） |
| \`USER\` | 一般用戶，無後台存取權 |`,
    contact: { name: 'ESG永續團隊', email: 'admin@esg.com' },
  },
  servers: [
    { url: 'https://esg-admin-backend.vercel.app', description: '生產環境' },
    { url: 'http://localhost:3001', description: '本地開發' },
  ],
  tags: [
    { name: '公開 - 諮詢', description: '前台諮詢表單提交' },
    { name: '公開 - 訂單', description: '前台服務預約與付款' },
    { name: '公開 - 評論', description: '前台客戶評論展示' },
    { name: '公開 - 電子報', description: '電子報訂閱' },
    { name: '後台 - 諮詢管理', description: '需要 ADMIN / EDITOR 角色' },
    { name: '後台 - 訂單管理', description: '需要 ADMIN / SUPER_ADMIN 角色' },
    { name: '後台 - 案例管理', description: '需要 ADMIN / EDITOR 角色' },
    { name: '後台 - 評論管理', description: '需要 ADMIN / EDITOR 角色' },
    { name: '後台 - 用戶管理', description: '需要 ADMIN / SUPER_ADMIN 角色' },
    { name: '後台 - 登入記錄', description: '登入/登出 Session 追蹤' },
  ],
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: '錯誤訊息' },
        },
      },
      Inquiry: {
        type: 'object',
        properties: {
          id:        { type: 'string', example: 'cmo0abc123' },
          name:      { type: 'string', example: '王大明' },
          email:     { type: 'string', format: 'email', example: 'wang@example.com' },
          phone:     { type: 'string', nullable: true, example: '02-2345-6789' },
          company:   { type: 'string', nullable: true, example: '綠色科技股份有限公司' },
          subject:   { type: 'string', example: '碳盤查服務諮詢' },
          message:   { type: 'string', example: '希望了解碳盤查流程與費用' },
          reply:     { type: 'string', nullable: true, example: '感謝您的詢問...' },
          repliedAt: { type: 'string', format: 'date-time', nullable: true },
          status:    { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], example: 'PENDING' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id:          { type: 'string' },
          orderNumber: { type: 'string', example: 'ESG-001001' },
          amount:      { type: 'integer', example: 50000 },
          currency:    { type: 'string', example: 'TWD' },
          status:      { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'] },
          items:       { type: 'array', items: { type: 'object' } },
          metadata:    { type: 'object', nullable: true },
          createdAt:   { type: 'string', format: 'date-time' },
        },
      },
      Testimonial: {
        type: 'object',
        properties: {
          id:       { type: 'string' },
          name:     { type: 'string', example: '林美華' },
          position: { type: 'string', example: 'CSR主任' },
          company:  { type: 'string', example: '日出企業集團' },
          content:  { type: 'string', example: '合作非常順暢，專業度一流！' },
          rating:   { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          image:    { type: 'string', nullable: true },
          active:   { type: 'boolean' },
          createdAt:{ type: 'string', format: 'date-time' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id:          { type: 'string' },
          title:       { type: 'string', example: '台積電碳盤查專案' },
          category:    { type: 'string', example: '碳盤查' },
          description: { type: 'string' },
          tags:        { type: 'array', items: { type: 'string' } },
          year:        { type: 'string', nullable: true, example: '2024' },
          featured:    { type: 'boolean' },
          active:      { type: 'boolean' },
          image:       { type: 'string', nullable: true },
          createdAt:   { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id:          { type: 'string' },
          name:        { type: 'string', nullable: true },
          email:       { type: 'string', format: 'email' },
          role:        { type: 'string', enum: ['USER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'] },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt:   { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    // ── 公開 API ──────────────────────────────────────────────────────────────
    '/api/inquiry': {
      post: {
        tags: ['公開 - 諮詢'],
        summary: '提交諮詢表單',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'subject', 'message'],
                properties: {
                  name:    { type: 'string', example: '王小明' },
                  email:   { type: 'string', format: 'email', example: 'wang@example.com' },
                  phone:   { type: 'string', example: '02-2345-6789' },
                  company: { type: 'string', example: 'XX股份有限公司' },
                  subject: { type: 'string', example: '碳盤查服務諮詢' },
                  message: { type: 'string', example: '希望了解碳盤查流程' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: '諮詢已建立', content: { 'application/json': { schema: { $ref: '#/components/schemas/Inquiry' } } } },
          400: { description: '驗證錯誤', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/orders': {
      post: {
        tags: ['公開 - 訂單'],
        summary: '建立服務預約訂單並取得 ECPay 付款參數',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'serviceName', 'price'],
                properties: {
                  name:        { type: 'string', example: '王小明' },
                  email:       { type: 'string', format: 'email' },
                  phone:       { type: 'string' },
                  company:     { type: 'string' },
                  serviceName: { type: 'string', example: 'ESG報告書撰寫' },
                  price:       { type: 'integer', example: 50000 },
                  message:     { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: '訂單建立成功，回傳 ECPay 付款參數',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ecpayUrl:    { type: 'string', description: 'ECPay 付款頁面 URL' },
                    ecpayParams: { type: 'object', description: 'POST 參數（含 CheckMacValue）' },
                    order:       { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
          400: { description: '驗證錯誤' },
        },
      },
    },
    '/api/testimonials': {
      get: {
        tags: ['公開 - 評論'],
        summary: '取得所有顯示中的客戶評論',
        responses: {
          200: {
            description: '評論列表',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Testimonial' } } } },
          },
        },
      },
    },
    '/api/newsletter': {
      post: {
        tags: ['公開 - 電子報'],
        summary: '訂閱電子報',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          200: { description: '訂閱成功' },
          400: { description: '格式錯誤或已訂閱' },
        },
      },
    },

    // ── 後台 諮詢管理 ────────────────────────────────────────────────────────
    '/api/admin/inquiries': {
      get: {
        tags: ['後台 - 諮詢管理'],
        summary: '取得所有諮詢（需 ADMIN/EDITOR）',
        responses: {
          200: { description: '諮詢列表', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Inquiry' } } } } },
          401: { description: '未授權' },
        },
      },
    },
    '/api/admin/inquiries/{id}': {
      patch: {
        tags: ['後台 - 諮詢管理'],
        summary: '更新諮詢狀態與回覆',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
                  reply:  { type: 'string', example: '感謝您的詢問，我們將於...' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '更新成功', content: { 'application/json': { schema: { $ref: '#/components/schemas/Inquiry' } } } },
          401: { description: '未授權' },
          404: { description: '諮詢不存在' },
        },
      },
    },

    // ── 後台 訂單管理 ────────────────────────────────────────────────────────
    '/api/admin/orders': {
      get: {
        tags: ['後台 - 訂單管理'],
        summary: '取得所有訂單（需 ADMIN）',
        responses: {
          200: { description: '訂單列表', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } },
          401: { description: '未授權' },
        },
      },
    },
    '/api/admin/orders/{id}': {
      patch: {
        tags: ['後台 - 訂單管理'],
        summary: '更新訂單狀態與備註',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'] },
                  notes:  { type: 'string', example: '已確認付款' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '更新成功' },
          401: { description: '未授權' },
          404: { description: '訂單不存在' },
        },
      },
    },

    // ── 後台 案例管理 ────────────────────────────────────────────────────────
    '/api/admin/projects': {
      get: {
        tags: ['後台 - 案例管理'],
        summary: '取得所有案例',
        responses: {
          200: { description: '案例列表', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } } },
          401: { description: '未授權' },
        },
      },
      post: {
        tags: ['後台 - 案例管理'],
        summary: '新增案例',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'category', 'description'],
                properties: {
                  title:       { type: 'string' },
                  category:    { type: 'string' },
                  description: { type: 'string' },
                  tags:        { type: 'array', items: { type: 'string' } },
                  year:        { type: 'string' },
                  featured:    { type: 'boolean' },
                  active:      { type: 'boolean' },
                  image:       { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: '案例已建立', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          400: { description: '驗證錯誤' },
          401: { description: '未授權' },
        },
      },
    },
    '/api/admin/projects/{id}': {
      patch: {
        tags: ['後台 - 案例管理'],
        summary: '更新案例',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title:       { type: 'string' },
                  category:    { type: 'string' },
                  description: { type: 'string' },
                  tags:        { type: 'array', items: { type: 'string' } },
                  year:        { type: 'string', nullable: true },
                  featured:    { type: 'boolean' },
                  active:      { type: 'boolean' },
                  image:       { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '更新成功', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          401: { description: '未授權' },
          404: { description: '案例不存在' },
        },
      },
      delete: {
        tags: ['後台 - 案例管理'],
        summary: '刪除案例',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: '刪除成功' },
          401: { description: '未授權' },
          404: { description: '案例不存在' },
        },
      },
    },

    // ── 後台 評論管理 ────────────────────────────────────────────────────────
    '/api/admin/testimonials': {
      get: {
        tags: ['後台 - 評論管理'],
        summary: '取得所有客戶評論',
        responses: {
          200: { description: '評論列表', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Testimonial' } } } } },
          401: { description: '未授權' },
        },
      },
      post: {
        tags: ['後台 - 評論管理'],
        summary: '新增客戶評論',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'position', 'company', 'content'],
                properties: {
                  name:     { type: 'string' },
                  position: { type: 'string' },
                  company:  { type: 'string' },
                  content:  { type: 'string' },
                  rating:   { type: 'integer', minimum: 1, maximum: 5 },
                  image:    { type: 'string' },
                  active:   { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: '評論已建立', content: { 'application/json': { schema: { $ref: '#/components/schemas/Testimonial' } } } },
          400: { description: '驗證錯誤' },
          401: { description: '未授權' },
        },
      },
    },
    '/api/admin/testimonials/{id}': {
      patch: {
        tags: ['後台 - 評論管理'],
        summary: '更新客戶評論',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name:     { type: 'string' },
                  position: { type: 'string' },
                  company:  { type: 'string' },
                  content:  { type: 'string' },
                  rating:   { type: 'integer', minimum: 1, maximum: 5 },
                  image:    { type: 'string', nullable: true },
                  active:   { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '更新成功', content: { 'application/json': { schema: { $ref: '#/components/schemas/Testimonial' } } } },
          401: { description: '未授權' },
          404: { description: '評論不存在' },
        },
      },
      delete: {
        tags: ['後台 - 評論管理'],
        summary: '刪除客戶評論',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: '刪除成功' },
          401: { description: '未授權' },
          404: { description: '評論不存在' },
        },
      },
    },

    // ── 後台 用戶管理 ────────────────────────────────────────────────────────
    '/api/admin/users': {
      get: {
        tags: ['後台 - 用戶管理'],
        summary: '取得所有用戶（需 ADMIN）',
        responses: {
          200: { description: '用戶列表', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } },
          401: { description: '未授權' },
        },
      },
      post: {
        tags: ['後台 - 用戶管理'],
        summary: '新增用戶',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name:     { type: 'string' },
                  email:    { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  role:     { type: 'string', enum: ['USER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: '用戶已建立', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          400: { description: '驗證錯誤或 Email 重複' },
          401: { description: '未授權' },
        },
      },
    },
    '/api/admin/users/{id}': {
      patch: {
        tags: ['後台 - 用戶管理'],
        summary: '更新用戶資料',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name:     { type: 'string' },
                  email:    { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  role:     { type: 'string', enum: ['USER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '更新成功', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: '未授權' },
          403: { description: '權限不足' },
          404: { description: '用戶不存在' },
        },
      },
      delete: {
        tags: ['後台 - 用戶管理'],
        summary: '刪除用戶',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: '刪除成功' },
          400: { description: '不能刪除自己' },
          401: { description: '未授權' },
          404: { description: '用戶不存在' },
        },
      },
    },

    // ── 後台 登入記錄 ────────────────────────────────────────────────────────
    '/api/admin/session': {
      post: {
        tags: ['後台 - 登入記錄'],
        summary: '建立登入記錄（登入時呼叫）',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ipAddress: { type: 'string' },
                  userAgent: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '記錄建立成功，回傳 session id', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' } } } } } },
          401: { description: '未授權' },
        },
      },
      patch: {
        tags: ['後台 - 登入記錄'],
        summary: '更新登出時間（登出時呼叫）',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string', description: 'LoginRecord ID' } },
              },
            },
          },
        },
        responses: {
          200: { description: '登出記錄已更新' },
          401: { description: '未授權' },
        },
      },
      get: {
        tags: ['後台 - 登入記錄'],
        summary: '取得登入記錄列表（需 ADMIN）',
        responses: {
          200: { description: '登入記錄列表' },
          401: { description: '未授權' },
        },
      },
    },
  },
};
