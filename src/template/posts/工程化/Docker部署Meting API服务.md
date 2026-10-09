---
title: Docker部署Meting API服务
date: 2026-09-26
category: 工程化
description: 'Docker部署 1. 安装 Docker dnf 添加 docker-ce 阿里云源并安装，启停 2. 获取镜像 拉取 ghcr.io 官方镜像；拉不动则 git clone 后本地 docker build 3. 运行容器 -p 80:80，配置 METING_URL / METING_TOKEN 环境变量 4. 放行端口 阿里云安全组 + firewalld 放行 80 5. 验证 curl 访问 /api?server=netease&type=search 第 1 步：安装 Docker（阿里云官方源） 第 2 步：获取镜像 拉取Github仓库代码本地构建 配置 Docker 镜像…'
---

# 用 Docker 部署 Meting API：从阿里云到 HTTPS 域名的完整实操

> 部署一套自己的音乐接口服务，最省心、可复现的方式就是用 Docker 跑 `Meting API`。本文基于我在阿里云 ECS 上的真实踩坑经验，把从安装 Docker、拉取镜像、运行容器，到最后用 Nginx + 证书把 IP 升级成 HTTPS 域名的**完整命令**一次性给你，照着复制即可。

**你将得到：**

- 阿里云 `Alibaba Cloud Linux 3` 下安装 `docker-ce` 的正确姿势（含 `$releasever` 的坑）
- 拉不动 `ghcr.io` 官方镜像时，`git clone` + 本地 `docker build` 的备用方案
- 镜像加速器配置 + 运行容器 + 端口放行
- IP 地址 → 域名 → HTTPS 的完整升级路径

## 先讲清楚：为什么要用 Docker

`Meting API` 本身是一个轻量的音乐接口服务（配合 APlayer 播放器使用）。用 Docker 部署的好处是**环境隔离、一键起停、换服务器无缝迁移**——不用在系统里装一堆依赖，也方便后续用 `docker-compose` 编排。

