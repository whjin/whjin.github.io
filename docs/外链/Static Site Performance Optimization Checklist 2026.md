# Static Site Performance Optimization Checklist (2026)

Static sites are supposed to be fast. That's the whole point of using something like Jekyll, Hugo, or Astro — no server-side rendering, no database queries, just pure HTML.

But "static" doesn't automatically mean "fast." I've seen static sites that score worse on PageSpeed Insights than some heavily dynamic WordPress sites.

After optimizing my own blog (deployed on GitHub Pages), I've compiled this checklist of performance optimizations that actually move the needle. These are the things that matter — not the micro-optimizations that save you 20ms.

---

## The Big Picture

Before we dive into the checklist, let's remember what we're optimizing for. Google's Core Web Vitals are:

- **LCP (Largest Contentful Paint)**: How long until the biggest content element renders
- **FID (First Input Delay)**: How responsive the page is when you first interact with it (now replaced by INP)
- **CLS (Cumulative Layout Shift)**: How much the layout shifts unexpectedly

These three metrics are what Google cares about most. Everything else is secondary.

---

## 1. Image Optimization

Images are usually the heaviest part of any page. If you fix nothing else, fix your images.

### ✅ Do This

- **Compress images**: Use tools like `squoosh` or `sharp` to reduce file size. You can often cut image size by 50-70% without noticeable quality loss.
- **Use modern formats**: WebP or AVIF are 25-50% smaller than JPEG/PNG. Just make sure you provide fallbacks.
- **Lazy load below-the-fold images**: Add `loading="lazy"` to images that aren't in the initial viewport. The browser will load them only when the user scrolls near them.
- **Set `width` and `height` attributes**: This prevents layout shifts (CLS). The browser can reserve the right amount of space before the image loads.
- **Prioritize above-the-fold images**: Add `fetchpriority="high"` to your LCP image (usually the logo or hero image).

### ❌ Don't Do This

- Don't serve 2000px wide images when they'll only display at 400px wide
- Don't use unoptimized PNGs for photos (use JPEG or WebP instead)
- Don't forget to set dimensions (this is the #1 cause of CLS)

---

## 2. CSS Optimization

Render-blocking CSS is one of the biggest culprits for slow FCP. The browser can't render the page until it has downloaded and parsed all CSS.

### ✅ Do This

- **Inline critical CSS**: The CSS needed for above-the-fold content should be inlined directly in the `<head>`. The rest can be loaded asynchronously.
- **Async load non-critical CSS**: Use `media="print" onload="this.media='all'"` trick to load CSS without blocking rendering.
- **Remove unused CSS**: Audit your stylesheets and remove anything you're not actually using. Tools like PurgeCSS can help.
- **Minify CSS**: Remove whitespace, comments, and shorten variable names.

### The Async CSS Trick

Here's the pattern I use for non-critical CSS:

```html
<!-- Load asynchronously (won't block rendering) -->
<link rel="stylesheet" href="non-critical.css" media="print" onload="this.media='all'">

<!-- Fallback for no-JS users -->
<noscript>
  <link rel="stylesheet" href="non-critical.css">
</noscript>
```

The `media="print"` trick makes the browser think this CSS is only for printing, so it loads it asynchronously. Then `onload` switches it to `media="all"` once it's loaded.

---

## 3. JavaScript Optimization

JavaScript is the most common cause of poor TBT (Total Blocking Time). The more JS you have, the longer the browser spends parsing and executing it, and the less responsive the page feels.

### ✅ Do This

- **Defer non-critical JS**: Add `defer` to scripts that don't need to run immediately. This tells the browser to download the script in the background and execute it after the HTML has finished parsing.
- **Code split**: Don't load all your JS at once. Split it by route or by feature, so users only download what they need.
- **Tree shake**: Remove unused code. Modern bundlers (Webpack, Rollup, esbuild) do this automatically if you use ES modules.
- **Minify and compress**: Terser or esbuild can reduce JS size by 50% or more.

### Defer vs Async: What's the Difference?

| Attribute | Execution Order | DOMContentLoaded |
|---|---|---|
| `defer` | Preserved (runs in order) | Waits for deferred scripts |
| `async` | Not preserved (runs as soon as it loads) | Doesn't wait |
| None (sync) | Preserved, blocks parsing | Blocks everything |

Use `defer` when your scripts depend on each other. Use `async` for things like analytics that don't affect the page.

---

## 4. Network Optimization

