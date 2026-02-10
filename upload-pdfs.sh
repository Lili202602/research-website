#!/bin/bash

# PDF 批量上传脚本
# 用途：将本地 pdfs_to_process/ 中的所有 PDF 上传到 GitHub，并移动到本地归档

set -e

echo "=== PDF 批量上传脚本 ==="
echo ""

# 检查是否在正确的目录
if [ ! -d "pdfs_to_process" ]; then
  echo "❌ 错误：请在项目根目录运行此脚本"
  exit 1
fi

# 统计 PDF 数量
PDF_COUNT=$(find pdfs_to_process -name "*.pdf" -type f | wc -l | tr -d ' ')

if [ "$PDF_COUNT" -eq 0 ]; then
  echo "📭 pdfs_to_process/ 中没有 PDF 文件"
  exit 0
fi

echo "📊 发现 $PDF_COUNT 个 PDF 文件待上传"
echo ""

# 列出所有 PDF
echo "📄 待上传的文件："
find pdfs_to_process -name "*.pdf" -type f -exec basename {} \; | nl
echo ""

# 确认上传
read -p "是否继续上传到 GitHub？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 已取消"
  exit 0
fi

# 创建本地归档目录
ARCHIVE_DIR="pdfs_archived"
mkdir -p "$ARCHIVE_DIR"

echo ""
echo "🚀 开始上传流程..."
echo ""

# 1. 添加所有 PDF 到 Git
echo "📤 步骤 1/4: 添加 PDF 文件到 Git..."
git add pdfs_to_process/*.pdf

# 2. 提交
echo "📝 步骤 2/4: 提交到本地仓库..."
COMMIT_MSG="chore: 批量上传 $PDF_COUNT 个待处理 PDF

$(find pdfs_to_process -name "*.pdf" -type f -exec basename {} \; | sed 's/^/- /')"

git commit -m "$COMMIT_MSG"

# 3. 推送到 GitHub
echo "☁️  步骤 3/4: 推送到 GitHub..."
git push origin main

# 4. 移动到本地归档
echo "📦 步骤 4/4: 移动到本地归档..."
find pdfs_to_process -name "*.pdf" -type f -exec mv {} "$ARCHIVE_DIR/" \;

echo ""
echo "✅ 上传完成！"
echo ""
echo "📊 统计："
echo "  - 已上传: $PDF_COUNT 个 PDF"
echo "  - GitHub 仓库: pdfs_to_process/"
echo "  - 本地归档: $ARCHIVE_DIR/"
echo ""
echo "🤖 接下来："
echo "  - GitHub Actions 将在每天早上 6:00 自动处理一篇"
echo "  - 或访问 https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions 手动触发"
echo ""

