# 个人技术博客 — 全栈性能优化实践

[English](README.md) | **中文**

> 一个高性能静态个人博客，使用纯 HTML/CSS/JavaScript 构建，针对全球访问、Google Core Web Vitals 和搜索引擎做了深度优化。

**线上站点**：[https://wuhuajin.com](https://wuhuajin.com)  
**作者**：[吴华锦](https://wuhuajin.com/about.html) — 全栈开发者 | FPGA 硬件工程师 | 独立游戏开发者

---

## 📖 项目简介

这是我的个人技术博客源码，从零开始构建，没有使用任何重量级框架。它是一个完全静态的站点，部署在 **GitHub Pages** 上，针对速度、SEO 和全球可访问性做了深度优化。

目前有 **53+ 篇技术文章**，覆盖全栈开发、FPGA 硬件设计、AI 工具、独立游戏开发和 Web 性能优化，是我长期积累的知识库和公开作品集。

---

## 🛠 技术栈

| 层级 | 技术方案 |
|---|---|
| **前端** | 纯 HTML5 + CSS3 + 原生 JavaScript |
| **内容** | Markdown → 静态 HTML（自定义构建脚本） |
| **构建工具** | Node.js + 自定义脚本（无 Webpack/Vite 开销） |
| **部署** | GitHub Pages + Cloudflare CDN + 阿里云 DNS |
| **统计** | Cloudflare Web Analytics + Cloudflare Worker + D1 |
| **变现** | Google AdSense + Ko-fi 会员订阅 |
| **国际化** | 自定义轻量双语（中文 / 英文） |

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
- ✅ 5 个第三方域名 `preconnect` 预连接（Google Analytics、AdSense、Cloudflare 等）
- ✅ 非关键 CSS 异步加载（代码高亮、markdown 渲染、图片查看器）
- ✅ 全部 13 个 JS 脚本 `defer` 延迟加载，不阻塞 HTML 解析
- ✅ 首屏 Logo `fetchpriority="high"` 优先加载，提升 LCP

**图片与媒体**
- ✅ 所有图片加 `width`/`height` 属性，防止布局偏移
- ✅ 首屏以下图片和社交图标懒加载
- ✅ 社交二维码压缩：576 KB → 262 KB（宽度 400px，质量 70%）
- ✅ 封面容器 `aspect-ratio: 16/9`，彻底消除 CLS

**HTML 与内容**
- ✅ 首页静态文章列表精简：前 15 篇保留完整描述，后面 38 篇只保留摘要
- ✅ 所有文章通过自定义构建脚本预渲染为静态 HTML
- ✅ `sitemap.xml` 自动生成，包含 54 个 URL

---

## ♿ 可访问性

我们相信性能和可访问性是相辅相成的。

- ✅ 语义化 HTML5（`<article>`、`<nav>`、`<h1>`）
- ✅ 所有纯图标按钮加 ARIA 标签
- ✅ 二维码弹窗加 ARIA 对话框标签（`role="dialog"`、`aria-modal="true"`）
- ✅ 颜色对比度 ≥ 4.5:1（WCAG AA 标准）
- ✅ 双语支持（中文 / 英文），一键切换

---

## 🔍 SEO 与可发现性

针对 Google 搜索和全球受众做了全面优化。

- ✅ 语义化 HTML，正确的 `lang="zh-CN"` 属性
- ✅ 完整的 Open Graph 标签（`og:title`、`og:description`、`og:image`、`theme-color`）
- ✅ JSON-LD 结构化数据（WebPage、Article 类型）
- ✅ `sitemap.xml` + `robots.txt` 自动生成
- ✅ 404 页面优化（正确的 h1 和导航）
- ✅ Cloudflare CDN 全球低延迟访问

---

## 🌍 海外部署（出海优化）

这个博客专门针对**国内**和**海外**访客做了双向优化。

### 架构

- **DNS**：阿里云 + Cloudflare 双解析
- **CDN**：Cloudflare 全球边缘网络
- **统计**：Cloudflare Web Analytics（隐私友好、无 Cookie、GDPR 合规）
- **自定义域名**：`stats.wuhuajin.com`（Cloudflare Worker + D1）、`meting.wuhuajin.com`（Meting API）

### 隐私与合规

- ✅ Cookie 同意横幅（GDPR / CCPA 合规）
- ✅ Google AdSense Consent Mode v2 集成
- ✅ 隐私政策 + 条款页面
- ✅ 无跨站追踪 Cookie

---

## 🎨 交互体验

除了极致性能，这个博客还注重打磨用户体验：

- **双语默认切换**：英文默认，一键切中文（不做双语双套页）
- **移动端优先**：优化字体排版、触摸友好图标、自适应布局
- **代码块增强功能**：
  - 一键复制按钮 + 视觉反馈
  - 语言标签徽章（JavaScript、Python、HTML 等）
  - 长代码块折叠（300px 最大高度，可滚动，点击展开全部）
  - 工具栏固定在右上角，滚动时不跟随移动
- **图片查看器**：点击任意图片全屏查看，支持缩放、拖动、原图/适应屏幕切换
- **社交互动**：赞赏功能（微信/支付宝二维码 + Ko-fi 会员订阅）
- **可访问性**：规范的 ARIA 标签、语义化 HTML、键盘导航支持

---

## 💡 这个项目的特别之处

大多数个人博客要么：
- **太简单**：只是一个静态站点模板，没有任何优化
- **太复杂**：重量级框架、构建工具和依赖，反而拖慢了速度

这个项目不同，因为它从一开始就把**性能作为首要约束**：

1. **零框架开销**：纯 HTML/CSS/JS，没有 React/Vue 打包体积
2. **自定义构建流水线**：轻量级 Node.js 脚本，完全按需定制
3. **全栈视角**：不只是前端——包含后端 API Worker、数据库（D1）、部署自动化
4. **硬件思维**：作为 FPGA 工程师，我习惯从资源约束和并行优化的角度思考问题
5. **AI 原生工作流**：日常使用 AI 编程助手（Cursor、Claude Code）提升开发效率

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

## 📚 精选文章

看看最受欢迎的几篇文章：

- [Webpack 模块打包原理详解](https://wuhuajin.com)
- [如何把 CLS 从 0.37 优化到 0.1 以下 — 真实案例](https://wuhuajin.com)
- [2026 静态站点性能优化清单](https://wuhuajin.com)
- [JavaScript Defer vs Async 完全指南](https://wuhuajin.com)
- [2026 AI 编程助手实测：全栈开发者的真实评价](https://wuhuajin.com)
- [AI 真的能写 FPGA Verilog 吗？我的实测](https://wuhuajin.com)

---

## 🤝 参与贡献

发现 Bug？有建议？欢迎提 Issue 或提交 PR！

也可以在 [Issues 页面](https://github.com/whjin/whjin.github.io/issues) 讨论。

---

## 👨‍💻 关于作者

**吴华锦** 是一个跨领域开发者：

- **全栈开发者**：JavaScript、Node.js、React、PostgreSQL
- **FPGA 工程师**：Verilog、数字设计、软硬件协同设计
- **独立游戏开发者**：浏览器游戏、Canvas、小型 Game Jam 项目
- **技术写作者**：50+ 篇关于 Web 性能、工具和最佳实践的文章

🌐 博客：[https://wuhuajin.com](https://wuhuajin.com)  
🐙 GitHub：[@whjin](https://github.com/whjin)  
🐦 Twitter/X：[@whjin](https://x.com/whjin)

---

## 📄 许可证

MIT — 欢迎参考这个项目来构建你自己的博客！

---

*用 ❤️ 构建 by [吴华锦](https://wuhuajin.com) — 为速度优化，为人类而建。*
