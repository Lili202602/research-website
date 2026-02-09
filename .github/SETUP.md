# GitHub Actions 定时发布设置指南

## 🎯 功能说明

每天北京时间早上 6:00 自动处理一篇 PDF 并发布到网站。

---

## 📋 设置步骤

### 1. 配置 GitHub Secret

1. 访问你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 Secret：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: 你的 DeepSeek API Key

### 2. 启用 GitHub Actions

1. 访问仓库的 **Actions** 标签
2. 如果看到提示，点击 **I understand my workflows, go ahead and enable them**
3. 找到 **Daily Insight Auto Publish** 工作流
4. 确认已启用

### 3. 配置 Workflow 权限

1. 访问 **Settings** → **Actions** → **General**
2. 滚动到 **Workflow permissions**
3. 选择 **Read and write permissions**
4. 勾选 **Allow GitHub Actions to create and approve pull requests**
5. 点击 **Save**

---

## 🚀 使用方法

### 自动发布（推荐）

1. 将 PDF 文件上传到 `pdfs_to_process/` 目录
2. Commit 并 Push 到 GitHub
3. 等待每天早上 6:00 自动处理
4. 查看 Actions 页面确认执行状态

### 手动触发

1. 访问 **Actions** 标签
2. 选择 **Daily Insight Auto Publish**
3. 点击 **Run workflow**
4. 选择分支（通常是 `main`）
5. 点击 **Run workflow** 按钮

---

## 📊 执行流程

```
1. 定时触发 (UTC 22:00 / 北京 06:00)
   ↓
2. Checkout 代码
   ↓
3. 安装 Node.js 18
   ↓
4. 安装依赖 (npm ci)
   ↓
5. 运行单篇处理 (npm run process:single)
   ├─ 读取 pdfs_to_process/ 第一个 PDF
   ├─ 提取文本
   ├─ 调用 DeepSeek API
   ├─ 生成文章数据
   ├─ 移动 PDF 到 public/pdfs/
   └─ 更新 articlesData.ts
   ↓
6. 检查是否有变更
   ↓
7. 自动 Commit 并 Push
   ↓
8. Vercel 自动部署
   ↓
9. 网站更新完成 ✅
```

---

## 🔍 监控和调试

### 查看执行日志

1. 访问 **Actions** 标签
2. 点击最近的工作流运行
3. 查看每个步骤的详细日志

### 常见问题

#### 问题 1：工作流未执行
**原因**：可能是 Actions 未启用或权限不足  
**解决**：检查 Actions 设置和 Workflow 权限

#### 问题 2：API Key 错误
**原因**：Secret 未设置或值错误  
**解决**：重新设置 `DEEPSEEK_API_KEY` Secret

#### 问题 3：Push 失败
**原因**：Workflow 权限不足  
**解决**：启用 "Read and write permissions"

#### 问题 4：没有 PDF 需要处理
**原因**：`pdfs_to_process/` 目录为空或所有 PDF 已处理  
**解决**：上传新的 PDF 文件

---

## 📅 定时配置

### 当前配置
- **Cron 表达式**: `0 22 * * *`
- **UTC 时间**: 22:00
- **北京时间**: 06:00（次日）

### 修改定时

编辑 `.github/workflows/daily-insight.yml`：

```yaml
schedule:
  - cron: '0 22 * * *'  # 修改这里
```

**Cron 表达式格式**：
```
分钟 小时 日 月 星期
0    22   *  *  *
```

**常用时间**：
- `0 22 * * *` - 每天 UTC 22:00（北京 06:00）
- `0 14 * * *` - 每天 UTC 14:00（北京 22:00）
- `0 2 * * *` - 每天 UTC 02:00（北京 10:00）
- `0 22 * * 1-5` - 工作日 UTC 22:00

---

## 🎛️ 高级配置

### 修改处理数量

如果想每次处理多篇，修改 `package.json`：

```json
"process:batch": "ts-node scripts/process-pdfs.ts"
```

然后在 workflow 中使用：
```yaml
run: npm run process:batch
```

### 添加通知

在 workflow 末尾添加：

```yaml
- name: Send notification
  if: steps.check_changes.outputs.has_changes == 'true'
  run: |
    curl -X POST https://your-webhook-url \
      -H 'Content-Type: application/json' \
      -d '{"text":"新文章已发布"}'
```

### 添加错误处理

```yaml
- name: Process single PDF
  continue-on-error: true
  env:
    DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
  run: npm run process:single

- name: Notify on failure
  if: failure()
  run: echo "处理失败，请检查日志"
```

---

## 📈 使用统计

### 查看执行历史

1. 访问 **Actions** 标签
2. 查看所有运行记录
3. 点击具体运行查看详情

### 配额限制

- **GitHub Actions 免费额度**: 2000 分钟/月
- **预计每次执行时间**: 2-3 分钟
- **每月可执行次数**: 约 600 次
- **每天执行 1 次**: 完全够用

---

## 🔐 安全建议

1. **不要在代码中硬编码 API Key**
2. **定期更换 API Key**
3. **限制 Workflow 权限**（只给必要的权限）
4. **监控 Actions 执行日志**
5. **设置 Branch Protection Rules**

---

## 📞 故障排查

### 检查清单

- [ ] GitHub Secret `DEEPSEEK_API_KEY` 已设置
- [ ] Workflow 权限已启用（Read and write）
- [ ] Actions 已启用
- [ ] `pdfs_to_process/` 目录有 PDF 文件
- [ ] PDF 文件未在 `processed_pdfs.json` 中
- [ ] 网络连接正常（DeepSeek API 可访问）

### 测试命令

本地测试单篇处理：
```bash
DEEPSEEK_API_KEY="your_key" npm run process:single
```

---

## 🎉 完成！

现在你的网站已经实现了：
- ✅ 每天自动发布一篇文章
- ✅ 无需手动操作
- ✅ 自动部署到 Vercel
- ✅ 完全云端化

只需要定期上传 PDF 到 `pdfs_to_process/` 目录即可！

---

**最后更新**: 2026年02月09日  
**维护者**: Lili

