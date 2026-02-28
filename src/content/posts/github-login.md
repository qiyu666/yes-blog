---
title: "给自己的网站添加GitHub登录功能"
published: 2026-02-28
description: "通过GitHub OAuth实现网站用户登录，提升用户体验"
tags: ["GitHub", "OAuth", "认证", "Web开发"]
category: "技术"
draft: false
---

## 为什么需要GitHub登录功能

在现代网站开发中，为用户提供便捷的登录方式是提升用户体验的重要环节。GitHub登录作为一种第三方认证方式，具有以下优势：

- **简化注册流程**：用户无需填写繁琐的注册表单
- **提高安全性**：利用GitHub的OAuth机制，无需存储用户密码
- **增加用户信任**：GitHub作为知名平台，用户更愿意通过它进行认证
- **获取用户信息**：可以获取用户的GitHub资料，丰富用户画像
- **便于集成**：GitHub提供了完善的OAuth API，集成难度较低

## 准备工作

在开始实现GitHub登录功能之前，需要完成以下准备工作：

### 1. 创建GitHub OAuth应用

1. 登录GitHub账号，进入[Settings](https://github.com/settings/profile)
2. 点击左侧菜单中的[Developer settings](https://github.com/settings/developers)
3. 选择[OAuth Apps](https://github.com/settings/developers)
4. 点击"New OAuth App"按钮
5. 填写应用信息：
   - **Application name**：你的网站名称
   - **Homepage URL**：你的网站首页地址
   - **Application description**：应用描述
   - **Authorization callback URL**：回调地址（重要！）

   回调地址格式通常为：`https://yourdomain.com/auth/github/callback`

6. 点击"Register application"完成创建
7. 记录生成的**Client ID**和**Client Secret**（稍后会用到）

### 2. 环境准备

- 一个运行中的网站项目
- 后端服务器（如Node.js、Python、PHP等）
- 数据库（用于存储用户信息）

## 实现步骤

### 步骤1：前端实现登录按钮

在你的网站登录页面添加GitHub登录按钮：

```html
<a href="/auth/github" class="github-login-btn">
  <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="20" height="20">
  用GitHub账号登录
</a>
```

### 步骤2：后端实现认证流程

以Node.js为例，使用Express框架实现GitHub OAuth认证：

#### 安装依赖

```bash
npm install express express-session passport passport-github2
```

#### 配置Passport.js

```javascript
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

// 配置GitHub策略
passport.use(new GitHubStrategy({
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // 这里可以查询或创建用户
    // profile包含用户的GitHub信息
    return done(null, profile);
  }
));

// 序列化和反序列化用户
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

const app = express();

// 配置session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// 初始化Passport
app.use(passport.initialize());
app.use(passport.session());
```

#### 实现认证路由

```javascript
// 发起GitHub认证
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

// 处理回调
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // 认证成功，重定向到主页
    res.redirect('/');
  });

// 登出
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// 保护路由的中间件
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// 受保护的路由
app.get('/profile', ensureAuthenticated, function(req, res) {
  res.render('profile', { user: req.user });
});
```

### 步骤3：用户数据处理

在实际应用中，你可能需要将GitHub用户信息存储到数据库中：

```javascript
function(accessToken, refreshToken, profile, done) {
  // 检查用户是否已存在
  User.findOne({ githubId: profile.id }, function(err, user) {
    if (err) return done(err);
    if (user) {
      // 用户存在，更新信息
      user.name = profile.displayName;
      user.email = profile.emails[0].value;
      user.avatar = profile.photos[0].value;
      user.save(function(err) {
        if (err) return done(err);
        return done(null, user);
      });
    } else {
      // 创建新用户
      const newUser = new User({
        githubId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value
      });
      newUser.save(function(err) {
        if (err) return done(err);
        return done(null, newUser);
      });
    }
  });
}
```

### 步骤4：前端显示用户信息

在前端页面中显示已登录用户的信息：

```html
<% if (user) { %>
  <div class="user-profile">
    <img src="<%= user.avatar %>" alt="<%= user.name %>" width="40" height="40">
    <span><%= user.name %></span>
    <a href="/logout">登出</a>
  </div>
<% } else { %>
  <a href="/auth/github" class="github-login-btn">
    用GitHub账号登录
  </a>
<% } %>
```

## 测试和调试

1. **本地测试**：使用`http://localhost:3000`作为回调地址
2. **部署测试**：确保回调地址配置为你的实际域名
3. **常见问题**：
   - 回调地址不匹配：确保GitHub应用设置中的回调地址与实际代码中的一致
   - 权限不足：检查GitHub应用的权限设置
   - 网络问题：确保服务器能够访问GitHub API

## 安全性考虑

1. **保护Client Secret**：不要将Client Secret硬编码在前端代码中
2. **使用HTTPS**：在生产环境中使用HTTPS协议
3. **验证用户**：在处理回调时验证用户信息的真实性
4. **设置合理的session过期时间**：避免session长时间有效
5. **限制scope**：只请求必要的用户权限

## 部署到生产环境

1. **更新回调地址**：将GitHub应用的回调地址改为你的生产域名
2. **环境变量**：使用环境变量存储Client ID和Client Secret
3. **日志记录**：添加认证相关的日志记录
4. **监控**：监控认证失败的情况

## 示例代码

以下是一个完整的Node.js Express实现示例：

```javascript
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/github-auth');

// 定义用户模型
const User = mongoose.model('User', new mongoose.Schema({
  githubId: String,
  name: String,
  email: String,
  avatar: String
}));

// 配置GitHub策略
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'YOUR_CLIENT_ID',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ githubId: profile.id }, function(err, user) {
      if (err) return done(err);
      if (user) {
        user.name = profile.displayName;
        user.email = profile.emails[0].value;
        user.avatar = profile.photos[0].value;
        user.save(function(err) {
          if (err) return done(err);
          return done(null, user);
        });
      } else {
        const newUser = new User({
          githubId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        });
        newUser.save(function(err) {
          if (err) return done(err);
          return done(null, newUser);
        });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

const app = express();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  res.send(`
    <h1>GitHub登录示例</h1>
    ${req.user ? 
      `<p>已登录：${req.user.name}</p><img src="${req.user.avatar}" width="100"><br><a href="/logout">登出</a>` : 
      '<a href="/auth/github">用GitHub登录</a>'
    }
  `);
});

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(3000, function() {
  console.log('服务器运行在 http://localhost:3000');
});
```

## 总结

通过以上步骤，你可以为自己的网站添加GitHub登录功能，为用户提供更便捷的登录体验。GitHub OAuth认证不仅简化了用户注册流程，还提高了网站的安全性和用户信任度。

在实现过程中，需要注意以下几点：

1. 正确配置GitHub OAuth应用的回调地址
2. 妥善保管Client Secret，避免泄露
3. 合理处理用户数据，保护用户隐私
4. 在生产环境中使用HTTPS协议
5. 添加适当的错误处理和日志记录

通过GitHub登录功能，你的网站将变得更加现代化和用户友好，吸引更多用户注册和使用。