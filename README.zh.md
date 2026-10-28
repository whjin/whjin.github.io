# 吴华锦的个人技术博客

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)
[![Website](https://img.shields.io/badge/site-wuhuajin.com-blue.svg)](https://wuhuajin.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Last Commit](https://img.shields.io/github/last-commit/whjin/whjin.github.io)](https://github.com/whjin/whjin.github.io/commits/main)

[English](README.md) | **中文**

> 一个高性能静态个人博客，使用纯 HTML/CSS/JavaScript 构建，针对全球访问、Google Core Web Vitals 和搜索引擎做了深度优化。无框架、无重型构建工具——只为更快、更易访问、对 SEO 友好。

**线上站点**：[https://wuhuajin.com](https://wuhuajin.com)
**作者**：[吴华锦](https://wuhuajin.com/about.html) — 全栈开发者 | 独立开发者

---

## 目录

- [站点预览](#-站点预览)
- [项目简介](#-项目简介)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [配置说明](#-配置说明)
- [构建流水线](#-构建流水线)
- [性能优化](#-性能优化core-web-vitals)
- [SEO 与全球部署](#-seo--全球部署)
- [相关文档](#-相关文档)
- [FAQ 与常见问题](#-faq--常见问题)
- [路线图](#-路线图)
- [参与贡献](#-参与贡献)
- [致谢](#-致谢)
- [许可证](#-许可证)

---

## 🖼 站点预览

| 板块 | 说明 | 线上地址 |
|---|---|---|
| **首页** | 桌面端两栏卡片流 / 移动端每页 6 张卡片，侧边栏广告与标签 | [wuhuajin.com](https://wuhuajin.com) |
| **文章页** | 预渲染静态页，含目录、代码块、图片查看器、赞赏卡片 | [示例文章](https://wuhuajin.com/src/template/posts/JavaScript/html/) |
| **产品页** | 独立产品落地页（Developer Tools Suite + Waffo 定价） | [/product.html](https://wuhuajin.com/product.html) |
| **赞赏页** | 会员与打赏页（Waffo 订阅 + 微信/支付宝） | [/reward.html](https://wuhuajin.com/reward.html) |
| **资源导航** | 卡片式聚合：AI 工具、开发者参考、精选链接 | [资源中心](https://wuhuajin.com/src/template/posts/Link/资源/resource.html) |

站点默认英文、一键切中文，且移动端完全适配。建议在桌面端与手机端各打开一次查看自适应布局。

---

## 📖 项目简介

这是 [wuhuajin.com](https://wuhuajin.com) 的源码，从零开始构建，没有使用任何重量级框架。它是一个完全静态的站点，部署在 **GitHub Pages** 上，针对速度、SEO 和全球可访问性做了深度优化。

目前有 **50+ 篇技术文章**，覆盖全栈开发、AI 工具、Web 性能优化、GIS 等方向，是长期积累的知识库和公开作品集。站点同时也是一个资源导航枢纽，汇集 AI 工具、开发者参考资料和精选链接。

---

## ✨ 功能特性

- **零框架前端**：纯 HTML5 + CSS3 + 原生 JS，无 React/Vue/Next.js 包体积开销
- **双语默认**：英文优先，轻量 i18n 字典一键切中文
- **静态预渲染**：每篇 Markdown 在构建时渲染为独立 HTML，保证爬虫完整可读
- **自适应分页**：桌面端两栏布局，右侧栏高度决定每页卡片数；移动端固定每页 6 张；公共 `pager` 组件统一胶囊样式
- **数据同步流水线**：友链数据（`友链/data.json`）通过 title 匹配自动同步到 feed 卡片（`build-feed.cjs` 中的 `LINK_SECTION_MAP`）
- **广告排序**：广告卡片支持 `sort` 字段（数字越小越靠前），统一控制侧边栏广告优先级
- **产品与合规页面**：独立 `/product.html` 产品落地页、`/aigc-policy.html` AI 内容使用规范、退款政策与违约责任条款
- **性能优先**：Core Web Vitals 调优（CLS < 0.1、LCP < 2.5s），通过 `defer`、图片 `aspect-ratio`、`preconnect`、懒加载实现
- **GDPR 就绪**：Cookie 同意横幅、Google Consent Mode v2、隐私政策、无跨站追踪 Cookie
- **无障碍**：语义化 HTML、图标按钮 ARIA 标签、focus-visible 轮廓、保留移动端双指缩放
- **代码块增强**：一键复制、语言标签、长代码折叠、悬浮工具栏
- **图片查看器**：点击全屏查看，支持缩放、拖动
- **赞赏/会员**：Waffo Pancake 订阅 + 微信/支付宝二维码，独立赞赏页
- **独立产品变现**：Waffo Pancake 订阅收款（$9.99/月，7 天免费试用）
- **资源导航**：卡片式聚合页，汇集 AI 工具、开发者参考、精选链接

---

## 🛠 技术栈

| 层级 | 技术方案 |
|---|---|
| **前端** | 纯 HTML5 + CSS3 + 原生 JavaScript（按需使用 ES Module） |
| **内容** | Markdown → 静态 HTML（自定义 Node.js 构建脚本） |
| **构建工具** | Node.js + 自定义 `.cjs` 脚本（无 Webpack/Vite/esbuild） |
| **开发服务器** | 原生 `http` 模块 + `chokidar` 文件监听 + WebSocket 热重载 |
| **部署** | GitHub Pages + Cloudflare CDN + 阿里云 DNS |
| **统计** | Cloudflare Web Analytics + Microsoft Clarity + Google Analytics 4 |
| **变现** | Google AdSense + Waffo Pancake 订阅 + 微信/支付宝赞赏 |
| **国际化** | 自定义轻量双语字典（中文 / 英文） |

---

## 📁 项目结构

```
wuhuajin.github.io/
├── src/
│   ├── components/               # 可复用 UI 组件（每个自包含）
│   │   ├── aplayer/             # 音频播放器
│   │   ├── banner/              # 顶部轮播广告（复用友链数据源）
│   │   ├── cookie-consent/      # GDPR Cookie 同意横幅
│   │   ├── feed/                # 首页文章流 + 分页
│   │   ├── footer/              # 站点页脚
│   │   ├── i18n/                # 双语字典 + 运行时切换
│   │   ├── image-viewer/        # 图片全屏查看器（缩放 + 平移）
│   │   ├── loading/             # 加载动画
│   │   ├── navigation/          # 顶部导航栏
│   │   ├── pager/               # 公共分页组件（全胶囊样式）
│   │   ├── render/              # Markdown 渲染器（marked + highlight.js）
│   │   ├── reward-tip/          # 文章内赞赏卡片
│   │   ├── scroll/              # 回到顶部按钮
│   │   ├── sidebar/             # 首页侧边栏（About、动态、标签、广告）
│   │   └── social/              # 社交图标网格
│   ├── template/
│   │   ├── posts/               # 文章（按分类组织，20+ 分类）
│   │   │   ├── JavaScript/      #   如 JavaScript / Node / TypeScript / React / Vue
│   │   │   ├── AI/              #   AI / GIS / Git / Web3 / WebRTC / Android / RN / …
│   │   │   └── Link/            #   聚合页（友链/资源/文章导航）
│   │   ├── feed/                # Feed 数据 data.json
│   │   ├── link/                # 友链/文章导航模板
│   │   ├── menu/                # 资源导航模板
│   │   └── reward/               # 赞赏页模板
│   ├── css/                     # 第三方 CSS（highlight.js 主题）
│   ├── images/                  # 图片资源 + 字体图标
│   └── js/                      # 第三方 JS（marked、highlight.js、APlayer）
├── scripts/                     # 构建与维护脚本
│   ├── build-all.cjs            # 全量构建入口
│   ├── build-feed.cjs           # 生成 feed/data.json
│   ├── build-articles.cjs       # Markdown 预渲染为静态 HTML
│   ├── build-home.cjs           # 生成首页数据
│   ├── build-sitemap.cjs        # 生成 sitemap.xml
│   ├── build-links.cjs          # 构建聚合页
│   ├── add-front-matter.cjs     # 补全缺失的 front matter
│   ├── update-wordcount.js      # 统计每篇文章真实字数
│   └── watch.cjs                # 文件监听 + 热重载
├── docs/                        # 项目文档
│   ├── 网站出海实操.md          # 网站出海实战蓝本（内部 SOP）
│   ├── 脚本.md                  # 脚本使用说明
│   └── 外链/                    # 对外发布的英文文章
├── server.js                    # 本地开发服务器（端口 8000）
├── index.html                   # 首页入口
├── app.html / home.html         # 应用与旧版首页壳
├── about.html / contact.html    # 合规页
├── privacy.html / terms.html    # 法律页（含退款政策与违约责任）
├── reward.html                   # 赞赏/会员页
├── product.html                  # 产品落地页（Developer Tools Suite）
├── aigc-policy.html              # AI 生成内容使用规范
├── viewer.html                   # 文章查看器（legacy，301 重定向）
├── 404.html
├── robots.txt / sitemap.xml / ads.txt / CNAME
└── package.json
```

---

## 🚀 快速开始

**环境要求**：Node.js ≥ 18，npm 或 pnpm。

```bash
# 克隆
git clone https://github.com/whjin/whjin.github.io.git
cd whjin.github.io

# 安装依赖
npm install

# 启动本地开发服务器（构建 + 监听 + 热重载）
npm run dev

# 生产构建所有静态页
npm run build

# 清理 macOS 元数据文件（AppleDouble、.DS_Store）
npm run clean
```

开发服务器地址：`http://localhost:8000`。

> **故障排查**：若全新克隆后 `npm run dev` 失败，请确认已执行 `npm install` 且 Node ≥ 18。更多常见问题见 [FAQ](#-faq--常见问题)。

---

## ⚙️ 配置说明

内容以 Markdown `front matter` 承载，结构化数据以 `data.json` 承载。**没有运行时配置文件**——一切都是数据驱动。

### 文章 front matter

```yaml
---
title: "我的文章"
date: 2026-01-01
category: ["JavaScript"]   # 或单字符串 "JavaScript"
tag: ["es6", "async"]       # 或 "tags:"
description: "手写 meta 描述（绝不自动回写覆盖）"
top: true                    # 可选 — 在所属分类桶内置顶
topic: "我的"               # 可选 — 归属到指定侧边栏卡片
reward: true                 # 可选 — 控制文章内赞赏卡片显隐
---
```

### `data.json` 约定

| 文件 | 用途 | 关键字段 |
|---|---|---|
| `src/template/posts/Link/友链/data.json` | 友链、广告、Banner 轮播 | `list[]`、`type: "ads"`、`show`、`sort` |
| `src/template/feed/data.json` | 首页 feed（构建生成） | 节级 `list[]`、条目 `desc` |
| `src/components/sidebar/data.json` | 侧边栏分区与广告 | 节级 `list[]`、广告 `items` |
| `src/template/reward/data.json` | 赞赏/会员记录 | `list[]`、金额分级 |

**命名规则**：友链、文章、feed 数据集统一用 `list`（非 `items`）与 `image`（非 `avatar`），保证一致性——详见实操蓝本的数据字段统一说明。

---

## 📦 构建流水线

| 脚本 | 命令 | 作用 |
|---|---|---|
| 全量构建 | `npm run build` | 按顺序执行所有构建脚本 |
| 开发模式 | `npm run dev` | 构建一次 → 启动监听 + 开发服务器热重载 |
| Feed 数据 | `npm run build:feed` | 解析 Markdown front matter → feed/data.json |
| 文章构建 | `npm run build:articles` | 每篇 Markdown 预渲染为 `posts/<分类>/html/<标题>.html` |
| Sitemap | `npm run build:sitemap` | 依据 feed 自动生成 `sitemap.xml` |
| Front matter | `npm run build:frontmatter` | 补全缺失的 front matter 字段 |
| 字数统计 | `node scripts/update-wordcount.js` | 统计每篇文章真实字数，写回 feed 的 wordCount 字段 |
| 聚合页 | `npm run build:links` | 构建 Link/menu 聚合页 |
| 清理 | `npm run clean` | 删除 `.DS_Store` / `._*` macOS 元数据文件 |

所有构建脚本均为**幂等**：重复执行不产生 diff。

---

## ⚡ 性能优化（Core Web Vitals）

本站经历了 **20+ 项系统性性能优化**，在 PageSpeed Insights 上取得接近满分的成绩。

### 核心成果

| 指标 | 优化前 | 优化后 | 提升 |
|---|---|---|---|
| **首页 HTML 体积** | 57 KB | 34 KB | **−40%** |
| **社交分享图** | 576 KB | 262 KB | **−55%** |
| **CLS（布局偏移）** | 0.37 | < 0.1 | **−73%** |
| **阻塞渲染的 CSS** | 11 KB | 异步加载 | **消除** |
| **阻塞渲染的 JS** | 13 个文件 | 全部 `defer` | **消除** |

### 采用的技术

- 5 个第三方域名 `preconnect` 预连接（GA4、AdSense、Cloudflare 等）
- 非关键 CSS（highlight.js、图片查看器）异步加载
- 所有 `<script>` 标签 `defer`，无阻塞渲染 JS
- 首屏 Logo 使用 `fetchpriority="high"`
- 所有 `<img>` 显式声明 `width` / `height`，防止 CLS
- 首屏以下图片 `loading="lazy"`
- 封面容器锁定 `aspect-ratio: 16 / 9`
- 文章在构建时预渲染为静态 HTML

---

## 🔍 SEO 与全球部署

### SEO

- 语义化 HTML，正确的 `lang` 属性
- 完整的 Open Graph 标签（`og:title`、`og:description`、`og:image`、`og:locale`）
- JSON-LD 结构化数据（文章页 `Article`、首页 `Person` + `WebSite`）
- 自动生成 `sitemap.xml` + `robots.txt`
- 自定义 404 页面，含正确 `h1` 和导航
- 每篇文章手工撰写 `meta description`，不留空

### 全球架构

- **DNS**：阿里云 + Cloudflare 双解析
- **CDN**：Cloudflare 全球边缘网络
- **统计**：Cloudflare Web Analytics（隐私友好、GDPR 合规）
- **行为分析**：Microsoft Clarity 会话录屏 / 热图
- **自定义子域**：`stats.wuhuajin.com`（Cloudflare Worker + D1 自维护计数器）

### 隐私与合规

- Cookie 同意横幅（GDPR / CCPA 合规）
- Google Consent Mode v2 集成
- 隐私政策 + 条款 + 关于 + 联系页面
- 除已同意的统计外，无跨站追踪 Cookie

---

## 📚 相关文档

- [网站出海实操蓝本](docs/网站出海实操.md) — 完整的网站出海实战手册（内部 SOP）
- [脚本.md](docs/脚本.md) — 脚本使用说明
- [关于本站](https://wuhuajin.com/about.html) — 关于这个博客
- [Issues](https://github.com/whjin/whjin.github.io/issues) — 讨论与 Bug 反馈

---

## ❓ FAQ 与常见问题

**Q：部署后二级页 404（文章页/资源页）。**
A：先确认 feed 生成的 URL 含 `/html/` 段、server 别名统一到 `/viewer.html`，且仓库根存在空 `.nojekyll`（否则 GitHub Pages 的 Jekyll 会吞掉无 front matter 的 `.md` 文件）。

**Q：点击外链图片不显示（外链图片挂掉）。**
A：部分图床（如语雀 `cdn.nlark.com`）会拒绝携带站点 Referer 的请求。外链 `<img>` 已加 `referrerpolicy="no-referrer"`——重新构建文章即自动带上。

**Q：搜索/首页出现同一文章重复卡片。**
A：同一文章可能存在于多个分组。feed 渲染按「标题 + 分类」去重，优先保留静态页链接。

**Q：本地 `npm run dev` 出现统计 CORS 报错。**
A：Cloudflare beacon 只允许 origin `http://localhost`（无端口）。站点会检测 `localhost`/`127.0.0.1` 并本地跳过统计——属预期行为。

**Q：footer 浏览量从哪里来？**
A：由 Cloudflare Worker + D1 计数器（`stats.wuhuajin.com`）在每次页面加载时 +1 并返回累计总数。详见实操蓝本第十章。

---

## 🗺 路线图

- [ ] 持续输出 AI 工程、GIS、独立开发方向的文章
- [ ] 提炼可复用的个人博客 / 资源站 Starter 模板
- [ ] 为资源导航页补充 Product schema
- [ ] 按需增加更多 i18n 语言（日语、西班牙语）
- [ ] 接入 Web Monetization API
- [ ] 图片查看器增加图集导航（上一张/下一张）

---

## 🤝 参与贡献

发现 Bug？有建议？欢迎贡献——请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，再提交 Issue 或 Pull Request。

也可以在 [Issues 页面](https://github.com/whjin/whjin.github.io/issues) 讨论。

---

## 🙏 致谢

- **[zhheo](https://zhheo.com)** — 赞赏卡片设计参考并经许可复刻
- **marked / highlight.js / APlayer / Meting** — 核心渲染与音频库
- **Cloudflare、GitHub Pages、Waffo Pancake、Google AdSense** — 托管、CDN 与变现基础设施

---

## 👨‍💻 关于作者

**吴华锦** — 全栈开发者 & 独立开发者

- 🌐 博客：[https://wuhuajin.com](https://wuhuajin.com)
- 🐙 GitHub：[@whjin](https://github.com/whjin)
- 🐦 Twitter/X：[@whjin](https://x.com/whjin)

---

## 📄 许可证

[MIT](LICENSE) — 欢迎参考本项目构建你自己的博客。署名非强制。

---

*用 ❤️ 构建 by [吴华锦](https://wuhuajin.com) — 为速度优化，为人类而建。*
