#!/bin/bash

# 统一 PDF 目录结构

echo "=== 统一 PDF 目录结构 ==="
echo ""

cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

echo "📋 当前状态："
echo ""
echo "1. pdfs/ (旧目录，应该删除):"
ls -lh pdfs/*.pdf 2>/dev/null | wc -l | xargs echo "   文件数:"
echo ""
echo "2. public/pdfs/ (正确的发布目录):"
ls -lh public/pdfs/*.pdf 2>/dev/null | wc -l | xargs echo "   文件数:"
echo ""
echo "3. pdfs_archived/ (本地归档):"
ls -lh pdfs_archived/*.pdf 2>/dev/null | wc -l | xargs echo "   文件数:"
echo ""

echo "🔧 修复计划："
echo "1. 将 pdfs/ 中的文件移动到 public/pdfs/"
echo "2. 删除 pdfs/ 目录"
echo "3. 提交到 GitHub"
echo ""

read -p "是否继续？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 已取消"
  exit 0
fi

echo ""
echo "🚀 开始修复..."
echo ""

# 1. 移动 pdfs/ 中的文件到 public/pdfs/
if [ -d "pdfs" ] && [ "$(ls -A pdfs/*.pdf 2>/dev/null)" ]; then
  echo "步骤 1: 移动 pdfs/ 中的文件到 public/pdfs/..."
  mkdir -p public/pdfs
  mv pdfs/*.pdf public/pdfs/ 2>/dev/null || echo "没有文件需要移动"
  echo "✅ 完成"
else
  echo "步骤 1: pdfs/ 中没有 PDF 文件，跳过"
fi

echo ""

# 2. 删除 pdfs/ 目录
if [ -d "pdfs" ]; then
  echo "步骤 2: 删除 pdfs/ 目录..."
  git rm -r pdfs/ 2>/dev/null || rm -rf pdfs/
  echo "✅ 完成"
else
  echo "步骤 2: pdfs/ 目录不存在，跳过"
fi

echo ""

# 3. 添加 public/pdfs/ 到 Git
echo "步骤 3: 添加 public/pdfs/ 到 Git..."
git add public/pdfs/
echo "✅ 完成"

echo ""

# 4. 提交
echo "步骤 4: 提交更改..."
git commit -m "fix: 统一 PDF 目录结构

- 将 pdfs/ 中的文件移动到 public/pdfs/
- 删除旧的 pdfs/ 目录
- 统一使用 public/pdfs/ 作为发布目录"

echo "✅ 完成"

echo ""

# 5. 推送
echo "步骤 5: 推送到 GitHub..."
git push origin main
echo "✅ 完成"

echo ""
echo "🎉 修复完成！"
echo ""
echo "📊 最终目录结构："
echo "  - pdfs_to_process/  ← 待处理队列"
echo "  - public/pdfs/      ← 已发布（GitHub Actions 处理后）"
echo "  - pdfs_archived/    ← 本地归档（upload-pdfs.sh 使用）"
echo ""

