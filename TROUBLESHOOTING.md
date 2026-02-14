# 网站更新问题排查和解决方案

## 🔍 问题诊断

根据诊断结果：
- ✅ `articlesData.ts` 有 8 篇文章（但都是旧的）
- ❌ `posts/` 目录为空（没有 HTML 文件）
- ❌ `public/pdfs/` 目录为空（没有 PDF 文件）
- ✅ `pdfs_to_process/` 有 3 个待处理 PDF

**结论**：Actions 可能没有成功处理 PDF，或者处理了但没有正确提交文件。

---

## 🛠️ 解决方案

### 方案 1：检查 GitHub Actions 日志（推荐）

1. 访问 GitHub Actions 页面：
   ```
   https://github.com/Lili202602/research-website/actions
   ```

2. 找到最近运行的 "Daily Insight Auto Publish" 工作流

3. 点击查看详细日志，检查：
   - "Process single PDF" 步骤是否有错误
   - "Debug - Show generated files" 步骤显示了什么
   - "Commit and push changes" 步骤是否成功

4. 如果看到错误，请告诉我具体的错误信息

---

### 方案 2：手动触发部署

如果 Actions 已经成功提交了文件，但网站没有更新，可以手动触发部署：

#### 如果是 GitHub Pages：
1. 访问 Actions 页面
2. 找到 "Deploy to GitHub Pages" 工作流
3. 点击 "Run workflow" 手动触发

#### 如果是 Vercel：
1. 访问 Vercel 控制台
2. 找到项目
3. 点击 "Redeploy" 重新部署

---

### 方案 3：本地测试处理脚本

如果 Actions 失败了，可以在本地测试处理脚本：

```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

# 设置 API Key（临时）
export DEEPSEEK_API_KEY="你的API密钥"

# 运行处理脚本
npm run process:single
```

检查是否生成了：
- `posts/` 目录中的 HTML 文件
- `public/pdfs/` 目录中的 PDF 文件
- 更新的 `articlesData.ts`

---

### 方案 4：强制重新部署

如果确认文件已经提交到 GitHub，但网站没有更新：

1. **清除浏览器缓存**：
   - Chrome: Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)
   - 选择"缓存的图片和文件"
   - 清除缓存

2. **硬刷新页面**：
   - Windows: Ctrl+F5
   - Mac: Cmd+Shift+R

3. **检查网站是否使用 CDN**：
   - 如果是 Vercel，可能需要等待几分钟
   - 如果是 GitHub Pages，可能需要等待 5-10 分钟

---

## 📋 下一步操作

请先执行**方案 1**，查看 GitHub Actions 的日志，然后告诉我：

1. Actions 是否成功运行？
2. 如果有错误，具体的错误信息是什么？
3. "Debug - Show generated files" 步骤显示了什么？

这样我可以更准确地帮你解决问题！
