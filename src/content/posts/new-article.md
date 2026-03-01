---
title: "如何通过 fuwari 部署博客并发布到 GitHub、Cloudflare"
date: "2026-03-01"
description: "步骤说明如何使用 fuwari 构建博客，并通过 GitHub 和 Cloudflare 部署。"
---

下面是一篇示例文章，介绍如何使用 **fuwari** 构建、部署博客，并将其托管在 GitHub 上，结合 Cloudflare 实现安全加速和发布。

---

# 使用 fuwari 部署博客并通过 GitHub + Cloudflare 发布

**作者**：GitHub Copilot  
**日期**：2026‑03‑01

## 📌 前提条件

1. 已安装 Node.js (建议 18+)。
2. 熟悉 Git、GitHub 仓库创建与推送。
3. 有一个自己的域名（可选）。
4. 拥有 Cloudflare 账户。

---

## 🚀 1. 初始化 fuwari 项目

```bash
# 克隆官方模板或从空目录开始
git clone https://github.com/saicaca/fuwari my-blog
cd my-blog

# 安装依赖并启动本地开发服务器
pnpm install        # 或 npm/yarn
pnpm dev            # 运行开发模式，默认 localhost:3000
```

修改 `src/content/posts/` 目录下的 Markdown 文件添加文章。可调整配置位于 `src/config.ts`、`astro.config.mjs` 等。

---

## 🛠️ 2. 本地调试与定制

- 编辑主题相关组件：`src/components/`、`src/layouts/`。
- 使用 Tailwind、Astro 插件、i18n 等功能。
- 运行 `pnpm build` 进行打包，输出静态文件在 `dist/`。

> 💡 **建议**：在本地多测试不同页面、搜索功能、评论等组件是否正常。

---

## 📁 3. 推送到 GitHub

1. 在 GitHub 上创建新仓库（比如 `username/blog`）。
2. 本地关联并推送：

```bash
git init
git remote add origin git@github.com:username/blog.git
git add .
git commit -m "初始 fuwari 博客"
git branch -M main
git push -u origin main
```

3. 在仓库中，**可选**添加 GitHub Pages 设置（不过我们会使用 Cloudflare Pages/Workers）。

---

## 🌐 4. 使用 Cloudflare 部署

### 4.1 Cloudflare Pages（推荐）

- 登录 Cloudflare，进入 **Pages** 服务。
- 点击 “Create a project”，选择 GitHub 账户并授权。
- 选中刚才的博客仓库。
- 配置：
  - 框架：`npm`、`pnpm` 任选（使用 `build` 命令 `pnpm run build`）。
  - 构建输出目录：`dist`
  - 环境变量（如有私密配置）。

- 保存并部署。Cloudflare 开始构建并发布，生成 `*.pages.dev` 域名。

### 4.2 Cloudflare Workers / Static Sites

也可以通过 Workers 或 `wrangler` 上传 `dist/` 静态文件：

```bash
npm install -g wrangler
wrangler login

# 在项目根创建 wrangler.toml
```

示例配置略。

---

## 🔐 5. 添加自定义域与 DNS

- 在 Cloudflare 仪表盘添加域名 **site.example.com**。
- 为 Pages/Workers 生成的地址创建 CNAME 记录。
- 开启 **SSL/TLS**（通常自动由 Cloudflare 管理）。
- 启用必要的优化（缓存、页面规则、防火墙等）。

---

## ✅ 6. 完成与验证

- 访问你的自定义域或 `*.pages.dev`，检查博客是否加载正常。
- 提前设置自动构建：每次向 `main` 分支推送，Cloudflare 会触发部署。
- 如果需要评论、搜索或 API 功能，确保对应的 Cloudflare Worker 或后端正确配置。

---

## 💡 小贴士

- 使用 `cloudflare-pages` 或 `@astrojs/cloudflare` 适配器简化配置。
- 若有多语言支持，检查 `i18n` 文件和路由。
- 在 `vercel.json`、`pagefind.yml` 等配置里可调整索引和缓存。

---

🎉 至此，你的 fuwari 博客已成功搭建并通过 GitHub & Cloudflare 高效发布！欢迎持续编写内容并享受静态站点带来的快速体验。