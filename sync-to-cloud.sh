#!/bin/bash

# 同步本地状态到云端（按照本地的来）

set -e

echo "=== 同步本地状态到云端 ==="
echo ""

cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

echo "📊 步骤 1/3: 检查当前状态"
echo ""

git status --short
echo ""

echo "📦 步骤 2/3: 添加所有更改"
echo ""

git add -A
echo "✅ 已添加所有文件"
echo ""

echo "💾 步骤 3/3: 提交并推送到云端"
echo ""

COMMIT_MSG="chore: 同步本地状态到云端

- 清空 articlesData.ts（删除所有文章）
- 更新诊断和故障排除文档"

git commit -m "$COMMIT_MSG"

echo ""
echo "🚀 推送到云端..."
git push origin main

echo ""
echo "✅ 同步完成！"
echo ""
echo "📋 本次更改："
echo "  - src/data/articlesData.ts: 已清空（删除所有文章）"
echo "  - 其他本地更改已同步到云端"

