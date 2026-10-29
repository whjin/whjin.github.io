# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

- Directory listing on 新趣集 (product + article), with ownership badge statically embedded in the footer (crawler-visible, no JS dependency).
- Documentation overhaul: README (EN/ZH) aligned to open-source project standards, new `LICENSE`, `CONTRIBUTING.md`, `CHANGELOG.md`.
- Removed macOS metadata files (AppleDouble `._*`).

## [2026-10-27]

### Added
- Homepage pagination component (`src/components/pager/`) — shared capsule-style UI, extracted from feed & reward pages.
- Real word-count for article cards (`scripts/update-wordcount.js`), replacing the estimated "X min read".
- Product landing page `/product.html` and AIGC content policy `/aigc-policy.html` to pass Waffo.ai self-review.
- `topic` front-matter field to assign an article to a specific sidebar card and avoid cross-card duplication.

### Fixed
- Waffo.ai review items: refund policy + liability terms added to `terms.html`.
- Article cards cross-card duplication resolved by `url → title` two-level merge + title dedup.
- Feed sorting now buckets articles by category (top first, then date desc), keeping same-category articles together.

### Changed
- Footer layout adjusted; homepage card positions reworked.

## [2026-10-22 ~ 2026-10-21]

### Added
- Microsoft Clarity behavior analytics integration (session recording / heatmaps).
- WeChat payment switched to a tip QR code (`赞赏码`).

### Changed
- Merged/removed Link sub-items: "工具"→"友链", "教程"→"文章".

## [2026-10-15]

### Added
- Code blocks: expand/collapse, one-click copy, language labels on article detail pages.
- Icon sizing & vertical centering normalization.

### Changed
- Removed the "Skip to content" feature site-wide.
- Reworked mobile search-box interaction (search box default visible, icon toggling).
- README bilingual (EN/ZH) rewrite.

## [2026-10-13 ~ 2026-10-14]

### Added
- Performance optimization pass driven by GSC/CrUX: CLS fixes, preconnect, lazy loading, `fetchpriority`, HTML slim-down.
- Off-site English articles (syndicated content).

### Fixed
- `sitemap.xml` time-format error; `robots.txt` errors; disabled Cloudflare AI Crawl Control.
- Cleared macOS OS metadata from the repo.

## [2026-10-09]

### Added
- Second-level page reward card + dedicated reward detail page (`reward.html`).
- Moved HTML pages under `Link/` directory for unified management; article external-link publishing.

## [2026-10-06]

### Added
- `docs/` directory with the global-launch playbook (`网站出海实操.md`).
- Cloudflare all-time visit counter via Worker + D1.

### Fixed
- Cloudflare beacon local CORS error (skip on `localhost`/`127.0.0.1`).
- Search results showing duplicate data.

## [2026-10-04 ~ 2026-10-05]

### Added
- `.nojekyll` file to disable GitHub Pages Jekyll.

### Fixed
- Post-deployment second-level page 404 (feed URL `/html/` segment + unified `/viewer.html` alias).
- "Resource page" blank body; homepage modal layering; horizontal scrolling on narrow screens.
- Site visit count stuck at 0 (migrated to Cloudflare Web Analytics).
- Homepage right-sidebar collapse/expand toggle.

---

For the full technical deep-dive (frameworks, pitfalls, checklists), see [docs/网站出海实操.md](docs/网站出海实操.md).
