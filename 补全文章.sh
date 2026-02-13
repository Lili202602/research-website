#!/bin/bash

# 补全缺失的文章信息

echo "=== 补全 articlesData.ts 缺失的文章 ==="
echo ""

cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

echo "📊 检查状态："
echo ""
echo "public/pdfs/ 中的 PDF:"
ls -1 public/pdfs/*.pdf | xargs -n1 basename
echo ""

echo "articlesData.ts 中已记录的 PDF:"
grep -o 'pdfs/[^"]*\.pdf' src/data/articlesData.ts | sed 's/pdfs\///'
echo ""

echo "🔍 缺失的文章："
echo "【华泰证券】宁德时代（03750）：全球电气化的"心脏".pdf"
echo ""

echo "⚠️  需要处理这个 PDF 来生成文章信息"
echo ""
echo "📋 有两种方式："
echo ""
echo "方式 1: 使用 DeepSeek API 自动生成（推荐）"
echo "  - 将 PDF 移回 pdfs_to_process/"
echo "  - 手动触发 GitHub Actions"
echo "  - 自动生成完整的文章信息"
echo ""
echo "方式 2: 手动添加（快速但不完整）"
echo "  - 手动编辑 articlesData.ts"
echo "  - 添加基本信息（标题、日期、PDF 链接）"
echo "  - 核心观点和点评需要手动填写"
echo ""

read -p "选择方式 (1/2): " -n 1 -r
echo ""

if [[ $REPLY == "1" ]]; then
  echo ""
  echo "🚀 方式 1: 使用 API 自动生成"
  echo ""
  echo "步骤："
  echo "1. 将 PDF 移回 pdfs_to_process/"
  mv "public/pdfs/【华泰证券】宁德时代（03750）：全球电气化的"心脏".pdf" pdfs_to_process/
  echo "   ✅ 已移动"
  echo ""
  echo "2. 提交到 GitHub"
  git add pdfs_to_process/ public/pdfs/
  git commit -m "chore: 将华泰证券报告移回待处理队列"
  git push origin main
  echo "   ✅ 已推送"
  echo ""
  echo "3. 手动触发 GitHub Actions:"
  echo "   访问: https://github.com/Lili202602/research-website/actions/workflows/daily-insight.yml"
  echo "   点击 'Run workflow'"
  echo ""
  echo "✅ 完成！等待 Actions 处理后，文章信息会自动补全。"
  
elif [[ $REPLY == "2" ]]; then
  echo ""
  echo "📝 方式 2: 手动添加"
  echo ""
  echo "请手动编辑 src/data/articlesData.ts，添加以下内容："
  echo ""
  cat << 'EOF'
{
  "id": 2,
  "title": "宁德时代（03750）：全球电气化的"心脏"",
  "date": "2026年02月13日",
  "coreViewpoints": "<div class=\"insight-item\">【<strong>市场地位</strong>】：宁德时代是全球动力电池领导者，市场份额持续领先。</div><div class=\"insight-item\">【<strong>技术创新</strong>】：持续投入研发，推动电池技术进步和成本下降。</div><div class=\"insight-item\">【<strong>全球布局</strong>】：积极拓展海外市场，与国际车企深度合作。</div>",
  "comments": "<div class=\"insight-item\">【<strong>供应链管理</strong>】：作为全球电池龙头，宁德时代的供应链管理经验值得借鉴。</div><div class=\"insight-item\">【<strong>产能布局</strong>】：全球化产能布局策略，平衡成本与市场需求。</div>",
  "pdfUrl": "pdfs/【华泰证券】宁德时代（03750）：全球电气化的"心脏".pdf",
  "fileSize": "2.3 MB",
  "postUrl": "posts/20260213-宁德时代全球电气化的心脏.html",
  "tags": ["供应链", "AI洞察"]
}
EOF
  echo ""
  echo "⚠️  注意：这只是示例内容，需要根据实际 PDF 内容修改。"
  
else
  echo "❌ 已取消"
  exit 0
fi

