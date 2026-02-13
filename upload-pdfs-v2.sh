#!/bin/bash

# 智能 PDF 上传脚本 v2.0
# 功能：同步云端状态 + 增量上传新文件

set -e

echo "=== 智能 PDF 上传脚本 v2.0 ==="
echo ""

cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

# ==================== 步骤 1: 同步云端状态 ====================
echo "📥 步骤 1/4: 同步云端状态..."
echo ""

# 拉取最新的远程状态
git fetch origin main
git pull origin main

echo "✅ 已拉取最新的云端状态"
echo ""

# 获取云端 pdfs_to_process 中的文件列表
echo "🔍 检查云端 pdfs_to_process/ 中的文件..."
REMOTE_FILES=$(git ls-tree HEAD:pdfs_to_process/ | grep -E '\.pdf$' | awk '{print $4}' | sed 's|pdfs_to_process/||' || echo "")

if [ -z "$REMOTE_FILES" ]; then
  echo "   云端 pdfs_to_process/ 为空"
else
  echo "   云端待处理文件:"
  echo "$REMOTE_FILES" | sed 's/^/   - /'
fi

echo ""

# 获取本地 pdfs_to_process 中的文件列表
echo "🔍 检查本地 pdfs_to_process/ 中的文件..."
LOCAL_FILES=$(find pdfs_to_process -name "*.pdf" -type f -exec basename {} \; 2>/dev/null || echo "")

if [ -z "$LOCAL_FILES" ]; then
  echo "   本地 pdfs_to_process/ 为空"
  LOCAL_COUNT=0
else
  LOCAL_COUNT=$(echo "$LOCAL_FILES" | wc -l | tr -d ' ')
  echo "   本地文件数: $LOCAL_COUNT"
fi

echo ""

# 找出本地有但云端没有的文件（已被云端处理）
PROCESSED_FILES=""
PROCESSED_COUNT=0

if [ -n "$LOCAL_FILES" ]; then
  while IFS= read -r local_file; do
    if ! echo "$REMOTE_FILES" | grep -Fxq "$local_file"; then
      PROCESSED_FILES="$PROCESSED_FILES$local_file"$'\n'
      PROCESSED_COUNT=$((PROCESSED_COUNT + 1))
    fi
  done <<< "$LOCAL_FILES"
fi

if [ $PROCESSED_COUNT -gt 0 ]; then
  echo "🔄 发现 $PROCESSED_COUNT 个文件已被云端处理，需要同步到本地 public/pdfs/..."
  echo ""
  
  # 创建 public/pdfs 目录
  mkdir -p public/pdfs
  
  # 移动已处理的文件
  while IFS= read -r file; do
    if [ -n "$file" ] && [ -f "pdfs_to_process/$file" ]; then
      echo "   移动: $file"
      mv "pdfs_to_process/$file" "public/pdfs/"
    fi
  done <<< "$PROCESSED_FILES"
  
  echo ""
  echo "✅ 本地同步完成"
else
  echo "✅ 本地和云端状态一致，无需同步"
fi

echo ""

# ==================== 步骤 2: 识别新文件 ====================
echo "📊 步骤 2/4: 识别需要上传的新文件..."
echo ""

# 重新获取本地文件列表（同步后）
LOCAL_FILES_AFTER=$(find pdfs_to_process -name "*.pdf" -type f -exec basename {} \; 2>/dev/null || echo "")

if [ -z "$LOCAL_FILES_AFTER" ]; then
  echo "❌ pdfs_to_process/ 中没有文件"
  exit 0
fi

# 找出本地有但云端没有的文件（新文件）
NEW_FILES=""
NEW_COUNT=0

while IFS= read -r local_file; do
  if ! echo "$REMOTE_FILES" | grep -Fxq "$local_file"; then
    NEW_FILES="$NEW_FILES$local_file"$'\n'
    NEW_COUNT=$((NEW_COUNT + 1))
  fi
done <<< "$LOCAL_FILES_AFTER"

if [ $NEW_COUNT -eq 0 ]; then
  echo "✅ 没有新文件需要上传（本地和云端完全一致）"
  exit 0
fi

echo "🆕 发现 $NEW_COUNT 个新文件需要上传:"
echo ""
echo "$NEW_FILES" | sed 's/^/   - /'
echo ""

# ==================== 步骤 3: 确认上传 ====================
read -p "是否继续上传这 $NEW_COUNT 个新文件到 GitHub？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 已取消"
  exit 0
fi

echo ""

# ==================== 步骤 4: 增量上传 ====================
echo "🚀 步骤 3/4: 增量上传新文件到 GitHub..."
echo ""

# 只添加新文件
while IFS= read -r file; do
  if [ -n "$file" ]; then
    echo "   添加: $file"
    git add "pdfs_to_process/$file"
  fi
done <<< "$NEW_FILES"

# 提交
COMMIT_MSG="chore: 增量上传 $NEW_COUNT 个新 PDF

$(echo "$NEW_FILES" | sed 's/^/- /')"

git commit -m "$COMMIT_MSG"

# 推送
git push origin main

echo ""
echo "✅ 上传完成！"
echo ""

# ==================== 步骤 5: 总结 ====================
echo "📊 步骤 4/4: 总结"
echo ""
echo "本次操作:"
echo "  - 同步处理: $PROCESSED_COUNT 个文件"
echo "  - 新增上传: $NEW_COUNT 个文件"
echo ""

# 统计云端待处理队列
REMOTE_TOTAL=$(echo "$REMOTE_FILES" | grep -c . || echo "0")
QUEUE_SIZE=$((REMOTE_TOTAL + NEW_COUNT))

echo "云端待处理队列:"
echo "  - 上传前: $REMOTE_TOTAL 个文件"
echo "  - 上传后: $QUEUE_SIZE 个文件"
echo ""

if [ $QUEUE_SIZE -gt 0 ]; then
  echo "🤖 接下来:"
  echo "  - GitHub Actions 将在每天早上 6:00 自动处理一篇"
  echo "  - 预计 $QUEUE_SIZE 天后全部处理完成"
  echo "  - 或访问 https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions 手动触发"
fi

echo ""
echo "✨ 完成！"

