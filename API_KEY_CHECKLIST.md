# API Key 配置检查清单

## 🔍 问题诊断

你提到 "API Key 前 5 位好像不对"，这说明：
1. ✅ Secret 已经传入脚本（不是空的）
2. ❌ 但 API Key 的值可能不正确

---

## 📋 立即检查步骤

### 步骤 1: 获取正确的 DeepSeek API Key

1. **访问 DeepSeek 控制台**：
   ```
   https://platform.deepseek.com/api_keys
   ```

2. **登录你的账号**

3. **查看或创建 API Key**：
   - 如果已有 API Key，点击 "Show" 查看
   - 如果没有，点击 "Create API Key"

4. **复制完整的 API Key**：
   - 格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxx`
   - 长度：约 48-64 个字符
   - 确保包含 `sk-` 前缀

---

### 步骤 2: 更新 GitHub Secret

1. **访问 GitHub Secrets 页面**：
   ```
   https://github.com/Lili202602/research-website/settings/secrets/actions
   ```

2. **找到 `DEEPSEEK_API_KEY`**

3. **点击 "Update"**

4. **粘贴新的 API Key**：
   - ⚠️ 确保没有多余的空格
   - ⚠️ 确保没有换行符
   - ⚠️ 确保包含完整的 `sk-` 前缀

5. **点击 "Update secret"**

---

### 步骤 3: 验证配置

1. **手动触发 GitHub Actions**：
   ```
   https://github.com/Lili202602/research-website/actions/workflows/daily-insight.yml
   ```
   点击 "Run workflow"

2. **查看日志**，找到这一行：
   ```
   🔑 Current API Key starts with: sk-ab...
   ```

3. **验证前 5 位**：
   - ✅ 应该是 `sk-` 加上 2 个字符
   - ✅ 例如：`sk-ab...`, `sk-12...`, `sk-xy...`
   - ❌ 如果是其他格式，说明 API Key 不正确

---

## 🔑 API Key 格式说明

### ✅ 正确的格式
```
sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890
```
- 以 `sk-` 开头
- 后面是字母和数字的组合
- 总长度约 48-64 个字符

### ❌ 常见错误

#### 错误 1: 缺少前缀
```
1234567890abcdefghijklmnopqrstuvwxyz1234567890
```
❌ 缺少 `sk-` 前缀

#### 错误 2: 包含空格
```
sk-1234567890abcdef ghijklmnopqrstuvwxyz1234567890
```
❌ 中间有空格

#### 错误 3: 包含换行
```
sk-1234567890abcdefghijklmnopqrstuvwxyz
1234567890
```
❌ 有换行符

#### 错误 4: 使用了错误的 Key
```
pk-1234567890abcdefghijklmnopqrstuvwxyz1234567890
```
❌ 前缀是 `pk-` 而不是 `sk-`

---

## 🧪 测试 API Key 是否有效

### 方法 1: 使用 curl 测试（可选）

在本地终端执行：

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-你的API_Key" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

**预期结果**：
- ✅ 成功：返回 JSON 响应
- ❌ 失败：返回 401 错误（API Key 无效）

### 方法 2: 查看 GitHub Actions 日志

更新 Secret 后，手动触发 Actions，查看：

```
🔑 Current API Key starts with: sk-ab...
📤 正在调用 DeepSeek API...
```

如果看到：
```
❌ DeepSeek API 调用失败！
📊 响应状态码: 401
📄 响应数据: {"error": {"message": "Invalid API key"}}
```

说明 API Key 无效。

---

## 📝 检查清单

请逐项确认：

- [ ] 已访问 DeepSeek 控制台
- [ ] 已复制完整的 API Key（包括 `sk-` 前缀）
- [ ] API Key 没有空格或换行
- [ ] 已在 GitHub 更新 Secret
- [ ] Secret 名称是 `DEEPSEEK_API_KEY`（区分大小写）
- [ ] 已手动触发 GitHub Actions
- [ ] 日志显示 `sk-` 开头的前 5 位

---

## 🎯 下一步

1. ✅ 按照上述步骤更新 API Key
2. ✅ 手动触发 GitHub Actions
3. ✅ 把日志中的这几行发给我：
   ```
   🔑 Current API Key starts with: ...
   📤 正在调用 DeepSeek API...
   ✅ API 调用成功
   或
   ❌ DeepSeek API 调用失败！
   ```

---

## 💡 提示

如果你不确定 API Key 是否正确，可以：
1. 在 DeepSeek 控制台删除旧的 API Key
2. 创建一个新的 API Key
3. 立即复制并更新到 GitHub Secret
4. 测试

**更新完成后告诉我，我们一起验证！** 🔍

