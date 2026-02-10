# 增强调试和错误处理 - 修复总结

## 🎯 本次修复重点

### 1. API Key 验证
```typescript
// 打印 API Key 前 5 位（隐私安全）
console.log('🔑 Current API Key starts with:', apiKey.substring(0, 5) + '...');
```
**作用**：确认 API Key 是否正确传入

---

### 2. 增强 Axios 错误处理
```typescript
if (error.response) {
  // 服务器返回了错误响应
  console.error('📊 响应状态码:', error.response.status);
  console.error('📄 响应数据:', JSON.stringify(error.response.data, null, 2));
} else if (error.request) {
  // 请求已发送但没有收到响应
  console.error('📡 请求已发送但没有收到响应');
} else {
  // 请求配置错误
  console.error('⚙️  请求配置错误:', error.message);
}
```
**作用**：详细诊断 API 调用失败的原因

---

### 3. 多层内容验证
```typescript
// 第 1 层：检查 API 返回是否为空
if (!content) {
  console.error('❌ DeepSeek 返回为空！');
  throw new Error('DeepSeek 返回为空');
}

// 第 2 层：检查清理后是否为空
if (!cleanedContent) {
  console.error('❌ 清理后的内容为空！');
  throw new Error('DeepSeek 返回内容为空');
}

// 第 3 层：检查是否能提取 JSON 对象
if (!jsonMatch) {
  console.error('❌ 无法找到 JSON 对象！');
  throw new Error('无法从返回内容中提取 JSON 对象');
}

// 第 4 层：检查提取的内容是否有效
if (!cleanedContent || cleanedContent.length < 10) {
  console.error('❌ 提取的 JSON 内容太短或为空！');
  throw new Error('提取的 JSON 内容无效');
}
```
**作用**：在 JSON.parse 之前进行多层验证，避免 crash

---

### 4. 详细的日志输出
```typescript
console.log('📥 DeepSeek 原始返回（前 500 字符）:');
console.log(content.substring(0, 500));

console.log('📝 准备解析的 JSON（前 200 字符）:');
console.log(cleanedContent.substring(0, 200));
```
**作用**：清晰展示每个处理阶段的内容

---

## 🔍 新的日志格式

### 成功流程
```
🔑 Current API Key starts with: sk-ab...
📤 正在调用 DeepSeek API...
✅ API 调用成功
📥 DeepSeek 原始返回（前 500 字符）:
{
  "title": "...",
  ...
}
...
从 Markdown 代码块中提取 JSON
📝 准备解析的 JSON（前 200 字符）:
{
  "title": "...",
  ...
✅ 成功解析 JSON
标题: 2025年中国农产品加工行业研究报告
摘要长度: 456
点评长度: 789
```

### 失败流程（API Key 问题）
```
❌ API Key 未设置！
错误：缺少环境变量 DEEPSEEK_API_KEY
```

### 失败流程（API 调用失败）
```
🔑 Current API Key starts with: sk-ab...
📤 正在调用 DeepSeek API...
❌ DeepSeek API 调用失败！
错误消息: Request failed with status code 401
📊 响应状态码: 401
📄 响应数据:
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error"
  }
}
```

### 失败流程（返回内容为空）
```
✅ API 调用成功
❌ DeepSeek 返回为空！
完整响应数据: {...}
```

### 失败流程（无法提取 JSON）
```
✅ API 调用成功
📥 DeepSeek 原始返回（前 500 字符）:
这是一个关于...的报告
...
❌ 无法找到 JSON 对象！
清理后的内容: 这是一个关于...的报告
```

### 失败流程（JSON 解析失败）
```
✅ API 调用成功
📥 DeepSeek 原始返回（前 500 字符）:
{title: "...", summary: "..."}
...
📝 准备解析的 JSON（前 200 字符）:
{title: "...", summary: "..."}
❌ JSON 解析失败！
完整的清理后内容:
{title: "...", summary: "..."}
解析错误: Unexpected token t in JSON at position 1
```

---

## 📋 提交和测试

### 提交命令
```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

git add scripts/process-pdfs.ts

git commit -m "fix: 增强 DeepSeek API 调试和错误处理

- 打印 API Key 前 5 位验证是否传入
- 详细的 axios 错误处理（status, data, request）
- 多层内容验证，避免空内容导致 crash
- 在 JSON.parse 前进行充分检查
- 优化日志格式，使用 emoji 提高可读性
- 每个错误都有清晰的上下文信息"

git push origin main
```

### 测试步骤
1. 推送后立即手动触发 GitHub Actions
2. 查看 "Process single PDF" 步骤的完整日志
3. 重点关注：
   - 🔑 API Key 是否显示？
   - 📤 API 调用是否成功？
   - 📥 返回内容是什么？
   - 如果失败，具体在哪一步？

---

## 🎯 预期结果

### 如果 API Key 未配置
```
❌ API Key 未设置！
```

### 如果 API Key 错误
```
🔑 Current API Key starts with: sk-wr...
📤 正在调用 DeepSeek API...
❌ DeepSeek API 调用失败！
📊 响应状态码: 401
📄 响应数据: {"error": {"message": "Invalid API key"}}
```

### 如果 API 返回格式错误
```
✅ API 调用成功
📥 DeepSeek 原始返回（前 500 字符）:
<html>...
❌ 无法找到 JSON 对象！
```

### 如果一切正常
```
🔑 Current API Key starts with: sk-ab...
📤 正在调用 DeepSeek API...
✅ API 调用成功
📥 DeepSeek 原始返回（前 500 字符）:
{
  "title": "...",
  ...
}
从 Markdown 代码块中提取 JSON
📝 准备解析的 JSON（前 200 字符）:
{
  "title": "...",
  ...
✅ 成功解析 JSON
```

---

**现在提交并测试，把完整的日志发给我！** 🚀

