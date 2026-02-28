# GitHub 登录功能配置说明

## 步骤 1：创建 GitHub OAuth 应用

1. 登录 GitHub 账户
2. 访问 https://github.com/settings/developers
3. 点击 "New OAuth App" 按钮
4. 填写以下信息：
   - **Application name**: 你的网站名称（例如：爱IT）
   - **Homepage URL**: 你的网站 URL（例如：https://yourdomain.com）
   - **Application description**: 可选的描述
   - **Authorization callback URL**: `http://localhost:8090/api/auth/github/callback`（本地开发）或 `https://yourdomain.com/api/auth/github/callback`（生产环境）
5. 点击 "Register application"
6. 复制生成的 `Client ID` 和 `Client Secret`

## 步骤 2：配置环境变量

1. 打开 `.env` 文件
2. 将 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` 替换为你在步骤 1 中获得的值
3. 根据你的环境修改 `SITE` 变量

## 步骤 3：部署到生产环境

1. 在生产环境的服务器上设置相同的环境变量
2. 确保 GitHub OAuth 应用的回调 URL 已更新为生产环境的 URL
3. 部署应用

## 功能说明

- **登录**: 点击导航栏中的 "GitHub 登录" 按钮
- **登出**: 登录后，点击用户头像旁边的 "退出" 链接
- **用户信息**: 登录后会显示用户的 GitHub 头像和用户名

## 安全注意事项

- 不要将 `GITHUB_CLIENT_SECRET` 提交到版本控制系统
- 在生产环境中使用 HTTPS
- 定期更新你的 OAuth 应用密钥

## 故障排除

- **401 错误**: 检查 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` 是否正确
- **回调 URL 不匹配**: 确保 GitHub OAuth 应用的回调 URL 与你的应用配置一致
- **CORS 错误**: 确保你的服务器配置允许 GitHub 的请求