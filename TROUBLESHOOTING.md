# GitHub Actions PDF 处理问题排查指南

## 📊 诊断结果

### ✅ 本地状态正常
- 有 2 个待处理的 PDF：
  1. 【哔哩哔哩】2026年轻人消费趋势报告：智性沸腾.pdf (35MB)
  2. 【硕远咨询】2025年中国农产品加工行业研究报告.pdf (964KB)
- 这两个 PDF 都已提交到 Git 仓库
- 脚本逻辑正确

### ❌ 可能的问题

GitHub Actions 显示 "nothing added to commit" 说明脚本没有生成新文件。可能原因：

1. **DEEPSEEK_API_KEY 未配置或配置错误**
2. **API 调用失败**（超时、配额、网络问题）
3. **脚本执行出错但被忽略**

---

## 🔍 排查步骤

### 步骤 1：检查 GitHub Secret 配置

1. 访问：
   ```
   https://github.com/Lili202602/research-website/settings/secrets/actions
   ```

2. 确认存在 `DEEPSEEK_API_KEY` Secret

3. 如果不存在或不确定，**重新添加**：
   - 点击 "New repository secret"
   - Name: `DEEPSEEK_API_KEY`
   - Value: 你的 DeepSeek API Key（格式：sk-xxxxxxxx）
   - 点击 "Add secret"

---

### 步骤 2：检查 GitHub Actions 日志

1. 访问：
   ```
   https://github.com/Lili202602/research-website/actions
   ```

2. 找到最近一次 "Daily Insight Auto Publish" 运行

3. 点击进入，查看 "Process single PDF" 步骤的详细日志

4. **关键信息**：
   - 是否显示 "错误：缺少环境变量 DEEPSEEK_API_KEY"？
   - 是否显示 "开始处理：【硕远咨询】..."？
   - 是否有 API 调用错误？
   - 是否显示 "已发布：..."？

---

### 步骤 3：手动触发测试

1. 访问：
   ```
   https://github.com/Lili202602/research-website/actions/workflows/daily-insight.yml
   ```

2. 点击右侧 "Run workflow" 按钮

3. 选择 `main` 分支

4. 点击绿色的 "Run workflow"

5. 等待执行完成，查看详细日志

---

## 🛠️ 常见问题解决方案

### 问题 1：API Key 未配置
**症状**：日志显示 "错误：缺少环境变量 DEEPSEEK_API_KEY"

**解决**：按照步骤 1 重新配置 Secret

---

### 问题 2：API 调用超时
**症状**：日志显示 "timeout" 或 "ETIMEDOUT"

**解决**：
- 第一个 PDF 文件太大（35MB），可能导致处理超时
- 建议先处理小文件：手动删除大文件，只保留小文件

---

### 问题 3：PDF 文件太大
**症状**：处理第一个 PDF 时超时或失败

**解决方案**：临时移除大文件

在终端执行：
```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

# 临时移除大文件
git rm "pdfs_to_process/【哔哩哔哩】2026年轻人消费趋势报告：智性沸腾.pdf"

git commit -m "temp: 临时移除大文件，先处理小文件"

git push origin main
```

等小文件处理成功后，再重新添加大文件。

---

### 问题 4：脚本执行但没有输出
**症状**：日志显示脚本运行，但没有 "开始处理" 或 "已发布" 信息

**可能原因**：
- PDF 文件在远程仓库中不存在（虽然本地有）
- 文件名编码问题

**解决**：检查远程仓库是否真的有这些 PDF

访问：
```
https://github.com/Lili202602/research-website/tree/main/pdfs_to_process
```

确认两个 PDF 文件都在列表中。

---

## 🎯 推荐操作流程

### 方案 A：先处理小文件（推荐）

1. 临时移除 35MB 的大文件
2. 让 GitHub Actions 处理 964KB 的小文件
3. 验证成功后，再添加大文件

### 方案 B：增加超时时间

修改 `.github/workflows/daily-insight.yml`，增加超时：

```yaml
- name: Process single PDF
  env:
    DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
  run: npm run process:single
  timeout-minutes: 30  # 增加到 30 分钟
```

---

## 📝 下一步

1. ✅ 检查 GitHub Secret 是否配置
2. ✅ 查看最近一次 Actions 的详细日志
3. ✅ 根据日志错误信息采取对应措施
4. ✅ 手动触发一次测试

**完成排查后，请告诉我日志中显示的具体错误信息！** 🔍

