#!/bin/bash

echo "=== PDF 处理诊断脚本 ==="
echo ""

echo "1. 检查 pdfs_to_process/ 目录："
ls -lh pdfs_to_process/*.pdf 2>&1 || echo "没有 PDF 文件"
echo ""

echo "2. 检查已处理记录："
cat data/processed_pdfs.json 2>&1 || echo "文件不存在"
echo ""

echo "3. 检查待处理的 PDF（未在 processed_pdfs.json 中）："
for pdf in pdfs_to_process/*.pdf; do
  filename=$(basename "$pdf")
  if ! grep -q "$filename" data/processed_pdfs.json 2>/dev/null; then
    echo "  - $filename (待处理)"
  else
    echo "  - $filename (已处理)"
  fi
done
echo ""

echo "4. 检查 DEEPSEEK_API_KEY 环境变量："
if [ -z "$DEEPSEEK_API_KEY" ]; then
  echo "  ❌ 未设置"
else
  echo "  ✅ 已设置 (长度: ${#DEEPSEEK_API_KEY})"
fi
echo ""

echo "5. 测试运行脚本（不实际调用 API）："
echo "  命令: npm run process:single"
echo ""

