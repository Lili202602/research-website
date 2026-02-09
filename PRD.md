# Lili的供应链AI Lab - 产品需求文档 (PRD)

## 项目概述

**项目名称**：Lili的供应链AI Lab  
**项目类型**：研究报告展示网站 + 自动化发布系统  
**技术栈**：React + TypeScript + GitHub Actions + Vercel  
**最后更新**：2026年02月09日

---

## 核心功能模块

### 1. 前端展示系统 ✅

#### 1.1 密码访问控制
- **功能**：访问口令保护
- **密码**：`lili2026`（正式）/ `test2026`（测试）
- **特性**：
  - SHA-256 加密存储
  - 设备绑定（单密码单设备）
  - 3次尝试限制
  - 1分钟自动解锁
  - localStorage 持久化

#### 1.2 页面结构
- **首页（每日洞察）**：展示最新1篇文章
- **往期回看**：展示所有历史文章
- **侧边栏导航**：160px 宽，极简设计
- **Hero 区域**：标题 + 副标题 + 更新频率

#### 1.3 文章卡片
- **透明磨砂质感**：`rgba(255, 255, 255, 0.85)` + `backdrop-filter`
- **内容结构**：
  - 标题 + 日期 + 标签
  - 核心观点（无边框，直接浮在卡片上）
  - 专业点评（无边框，直接浮在卡片上）
  - 下载按钮（深灰色半透明）

#### 1.4 设计风格
- **配色**：浅灰背景 `#F5F6FA`，深灰文字 `#2D3436`
- **字体**：Inter / PingFang SC
- **极简主义**：无 Emoji，无装饰元素
- **专业调性**：AI Lab 风格

---

### 2. 自动化发布系统 ✅

#### 2.1 本地处理脚本
- **文件**：`scripts/process-pdfs.ts`
- **功能**：
  - 提取 PDF 文本（前10页，最多60,000字符）
  - 调用 DeepSeek API 生成摘要和点评
  - 更新 `src/data/articlesData.ts`
  - 生成文章详情页 HTML
  - 移动 PDF 到 `public/pdfs/`
  - 防重复处理

#### 2.2 处理模式
- **批量模式**：`npm run process` - 处理所有未处理的 PDF
- **单篇模式**：`npm run process:single` - 只处理第一篇 PDF

#### 2.3 DeepSeek Prompt
- **System Prompt**：资深供应链顾问角色
- **User Prompt**：
  - 提取标题
  - 生成核心摘要（5-10条，【**总结词**】格式）
  - 生成专家点评（供应链视角，300-600字）
- **输出格式**：JSON（title, summary, expert_commentary）

---

### 3. 云端定时发布系统 ✅

#### 3.1 GitHub Actions 工作流
- **文件**：`.github/workflows/daily-insight.yml`
- **触发方式**：
  - 定时触发：每天 UTC 22:00（北京时间早上 6:00）
  - 手动触发：GitHub Actions 页面

#### 3.2 执行流程
1. Checkout 代码
2. 安装 Node.js 18
3. 安装依赖（`npm ci`）
4. 运行单篇处理（`npm run process:single`）
5. 检查是否有变更
6. 自动 commit 并 push

#### 3.3 环境配置
- **GitHub Secret**：`DEEPSEEK_API_KEY`
- **权限**：需要 `contents: write` 权限

---

### 4. 数据结构

#### 4.1 文章数据（articlesData.ts）
```typescript
{
  id: number;                    // 自增 ID
  title: string;                 // 文章标题
  date: string;                  // 发布日期（中文格式）
  coreViewpoints: string;        // 核心观点 HTML
  comments: string;              // 专业点评 HTML
  pdfUrl: string;                // PDF 相对路径
  fileSize: string;              // 文件大小
  postUrl: string;               // 详情页路径
  tags?: string[];               // 标签（可选）
}
```

#### 4.2 HTML 格式
```html
<div class="insight-item">
  【<strong>总结词</strong>】：具体描述...
</div>
```

---

### 5. 部署架构

#### 5.1 托管平台
- **前端**：Vercel（自动部署）
- **代码**：GitHub（版本控制 + Actions）
- **域名**：www.liliailab.cn

#### 5.2 部署流程
1. 本地开发 → `git push`
2. GitHub 检测到推送
3. Vercel 自动构建并部署
4. 1-2 分钟后生效

#### 5.3 自动化流程
1. 管理员上传 PDF 到 `pdfs_to_process/`
2. GitHub Actions 每天早上 6 点自动处理
3. 自动 commit 并推送
4. Vercel 自动部署
5. 用户访问网站看到新文章

---

## 未来功能规划 🚧

### 6. 管理后台（/admin）⏳

#### 6.1 功能需求
- **认证**：管理员密码登录
- **文章管理**：
  - 查看所有文章列表
  - 编辑文章内容（标题、摘要、点评）
  - 删除文章
  - 新增文章（手动输入）
  - 调整文章顺序
- **PDF 管理**：
  - 上传 PDF 到 `pdfs_to_process/`
  - 查看处理状态
  - 手动触发处理
- **数据导出**：
  - 导出 articlesData.ts
  - 备份数据

#### 6.2 技术方案
- **前端**：React + React Hook Form
- **状态管理**：Context API 或 Zustand
- **文件操作**：需要后端 API（Node.js + Express）
- **认证**：JWT Token
- **部署**：Vercel Serverless Functions

#### 6.3 UI 设计
- **风格**：延续主站的极简灰色调
- **布局**：侧边栏导航 + 主内容区
- **表单**：Material-UI 或 Ant Design

---

## 技术规范

### 7.1 代码规范
- **语言**：TypeScript（严格模式）
- **格式化**：Prettier
- **Lint**：ESLint
- **命名**：camelCase（变量/函数），PascalCase（组件）

### 7.2 Git 规范
- **Commit 格式**：
  - `feat:` 新功能
  - `fix:` 修复 Bug
  - `chore:` 日常维护
  - `docs:` 文档更新
  - `refactor:` 重构

### 7.3 目录结构
```
research-website/
├── .github/workflows/        # GitHub Actions
├── public/                   # 静态资源
│   └── pdfs/                # 已发布 PDF
├── src/
│   ├── components/          # React 组件
│   ├── pages/               # 页面组件
│   ├── data/                # 数据文件
│   └── styles/              # 样式文件
├── scripts/                 # 自动化脚本
├── posts/                   # 文章详情页
├── pdfs_to_process/         # 待处理 PDF
└── data/                    # 数据记录
```

---

## 性能指标

### 8.1 加载性能
- **首屏加载**：< 2s
- **交互响应**：< 100ms
- **构建时间**：< 1min

### 8.2 API 配额
- **DeepSeek API**：每天最多处理 10 篇 PDF
- **GitHub Actions**：每月 2000 分钟免费额度

---

## 安全考虑

### 9.1 前端安全
- **密码加密**：SHA-256 哈希
- **XSS 防护**：HTML 转义
- **CSRF 防护**：SameSite Cookie

### 9.2 API 安全
- **密钥管理**：GitHub Secrets
- **访问控制**：设备绑定
- **速率限制**：3次尝试锁定

---

## 维护计划

### 10.1 日常维护
- **监控**：GitHub Actions 执行状态
- **备份**：定期备份 articlesData.ts
- **更新**：依赖包安全更新

### 10.2 扩展计划
- **Q1 2026**：管理后台开发
- **Q2 2026**：数据分析面板
- **Q3 2026**：用户评论系统

---

**文档版本**：v2.0  
**维护者**：Lili  
**联系方式**：通过小红书获取

