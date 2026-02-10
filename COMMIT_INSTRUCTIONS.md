# 提交指令

由于系统权限限制，请在你的终端中手动执行以下命令：

## 1. 查看当前修改状态
```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"
git status
```

## 2. 添加所有修改到暂存区
```bash
git add .github/workflows/daily-insight.yml
git add package.json
git add scripts/process-pdfs.ts
git add PRD.md
git add scripts/README.md
git rm package-lock.json
```

## 3. 提交修改
```bash
git commit -m "fix: 修复 GitHub Actions 依赖安装问题

- 将 npm ci 改为 npm install 提高容错率
- 删除 package-lock.json，让云端自动处理版本锁定
- 修复 ES Module __dirname 问题
- 移除 npm cache 配置避免缓存冲突"
```

## 4. 推送到 GitHub
```bash
git push origin main
```

## 已完成的修改

### ✅ .github/workflows/daily-insight.yml
- 将 `npm ci` 改为 `npm install`
- 移除了 `cache: 'npm'` 配置

### ✅ scripts/process-pdfs.ts
- 添加了 ES Module 兼容代码（__dirname 修复）
- 支持 --single 参数

### ✅ package.json
- 添加了 `"type": "module"`
- 包含所有必要的依赖和脚本

### ✅ 删除 package-lock.json
- 避免版本锁定冲突
- 让 GitHub Actions 自动生成

## 下一步

提交成功后：
1. 前往 GitHub 仓库的 Settings → Secrets and variables → Actions
2. 添加 Secret：`DEEPSEEK_API_KEY`（值为你的 DeepSeek API Key）
3. 前往 Settings → Actions → General → Workflow permissions
4. 选择 "Read and write permissions"
5. 保存设置

然后你可以：
- 在 Actions 标签页手动触发 workflow 测试
- 或等待每天北京时间早上 6:00 自动执行

