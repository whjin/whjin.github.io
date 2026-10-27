# 个人技术博客 — 全栈性能优化实践

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)
[![Website](https://img.shields.io/badge/site-wuhuajin.com-blue.svg)](https://wuhuajin.com)
[![Blog Posts](https://img.shields.io/badge/articles-49+-orange.svg)](https://wuhuajin.com)

[English](README.md) | **中文**

> 一个高性能静态个人博客，使用纯 HTML/CSS/JavaScript 构建，针对全球访问、Google Core Web Vitals 和搜索引擎做了深度优化。

**线上站点**：[https://wuhuajin.com](https://wuhuajin.com)
**作者**：[吴华锦](https://wuhuajin.com/about.html) — 全栈开发者 | 独立开发者

---

## 目录

- [项目简介](#-项目简介)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [构建流水线](#-构建流水线)
- [性能优化](#-性能优化core-web-vitals)
- [SEO 与全球部署](#-seo--全球部署)
- [功能特性](#-交互体验)
- [相关文档](#-相关文档)
- [参与贡献](#-参与贡献)
- [许可证](#-许可证)

---

## 📖 项目简介

这是我的个人技术博客源码，从零开始构建，没有使用任何重量级框架。它是一个完全静态的站点，部署在 **GitHub Pages** 上，针对速度、SEO 和全球可访问性做了深度优化。

目前有 **49+ 篇技术文章**，覆盖全栈开发、AI 工具、Web 性能优化等方向，是我长期积累的知识库和公开作品集。

---

## 🛠 技术栈

| 层级 | 技术方案 |
|---|---|
| **前端** | 纯 HTML5 + CSS3 + 原生 JavaScript |
| **内容** | Markdown → 静态 HTML（自定义构建脚本） |
| **构建工具** | Node.js + 自定义脚本（无 Webpack/Vite 开销） |
| **部署** | GitHub Pages + Cloudflare CDN + 阿里云 DNS |
| **统计** | Cloudflare Web Analytics + Microsoft Clarity + Google Analytics 4 |
| **变现** | Google AdSense + Ko-fi 会员订阅 |
| **国际化** | 自定义轻量双语（中文 / 英文） |

---

## 📁 项目结构

```
wuhuajin.github.io/
├── src/
│   ├── components/           # 可复用 UI 组件
│   │   ├── banner/          # 顶部轮播广告
│   │   ├── cookie-consent/  # GDPR Cookie 同意横幅
│   │   ├── feed/            # 首页文章流
│   │   ├── image-viewer/    # 图片全屏查看器
│   │   ├── navigation/       # 顶部导航栏
│   │   ├── reward-tip/      # 赞赏卡片组件
│   │   ├── render/          # Markdown 渲染器
│   │   ├── scroll/          # 回到顶部按钮
│   │   └── sidebar/         # 目录 / 广告侧边栏
│   ├── template/
│   │   ├── posts/           # 文章（按分类组织）
│   │   │   ├── JavaScript/
│   │   │   ├── Node/
│   │   │   ├── AI/
│   │   │   └── Link/        # 聚合页（友链/文章/资源导航）
│   │   ├── link/            # 友链/文章导航模板
│   │   └── menu/            # 资源导航模板
│   ├── css/                 # 第三方 CSS（highlight.js）
│   ├── images/              # 图片资源
│   └── js/                  # 第三方 JS（marked/highlight）
├── scripts/                 # 构建脚本
│   ├── build-all.cjs        # 全量构建入口
│   ├── build-feed.cjs       # 生成 feed 数据
│   ├── build-articles.cjs   # 文章预渲染为静态 HTML
│   ├── build-home.cjs      # 生成首页数据
│   ├── build-sitemap.cjs    # 生成 sitemap.xml
│   ├── build-links.cjs       # 构建聚合页
│   └── watch.cjs            # 文件监听 + 热重载
├── docs/                    # 项目文档
├── server.js                # 本地开发服务器
├── index.html               # 首页入口
└── package.json
```

---

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/whjin/whjin.github.io.git

# 安装依赖
npm install

# 启动本地开发服务器（带自动刷新）
npm run dev

# 构建所有静态页面
npm run build
```

---

## 📦 构建流水线

| 脚本 | 命令 | 作用 |
|---|---|---|
| 全量构建 | `npm run build` | 按顺序执行所有构建脚本 |
| 开发模式 | `npm run dev` | 构建 + 开发服务器 + 热重载 |
| Feed 数据 | `npm run build:feed` | 解析 md front matter，生成 feed JSON |
| 文章构建 | `npm run build:articles` | 预渲染所有 md → 静态 HTML |
| Sitemap | `npm run build:sitemap` | 自动生成 sitemap.xml |
| Front matter | `npm run build:frontmatter` | 补全 md 文件缺失的 front matter |
| 清理 | `npm run clean` | 清理 macOS 元数据文件 |

---

## ⚡ 性能优化（Core Web Vitals）

这个博客经历了 **22+ 项系统性性能优化**，在 PageSpeed Insights 和 GTmetrix 上取得了接近满分的成绩。

### 核心成果

| 指标 | 优化前 | 优化后 | 提升 |
|---|---|---|---|
| **首页 HTML 体积** | 57 KB | 34 KB | **-40%** |
| **社交图片体积** | 576 KB | 262 KB | **-55%** |
| **CLS（布局偏移）** | 0.37 | < 0.1 | **-73%** |
| **阻塞渲染的 CSS** | 11 KB | 异步加载 | **消除** |
| **阻塞渲染的 JS** | 13 个文件 | 全部 `defer` | **消除** |

### 具体做了什么

**网络与资源加载**
- ✅ 5 个第三方域名 `preconnect` 预连接
- ✅ 非关键 CSS 异步加载
- ✅ 全部 JS 脚本 `defer` 延迟加载
- ✅ 首屏 Logo `fetchpriority="high"` 优先加载

**图片与媒体**
- ✅ 所有图片加 `width`/`height` 属性，防止布局偏移
- ✅ 首屏以下图片懒加载
- ✅ 封面容器 `aspect-ratio: 16/9`，彻底消除 CLS

**HTML 与内容**
- ✅ 所有文章通过自定义构建脚本预渲染为静态 HTML
- ✅ `sitemap.xml` 自动生成

---

## 🔍 SEO 与全球部署

### SEO

- ✅ 语义化 HTML，正确的 `lang` 属性
- ✅ 完整的 Open Graph 标签
- ✅ JSON-LD 结构化数据（WebPage、Article 类型）
- ✅ `sitemap.xml` + `robots.txt` 自动生成
- ✅ 404 页面优化

### 全球架构

- **DNS**：阿里云 + Cloudflare 双解析
- **CDN**：Cloudflare 全球边缘网络
- **统计**：Cloudflare Web Analytics（隐私友好、GDPR 合规）
- **自定义域名**：`stats.wuhuajin.com`（Cloudflare Worker + D1）

### 隐私与合规

- ✅ Cookie 同意横幅（GDPR / CCPA 合规）
- ✅ Google AdSense Consent Mode v2 集成
- ✅ 隐私政策 + 条款页面
- ✅ 无跨站追踪 Cookie

---

## 🎨 交互体验

- **双语默认切换**：英文默认，一键切中文
- **移动端优先**：优化字体排版、触摸友好图标
- **代码块增强**：一键复制、语言标签、长代码折叠
- **图片查看器**：点击全屏查看，支持缩放、拖动
- **赞赏卡片**：打赏/订阅按钮 + 版权声明
- **资源导航**：卡片式聚合页，展示友链和工具

---

## 📚 相关文档

- [网站出海实操蓝本](docs/网站出海实操.md) — 完整的网站出海实战手册
- [关于本站](https://wuhuajin.com/about.html) — 关于这个博客

---

## 🤝 参与贡献

发现 Bug？有建议？欢迎提 Issue 或提交 PR！

也可以在 [Issues 页面](https://github.com/whjin/whjin.github.io/issues) 讨论。

---

## 👨‍💻 关于作者

**吴华锦** — 全栈开发者 & 独立开发者

- 🌐 博客：[https://wuhuajin.com](https://wuhuajin.com)
- 🐙 GitHub：[@whjin](https://github.com/whjin)
- 🐦 Twitter/X：[@whjin](https://x.com/whjin)

---

## 📄 许可证

MIT — 欢迎参考这个项目来构建你自己的博客！

---

*用 ❤️ 构建 by [吴华锦](https://wuhuajin.com) — 为速度优化，为人类而建。*
