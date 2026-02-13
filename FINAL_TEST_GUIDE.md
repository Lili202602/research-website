# 🚀 系统就绪 - 完整测试指南

## ✅ 已完成的准备工作

### 1. 清理完成
- ✅ 删除了旧的 `pdfs/` 目录
- ✅ 删除了所有旧的 PDF 文件
- ✅ 统一使用 `public/pdfs/` 作为发布目录

### 2. 自动化系统就绪
- ✅ `upload-pdfs.sh` - 批量上传脚本
- ✅ `daily-insight.yml` - 每天早上 6:00 自动处理
- ✅ `deploy.yml` - 自动部署到网站
- ✅ 权限配置完成（`permissions: contents: write`）

### 3. 文档完备
- ✅ `AUTOMATION_GUIDE.md` - 使用指南
- ✅ `TROUBLESHOOTING.md` - 故障排查
- ✅ `RECOVERY_GUIDE.md` - 恢复指南
- ✅ `ACTIONS_FIX_CHECKLIST.md` - Actions 修复清单

---

## 🧪 完整测试流程

### 测试 1：上传 PDF 到 GitHub

```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

# 1. 准备一个测试 PDF（使用之前的小文件）
git checkout e18ec31 -- "pdfs_to_process/【硕远咨询】2025年中国农产品加工行业研究报告.pdf"

# 2. 查看文件
ls -lh pdfs_to_process/*.pdf

# 3. 上传到 GitHub
./upload-pdfs.sh
```

**预期结果**：
- ✅ 脚本显示找到 1 个 PDF
- ✅ 询问确认
- ✅ 提交并推送成功
- ✅ 本地 PDF 移动到 `pdfs_archived/`

---

### 测试 2：手动触发 GitHub Actions

1. 访问：
   ```
   https://github.com/Lili202602/research-website/actions/workflows/daily-insight.yml
   ```

2. 点击 "Run workflow"

3. 选择 `main` 分支

4. 点击绿色的 "Run workflow"

---

### 测试 3：查看 Actions 日志

点击运行记录，检查每个步骤：

#### ✅ "Install dependencies"
```
added 1323 packages
```

#### ✅ "Process single PDF"
```
开始处理：【硕远咨询】2025年中国农产品加工行业研究报告.pdf
已发布：posts/20260210-xxx.html （PDF：pdfs/xxx.pdf）
处理完成：已更新 src/data/articlesData.ts / posts/ / public/pdfs/
```

#### ✅ "Debug - Show generated files"
```
=== 检查生成的文件 ===
articlesData.ts:
-rw-r--r-- 1 runner docker 1234 Feb 10 12:34 src/data/articlesData.ts

posts/:
-rw-r--r-- 1 runner docker 5678 Feb 10 12:34 20260210-xxx.html

public/pdfs/:
-rw-r--r-- 1 runner docker 964K Feb 10 12:34 【硕远咨询】2025年中国农产品加工行业研究报告.pdf

Git 状态:
M src/data/articlesData.ts
A posts/20260210-xxx.html
A public/pdfs/【硕远咨询】2025年中国农产品加工行业研究报告.pdf
M data/processed_pdfs.json
D pdfs_to_process/【硕远咨询】2025年中国农产品加工行业研究报告.pdf
```

#### ✅ "Check for changes"
```
✅ 检测到文件变更
```

#### ✅ "Commit and push changes"
```
=== 添加文件到 Git ===
=== 提交更改 ===
[main abc1234] chore: 自动发布每日洞察 [2026-02-10]
=== 推送到远程 ===
✅ 推送成功
```

---

### 测试 4：验证网站更新

1. 等待 5-10 分钟（部署时间）

2. 访问：
   ```
   https://www.liliailab.cn
   ```

3. 检查：
   - ✅ 首页显示新文章
   - ✅ 文章标题正确
   - ✅ 核心观点显示
   - ✅ 专家点评显示
   - ✅ PDF 下载链接可用

---

### 测试 5：验证 GitHub 仓库

访问：
```
https://github.com/Lili202602/research-website
```

检查：
- ✅ `pdfs_to_process/` 中的 PDF 已删除
- ✅ `public/pdfs/` 中有新的 PDF
- ✅ `posts/` 中有新的 HTML 文章
- ✅ `src/data/articlesData.ts` 已更新
- ✅ 有新的提交："chore: 自动发布每日洞察"

---

## 🎉 测试成功标志

### 全部通过 ✅
- ✅ PDF 成功上传到 GitHub
- ✅ GitHub Actions 成功处理
- ✅ 文件成功生成并提交
- ✅ 网站自动部署
- ✅ 新文章在网站上显示

### 如果有问题 ❌
参考以下文档：
- `TROUBLESHOOTING.md` - 故障排查
- `ACTIONS_FIX_CHECKLIST.md` - Actions 问题
- `RECOVERY_GUIDE.md` - 恢复指南

---

## 📅 日常使用流程

### 每周操作（批量上传）

```bash
# 1. 准备 PDF
cp ~/Downloads/报告*.pdf pdfs_to_process/

# 2. 上传
./upload-pdfs.sh

# 3. 等待自动处理（每天一篇）
```

### 紧急发布

```bash
# 1. 上传 PDF
./upload-pdfs.sh

# 2. 手动触发
# 访问: https://github.com/Lili202602/research-website/actions
# 点击 "Run workflow"
```

---

## 🔍 监控和维护

### 每周检查
- 查看 Actions 运行状态
- 确认文章正常发布
- 检查网站显示正常

### 每月维护
- 清理 `pdfs_archived/` 归档
- 检查 API 配额使用情况
- 更新依赖包（如需要）

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 Actions 日志
2. 参考故障排查文档
3. 检查 Secret 配置
4. 验证权限设置

---

**现在开始测试 1：恢复测试 PDF 并上传！** 🚀