Even if your files are small, slow network requests can delay everything.

### ✅ Do This

- **Preconnect to important origins**: If you load resources from third-party domains (Google Analytics, AdSense, CDNs), use `<link rel="preconnect">` to establish the connection early.

```html
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="preconnect" href="https://pagead2.googlesyndication.com">
```

- **Preload critical resources**: If you have a critical resource that's discovered late (like a font or an LCP image), use `<link rel="preload">` to tell the browser to fetch it earlier.
- **Use a CDN**: A CDN caches your content at edge locations around the world, so users get it from a server close to them.
- **Enable compression**: Make sure your server (or CDN) is serving gzip or Brotli-compressed files. This can reduce HTML/CSS/JS size by 60-80%.

### What Is Preconnect, Exactly?

When the browser loads a resource from a new domain, it has to:
1. Do a DNS lookup
2. Establish a TCP connection
3. Do a TLS handshake (for HTTPS)

That's usually 100-300ms of overhead. `preconnect` tells the browser to do all this *before* it even needs the resource, so when it does need it, the connection is already ready.

---

## 5. Font Optimization

Web fonts are often overlooked, but they can have a big impact on performance.

### ✅ Do This

- **Use `font-display: swap`**: This tells the browser to show a fallback font immediately, then swap in the custom font when it's ready. Without this, the browser might show invisible text until the font loads.

```css
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/myfont.woff2') format('woff2');
  font-display: swap;
}
```

- **Only load the weights you need**: Don't load 400, 500, 600, 700, 800 if you only use 400 and 700.
- **Subset your fonts**: If you only use Latin characters, don't load the Chinese/Japanese/Korean subsets.
- **Use WOFF2**: It's the most efficient modern font format, supported by all modern browsers.

### Should You Even Use Web Fonts?

For a lot of sites, system fonts are the best choice:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

System fonts are already on the user's device, so there's nothing to download. They also look native and feel fast.

Use web fonts only if you have strong brand reasons to.

---

## 6. SEO and Crawlability

Performance isn't just about speed — it's also about making sure search engines can actually crawl your site.

### ✅ Do This

- **Use semantic HTML**: Proper `<h1>`, `<article>`, `<nav>` tags help search engines understand your content.
- **Add meta descriptions**: Every page should have a unique `<meta name="description">`.
- **Generate a sitemap.xml**: Submit it to Google Search Console.
- **Use structured data (JSON-LD)**: Add schema.org markup for articles, products, etc. This enables rich snippets in search results.
- **Set `lang` attribute**: `<html lang="en">` helps browsers and search engines know what language your content is in.

---

## 7. Accessibility

Accessibility isn't just the right thing to do — it also improves SEO and UX.

### ✅ Do This

- **Add `alt` text to images**: Screen readers use it, and Google uses it to understand images.
- **Use ARIA labels on icon buttons**: Icon-only buttons need `aria-label` so screen readers know what they do.
- **Add skip links**: Let keyboard users skip past navigation and jump straight to the main content.
- **Ensure color contrast**: Text should have at least 4.5:1 contrast ratio with its background.

---

## 8. The Quick Wins (Do These First)

If you don't have time for everything, do these first — they give you the biggest bang for your buck:

1. **Compress images** — usually the #1 biggest win
2. **Add `width`/`height` to images** — fixes CLS
3. **Defer non-critical JS** — improves TBT
4. **Async load non-critical CSS** — improves FCP
5. **Preconnect to third-party domains** — improves LCP

---

## How to Measure

You can't improve what you don't measure. Use these tools:

- **PageSpeed Insights**: Google's official tool, measures Core Web Vitals
- **WebPageTest**: More detailed waterfall analysis, test from different locations
- **Chrome DevTools Performance tab**: See exactly what's slowing down your page
- **Lighthouse**: Built into Chrome DevTools, gives you an overall score

Run the test, fix the top issues, then run it again. Repeat.

---

## Conclusion

Static sites have a huge performance advantage out of the box, but that advantage evaporates if you load hundreds of KB of images, CSS, and JS unnecessarily.

The good news is that most performance problems are fixable with small, targeted changes. You don't need to rewrite your whole site — you just need to know what to look for.

Start with the quick wins, measure, and iterate. Over time, you'll get that PageSpeed score from 50 to 90+.

---

*This checklist was compiled from real-world optimization work on [wuhuajin.com](https://wuhuajin.com). If you have questions or want to share your own tips, feel free to reach out.*
