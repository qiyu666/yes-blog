---
title: "fuwari部署教程"
published: 2026-03-01
description: "简简单单的部署，跟着教程做，你也能有一个属于你自己的搏客"
tags: ["", "搏客", "网站"]
category: "搏客"
draft: false
---
# 如何通过 fuwari 部署博客并发布到 GitHub、Cloudflare

**作者**：AI 助手
**日期**：2026-03-01
**文档版本**：v1.0

---

## 📌 前提条件

1. 已安装 Node.js (建议 18+)
2. 熟悉 Git、GitHub 仓库创建与推送
3. 有一个自己的域名（可选）
4. 拥有 Cloudflare 账户

---

## 🚀 1. 初始化 fuwari 项目

### 1.1 克隆项目

```
# 克隆官方模板
git clone https://github.com/saicaca/fuwari my-blog
cd my-blog
```

### 1.2 安装依赖

```
# 推荐使用 pnpm
pnpm install

# 或使用 npm
# npm install

# 或使用 yarn
# yarn install
```

### 1.3 启动本地开发

```
pnpm dev
```

开发服务器默认运行在 `http://localhost:3000`

---

## 🛠️ 2. 本地调试与定制

### 2.1 项目结构调整

- **文章内容**：`src/content/posts/`
- **主题组件**：`src/components/`
- **布局文件**：`src/layouts/`
- **全局配置**：`src/config.ts`
- **Astro 配置**：`astro.config.mjs`

### 2.2 关键配置修改（重要！）

#### 安装 Cloudflare 适配器

```
pnpm add @astrojs/cloudflare
```

#### 修改 astro.config.mjs

```
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
});
```

### 2.3 构建测试

```
pnpm build
```

构建输出目录：`dist/`

---

## 📁 3. 推送到 GitHub

### 3.1 创建 GitHub 仓库

1. 登录 GitHub
2. 点击 "New repository"
3. 命名仓库（如：my-blog）
4. 选择公开或私有

### 3.2 推送代码

```
# 初始化本地仓库
git init
git remote add origin git@github.com:your-username/my-blog.git

# 添加并提交代码
git add .
git commit -m "Initial commit with fuwari blog"

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 4. 使用 Cloudflare 部署

### 4.1 Cloudflare Pages（推荐）

#### 创建 Pages 项目

1. 登录 Cloudflare 仪表盘
2. 进入 **Pages** 服务
3. 点击 "Create a project"
4. 选择 GitHub 账户并授权

#### 配置项目

- **Repository**：选择刚才推送的仓库
- **Build command**：`pnpm run build`
- **Build directory**：`dist`
- **Environment Variables**：根据需要添加

#### 部署

点击 "Save and Deploy"，Cloudflare 将自动构建并发布

### 4.2 环境变量配置说明

#### 构建时变量

在 Pages 设置的 "Environment Variables" 中添加，用于构建过程

#### 运行时变量

在 Cloudflare Dashboard 的 "Workers & Pages" > "Variables" 中设置

---

## 🔐 5. 添加自定义域与 DNS

### 5.1 添加域名

1. 在 Cloudflare 仪表盘添加域名
2. 按照指引修改域名 DNS 服务器

### 5.2 配置 DNS 记录

1. 进入 "DNS" 设置
2. 添加 CNAME 记录指向 Pages 生成的地址
3. 或直接使用 Pages 提供的域名

### 5.3 SSL/TLS 设置

- **SSL/TLS 模式**：Full (严格)
- **自动 HTTPS 重写**：开启
- ** Opportunistic Encryption**：开启

---

## ✅ 6. 完成与验证

### 6.1 访问验证

- 访问生成的 `*.pages.dev` 域名
- 或访问自定义域名
- 检查所有页面加载是否正常

### 6.2 自动部署设置

- 每次向 `main` 分支推送代码
- Cloudflare Pages 会自动触发构建和部署
- 可在 "Settings" > "Builds" 中配置

### 6.3 功能验证

- 检查文章显示是否正常
- 测试搜索功能
- 验证评论系统（如有）
- 检查多语言支持（如有）

---

## 💡 小贴士与最佳实践

### 7.1 性能优化

- 启用 Brotli 压缩
- 配置缓存策略
- 使用 CDN 加速静态资源

### 7.2 安全设置

- 启用 WAF（Web Application Firewall）
- 配置速率限制
- 启用 DDoS 保护

### 7.3 监控与分析

- 配置 Google Analytics
- 使用 Cloudflare Analytics
- 设置部署通知（Slack、Email 等）

### 7.4 常见问题排查

- **构建失败**：检查 `astro.config.mjs` 配置
- **页面加载慢**：优化图片和资源
- **功能异常**：查看浏览器控制台错误
- **部署问题**：检查 Cloudflare Pages 构建日志

---

## 🔄 后续维护

### 8.1 内容更新

- 在 `src/content/posts/` 添加新文章
- 使用 Markdown 语法编写内容
- 提交并推送到 GitHub

### 8.2 主题定制

- 修改 `src/styles/` 中的 CSS
- 自定义组件在 `src/components/`
- 调整布局在 `src/layouts/`

### 8.3 依赖更新

```
# 检查依赖更新
pnpm outdated

# 更新依赖
pnpm update
```

---

## 🎉 总结

通过以上步骤，您已经成功：

1. 初始化并配置了 fuwari 博客项目
2. 完成了本地开发和调试
3. 将代码托管到 GitHub
4. 使用 Cloudflare Pages 实现自动化部署
5. 配置了自定义域名和安全设置

现在您可以专注于内容创作，享受快速、安全的静态博客体验！

---

**文档完成时间**：2026-03-01
**最后更新**：2026-03-01
**文档状态**：正式版