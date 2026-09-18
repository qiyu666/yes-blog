---title: "手机运行原生 Trae"
published: 2026-09-18
categories: ["技术"]
tags: ["Termux", "Trae"]
---
手机运行原生 Trae

本文档将介绍如何在手机上运行原生 Trae 环境。

需要用到的 APP

- Termux
- Termux:X11
- 海鸥加速器（或其他合规网络工具，用于解决下载过程中的网络问题）

操作步骤

1. 配置 Termux 源并更新

```bash
termux-change-repo
```


```bash
pkg update -y
```

```bash
pkg upgrade -y
```

2. 安装 proot-distro 并安装 Debian


```bash
pkg install proot-distro -y
```

```bash
proot-distro install debian
```

⚠️ 如果因网络问题导致下载失败，请确保当前网络环境可正常访问外网资源后重试。


```bash
proot-distro install debian
```

3. 进入 Debian 并安装桌面环境与浏览器


```bash
proot-distro login debian
```

```bash
apt update -y
```

```bash
apt upgrade -y
```

```bash
apt install firefox xfce4-terminal xfce4 dbus-x11 dbus -y
```

```bash
exit
```

4. 安装 Termux:X11 并启动桌面


```bash
pkg install termux-x11-nightly
```

```bash
proot-distro login debian
```

```bash
XDG_RUNTIME_DIR=${TMPDIR} termux-x11 :1 -xstartup "dbus-launch --exit-with-session xfce4-session"
```

提示： 执行完上面的命令后，打开 Termux:X11 APP 即可看到桌面环境。

5. 安装并运行 Trae


```bash
dpkg -i TraeCode.deb
```

```bash
apt install -f -y
```

```bash
trae-cn --no-sandbox --user-data-dir="/root/.trae-root"
```

###额外：安装 VS Code


```bash
dpkg -i code.deb
```

```bash
apt install -f -y
```


```bash
code --no-sandbox --user-data-dir="/root/.trae-root"
```

---
