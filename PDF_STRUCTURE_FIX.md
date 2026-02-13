# PDF 目录混乱问题诊断和解决方案

## 🔍 问题诊断

### 你遇到的问题

1. ✅ GitHub Actions 显示成功
2. ❌ 网页没有更新
3. ❌ PDF 文件放错位置：
   - GitHub 云端：在 `pdfs/`（错误）
   - 本地：一个在 `pdfs_archived/`，一个在 `pdfs/`（混乱）

---

## 🎯 根本原因

### 目录结构混乱

你的项目中有**三个 PDF 目录**：

```
1. pdfs/                 ← 旧目录（应该删除，但还在被使用）
   └── 【华泰证券】宁德时代.pdf

2. public/pdfs/          ← 正确的发布目录（脚本使用）
   └── 【硕远咨询】2025年中国农产品加工行业研究报告.pdf

3. pdfs_archived/        ← 本地归档（upload-pdfs.sh 使用）
   └── 6 个旧 PDF
```

### 为什么网页没有更新？

**网页读取的是 `public/pdfs/`，但部分文件被放到了 `pdfs/`！**

---

## ✅ 解决方案

### 步骤 1: 运行修复脚本

在终端执行：

```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

chmod +x fix-pdf-structure.sh

./fix-pdf-structure.sh
```

脚本会：
1. ✅ 将 `pdfs/` 中的文件移动到 `public/pdfs/`
2. ✅ 删除 `pdfs/` 目录
3. ✅ 提交并推送到 GitHub

---

### 步骤 2: 验证修复

修复后，目录结构应该是：

```
pdfs_to_process/         ← 待处理队列（上传新 PDF 到这里）
    └── (空)

public/pdfs/             ← 已发布（GitHub Actions 处理后移动到这里）
    └── 【硕远咨询】2025年中国农产品加工行业研究报告.pdf
    └── 【华泰证券】宁德时代.pdf

pdfs_archived/           ← 本地归档（upload-pdfs.sh 使用）
    └── 6 个旧 PDF
```

---

## 📋 正确的工作流程

### 上传新 PDF

```bash
# 1. 将 PDF 放入 pdfs_to_process/
cp ~/Downloads/*.pdf pdfs_to_process/

# 2. 运行上传脚本
./upload-pdfs.sh
```

**upload-pdfs.sh 做什么？**
- ✅ 提交 PDF 到 GitHub 的 `pdfs_to_process/`
- ✅ 移动本地 PDF 到 `pdfs_archived/`（本地归档）

---

### GitHub Actions 自动处理

**每天早上 6:00 或手动触发时：**

1. ✅ 从 `pdfs_to_process/` 取出第一个 PDF
2. ✅ 调用 DeepSeek API 分析
3. ✅ 生成文章数据（`src/data/articlesData.ts`）
4. ✅ 移动 PDF 到 `public/pdfs/`
5. ✅ 删除 `pdfs_to_process/` 中的原文件
6. ✅ 自动提交并部署

---

## 🎯 为什么会出现混乱？

### 历史遗留问题

1. **旧版本**使用 `pdfs/` 目录
2. **新版本**改用 `public/pdfs/` 目录
3. **但旧目录没有被完全清理**

### 导致的问题

- 部分代码还在引用 `pdfs/`
- GitHub Actions 可能在某些情况下使用了错误的路径
- 文件被分散到不同目录

---

## 🔧 修复后的预期结果

### 1. 网页会更新

修复后，所有 PDF 都在 `public/pdfs/`，网页能正确读取。

### 2. 目录清晰

```
pdfs_to_process/  → 待处理（GitHub）
public/pdfs/      → 已发布（GitHub，网页读取）
pdfs_archived/    → 本地归档（仅本地）
```

### 3. 工作流顺畅

```
上传 PDF → pdfs_to_process/
    ↓
GitHub Actions 处理
    ↓
移动到 public/pdfs/
    ↓
网页自动更新
```

---

## 📝 检查清单

修复后请检查：

- [ ] 运行 `./fix-pdf-structure.sh`
- [ ] 确认 `pdfs/` 目录已删除
- [ ] 确认所有 PDF 在 `public/pdfs/`
- [ ] 访问网站，确认文章显示
- [ ] 手动触发 Actions，测试新的工作流

---

## 🎉 总结

### 问题根源
- ✅ 旧的 `pdfs/` 目录没有清理
- ✅ 文件被放到错误的位置
- ✅ 网页读取不到 PDF

### 解决方案
- ✅ 运行 `fix-pdf-structure.sh` 统一目录
- ✅ 删除 `pdfs/` 目录
- ✅ 所有 PDF 统一到 `public/pdfs/`

**现在运行修复脚本吧！** 🚀

