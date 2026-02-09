# GitHub Pages 部署配置指南

## 🎯 问题说明

GitHub Pages 默认使用 Jekyll 构建静态网站，但我们的项目是 React 应用，需要使用 npm build 构建。

## ✅ 已完成的修复

### 1. 创建 `.nojekyll` 文件
告诉 GitHub Pages 不要使用 Jekyll 构建。

### 2. 创建 `.github/workflows/deploy.yml`
新的部署 workflow，会自动：
- 安装依赖
- 构建 React 应用
- 部署到 GitHub Pages

### 3. 添加 `homepage` 到 package.json
确保 React Router 路由正确。

---

## 📋 需要在 GitHub 上配置（重要！）

### 步骤 1：修改 Pages 部署源

1. 访问：
   ```
   https://github.com/Lili202602/research-website/settings/pages
   ```

2. 在 "Build and deployment" 部分：
   - **Source**: 选择 `GitHub Actions`（不是 Deploy from a branch）
   
3. 保存设置

---

## 🚀 提交并部署

在终端执行：

```bash
cd "/Users/lesley/Desktop/GitHub/Research Web/research-website"

git add .nojekyll .github/workflows/deploy.yml package.json

git commit -m "feat: 配置 GitHub Pages 自动部署 React 应用

- 添加 .nojekyll 禁用 Jekyll
- 创建 deploy.yml workflow 自动构建和部署
- 添加 homepage 字段到 package.json"

git push origin main
```

---

## 🎉 部署后

推送后，GitHub Actions 会自动：
1. ✅ 构建 React 应用
2. ✅ 部署到 GitHub Pages
3. ✅ 网站将在 5-10 分钟内上线

访问地址：
```
https://lili202602.github.io/research-website
```

---

## 📊 两个独立的 Workflows

现在你有两个 workflow：

### 1. `deploy.yml` - 网站部署
- 触发：每次推送到 main 分支
- 作用：构建并部署 React 应用到 GitHub Pages

### 2. `daily-insight.yml` - 自动发布
- 触发：每天早上 6:00（北京时间）
- 作用：处理 PDF，生成文章，自动提交
- 提交后会触发 `deploy.yml` 自动部署

---

## ⚠️ 重要提醒

完成上述配置后，记得：
1. ✅ 在 GitHub Settings → Pages 中选择 "GitHub Actions" 作为部署源
2. ✅ 确保 Actions 有写权限（Settings → Actions → General → Workflow permissions → Read and write）
3. ✅ 配置 DEEPSEEK_API_KEY Secret

完成后告诉我！🚀

