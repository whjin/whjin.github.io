# Contributing to Wu Huajin Blog

Thanks for your interest in contributing! This is a small personal project, but well-organized contributions are very welcome — whether it's fixing a bug, improving documentation, adding an article, or refining the build tooling.

## Ways to contribute

- **Report a bug** — open an [Issue](https://github.com/whjin/whjin.github.io/issues) with a clear description, steps to reproduce, and expected vs actual behavior.
- **Suggest a feature** — open an Issue describing the use case and why it matters.
- **Fix or improve code** — open a Pull Request following the guidelines below.
- **Write / fix documentation** — docs improvements are always appreciated.

## Getting started

1. Fork the repository.
2. Create a branch: `git checkout -b fix/your-fix-name` (or `feat/...`, `docs/...`).
3. Install dependencies: `npm install`.
4. Make your change and run the build to verify: `npm run build`.
5. Test locally: `npm run dev` → open `http://localhost:8000`.
6. Run `npm run clean` to remove any macOS metadata files before committing.
7. Commit with a clear message, push, and open a Pull Request.

## Guidelines

- **Keep the zero-framework principle**: the site intentionally has no React/Vue/Next.js — new frontend code should stay Vanilla JS.
- **Data-driven config**: structured data lives in `data.json` files (see README "Configuration"); prefer data over hard-coded values.
- **Idempotent builds**: build scripts must produce no diff when run twice.
- **Match style**: follow `.prettierrc` (2-space indent, single quotes, semicolons) and the existing naming conventions (`list`, `image` fields).
- **Don't break SEO/compliance**: preserve canonical/OG/JSON-LD tags, `defer` scripts, and legal pages.
- **Keep READMEs in sync**: when behavior changes, update both `README.md` (English) and `README.zh.md` (Chinese).

## Commit message style

Use conventional prefixes for clarity:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `chore:` — maintenance / tooling
- `refactor:` — code change that doesn't alter behavior

Example: `fix: unify viewer alias to /viewer.html to avoid 404s`

## Code of Conduct

Be respectful and constructive. Harassment, discrimination, or abusive behavior of any kind is not tolerated.

---

Questions? Open an [Issue](https://github.com/whjin/whjin.github.io/issues) or reach out via the contact page.
