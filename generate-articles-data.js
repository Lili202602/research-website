#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 目录路径
const postsDir = path.join(__dirname, 'posts');
const pdfsDir = path.join(__dirname, 'public', 'pdfs');
const outputFile = path.join(__dirname, 'src', 'data', 'articlesData.ts');

// 文件名映射规则
const pdfMapping = {
  '【哔哩哔哩】2026年轻人消费趋势报告：智性沸腾.pdf': '【哔哩哔哩】2026年轻人消费趋势报告：智性沸腾.pdf',
  '【易观】GEO行业市场分析报告2026【洞见研报DJyanbao.com】.pdf': '【易观】GEO行业市场分析报告2026.pdf',
  '【益普索Ipsos】成人健康行业：2025中国成人健康管理洞察【洞见研报DJyanbao.com】 (1).pdf': '【益普索Ipsos】成人健康行业：2025中国成人健康管理洞察.pdf'
};

// 获取所有 HTML 文件
const htmlFiles = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.html'))
  .sort()
  .reverse(); // 最新的在前

console.log(`📄 找到 ${htmlFiles.length} 个 HTML 文件`);

// 获取所有 PDF 文件
const pdfFiles = fs.readdirSync(pdfsDir)
  .filter(f => f.endsWith('.pdf'));

console.log(`📦 找到 ${pdfFiles.length} 个 PDF 文件`);

// 提取 HTML 内容
function extractFromHtml(htmlPath) {
  const content = fs.readFileSync(htmlPath, 'utf-8');
  
  // 提取标题
  const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
  
  // 提取日期
  const dateMatch = content.match(/发布于[：:\s]*(\d{4}年\d{2}月\d{2}日)/);
  const date = dateMatch ? dateMatch[1] : '';
  
  // 提取 PDF 链接
  const pdfMatch = content.match(/href="\.\.\/pdfs\/(.*?)"/);
  let pdfFilename = pdfMatch ? pdfMatch[1] : '';
  
  // 应用映射规则
  if (pdfMapping[pdfFilename]) {
    console.log(`🔄 映射: ${pdfFilename} → ${pdfMapping[pdfFilename]}`);
    pdfFilename = pdfMapping[pdfFilename];
  }
  
  // 提取核心摘要
  let coreViewpoints = '';
  const summaryMatch = content.match(/<h2[^>]*>.*?核心摘要.*?<\/h2>\s*<div[^>]*>(.*?)<\/div>/s);
  if (summaryMatch) {
    coreViewpoints = summaryMatch[1].trim()
      .replace(/<br\s*\/?>/g, '')
      .replace(/\n\s*/g, '');
  }
  
  // 提取专家点评
  let comments = '';
  const commentMatch = content.match(/<h2[^>]*>.*?专家点评.*?<\/h2>\s*<div[^>]*>(.*?)<\/div>/s);
  if (commentMatch) {
    comments = commentMatch[1].trim()
      .replace(/<br\s*\/?><br\s*\/?>/g, '</div><div class="insight-item">')
      .replace(/\n\s*/g, '');
  }
  
  return { title, date, pdfFilename, coreViewpoints, comments };
}

// 生成文章数据
const articles = [];
let id = 1;

for (const htmlFile of htmlFiles) {
  const htmlPath = path.join(postsDir, htmlFile);
  const data = extractFromHtml(htmlPath);
  
  if (!data.title) {
    console.log(`⚠️  跳过 ${htmlFile}：无法提取标题`);
    continue;
  }
  
  // 查找对应的 PDF
  const pdfPath = pdfFiles.find(pdf => pdf === data.pdfFilename);
  if (!pdfPath) {
    console.log(`⚠️  ${htmlFile} 找不到对应的 PDF: ${data.pdfFilename}`);
  }
  
  // 获取文件大小
  let fileSize = '未知';
  if (pdfPath) {
    const stats = fs.statSync(path.join(pdfsDir, pdfPath));
    const bytes = stats.size;
    if (bytes < 1024) {
      fileSize = `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      fileSize = `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }
  
  articles.push({
    id: id++,
    title: data.title,
    date: data.date || '未知日期',
    coreViewpoints: data.coreViewpoints || '<div class="insight-item">暂无摘要</div>',
    comments: data.comments || '<div class="insight-item">暂无点评</div>',
    pdfUrl: `pdfs/${data.pdfFilename}`,
    fileSize: fileSize,
    postUrl: `posts/${htmlFile}`,
    tags: ['供应链', 'AI洞察']
  });
  
  console.log(`✅ ${htmlFile} → ${data.title}`);
}

// 生成 TypeScript 文件
const tsContent = `// 文章数据常量 - 自动生成，请勿手动编辑
export const ARTICLES_DATA = ${JSON.stringify(articles, null, 2)};
`;

fs.writeFileSync(outputFile, tsContent, 'utf-8');

console.log('');
console.log(`🎉 成功生成 articlesData.ts`);
console.log(`📊 共 ${articles.length} 篇文章`);
console.log(`📁 输出文件: ${outputFile}`);
