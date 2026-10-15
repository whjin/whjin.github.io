# Personal Tech Blog — Full-Stack Performance Optimized

**English** | [中文](README.zh.md)

> A high-performance static personal blog built with pure HTML/CSS/JavaScript, optimized for global audiences, Google Core Web Vitals, and search engines.

**Live Site**: [https://wuhuajin.com](https://wuhuajin.com)  
**Author**: [Wu Huajin](https://wuhuajin.com/about.html) — Full-Stack Developer | FPGA Engineer | Indie Game Developer

---

## 📖 About

This is the source code of my personal tech blog, built from scratch without any heavy frameworks. It's a fully static site hosted on **GitHub Pages**, optimized for speed, SEO, and global accessibility.

With **53+ technical articles** covering full-stack development, FPGA hardware design, AI tools, indie game development, and web performance optimization, it serves as my long-term knowledge base and public portfolio.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Pure HTML5 + CSS3 + Vanilla JavaScript |
| **Content** | Markdown → Static HTML (custom build scripts) |
| **Build Tool** | Node.js + Custom scripts (no Webpack/Vite overhead) |
| **Deployment** | GitHub Pages + Cloudflare CDN + Alibaba Cloud DNS |
| **Analytics** | Cloudflare Web Analytics + Cloudflare Worker + D1 |
| **Monetization** | Google AdSense + Ko-fi Membership |
| **i18n** | Custom lightweight bilingual (Chinese / English) |

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
- ✅ All 13 JS scripts `defer`-loaded, non-blocking HTML parsing
- ✅ Above-the-fold logo `fetchpriority="high"` for faster LCP

**Images & Media**
- ✅ All images `width`/`height` attributes to prevent layout shifts
- ✅ Lazy loading for below-the-fold images and social icons
- ✅ Social QR codes compressed: 576 KB → 262 KB (width 400px, quality 70%)
- ✅ Cover containers `aspect-ratio: 16/9` to eliminate CLS

**HTML & Content**
- ✅ Homepage static article list trimmed: full descriptions for top 15, summary for rest
- ✅ All articles pre-rendered to static HTML by custom build scripts
- ✅ Sitemap.xml auto-generated with 54 URLs

---

## ♿ Accessibility

We believe performance and accessibility go hand in hand.

- ✅ Semantic HTML5 (`<article>`, `<nav>`, `<h1>`)
- ✅ ARIA labels on all icon-only buttons
- ✅ ARIA dialog labels on QR code modals (`role="dialog"`, `aria-modal="true"`)
- ✅ Color contrast ratio ≥ 4.5:1 (WCAG AA)
- ✅ Bilingual support (Chinese / English) with one-click toggle

---

## 🔍 SEO & Discoverability

Fully optimized for Google search and international audiences.

- ✅ Semantic HTML with proper `lang="zh-CN"` attribute
- ✅ Complete Open Graph tags (`og:title`, `og:description`, `og:image`, `theme-color`)
- ✅ JSON-LD structured data (WebPage, Article types)
- ✅ `sitemap.xml` + `robots.txt` auto-generated
- ✅ 404 page with proper h1 and navigation
- ✅ Cloudflare CDN for global low-latency access

---

## 🌍 Global Deployment (Overseas Optimization)

This blog is specifically optimized for both **domestic (China)** and **overseas** visitors.

### Architecture

- **DNS**: Alibaba Cloud + Cloudflare dual resolution
- **CDN**: Cloudflare global edge network
- **Analytics**: Cloudflare Web Analytics (privacy-friendly, no cookies, GDPR compliant)
- **Custom Domains**: `stats.wuhuajin.com` (Cloudflare Worker + D1), `meting.wuhuajin.com` (Meting API)

### Privacy & Compliance

- ✅ Cookie Consent Banner (GDPR / CCPA compliant)
- ✅ Google AdSense Consent Mode v2 integration
- ✅ Privacy Policy + Terms pages
- ✅ No cross-site tracking cookies

---

## 💡 What Makes This Project Different

Most personal blogs are either:
- **Too simple**: Just a static site generator template with no optimization
- **Too complex**: Heavy frameworks, build tools, and dependencies that slow things down

This project is different because it's built from the ground up with **performance as the primary constraint**:

1. **Zero framework overhead**: Pure HTML/CSS/JS, no React/Vue bundle
2. **Custom build pipeline**: Lightweight Node.js scripts tailored exactly to our needs
3. **Full-stack understanding**: Not just frontend — includes backend API workers, database (D1), deployment automation
4. **Hardware perspective**: As an FPGA engineer, I think in terms of resource constraints and parallel optimization
5. **AI-native workflow**: Daily use of AI coding assistants (Cursor, Claude Code) to iterate faster

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

## 📚 Featured Articles

Explore some of the most popular articles:

- [Webpack Module Bundling Explained: How It Works Under the Hood](https://wuhuajin.com)
- [How I Reduced CLS from 0.37 to Under 0.1 — A Real-World Case Study](https://wuhuajin.com)
- [Static Site Performance Optimization Checklist (2026)](https://wuhuajin.com)
- [JavaScript Defer vs Async: A Complete Guide](https://wuhuajin.com)
- [AI Coding Assistants 2026: A Full-Stack Developer's Honest Review](https://wuhuajin.com)
- [Can AI Actually Write Verilog for FPGAs? My Real-World Test](https://wuhuajin.com)

---

## 🤝 Contributing

Found a bug? Have a suggestion? Feel free to open an issue or submit a PR!

You can also discuss on the [Issues page](https://github.com/whjin/whjin.github.io/issues).

---

## 👨‍💻 About the Author

**Wu Huajin** is a multi-disciplinary developer:

- **Full-Stack Developer**: JavaScript, Node.js, React, PostgreSQL
- **FPGA Engineer**: Verilog, digital design, hardware-software co-design
- **Indie Game Developer**: Browser games, Canvas, small game jam projects
- **Tech Writer**: 50+ articles on web performance, tools, and best practices

🌐 Blog: [https://wuhuajin.com](https://wuhuajin.com)  
🐙 GitHub: [@whjin](https://github.com/whjin)  
🐦 Twitter/X: [@whjin](https://x.com/whjin)

---

## 📄 License

MIT — feel free to use this as inspiration for your own blog!

---

*Built with ❤️ by [Wu Huajin](https://wuhuajin.com) — optimized for speed, built for humans.*