> 想了解更完整的部署思路和细节，可参考我维护的完整教程：[Docker部署Meting API服务（完整版）](https://wuhuajin.com/src/template/posts/工程化/html/Docker部署Meting API服务.html)。

## 前置条件

- 一台**阿里云 ECS**（本文以 `Alibaba Cloud Linux 3` 为例，CentOS/其他发行版原理相同）
- 一个域名（用于最后的 HTTPS 升级；只想要 IP 访问可以跳过）
- `sudo` 权限

---

## 第 1 步：安装 Docker（阿里云官方源）

在阿里云机器上，最稳的方式是用**阿里云内网镜像源**。有两个容易踩的坑：

1. `mirrors.cloud.aliyuncs.com` 是内网地址，ECS 上用速度最快；
2. `Alibaba Cloud Linux 3` 的 `$releasever=3`，但 `docker-ce` 源是按 **CentOS 8** 组织的，所以要手动把变量替换成 `8`。

```sh
# 1) 添加 docker-ce 源（用 curl，阿里云内网镜像）
sudo curl -o /etc/yum.repos.d/docker-ce.repo http://mirrors.cloud.aliyuncs.com/docker-ce/linux/centos/docker-ce.repo
sudo sed -i 's|https://mirrors.aliyun.com|http://mirrors.cloud.aliyuncs.com|g' /etc/yum.repos.d/docker-ce.repo

# 2) 关键：把 $releasever 替换成 8（等价于 releasever-adapter 插件的作用）
sudo sed -i 's|\$releasever|8|g' /etc/yum.repos.d/docker-ce.repo

# 3) 刷新缓存并安装
sudo dnf clean all
sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 4) 启动并验证
sudo systemctl enable --now docker
docker --version
```

## 第 2 步：获取镜像

优先直接拉官方镜像；如果 `ghcr.io` 拉不动（国内常见），就用**代码本地构建**兜底。

**方式 A：直接拉官方镜像**

```sh
docker pull ghcr.io/metowolf/meting-api:latest
```

**方式 B：git clone 后本地构建**

```sh
sudo dnf -y install git
git clone https://github.com/whjin/Meting-API.git /opt/meting-api   # 慢可换 https://ghfast.top/https://github.com/...
cd /opt/meting-api
docker build -t meting-api .
```

**配置 Docker 镜像加速器**（拉镜像慢时很有用）：

```sh
# 1) 创建配置
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://docker.m.daocloud.io"]
}
EOF

# 2) 重启 Docker 生效
sudo systemctl daemon-reload
sudo systemctl restart docker

# 3) 重新构建
cd /opt/meting-api
docker build -t meting-api .
```

> 想拿阿里云专属加速器地址（ECS 用户最稳）：阿里云控制台 → 搜索"容器镜像服务 ACR" → 左侧"镜像工具 → 镜像加速器"，页面会显示形如 `https://xxxx.mirror.aliyuncs.com` 的专属地址，替换 `registry-mirrors` 即可。

## 第 3 步：运行容器

`METING_URL` 记得带上 `:8000`，`METING_TOKEN` 用随机密钥：

```sh
# 1) 删掉旧容器（-f 强制，保险）
docker rm -f meting-api

# 2) 重新运行
docker run -d --name meting-api \
  -p 80:80 \
  -e METING_URL=http://你的服务器公网IP:8000 \
  -e METING_TOKEN=换成你自己的随机密钥 \
  --restart unless-stopped \
  ghcr.io/metowolf/meting-api:latest
```

生成随机密钥：

```sh
openssl rand -hex 32
```

## 第 4 步：放行端口

1. **阿里云安全组**：ECS 控制台 → 实例 → 安全组 → 入方向规则 → 添加 80 端口（或自定义端口，如 8000），授权对象 `0.0.0.0/0`。
2. **系统防火墙**：

```sh
sudo firewall-cmd --permanent --add-port=8000/tcp && sudo firewall-cmd --reload
# 如果没开 firewalld 可忽略
```

> 80 端口被占用时，可改用 8000 端口。

## 第 5 步：验证

```sh
# 本机验证（用 localhost，不要 curl 自己的公网 IP）
curl "http://localhost:8000/api?server=netease&type=search&id=周杰伦"
```

浏览器打开 `http://你的公网IP:8000/api?server=netease&type=search&id=周杰伦` 能返回 JSON，说明服务已经通了。

---

## 进阶：把 IP 升级为 HTTPS 域名

IP 直接访问不安全也不好记，升级到域名 + HTTPS 只需 4 步：

1. **域名解析**：在域名控制台添加一条 A 记录，指向服务器公网 IP；
2. **Nginx 反向代理**：在 `/etc/nginx/conf.d/meting.conf` 配置，同时包含 HTTP 和 HTTPS；
3. **签发证书**：用 `certbot` 自动申请并安装证书；
4. **更新容器**：把 `METING_URL` 改为域名地址并重启容器。

```sh
# 重载 Nginx 配置
sudo systemctl -s reload nginx

# 重新安装证书
sudo certbot install --cert-name meting.wuhuajin.com

# 验证 HTTPS 是否通
curl -I https://meting.wuhuajin.com/api?server=netease&type=search&id=周杰伦

# 更新容器 METING_URL 为域名
docker rm -f meting-api
docker run -d --name meting-api \
  -p 8000:80 \
  -e METING_URL=https://meting.wuhuajin.com \
  -e METING_TOKEN=你的密钥 \
  --restart unless-stopped \
  meting-api
```

> 完整命令与更多细节（含 Nginx 配置写法），见 [完整版教程](https://wuhuajin.com/src/template/posts/工程化/html/Docker部署Meting API服务.html)。

---

## 小结

- 用 **阿里云内网源** 装 `docker-ce`，记得把 `$releasever` 替换成 `8`；
- 拉不动镜像就 **git clone + 本地 build**，再配 **镜像加速器**；
- 容器端口映射、安全组 + `firewalld` 放行缺一不可；
- 要上 HTTPS，走 **A 记录 + Nginx 反代 + certbot** 三步。

部署完成后，配合 APlayer 前端组件即可在前端页面播放音乐。如果你也在自建音乐 API 服务，欢迎收藏、转发这篇文章，也欢迎到原文评论区交流踩坑经验。
