# Wu Huajin — Personal Tech Blog

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)
[![Website](https://img.shields.io/badge/site-wuhuajin.com-blue.svg)](https://wuhuajin.com)
[![Blog Posts](https://img.shields.io/badge/articles-50+-orange.svg)](https://wuhuajin.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Last Commit](https://img.shields.io/github/last-commit/whjin/whjin.github.io)](https://github.com/whjin/whjin.github.io/commits/main)

**English** | [中文](README.zh.md)

> A high-performance static personal blog built with pure HTML/CSS/JavaScript, optimized for global audiences, Google Core Web Vitals, and search engines. No frameworks, no build-tooling overhead — just fast, accessible, and SEO-friendly pages.

**Live Site**: [https://wuhuajin.com](https://wuhuajin.com)
**Author**: [Wu Huajin](https://wuhuajin.com/about.html) — Full-Stack Developer | Indie Hacker

---

## Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Build Pipeline](#-build-pipeline)
- [Performance](#-performance-core-web-vitals)
- [SEO & Global Deployment](#-seo--global-deployment)
- [Documentation](#-documentation)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About

This is the source code of [wuhuajin.com](https://wuhuajin.com), a personal tech blog built from scratch without any heavy frameworks. It is a fully static site hosted on **GitHub Pages**, optimized for speed, SEO, and global accessibility.

With **50+ technical articles** covering full-stack development, AI tools, web performance optimization, GIS, and more, it serves as a long-term knowledge base and public portfolio. The site also doubles as a resource navigation hub for AI tools, developer references, and curated links.

---

## ✨ Features

- **Zero-framework frontend**: Pure HTML5 + CSS3 + Vanilla JS, no React/Vue/Next.js bundle overhead
- **Bilingual by default**: English-first, one-click switch to Chinese via a lightweight i18n dictionary
- **Static prerendering**: Every Markdown article is built into a standalone HTML at build time for full SEO crawlability
- **Adaptive pagination**: Two-column desktop layout with right-sidebar-driven page sizing; fixed 6-per-page on mobile; shared `pager` component for consistent capsule-style UI
- **Data sync pipeline**: Friend-link data (`友链/data.json`) auto-syncs to feed cards via title-matched mapping in `build-feed.cjs`
- **Ad sorting**: Advertisement cards support `sort` field (lower = higher priority) across the sidebar
- **Product & compliance pages**: Dedicated `/product.html` landing page, `/aigc-policy.html` content usage policy, refund & liability terms
- **Performance-first**: Core Web Vitals tuned (CLS < 0.1, LCP < 2.5s) via `defer` loading, image `aspect-ratio`, `preconnect`, and lazy loading
- **GDPR-ready**: Cookie consent banner, Google Consent Mode v2, privacy policy, no cross-site tracking cookies
- **Accessibility**: Semantic HTML, ARIA labels on icon buttons, focus-visible outlines, mobile pinch-to-zoom preserved
- **Code blocks**: One-click copy, language labels, collapsible long blocks with a floating toolbar
- **Image viewer**: Click any image for fullscreen, zoom, and pan
- **Reward / membership**: Ko-fi membership + WeChat/Alipay QR support, with a dedicated reward page
- **Indie product monetization**: Waffo Pancake subscription checkout ($9.99/month, 7-day trial)
- **Resource navigation**: Card-based aggregation pages for AI tools, developer references, and curated links

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Pure HTML5 + CSS3 + Vanilla JavaScript (ES Modules where needed) |
| **Content** | Markdown → static HTML via custom Node.js build scripts |
| **Build tooling** | Node.js + custom `.cjs` scripts (no Webpack/Vite/esbuild) |
| **Dev server** | Native `http` module + `chokidar` file watcher + WebSocket live reload |
| **Deployment** | GitHub Pages + Cloudflare CDN + Alibaba Cloud DNS |
| **Analytics** | Cloudflare Web Analytics + Microsoft Clarity + Google Analytics 4 |
| **Monetization** | Google AdSense + Ko-fi membership + WeChat/Alipay tips + Waffo Pancake subscription |
| **i18n** | Custom lightweight bilingual dictionary (Chinese / English) |

---

## 📁 Project Structure

```
wuhuajin.github.io/
├── src/
│   ├── components/               # Reusable UI components (each self-contained)
│   │   ├── aplayer/             # Audio player
│   │   ├── banner/              # Top carousel ads
│   │   ├── cookie-consent/      # GDPR cookie consent banner
│   │   ├── feed/                # Homepage article feed + pagination
│   │   ├── footer/              # Site footer
│   │   ├── i18n/                # Bilingual dictionary + runtime switch
│   │   ├── image-viewer/        # Fullscreen image viewer
│   │   ├── loading/             # Loading spinner
│   │   ├── navigation/          # Top navigation bar
│   │   ├── pager/               # Shared pagination component (capsule style)
│   │   ├── render/              # Markdown renderer (marked + highlight.js)
│   │   ├── reward-tip/          # In-article donation card
│   │   ├── scroll/              # Back-to-top button
│   │   ├── sidebar/             # Homepage sidebar (About, events, tags, ads)
│   │   └── social/              # Social icon grid
│   ├── template/
│   │   ├── posts/               # Articles organized by category
│   │   │   ├── JavaScript/
│   │   │   ├── Node/
│   │   │   ├── AI/
│   │   │   ├── Git/
│   │   │   └── Link/            # Aggregation pages (links, resources, articles)
│   │   ├── feed/                # Feed data.json
│   │   ├── link/                # Link/article navigation template
│   │   ├── menu/                # Resource navigation template
│   │   └── reward/              # Reward page template
│   ├── css/                     # Third-party CSS (highlight.js themes)
│   ├── images/                  # Image assets + icon fonts
│   └── js/                      # Third-party JS (marked, highlight.js)
├── scripts/                     # Build & maintenance scripts
│   ├── build-all.cjs             # Full build entry
│   ├── build-feed.cjs            # Generate feed data.json
│   ├── build-articles.cjs       # Prerender Markdown → static HTML
│   ├── build-home.cjs            # Generate homepage data
│   ├── build-sitemap.cjs         # Generate sitemap.xml
│   ├── build-links.cjs           # Build aggregation pages
│   ├── add-front-matter.cjs      # Backfill missing front matter
│   ├── update-wordcount.js       # Count real words per article
│   └── watch.cjs                 # File watcher + live reload
├── docs/                         # Project documentation
│   ├── 网站出海实操.md           # Global launch playbook (Chinese)
│   └── 外链/                     # Off-site syndicated English articles
├── server.js                     # Local dev server (port 8000)
├── index.html                    # Homepage entry
├── about.html / contact.html    # Compliance pages
├── privacy.html / terms.html     # Legal pages (with refund & liability clauses)
├── reward.html                   # Reward / membership page
├── product.html                  # Product landing page (Developer Tools Suite)
├── aigc-policy.html              # AIGC content usage policy
├── 404.html
├── robots.txt / sitemap.xml / ads.txt / CNAME
└── package.json
```

---

## 🚀 Quick Start

**Prerequisites**: Node.js ≥ 18, npm or pnpm.

```bash
# Clone
git clone https://github.com/whjin/whjin.github.io.git
cd whjin.github.io

# Install dependencies
npm install

# Start local dev server (build + watch + live reload)
npm run dev

# Build all static pages for production
npm run build

# Clean macOS metadata files
npm run clean
```

The dev server runs at `http://localhost:8000`.

---

## 📦 Build Pipeline

| Script | Command | What it does |
|---|---|---|
| Full build | `npm run build` | Runs all build scripts in sequence |
| Dev mode | `npm run dev` | Build once → start watcher + dev server with live reload |
| Feed data | `npm run build:feed` | Parse Markdown front matter → feed/data.json |
| Articles | `npm run build:articles` | Prerender every Markdown → static HTML in `posts/<cat>/html/` |
| Sitemap | `npm run build:sitemap` | Auto-generate `sitemap.xml` from feed |
| Front matter | `npm run build:frontmatter` | Backfill missing front matter fields |
| Word count | `node scripts/update-wordcount.js` | Count real words per article, write `wordCount` to feed |
| Clean | `npm run clean` | Remove `.DS_Store` / `._*` macOS metadata |

All build scripts are **idempotent**: running them twice produces no diff.

---

## ⚡ Performance (Core Web Vitals)

This blog has undergone **20+ systematic performance optimizations** to achieve near-perfect PageSpeed Insights scores.

### Key Wins

| Metric | Before | After | Improvement |
|---|---|---|---|
| **Homepage HTML size** | 57 KB | 34 KB | **−40%** |
| **Social share image** | 576 KB | 262 KB | **−55%** |
| **CLS (layout shift)** | 0.37 | < 0.1 | **−73%** |
| **Render-blocking CSS** | 11 KB | Async loaded | **Eliminated** |
| **Render-blocking JS** | 13 files | All `defer` | **Eliminated** |

### Techniques

- `preconnect` to 5 third-party origins (GA4, AdSense, Cloudflare, etc.)
- Non-critical CSS (highlight.js, image viewer) loaded asynchronously
- All `<script>` tags use `defer`; no render-blocking JS
- Above-the-fold logo uses `fetchpriority="high"`
- Every `<img>` has explicit `width` / `height` to prevent CLS
- Below-the-fold images use `loading="lazy"`
- Cover containers lock `aspect-ratio: 16 / 9`
- Articles prerendered to static HTML at build time

---

## 🔍 SEO & Global Deployment

### SEO

- Semantic HTML with correct `lang` attribute
- Complete Open Graph tags (`og:title`, `og:description`, `og:image`, `og:locale`)
- JSON-LD structured data (`Article` on posts, `Person` + `WebSite` on homepage)
- Auto-generated `sitemap.xml` + `robots.txt`
- Custom 404 page with proper `h1` and navigation
- Every article has a hand-crafted `meta description` (no empty descriptions)

### Global Architecture

- **DNS**: Alibaba Cloud + Cloudflare dual resolution
- **CDN**: Cloudflare global edge network
- **Analytics**: Cloudflare Web Analytics (privacy-friendly, GDPR compliant)
- **Custom subdomain**: `stats.wuhuajin.com` (Cloudflare Worker + D1 self-hosted counter)

### Privacy & Compliance

- Cookie consent banner (GDPR / CCPA compliant)
- Google Consent Mode v2 integration
- Privacy Policy + Terms + About + Contact pages
- No cross-site tracking cookies beyond consented analytics

---

## 📚 Documentation

- [网站出海实操蓝本](docs/网站出海实操.md) — Full website launch playbook (Chinese, internal SOP)
- [About](https://wuhuajin.com/about.html) — About this blog
- [Issues](https://github.com/whjin/whjin.github.io/issues) — Discussions and bug reports

---

## 🗺 Roadmap

- [ ] More articles on AI engineering, GIS, and indie hacking
- [ ] Reusable starter template for personal blogs / resource sites
- [ ] Product schema for the resource navigation pages
- [ ] Additional i18n locales (Japanese, Spanish) on demand
- [ ] Web monetization integration (Web Monetization API)

---

## 🤝 Contributing

Found a bug? Have a suggestion? Contributions are welcome — please read [CONTRIBUTING.md](CONTRIBUTING.md) first, then open an issue or submit a pull request.

You can also discuss on the [Issues page](https://github.com/whjin/whjin.github.io/issues).

---

## 👨‍💻 About the Author

**Wu Huajin** — Full-Stack Developer & Indie Hacker

- 🌐 Blog: [https://wuhuajin.com](https://wuhuajin.com)
- 🐙 GitHub: [@whjin](https://github.com/whjin)
- 🐦 Twitter/X: [@whjin](https://x.com/whjin)

---

## 📄 License

[MIT](LICENSE) — feel free to use this as inspiration for your own blog. Attribution appreciated but not required.

---

*Built with ❤️ by [Wu Huajin](https://wuhuajin.com) — optimized for speed, built for humans.*
