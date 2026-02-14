#!/bin/bash

# 诊断脚本：检查网站更新问题

echo "=== 网站更新诊断 ==="
echo ""

cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

echo "📊 1. 检查本地文件状态"
echo ""

echo "articlesData.ts 文章数:"
grep -c '"id":' src/data/articlesData.ts || echo "0"
echo ""

echo "posts/ 目录:"
ls -1 posts/*.html 2>/dev/null | wc -l | xargs echo "HTML 文件数:"
ls -1 posts/*.html 2>/dev/null | head -3
echo ""

echo "public/pdfs/ 目录:"
ls -1 public/pdfs/*.pdf 2>/dev/null | wc -l | xargs echo "PDF 文件数:"
ls -1 public/pdfs/*.pdf 2>/dev/null | head -3
echo ""

echo "pdfs_to_process/ 目录:"
ls -1 pdfs_to_process/*.pdf 2>/dev/null | wc -l | xargs echo "待处理 PDF 数:"
ls -1 pdfs_to_process/*.pdf 2>/dev/null | head -3
echo ""

echo "📥 2. 检查云端状态"
echo ""

echo "拉取最新状态..."
git fetch origin main
echo ""

echo "本地和云端的差异:"
git diff HEAD origin/main --name-only | head -10
echo ""

echo "📋 3. 检查 Git 状态"
echo ""

git status --short | head -10
echo ""

echo "✅ 诊断完成"
echo ""
echo "💡 建议："
echo "1. 如果 posts/ 和 public/pdfs/ 都是空的，说明 Actions 可能没有成功处理 PDF"
echo "2. 如果本地有文件但云端没有，需要提交并推送"
echo "3. 如果云端有文件但网站没更新，可能是部署问题或缓存问题"
