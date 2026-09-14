# `Docker`部署

> 1. **安装 `Docker`**
>    `dnf` 添加 `docker-ce` 阿里云源并安装，启停
> 2. **获取镜像**
>    拉取 `ghcr.io` 官方镜像；拉不动则 `git clone` 后本地 `docker build`
> 3. **运行容器**
>    `-p 80:80`，配置 `METING_URL / METING_TOKEN` 环境变量
> 4. **放行端口**
>    阿里云安全组 + `firewalld` 放行 `80`
> 5. **验证**
>    `curl` 访问 `/api?server=netease&type=search`

## 第 1 步：安装 `Docker`（阿里云官方源）

```sh
# 1) 添加 docker-ce 源（用 curl，阿里云内网镜像）
sudo curl -o /etc/yum.repos.d/docker-ce.repo http://mirrors.cloud.aliyuncs.com/docker-ce/linux/centos/docker-ce.repo
sudo sed -i 's|https://mirrors.aliyun.com|http://mirrors.cloud.aliyuncs.com|g' /etc/yum.repos.d/docker-ce.repo

# 2) 关键：Alibaba Cloud Linux 3 的 $releasever=3，docker-ce 源按 CentOS 8 组织，
#    手动把变量替换成 8（等价于 releasever-adapter 插件的作用）
sudo sed -i 's|\$releasever|8|g' /etc/yum.repos.d/docker-ce.repo

# 3) 刷新缓存并安装
sudo dnf clean all
sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 4) 启动并验证
sudo systemctl enable --now docker
docker --version
```

## 第 2 步：获取镜像

拉取[Github仓库代码](https://github.com/whjin/Meting-API)本地构建

```sh
sudo dnf -y install git
git clone https://github.com/whjin/Meting-API.git /opt/meting-api   # 慢可换 https://ghfast.top/https://github.com/...
cd /opt/meting-api
docker build -t meting-api .
```

**配置 `Docker` 镜像加速器**

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
cd /opt/meting-api    # 或你 clone 的 meting-api 目录
docker build -t meting-api .
```

**临时用公共加速器**：`"registry-mirrors": ["https://docker.m.daocloud.io"]`

**[阿里云加速器地址](https://cr.console.aliyun.com/cn-shenzhen/instances/mirrors)获取** （ECS 用户最稳）：登录阿里云控制台 → 搜索 "容器镜像服务 ACR" → 左侧 "镜像工具 → 镜像加速器"，页面会显示你账号专属的加速地址（形如 `https://xxxx.mirror.aliyuncs.com`），复制填到上面配置里即可。

## 第 3 步：运行容器

```sh
# 1) 删掉旧容器（-f 强制，保险）
docker rm -f meting-api

# 2) 重新运行（METING_URL 记得带 :8000）
docker run -d --name meting-api \
  -p 80:80 \
  -e METING_URL=http://你的服务器公网IP:8000 \
  -e METING_TOKEN=换成你自己的随机密钥 \
  --restart unless-stopped \
  ghcr.io/metowolf/meting-api:latest
```

**随机密钥生成方式：**`openssl rand -hex 32`

## 第 4 步：放行端口

1. **阿里云安全组**：ECS 控制台 → 实例 → 安全组 → 入方向规则 → 添加 80 端口（或你自定义的端口, 例如 8000），授权对象 `0.0.0.0/0`
2. **系统防火墙**：

```sh
sudo firewall-cmd --permanent --add-port=8000/tcp && sudo firewall-cmd --reload
# 如果没开 firewalld 可忽略
```

`80` 端口被占用，可尝试 `8000` 端口

## 第 5 步：验证

```sh
# 本机验证
curl "http://localhost:8000/api?server=netease&type=search&id=周杰伦"
# 公网验证（在本地电脑浏览器打开）
http://你的公网IP:8000/api?server=netease&type=search&id=周杰伦
```

# 完整命令

```sh
# 1) 删掉这个从未运行的旧容器
docker rm -f meting-api

# 2) 重新运行（这次会真正启动）
docker run -d --name meting-api \
  -p 80:80 \
  -e METING_URL=http://你的服务器公网IP:8000 \
  -e METING_TOKEN=换成你自己的随机密钥 \
  --restart unless-stopped \
  ghcr.io/metowolf/meting-api:latest

# 3) 确认状态（STATUS 必须是 Up，不能是 Created/Exited）
docker ps | grep meting-api

# 4) 本机测试（用 localhost，不要 curl 自己的公网 IP）
curl "http://localhost:8000/api?server=netease&type=search&id=周杰伦"
```

# IP地址映射为域名地址

1. 在你的域名解析控制台添加一条 **A 记录**
2. 在服务器 `/etc/nginx/conf.d/meting.conf` 中配置反向代理，包括 `HTTP` 和 `HTTPS`
3. 重载 Nginx 配置

```sh
sudo systemctl -s reload nginx
```

4. 重新安装证书

```sh
certbot install --cert-name meting.wuhuajin.com
```

5. 验证

```sh
# 查看 Nginx 配置是否已经被 certbot 修改
cat /etc/nginx/conf.d/meting.wuhuajin.com.conf

# 测试 HTTPS 是否通
curl -I https://meting.wuhuajin.com/api?server=netease&type=search&id=周杰伦
```

6. 更新 Docker 容器的 `METING_URL`

```sh
docker rm -f meting-api
docker run -d --name meting-api \
  -p 8000:80 \
  -e METING_URL=https://meting.wuhuajin.com \
  -e METING_TOKEN=你的密钥 \
  --restart unless-stopped \
  meting-api
```
