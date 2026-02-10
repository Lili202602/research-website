# PDF 文件恢复和重新处理指南

## 🔍 问题诊断结果

### 发现的问题：
1. ✅ 两个 PDF 文件曾经在 `pdfs_to_process/` 中（提交 e18ec31）
2. ❌ 脚本处理后，文件被移动到 `public/pdfs/`，但没有提交到 Git
3. ❌ 现在 GitHub 仓库中 `pdfs_to_process/` 是空的
4. ❌ `public/pdfs/` 也是空的
5. ❌ 文章数据没有更新

### 结论：
**需要从历史提交中恢复 PDF 文件，然后重新处理。**

---

## 🛠️ 解决方案

### 步骤 1：恢复 PDF 文件到 pdfs_to_process/

在终端执行：

```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

# 从历史提交中恢复两个 PDF 文件
git checkout e18ec31 -- "pdfs_to_process/【哔哩哔哩】2026年轻人消费趋势报告：智性沸腾.pdf"
git checkout e18ec31 -- "pdfs_to_process/【硕远咨询】2025年中国农产品加工行业研究报告.pdf"

# 查看状态
git status
```

---

### 步骤 2：清理已处理记录

因为这些 PDF 之前被标记为"已处理"，需要从记录中移除：

```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

# 编辑 data/processed_pdfs.json，手动删除这两个文件名
# 或者直接重置为空数组
echo '[]' > data/processed_pdfs.json

git add data/processed_pdfs.json
```

---

### 步骤 3：提交恢复的文件

```bash
git commit -m "fix: 恢复待处理的 PDF 文件

- 从历史提交恢复两个 PDF 到 pdfs_to_process/
- 清空 processed_pdfs.json 以便重新处理"

git push origin main
```

---

### 步骤 4：手动触发 GitHub Actions

1. 访问：
   ```
   https://github.com/Lili202602/research-website/actions/workflows/daily-insight.yml
   ```

2. 点击 "Run workflow"

3. 选择 `main` 分支

4. 点击绿色的 "Run workflow" 按钮

5. 等待执行完成

---

## ⚠️ 重要提示

### 关于大文件（35MB）

第一个 PDF 文件（哔哩哔哩报告）有 35MB，可能导致：
- API 调用超时
- 处理时间过长

**建议**：先只恢复小文件

```bash
# 只恢复小文件
git checkout e18ec31 -- "pdfs_to_process/【硕远咨询】2025年中国农产品加工行业研究报告.pdf"

git add "pdfs_to_process/【硕远咨询】2025年中国农产品加工行业研究报告.pdf"
git commit -m "fix: 恢复小文件用于测试"
git push origin main
```

等小文件处理成功后，再恢复大文件。

---

## 📋 完整操作流程（推荐）

### 方案 A：先处理小文件（推荐）

```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

# 1. 只恢复小文件
git checkout e18ec31 -- "pdfs_to_process/【硕远咨询】2025年中国农产品加工行业研究报告.pdf"

# 2. 清空处理记录
echo '[]' > data/processed_pdfs.json

# 3. 提交
git add "pdfs_to_process/【硕远咨询】2025年中国农产品加工行业研究报告.pdf" data/processed_pdfs.json
git commit -m "fix: 恢复小文件并清空处理记录"
git push origin main
```

然后手动触发 GitHub Actions。

---

### 方案 B：同时恢复两个文件

```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

# 1. 恢复两个 PDF
git checkout e18ec31 -- "pdfs_to_process/【哔哩哔哩】2026年轻人消费趋势报告：智性沸腾.pdf"
git checkout e18ec31 -- "pdfs_to_process/【硕远咨询】2025年中国农产品加工行业研究报告.pdf"

# 2. 清空处理记录
echo '[]' > data/processed_pdfs.json

# 3. 提交
git add pdfs_to_process/*.pdf data/processed_pdfs.json
git commit -m "fix: 恢复所有待处理 PDF 并清空处理记录"
git push origin main
```

---

## 🎯 预期结果

执行完成后：
1. ✅ PDF 文件回到 `pdfs_to_process/`
2. ✅ GitHub Actions 自动触发处理
3. ✅ 生成文章数据到 `src/data/articlesData.ts`
4. ✅ 生成文章详情到 `posts/`
5. ✅ PDF 移动到 `public/pdfs/`
6. ✅ 自动提交并部署
7. ✅ 网站显示新文章

---

**请选择方案 A 或 B，在终端执行命令！** 🚀

