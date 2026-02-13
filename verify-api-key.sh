#!/bin/bash

# API Key 验证脚本

echo "=== GitHub Secret 验证指南 ==="
echo ""

echo "📋 步骤 1: 访问 GitHub Secrets 页面"
echo "https://github.com/Lili202602/research-website/settings/secrets/actions"
echo ""

echo "📋 步骤 2: 检查 DEEPSEEK_API_KEY"
echo "- 确认 Secret 名称是否正确：DEEPSEEK_API_KEY（区分大小写）"
echo "- 点击 'Update' 重新输入 API Key"
echo "- API Key 格式应该是：sk-xxxxxxxxxxxxxxxxxxxxxxxx"
echo ""

echo "📋 步骤 3: 验证 API Key 格式"
echo "DeepSeek API Key 应该："
echo "  - 以 'sk-' 开头"
echo "  - 长度约 48-64 个字符"
echo "  - 只包含字母、数字和连字符"
echo ""

echo "📋 步骤 4: 获取正确的 API Key"
echo "1. 访问 DeepSeek 控制台："
echo "   https://platform.deepseek.com/api_keys"
echo ""
echo "2. 如果没有 API Key，点击 'Create API Key'"
echo ""
echo "3. 复制完整的 API Key（包括 'sk-' 前缀）"
echo ""

echo "📋 步骤 5: 更新 GitHub Secret"
echo "1. 回到 GitHub Secrets 页面"
echo "2. 找到 DEEPSEEK_API_KEY，点击 'Update'"
echo "3. 粘贴完整的 API Key"
echo "4. 点击 'Update secret'"
echo ""

echo "📋 步骤 6: 验证更新"
echo "1. 更新后，手动触发 GitHub Actions"
echo "2. 查看日志中的 '🔑 Current API Key starts with:'"
echo "3. 应该显示 'sk-ab...' 或类似的前 5 位"
echo ""

echo "⚠️  常见错误："
echo "  ❌ Secret 名称拼写错误（DEEPSEEK_API_KEY）"
echo "  ❌ 复制时漏掉了 'sk-' 前缀"
echo "  ❌ 复制时包含了多余的空格或换行"
echo "  ❌ 使用了过期或无效的 API Key"
echo ""

echo "✅ 正确的 API Key 示例："
echo "  sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890"
echo ""

read -p "按 Enter 键继续..."

