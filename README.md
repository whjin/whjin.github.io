# Personal Tech Blog — Full-Stack Performance Optimized

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)
[![Website](https://img.shields.io/badge/site-wuhuajin.com-blue.svg)](https://wuhuajin.com)
[![Blog Posts](https://img.shields.io/badge/articles-49+-orange.svg)](https://wuhuajin.com)

**English** | [中文](README.zh.md)

> A high-performance static personal blog built with pure HTML/CSS/JavaScript, optimized for global audiences, Google Core Web Vitals, and search engines.

**Live Site**: [https://wuhuajin.com](https://wuhuajin.com)
**Author**: [Wu Huajin](https://wuhuajin.com/about.html) — Full-Stack Developer | Indie Hacker

---

## Table of Contents

- [About](#-about)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Build Pipeline](#-build-pipeline)
- [Performance](#-performance-optimization-core-web-vitals)
- [SEO & Global Deployment](#-seo--global-deployment)
- [Features](#-uiux-features)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About

This is the source code of my personal tech blog, built from scratch without any heavy frameworks. It's a fully static site hosted on **GitHub Pages**, optimized for speed, SEO, and global accessibility.

With **49+ technical articles** covering full-stack development, AI tools, web performance optimization, and more, it serves as my long-term knowledge base and public portfolio.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Pure HTML5 + CSS3 + Vanilla JavaScript |
| **Content** | Markdown → Static HTML (custom build scripts) |
| **Build Tool** | Node.js + Custom scripts (no Webpack/Vite overhead) |
| **Deployment** | GitHub Pages + Cloudflare CDN + Alibaba Cloud DNS |
| **Analytics** | Cloudflare Web Analytics + Microsoft Clarity + Google Analytics 4 |
| **Monetization** | Google AdSense + Ko-fi Membership |
| **i18n** | Custom lightweight bilingual (Chinese / English) |

---

## 📁 Project Structure

```
wuhuajin.github.io/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── banner/          # Top carousel ads
│   │   ├── cookie-consent/  # GDPR cookie consent banner
│   │   ├── feed/             # Homepage article feed
│   │   ├── image-viewer/    # Fullscreen image viewer
│   │   ├── navigation/       # Top navigation bar
│   │   ├── reward-tip/       # Donation card component
│   │   ├── render/          # Markdown renderer
│   │   ├── scroll/          # Back-to-top button
│   │   └── sidebar/         # Table of contents / ads
│   ├── template/
│   │   ├── posts/           # Articles (by category)
│   │   │   ├── JavaScript/
│   │   │   ├── Node/
│   │   │   ├── AI/
│   │   │   └── Link/        # Aggregation pages (links/articles/resources)
│   │   ├── link/            # Link/article navigation template
│   │   └── menu/            # Resource navigation template
│   ├── css/                 # Third-party CSS (highlight.js)
│   ├── images/              # Image assets
│   └── js/                  # Third-party JS (marked/highlight)
├── scripts/                 # Build scripts
│   ├── build-all.cjs        # Full build entry
│   ├── build-feed.cjs       # Generate feed data
│   ├── build-articles.cjs   # Pre-render articles to static HTML
│   ├── build-home.cjs       # Generate homepage data
│   ├── build-sitemap.cjs    # Generate sitemap.xml
│   ├── build-links.cjs      # Build aggregation pages
│   └── watch.cjs            # File watcher + live reload
├── docs/                    # Project documentation
├── server.js                # Local dev server
├── index.html               # Homepage entry
└── package.json
```

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/whjin/whjin.github.io.git

# Install dependencies
npm install

# Start local dev server with live reload
npm run dev

# Build all static pages
npm run build
```

---

## 📦 Build Pipeline

| Script | Command | What it does |
|---|---|---|
| Full build | `npm run build` | Runs all build scripts in sequence |
| Dev mode | `npm run dev` | Build + dev server + live reload |
| Feed data | `npm run build:feed` | Parse md front matter, generate feed JSON |
| Articles | `npm run build:articles` | Pre-render all md → static HTML |
| Sitemap | `npm run build:sitemap` | Auto-generate sitemap.xml |
| Front matter | `npm run build:frontmatter` | Add missing front matter to md files |
| Clean | `npm run clean` | Remove macOS metadata files |

---

## ⚡ Performance Optimization (Core Web Vitals)

This blog has undergone **22+ systematic performance optimizations** to achieve near-perfect scores on PageSpeed Insights and GTmetrix.

### Key Wins

| Metric | Before | After | Improvement |
|---|---|---|---|
| **Homepage HTML Size** | 57 KB | 34 KB | **-40%** |
| **Social Image Weight** | 576 KB | 262 KB | **-55%** |
| **CLS (Cumulative Layout Shift)** | 0.37 | < 0.1 | **-73%** |
| **Blocking CSS** | 11 KB render-blocking | Async loaded | **Eliminated** |
| **Blocking JS** | 13 files render-blocking | All `defer` | **Eliminated** |

### What We Did

**Network & Resource Loading**
- ✅ `preconnect` to 5 third-party domains (Google Analytics, AdSense, Cloudflare, etc.)
- ✅ Non-critical CSS async loaded (highlight.js, markdown renderer, image viewer)
- ✅ All JS scripts `defer`-loaded, non-blocking HTML parsing
- ✅ Above-the-fold logo `fetchpriority="high"` for faster LCP

**Images & Media**
- ✅ All images `width`/`height` attributes to prevent layout shifts
- ✅ Lazy loading for below-the-fold images and social icons
- ✅ Cover containers `aspect-ratio: 16/9` to eliminate CLS

**HTML & Content**
- ✅ All articles pre-rendered to static HTML by custom build scripts
- ✅ Sitemap.xml auto-generated with all URLs

---

## 🔍 SEO & Global Deployment

### SEO

- ✅ Semantic HTML with proper `lang` attribute
- ✅ Complete Open Graph tags (`og:title`, `og:description`, `og:image`)
- ✅ JSON-LD structured data (WebPage, Article types)
- ✅ `sitemap.xml` + `robots.txt` auto-generated
- ✅ 404 page with proper h1 and navigation

### Global Architecture

- **DNS**: Alibaba Cloud + Cloudflare dual resolution
- **CDN**: Cloudflare global edge network
- **Analytics**: Cloudflare Web Analytics (privacy-friendly, GDPR compliant)
- **Custom Domains**: `stats.wuhuajin.com` (Cloudflare Worker + D1)

### Privacy & Compliance

- ✅ Cookie Consent Banner (GDPR / CCPA compliant)
- ✅ Google AdSense Consent Mode v2 integration
- ✅ Privacy Policy + Terms pages
- ✅ No cross-site tracking cookies

---

## 🎨 UI/UX Features

- **Bilingual by default**: English first, one-click switch to Chinese
- **Mobile-first responsive**: Optimized typography, touch-friendly icons
- **Code block enhancements**: One-click copy, language labels, collapsible blocks
- **Image viewer**: Click any image to view fullscreen, zoom, pan
- **Donation card**: Reward/donation section with QR codes + Ko-fi
- **Resource navigation**: Card-based aggregation pages for links and tools

---

## 📚 Documentation

- [网站出海实操蓝本](docs/网站出海实操.md) — Full website launch playbook (Chinese)
- [About](https://wuhuajin.com/about.html) — About this blog

---

## 🤝 Contributing

Found a bug? Have a suggestion? Feel free to open an issue or submit a PR!

You can also discuss on the [Issues page](https://github.com/whjin/whjin.github.io/issues).

---

## 👨‍💻 About the Author

**Wu Huajin** — Full-Stack Developer & Indie Hacker

- 🌐 Blog: [https://wuhuajin.com](https://wuhuajin.com)
- 🐙 GitHub: [@whjin](https://github.com/whjin)
- 🐦 Twitter/X: [@whjin](https://x.com/whjin)

---

## 📄 License

MIT — feel free to use this as inspiration for your own blog!

---

*Built with ❤️ by [Wu Huajin](https://wuhuajin.com) — optimized for speed, built for humans.*
