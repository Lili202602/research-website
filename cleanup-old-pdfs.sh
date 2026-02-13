#!/bin/bash

# 清理旧的 PDF 文件和目录

set -e

echo "=== 清理 GitHub 上的旧 PDF 文件 ==="
echo ""

cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

echo "📋 将要删除的文件："
echo ""
echo "1. pdfs/ 目录（旧的，应该使用 public/pdfs/）"
echo "2. 所有旧的 PDF 文件"
echo ""

read -p "确认删除？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 已取消"
  exit 0
fi

echo ""
echo "🗑️  开始清理..."
echo ""

# 1. 删除 pdfs/ 目录中的所有 PDF
echo "步骤 1/3: 删除 pdfs/ 目录中的 PDF 文件..."
git rm pdfs/*.pdf 2>/dev/null || echo "没有 PDF 文件需要删除"

# 2. 删除整个 pdfs/ 目录
echo "步骤 2/3: 删除 pdfs/ 目录..."
git rm -r pdfs/ 2>/dev/null || echo "目录已删除"

# 3. 提交更改
echo "步骤 3/3: 提交更改..."
git commit -m "chore: 清理旧的 pdfs/ 目录

- 删除旧的 pdfs/ 目录及所有 PDF 文件
- 统一使用 public/pdfs/ 作为发布目录
- 为自动化处理系统做准备"

echo ""
echo "✅ 清理完成！"
echo ""
echo "📊 下一步："
echo "  1. 运行: git push origin main"
echo "  2. 确认 GitHub 上 pdfs/ 目录已删除"
echo "  3. 开始使用新的自动化系统"
echo ""

