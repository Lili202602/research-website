# GitHub Actions 配置指南

## ✅ 代码已推送成功！

最新提交：`88bd3b8 fix: 修复 GitHub Actions 依赖安装问题`

---

## 🔧 必须完成的配置（2步）

### 第 1 步：配置 DeepSeek API Key

1. 打开浏览器，访问：
   ```
   https://github.com/Lili202602/research-website/settings/secrets/actions
   ```

2. 点击右上角绿色按钮 **"New repository secret"**

3. 填写信息：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Secret**: 粘贴你的 DeepSeek API Key（格式：sk-xxxxxxxx）

4. 点击 **"Add secret"** 保存

---

### 第 2 步：启用 GitHub Actions 写权限

1. 访问：
   ```
   https://github.com/Lili202602/research-website/settings/actions
   ```

2. 滚动到页面底部，找到 **"Workflow permissions"** 部分

3. 选择：
   - ✅ **"Read and write permissions"**（允许 Actions 提交代码）

4. 点击 **"Save"** 保存

---

## 🧪 测试自动化流程

配置完成后，立即测试：

1. 访问 Actions 页面：
   ```
   https://github.com/Lili202602/research-website/actions
   ```

2. 点击左侧的 **"Daily Insight Auto Publish"** workflow

3. 点击右侧的 **"Run workflow"** 下拉按钮

4. 选择 `main` 分支，点击绿色的 **"Run workflow"** 按钮

5. 等待几秒钟，页面会出现一个新的运行记录，点击进去查看执行日志

---

## 📊 预期结果

### ✅ 成功的标志：
- 所有步骤都显示绿色 ✓
- 在 "Process single PDF" 步骤中看到 PDF 处理日志
- 如果有新 PDF，会自动提交到仓库
- `src/data/articlesData.ts` 会更新

### ❌ 如果失败：
- 检查 API Key 是否正确配置
- 检查 `pdfs_to_process/` 目录是否有 PDF 文件
- 查看详细错误日志

---

## 🕐 自动执行时间

配置成功后，系统将：
- **每天北京时间早上 6:00** 自动执行
- 自动处理 `pdfs_to_process/` 中的第一个 PDF
- 自动提交更新到 GitHub
- 网站自动更新（如果部署了 GitHub Pages）

---

## 📁 测试用 PDF

我看到你已经有一个 PDF 文件在队列中：
```
pdfs_to_process/【哔哩哔哩】2026年轻人消费趋势报告：智性沸腾.pdf
```

这个文件会在第一次运行时被处理！

---

## 🎯 下一步

1. ✅ 完成上述 2 个配置步骤
2. ✅ 手动触发一次测试
3. ✅ 查看执行结果
4. ✅ 检查网站是否更新

配置完成后告诉我结果！🚀

