# JavaScript Defer vs Async: A Complete Guide

If you've ever looked at how scripts are loaded in HTML, you've probably seen `defer` and `async` attributes. They both sound like they make your page faster — and they do — but they work in completely different ways.

Get them wrong, and you'll end up with subtle bugs that are hard to debug. Get them right, and you'll see a noticeable improvement in page load performance.

In this guide, we'll break down exactly how `defer` and `async` work, when to use each, and what common pitfalls to avoid.

---

## First: How Scripts Load By Default

Let's start with the basics. When the browser encounters a `<script>` tag without any attributes, here's what happens:

1. The browser **pauses HTML parsing**
2. It downloads the script file
3. It executes the script
4. Then it resumes HTML parsing

This is called "render-blocking." The browser can't render the page until it's done with the script.

This is bad for performance because:
- The longer the script takes to download, the longer users wait to see content
- The longer the script takes to execute, the longer the page feels frozen

That's where `defer` and `async` come in.

---

## What Does `defer` Do?

When you add `defer` to a script tag:

```html
<script defer src="script.js"></script>
```

Here's what happens:

1. The browser **continues HTML parsing** while downloading the script in the background
2. It **waits until HTML parsing is complete** before executing the script
3. Multiple `defer` scripts execute **in order** (the order they appear in the HTML)

### Key Properties of `defer`

- ✅ Doesn't block HTML parsing
- ✅ Scripts execute in order
- ✅ Executes before `DOMContentLoaded` event fires
- ✅ Scripts can safely access the DOM (because parsing is done)

### When to Use `defer`

Use `defer` when:
- Your script depends on the DOM being fully parsed
- Your scripts depend on each other (script B needs script A to be loaded first)
- You want to improve page load performance without changing script order

Basically, **most scripts should be `defer`**.

---

## What Does `async` Do?

When you add `async` to a script tag:

```html
<script async src="script.js"></script>
```

Here's what happens:

1. The browser **continues HTML parsing** while downloading the script in the background
2. As soon as the script finishes downloading, the browser **pauses parsing** and executes it
3. Then it resumes parsing

### Key Properties of `async`

- ✅ Doesn't block HTML parsing (most of the time)
- ❌ Scripts execute **in whatever order they finish downloading** — not the order they appear in the HTML
- ❌ Scripts might execute before DOM parsing is complete
- ❌ You can't rely on the order of execution

### When to Use `async`

Use `async` when:
- Your script is completely independent (doesn't depend on other scripts)
- Your script doesn't need to access the DOM immediately
- Examples: analytics, ads, third-party widgets that don't affect the page layout

---

## The Side-by-Side Comparison

Let's visualize how they work:

### No Attributes (Blocking)

```
HTML Parsing  ████████████████
Script Download         ████
Script Execute               ████
```

The browser pauses parsing while it downloads and executes the script.

### `defer`

```
HTML Parsing  ████████████████
Script Download      ████
Script Execute                  ████
```

Download happens in parallel with parsing. Execution waits until parsing is done.

### `async`

```
HTML Parsing  ██████████
Script Download      ████
Script Execute          ████
HTML Parsing           ██████████
```

Download happens in parallel. As soon as it's done, execution pauses parsing, runs the script, then resumes parsing.

---

## Common Pitfalls

### Pitfall 1: Assuming `async` Scripts Execute in Order

This is the most common mistake. If you have:

```html
<script async src="a.js"></script>
<script async src="b.js"></script>
```

There's no guarantee that `a.js` executes before `b.js`. If `b.js` finishes downloading first, it runs first.

**Solution**: If script B depends on script A, use `defer` instead.

### Pitfall 2: Using `async` for DOM-Dependent Scripts

```html
<script async src="app.js"></script>
```

If `app.js` tries to access the DOM immediately (e.g., `document.querySelector('#app')`), it might run before the DOM is ready.

**Solution**: Either use `defer`, or wrap your code in a `DOMContentLoaded` event listener.

### Pitfall 3: Mixing `async` and `defer`

```html
<script async src="analytics.js"></script>
<script defer src="app.js"></script>
```

There's no guarantee of order between `async` and `defer` scripts. `async` scripts execute as soon as they're ready, which might be before or after `defer` scripts.

**Solution**: Keep dependencies within the same loading strategy.

---

## Real-World Examples

### Example 1: Your Main App Script

```html
<!-- Use defer: depends on DOM, might depend on other scripts -->
<script defer src="/js/app.js"></script>
```

Your app probably needs to access the DOM and initialize components. `defer` ensures the DOM is ready when it runs.

### Example 2: Google Analytics

```html
<!-- Use async: independent, doesn't need DOM immediately -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

Analytics doesn't affect the page content. It just sends data to Google. It can load whenever.

### Example 3: Multiple Dependent Scripts

```html
<!-- Use defer: they depend on each other -->
<script defer src="/js/jquery.js"></script>
<script defer src="/js/plugin.js"></script> <!-- depends on jQuery -->
<script defer src="/js/app.js"></script> <!-- depends on plugin -->
```

`defer` guarantees they execute in order, so jQuery loads first, then the plugin, then your app.

---

## What About `module` Scripts?

Modern ES modules (`<script type="module">`) behave like `defer` by default. They:
- Don't block HTML parsing
- Execute after parsing is done
- Execute in order

So you don't need to add `defer` to module scripts — it's automatic.

```html
<!-- This is already deferred-like -->
<script type="module" src="app.js"></script>
```

---

## The `DOMContentLoaded` Event

One more thing to know: `DOMContentLoaded` waits for deferred scripts to finish.

The order is:

1. HTML parsing finishes
2. Deferred scripts execute (in order)
3. `DOMContentLoaded` event fires

So if you have a `DOMContentLoaded` listener, you can be sure all `defer` scripts have already run.

Async scripts don't block `DOMContentLoaded` — they might run before or after, depending on when they finish downloading.

---

## Quick Decision Guide

Ask yourself these questions:

### 1. Does my script need the DOM to be ready?
- **Yes** → Use `defer`
- **No** → Continue to question 2

### 2. Does my script depend on other scripts?
- **Yes** → Use `defer`
- **No** → Continue to question 3

### 3. Is my script independent and non-critical?
- **Yes** → Use `async`
- **No** → Use `defer`

When in doubt, use `defer`. It's safer.

---

## Performance Impact

How much does this actually matter?

It depends on how much JS you have. For a typical blog with 100-200KB of JS:
- Without defer: FCP might be 1-2 seconds slower
- With defer: FCP improves by 30-50%

For heavy apps with 500KB+ of JS, the difference is even bigger.

The best part? Adding `defer` to all your scripts is a one-line change. It's one of the easiest performance wins you can get.

---

## Conclusion

`defer` and `async` both help performance, but they're not interchangeable:

- **`defer`**: Scripts execute in order, after DOM is ready. Use for most of your scripts.
- **`async`**: Scripts execute whenever they finish downloading. Use for independent, non-critical scripts like analytics.

The biggest mistake people make is using `async` when they should use `defer`, then wondering why their scripts fail randomly. Remember: if order matters, use `defer`.

Once you understand this distinction, script loading stops being magic and starts being predictable.

---

*This article was inspired by performance optimization work on [wuhuajin.com](https://wuhuajin.com). If you have questions, feel free to reach out.*
