import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
// @ts-ignore
import pdfParse from 'pdf-parse';

// ==================== ES Module 兼容 ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==================== 配置 ====================
const ROOT = path.resolve(__dirname, '..');
const PDFS_TO_PROCESS_DIR = path.join(ROOT, 'pdfs_to_process');
const PUBLISHED_PDFS_DIR = path.join(ROOT, 'public', 'pdfs');
const POSTS_DIR = path.join(ROOT, 'posts');
const DATA_DIR = path.join(ROOT, 'data');
const ARTICLES_DATA_TS = path.join(ROOT, 'src', 'data', 'articlesData.ts');
const PROCESSED_LEDGER_PATH = path.join(DATA_DIR, 'processed_pdfs.json');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

// ==================== 类型定义 ====================
interface ExtractedPost {
  title: string;
  summary: string;
  expert_commentary: string;
}

interface Article {
  id: number;
  title: string;
  date: string;
  coreViewpoints: string;
  comments: string;
  pdfUrl: string;
  fileSize: string;
  postUrl: string;
  tags?: string[];
}

// ==================== 工具函数 ====================
function ensureDirs(): void {
  [PDFS_TO_PROCESS_DIR, PUBLISHED_PDFS_DIR, POSTS_DIR, DATA_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  for (const unit of units) {
    size /= 1024;
    if (size < 1024) return `${size.toFixed(1)} ${unit}`;
  }
  return `${size.toFixed(1)} PB`;
}

function slugify(text: string, maxLen: number = 80): string {
  let slug = text.trim()
    .replace(/\s+/g, '-')
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  
  if (!slug) slug = 'post';
  if (slug.length > maxLen) slug = slug.substring(0, maxLen).replace(/-+$/, '');
  return slug;
}

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markdownBoldToHtml(text: string): string {
  const placeholders: Record<string, string> = {};
  let counter = 0;
  
  const extractBold = (match: string, content: string): string => {
    const escapedContent = htmlEscape(content);
    const placeholder = `__BOLD_PLACEHOLDER_${counter}__`;
    counter++;
    placeholders[placeholder] = escapedContent;
    return placeholder;
  };
  
  const pattern = /\*\*([^*]+?)\*\*/g;
  let textWithPlaceholders = text.replace(pattern, extractBold);
  let escapedText = htmlEscape(textWithPlaceholders);
  
  for (const [placeholder, content] of Object.entries(placeholders)) {
    escapedText = escapedText.replace(placeholder, `<strong>${content}</strong>`);
  }
  
  return escapedText;
}

function renderSummaryAsHtmlList(summary: string): string {
  const lines = summary.split('\n').map(ln => ln.trim()).filter(ln => ln);
  
  if (lines.length === 0) {
    const content = markdownBoldToHtml(summary);
    return `<div class="insight-item">${content}</div>`;
  }
  
  return lines.map(ln => `<div class="insight-item">${markdownBoldToHtml(ln)}</div>`).join('');
}

// ==================== PDF 处理 ====================
async function readPdfText(pdfPath: string, maxPages: number = 10, maxChars: number = 60000): Promise<string> {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  
  let text = data.text || '';
  if (text.length > maxChars) {
    text = text.substring(0, maxChars);
  }
  
  return text.trim();
}

// ==================== DeepSeek API ====================
async function deepseekExtractJson(pdfText: string, apiKey: string): Promise<ExtractedPost> {
  if (!apiKey) {
    console.error('❌ API Key 未设置！');
    throw new Error('缺少环境变量 DEEPSEEK_API_KEY');
  }

  // 打印 API Key 前 5 位（隐私安全）
  console.log('🔑 Current API Key starts with:', apiKey.substring(0, 5) + '...');

  const system = 
    '你是一名深度理解供应链管理、物流技术、全球贸易合规以及 AI 在供应链应用的资深供应链顾问。' +
    '你将从用户提供的 PDF 文本中提取关键信息，并面向供应链从业者给出具有可操作性的专业点评，' +
    '特别关注对供应链规划、采购策略、库存与产能布局、物流网络设计、风险管理和合规要求的影响。' +
    '必须仅输出 JSON（不要输出多余文字），并确保字段齐全。';

  const user = 
    '请从下面的 PDF 文本中提取信息，并严格以 JSON 对象输出。\n\n' +
    '要求：\n' +
    '1) title：报告/文章标题（中文优先，尽量完整）\n' +
    '2) summary：核心摘要（5-10 条要点，必须严格遵守以下格式）：\n' +
    '   每条要点格式：【**总结词/短句**】：紧接着展开 1-2 句具体的细节描述。\n' +
    '   示例：\n' +
    '   【**物流降本**】：通过引入 AI 路径规划算法，预计可降低 15% 的末端配送成本。\n' +
    '   【**合规风险**】：针对 2026 年新的贸易法案，报告提示了电子原件进口的准入限制。\n' +
    '   注意：总结词必须用 **加粗标记** 包裹，每条要点独立一行，用换行分隔。\n' +
    '3) expert_commentary：专家点评（资深供应链顾问视角，聚焦供应链管理、物流技术、贸易合规或 AI/数字化在供应链中的应用，' +
    '结合报告结论说明对行业从业者在决策、运营优化和风险管理上的具体影响，并给出可执行建议，300-600 字）：\n' +
    '   必须严格遵守以下格式：\n' +
    '   每条洞察格式：【**总结词/短句**】：紧接着展开 1-2 句具体的细节描述。\n' +
    '   示例：\n' +
    '   【**物流降本**】：通过引入 AI 路径规划算法，预计可降低 15% 的末端配送成本。\n' +
    '   【**合规风险**】：针对 2026 年新的贸易法案，报告提示了电子原件进口的准入限制。\n' +
    '   注意：总结词必须用 **加粗标记** 包裹，每条洞察独立一段，用换行分隔。\n\n' +
    '输出 JSON 示例：\n' +
    '{\n' +
    '  "title": "...",\n' +
    '  "summary": "【**总结词1**】：描述1\\n【**总结词2**】：描述2\\n...",\n' +
    '  "expert_commentary": "【**洞察1**】：描述1\\n\\n【**洞察2**】：描述2\\n\\n..."\n' +
    '}\n\n' +
    'PDF 文本如下（可能不完整）：\n' +
    '-----\n' +
    `${pdfText}\n` +
    '-----\n';

  console.log('📤 正在调用 DeepSeek API...');
  
  let response;
  try {
    response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    );
    console.log('✅ API 调用成功');
  } catch (error: any) {
    console.error('❌ DeepSeek API 调用失败！');
    console.error('错误消息:', error.message);
    
    if (error.response) {
      console.error('📊 响应状态码:', error.response.status);
      console.error('📄 响应数据:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📡 请求已发送但没有收到响应');
      console.error('请求详情:', error.request);
    } else {
      console.error('⚙️  请求配置错误:', error.message);
    }
    
    throw error;
  }

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    console.error('❌ DeepSeek 返回为空！');
    console.error('完整响应数据:', JSON.stringify(response.data, null, 2));
    throw new Error('DeepSeek 返回为空');
  }

  console.log('📥 DeepSeek 原始返回（前 500 字符）:');
  console.log(content.substring(0, 500));
  console.log('...');

  // 清理和提取 JSON
  let cleanedContent = content.trim();
  
  // 检查是否为空
  if (!cleanedContent) {
    console.error('❌ 清理后的内容为空！');
    console.error('原始内容:', content);
    throw new Error('DeepSeek 返回内容为空');
  }
  
  // 尝试提取 ```json 代码块
  const jsonBlockMatch = cleanedContent.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    cleanedContent = jsonBlockMatch[1].trim();
    console.log('从 Markdown 代码块中提取 JSON');
  }
  
  // 尝试提取 ``` 代码块（无 json 标记）
  if (!jsonBlockMatch) {
    const codeBlockMatch = cleanedContent.match(/```\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      cleanedContent = codeBlockMatch[1].trim();
      console.log('从通用代码块中提取 JSON');
    }
  }
  
  // 移除可能的 BOM 和其他不可见字符
  cleanedContent = cleanedContent.replace(/^\uFEFF/, '');
  
  // 尝试提取 JSON 对象（从第一个 { 到最后一个 }）
  const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanedContent = jsonMatch[0];
  } else {
    console.error('❌ 无法找到 JSON 对象！');
    console.error('清理后的内容:', cleanedContent);
    throw new Error('无法从返回内容中提取 JSON 对象');
  }
  
  // 最终检查：确保不为空
  if (!cleanedContent || cleanedContent.length < 10) {
    console.error('❌ 提取的 JSON 内容太短或为空！');
    console.error('提取的内容:', cleanedContent);
    throw new Error('提取的 JSON 内容无效');
  }
  
  console.log('📝 准备解析的 JSON（前 200 字符）:');
  console.log(cleanedContent.substring(0, 200));

  let obj: any;
  try {
    obj = JSON.parse(cleanedContent);
  } catch (e) {
    console.error('❌ JSON 解析失败！');
    console.error('完整的清理后内容:');
    console.error(cleanedContent);
    console.error('解析错误:', e);
    throw new Error(`JSON 解析失败: ${e instanceof Error ? e.message : String(e)}`);
  }

  const title = (obj.title || '').trim();
  const summary = (obj.summary || '').trim();
  const expert = (obj.expert_commentary || '').trim();

  if (!title || !summary || !expert) {
    console.error('解析的对象:', JSON.stringify(obj, null, 2));
    throw new Error('DeepSeek JSON 字段缺失');
  }

  console.log('✅ 成功解析 JSON');
  console.log('标题:', title);
  console.log('摘要长度:', summary.length);
  console.log('点评长度:', expert.length);

  return { title, summary, expert_commentary: expert };
}

// ==================== 文章数据更新 ====================
function updateArticlesDataTs(articles: Article[]): void {
  // 确保 HTML 内容中的特殊字符被正确转义
  const articlesJson = JSON.stringify(articles, null, 2);
  
  const content = `// 文章数据常量 - 自动生成，请勿手动编辑
export const ARTICLES_DATA = ${articlesJson};
`;
  
  fs.writeFileSync(ARTICLES_DATA_TS, content, 'utf-8');
  console.log(`✅ 已更新 articlesData.ts，共 ${articles.length} 篇文章`);
}

function loadArticlesFromTs(): Article[] {
  if (!fs.existsSync(ARTICLES_DATA_TS)) {
    return [];
  }
  
  const content = fs.readFileSync(ARTICLES_DATA_TS, 'utf-8');
  const match = content.match(/export const ARTICLES_DATA = (\[[\s\S]*\]);/);
  if (!match) return [];
  
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    console.error('解析 articlesData.ts 失败:', e);
    return [];
  }
}

function upsertArticleEntry(
  articles: Article[],
  data: {
    title: string;
    dateStr: string;
    coreViewpointsHtml: string;
    commentsHtml: string;
    pdfUrl: string;
    fileSize: string;
    postUrl: string;
  }
): Article[] {
  const maxId = articles.reduce((max, a) => Math.max(max, a.id || 0), 0);
  
  // 去重检查
  const exists = articles.some(a => 
    a.title.trim() === data.title && a.pdfUrl.trim() === data.pdfUrl
  );
  
  if (exists) {
    return articles;
  }
  
  const newArticle: Article = {
    id: maxId + 1,
    title: data.title,
    date: data.dateStr,
    coreViewpoints: data.coreViewpointsHtml,
    comments: data.commentsHtml,
    pdfUrl: data.pdfUrl,
    fileSize: data.fileSize,
    postUrl: data.postUrl,
    tags: ['供应链', 'AI洞察']
  };
  
  return [newArticle, ...articles];
}

// ==================== 主流程 ====================
async function main(): Promise<number> {
  ensureDirs();
  
  // 检查是否为单篇处理模式
  const isSingleMode = process.argv.includes('--single');
  
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    console.error('错误：缺少环境变量 DEEPSEEK_API_KEY');
    return 1;
  }
  
  // 读取已处理记录
  let processed: string[] = [];
  if (fs.existsSync(PROCESSED_LEDGER_PATH)) {
    processed = JSON.parse(fs.readFileSync(PROCESSED_LEDGER_PATH, 'utf-8'));
  }
  const processedSet = new Set(processed);
  
  // 读取现有文章
  let articles = loadArticlesFromTs();
  
  // 获取待处理 PDF
  let pdfFiles = fs.readdirSync(PDFS_TO_PROCESS_DIR)
    .filter(f => f.endsWith('.pdf'))
    .sort();
  
  if (pdfFiles.length === 0) {
    console.log('pdfs_to_process/ 中没有待处理 PDF。');
    return 0;
  }
  
  // 单篇模式：只处理第一个未处理的 PDF
  if (isSingleMode) {
    const unprocessed = pdfFiles.filter(f => !processedSet.has(f));
    if (unprocessed.length === 0) {
      console.log('单篇模式：所有 PDF 已处理完毕。');
      return 0;
    }
    pdfFiles = [unprocessed[0]];
    console.log(`单篇模式：仅处理 ${pdfFiles[0]}`);
  }
  
  let anyChanged = false;
  
  for (const pdfFile of pdfFiles) {
    if (processedSet.has(pdfFile)) {
      console.log(`跳过已处理：${pdfFile}`);
      continue;
    }
    
    console.log(`\n========================================`);
    console.log(`开始处理：${pdfFile}`);
    console.log(`========================================\n`);
    
    const pdfPath = path.join(PDFS_TO_PROCESS_DIR, pdfFile);
    
    try {
      // 提取 PDF 文本
      console.log('步骤 1/5: 提取 PDF 文本...');
      const pdfText = await readPdfText(pdfPath);
      if (!pdfText) {
        console.log(`⚠️  警告：PDF 提取文本为空，跳过：${pdfFile}`);
        continue;
      }
      console.log(`✅ 提取成功，文本长度: ${pdfText.length} 字符`);
      
      // 调用 DeepSeek API
      console.log('\n步骤 2/5: 调用 DeepSeek API 分析内容...');
      const extracted = await deepseekExtractJson(pdfText, apiKey);
      
      // 移动 PDF 到 public/pdfs
      console.log('\n步骤 3/5: 移动 PDF 到发布目录...');
      let targetPdfPath = path.join(PUBLISHED_PDFS_DIR, pdfFile);
      if (fs.existsSync(targetPdfPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = path.extname(pdfFile);
        const base = path.basename(pdfFile, ext);
        targetPdfPath = path.join(PUBLISHED_PDFS_DIR, `${base}-${timestamp}${ext}`);
      }
      
      fs.renameSync(pdfPath, targetPdfPath);
      const pdfRelUrl = `pdfs/${path.basename(targetPdfPath)}`;
      console.log(`✅ PDF 已移动到: ${pdfRelUrl}`);
      
      // 生成日期和 slug
      console.log('\n步骤 4/5: 生成文章数据...');
      const dateStr = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '年').replace(/年(\d+)年/, '年$1月') + '日';
      
      const slug = slugify(extracted.title);
      const postFilename = `${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${slug}.html`;
      const postPath = path.join(POSTS_DIR, postFilename);
      const postRelUrl = `posts/${postFilename}`;
      
      // 生成 HTML
      const postHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${htmlEscape(extracted.title)}</title>
</head>
<body>
  <h1>${htmlEscape(extracted.title)}</h1>
  <p>发布于：${htmlEscape(dateStr)}</p>
  <a href="../${htmlEscape(pdfRelUrl)}">下载 PDF</a>
  <h2>核心摘要</h2>
  <div>${renderSummaryAsHtmlList(extracted.summary)}</div>
  <h2>专家点评</h2>
  <div>${renderSummaryAsHtmlList(extracted.expert_commentary)}</div>
</body>
</html>`;
      
      fs.writeFileSync(postPath, postHtml, 'utf-8');
      console.log(`✅ 文章详情页: ${postRelUrl}`);
      
      // 更新文章数据
      console.log('\n步骤 5/5: 更新文章列表...');
      const fileSize = humanFileSize(fs.statSync(targetPdfPath).size);
      const coreViewpointsHtml = renderSummaryAsHtmlList(extracted.summary);
      const commentsHtml = renderSummaryAsHtmlList(extracted.expert_commentary);
      
      articles = upsertArticleEntry(articles, {
        title: extracted.title,
        dateStr,
        coreViewpointsHtml,
        commentsHtml,
        pdfUrl: pdfRelUrl,
        fileSize,
        postUrl: postRelUrl
      });
      
      processed.push(pdfFile);
      processedSet.add(pdfFile);
      
      anyChanged = true;
      console.log(`\n✅ 处理完成！`);
      console.log(`   标题: ${extracted.title}`);
      console.log(`   PDF: ${pdfRelUrl}`);
      console.log(`   文章: ${postRelUrl}`);
      
    } catch (error) {
      console.error(`\n❌ 处理 ${pdfFile} 时出错:`);
      console.error(error);
      console.error('\n跳过此文件，继续处理下一个...\n');
      continue;
    }
  }
  
  if (anyChanged) {
    updateArticlesDataTs(articles);
    fs.writeFileSync(PROCESSED_LEDGER_PATH, JSON.stringify(processed, null, 2), 'utf-8');
    console.log('处理完成：已更新 src/data/articlesData.ts / posts/ / public/pdfs/');
  } else {
    console.log('没有需要处理的新 PDF。');
  }
  
  return 0;
}

// 执行
main().then(code => process.exit(code)).catch(err => {
  console.error('错误:', err);
  process.exit(1);
});

