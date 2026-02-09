# PDF 自动处理脚本使用指南

## 📋 功能说明

自动化处理 PDF 研究报告，提取核心内容并发布到网站。

### 核心功能
- ✅ 自动提取 PDF 文本内容
- ✅ 使用 DeepSeek AI 生成摘要和专家点评
- ✅ 自动更新 `src/data/articlesData.ts`
- ✅ 生成文章详情页 HTML
- ✅ 移动 PDF 到 `public/pdfs/`
- ✅ 防重复处理（记录在 `data/processed_pdfs.json`）

---

## 🚀 使用步骤

### 1. 安装依赖

```bash
npm install
```

需要安装的新依赖：
- `axios` - HTTP 请求
- `pdf-parse` - PDF 文本提取
- `ts-node` - 运行 TypeScript
- `@types/pdf-parse` - TypeScript 类型定义

### 2. 设置环境变量

在项目根目录创建 `.env` 文件（或在终端中设置）：

```bash
export DEEPSEEK_API_KEY="your_api_key_here"
```

### 3. 放置 PDF 文件

将待处理的 PDF 文件放入 `pdfs_to_process/` 目录：

```bash
pdfs_to_process/
├── 报告1.pdf
├── 报告2.pdf
└── 报告3.pdf
```

### 4. 运行处理脚本

```bash
npm run process
```

或者：

```bash
DEEPSEEK_API_KEY="your_key" npm run process
```

---

## 📁 目录结构

```
research-website/
├── pdfs_to_process/          # 待处理 PDF（输入）
├── public/pdfs/               # 已发布 PDF（输出）
├── posts/                     # 文章详情页 HTML（输出）
├── data/
│   └── processed_pdfs.json   # 已处理记录
├── src/data/
│   └── articlesData.ts       # 文章数据（自动更新）
└── scripts/
    └── process-pdfs.ts       # 处理脚本
```

---

## 🔄 处理流程

1. **扫描** `pdfs_to_process/` 目录
2. **跳过**已处理的 PDF（检查 `processed_pdfs.json`）
3. **提取** PDF 文本内容（前 10 页，最多 60,000 字符）
4. **调用** DeepSeek API 生成：
   - 标题
   - 核心摘要（5-10 条要点）
   - 专家点评（供应链视角）
5. **移动** PDF 到 `public/pdfs/`
6. **生成**文章详情页 HTML 到 `posts/`
7. **更新** `src/data/articlesData.ts`
8. **记录**到 `processed_pdfs.json`

---

## 📝 数据格式

### articlesData.ts 结构

```typescript
{
  id: 1,
  title: "报告标题",
  date: "2026年02月09日",
  coreViewpoints: "<div class=\"insight-item\">【<strong>总结词</strong>】：描述...</div>",
  comments: "<div class=\"insight-item\">【<strong>洞察</strong>】：描述...</div>",
  pdfUrl: "pdfs/报告.pdf",
  fileSize: "7.7 MB",
  postUrl: "posts/20260209-报告标题.html",
  tags: ["供应链", "AI洞察"]
}
```

---

## ⚠️ 注意事项

### API 配额
- DeepSeek API 有调用限制
- 建议批量处理时控制数量
- 每个 PDF 约消耗 1500 tokens

### 文件命名
- PDF 文件名支持中文
- 生成的 HTML 文件名会自动 slugify
- 重复文件名会自动添加时间戳

### 错误处理
- PDF 提取失败会跳过该文件
- API 调用失败会抛出错误并停止
- 已处理的文件不会重复处理

---

## 🐛 故障排查

### 问题：`DEEPSEEK_API_KEY` 未设置
```bash
错误：缺少环境变量 DEEPSEEK_API_KEY
```
**解决**：设置环境变量或创建 `.env` 文件

### 问题：PDF 提取文本为空
```bash
警告：PDF 提取文本为空，跳过：xxx.pdf
```
**解决**：检查 PDF 是否为扫描件（需要 OCR）

### 问题：DeepSeek API 调用失败
```bash
DeepSeek 返回为空
```
**解决**：检查 API Key 是否有效，网络是否正常

---

## 🔧 自定义配置

### 修改提取参数

在 `scripts/process-pdfs.ts` 中：

```typescript
// 修改最大页数和字符数
const pdfText = await readPdfText(pdfPath, 20, 100000);
```

### 修改 Prompt

在 `deepseekExtractJson` 函数中修改 `system` 和 `user` 变量。

---

## 📊 示例输出

```bash
$ npm run process

开始处理：益普索中国智能家电市场趋势洞察.pdf
已发布：posts/20260209-益普索中国智能家电市场趋势洞察.html （PDF：pdfs/益普索中国智能家电市场趋势洞察.pdf）
处理完成：已更新 src/data/articlesData.ts / posts/ / public/pdfs/
```

---

## 🚀 部署后续步骤

处理完成后：

```bash
# 1. 提交更改
git add src/data/articlesData.ts posts/ public/pdfs/ data/processed_pdfs.json
git commit -m "feat: 新增研究报告"

# 2. 推送到 GitHub
git push origin main

# 3. Vercel 自动部署
```

---

## 📞 支持

如有问题，请检查：
1. Node.js 版本 >= 16
2. 所有依赖已安装
3. API Key 有效
4. PDF 文件可读

---

**最后更新**：2026年02月09日

