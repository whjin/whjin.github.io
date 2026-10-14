# How I Reduced My Blog's CLS from 0.37 to Under 0.1: A Real-World Case Study

Cumulative Layout Shift (CLS) is one of those metrics that sounds simple on paper — "how much does the layout shift during page load" — but in practice, it's surprisingly tricky to get right.

When I ran my blog through PageSpeed Insights, I got a CLS score of **0.37**. That's way above the recommended threshold of 0.1. Worse, the report didn't give me clear guidance on *what* was actually shifting.

After a week of digging, I got it down to under 0.1. In this article, I'll share exactly what I did, what the common culprits are, and how you can fix them on your own site.

---

## What Is CLS, Anyway?

Before we dive into fixes, let's make sure we're on the same page.

CLS measures how much unexpected layout shift happens during a page's lifetime. Every time an element moves from one position to another after the initial render, that's a layout shift.

Google breaks it down like this:
- **Good**: ≤ 0.1
- **Needs improvement**: 0.1 – 0.25
- **Poor**: > 0.25

My score of 0.37 was solidly in "poor" territory. The main issue? It wasn't obvious *why*.

---

## The Diagnostic Process

First, I needed to figure out what was actually shifting. PageSpeed Insights gives you a list of "layout shift culprits," but it's not always clear how to fix them.

Here's the process I followed:

### Step 1: Use Chrome DevTools' Performance Tab

Open DevTools → Performance tab → record a page load.

Look for:
- **Layout Shift markers** (purple bars) in the timeline
- Elements that move when you hover over the shift markers

This gave me a clearer picture: the shifts were happening when images loaded.

### Step 2: Check for Missing Image Dimensions

The most common cause of CLS is images without `width` and `height` attributes.

When the browser doesn't know how big an image is going to be, it reserves zero space for it. Then when the image loads, it suddenly takes up space, pushing everything below it down. That's a layout shift.

I thought I'd already fixed this. Turns out, I'd only fixed it for *static* images in the HTML, not for *dynamically rendered* images.

---

## The Culprits: What Was Actually Shifting

Let me walk through the specific issues I found and fixed.

---

### Issue 1: Dynamic Feed Card Cover Images

My homepage has a feed of article cards. Each card has a cover image on the left, and text content on the right.

The cards are rendered dynamically with JavaScript. The cover image HTML looked like this:

```html
<div class="fc-cover">
  <img src="/images/article-cover.jpg" alt="Article title" loading="lazy">
</div>
```

Notice anything missing? **No `width` or `height` attributes.**

The `.fc-cover` container had a width set (`38%` of the card), but no fixed height. So before the image loaded, the container was 0px tall. When the image loaded, it suddenly expanded to ~180px, pushing the text content down.

That's a layout shift. Every single card on the page was causing one.

### The Fix

I had two options:

1. **Add `width` and `height` attributes to the `<img>` tag**
2. **Set `aspect-ratio` on the container**

I went with option 2 because it's more flexible:

```css
.feed-card.fc-has-cover .fc-cover {
  width: 38%;
  max-width: 280px;
  aspect-ratio: 16 / 9;  /* ← This line! */
  flex-shrink: 0;
  display: flex;
}
```

`aspect-ratio: 16 / 9` tells the browser: "this container should always be 16:9, regardless of what's inside." So even before the image loads, the container already has the correct height. No more shift when the image pops in.

This single fix eliminated the majority of my CLS.

---

### Issue 2: Advertisement Units

The second culprit was Google AdSense ads.

Ads load asynchronously. When they finally render, they inject content into the page, pushing everything below them down.

This is a notoriously hard problem because:
- You don't know how tall the ad will be ahead of time
- Different ad sizes fit in the same slot
- You can't control what Google serves

### The Fix

The best practical solution is to **reserve space for ads upfront**.

Pick a standard ad size (e.g., 300x250 for a rectangle, or 728x90 for a leaderboard) and set that as the minimum height of the ad container:

```css
.ad-slot {
  min-height: 250px;  /* ← Reserve space */
  width: 100%;
}
```

This way, even before the ad loads, the container already takes up the right amount of space. The ad fills in when it's ready, and nothing shifts.

It's not perfect — if Google serves a smaller ad, you'll have some empty space. But it's better than layout shifts.

---

### Issue 3: Web Fonts

The third culprit was web fonts.

When a web font loads, it can cause a "font swap" — the browser first shows a fallback font, then swaps in the custom font. If the custom font has different metrics (wider, taller, etc.), the text reflows, causing layout shifts.

### The Fix

Use `font-display: swap` and make sure your fallback font is as close as possible in metrics.

```css
@font-face {
  font-family: 'MyCustomFont';
  src: url('/fonts/myfont.woff2') format('woff2');
  font-display: swap;
}
```

For even better results, you can use `size-adjust` and `ascent-override` to make the fallback font match the custom font's metrics more closely.

In my case, I was using system fonts, so this wasn't a big issue. But it's worth checking if you use custom web fonts.

---

### Issue 4: Late-Injected UI Elements

The fourth issue was UI elements that were injected into the page after initial render.

For example:
- Cookie consent banners that pop up a few seconds after load
- Notification bars
- Floating action buttons

These elements appear suddenly, pushing content down.

### The Fix

Reserve space for them upfront, or make them **overlay** elements (position: fixed/absolute) instead of in-flow elements.

Cookie consent banners are usually fixed at the bottom, so they overlay content rather than pushing it. That's fine for CLS. But if you have an inline banner that pushes content down, you need to account for it.

In my case, the cookie consent banner was already `position: fixed`, so it wasn't contributing to CLS. But it's worth checking.

---

## The Results

After these fixes, my CLS score dropped from **0.37** to under **0.1**.

| Metric | Before | After |
|---|---|---|
| CLS | 0.37 (Poor) | < 0.1 (Good) |
| LCP | 1.3s | 1.3s (unchanged) |
| FCP | 387ms | 387ms (unchanged) |

The best part? None of these fixes required a rewrite. They were all small, targeted changes.

---

## CLS Checklist: What to Check on Your Site

Use this checklist to audit your own site:

### Images
- [ ] Do all `<img>` tags have `width` and `height` attributes?
- [ ] Do dynamically rendered images have dimensions?
- [ ] Do image containers have `aspect-ratio` set?
- [ ] Do background images have reserved space?

### Ads
- [ ] Do ad slots have a `min-height` set?
- [ ] Are ad sizes standardized?

### Fonts
- [ ] Are you using `font-display: swap`?
- [ ] Do your fallback fonts match your custom font's metrics?

### UI Elements
- [ ] Are cookie banners fixed/overlay (not in-flow)?
- [ ] Are notification bars reserved upfront?
- [ ] Are floating buttons fixed (not in-flow)?

### Embedded Content
- [ ] Do `<iframe>` tags have `width` and `height`?
- [ ] Do video embeds have reserved space?
- [ ] Do social media embeds have reserved space?

---

## Common Myths Debunked

### Myth 1: "CLS only affects mobile"

Nope. CLS matters on desktop too. Google's Core Web Vitals are measured on mobile, but good CLS is good CLS regardless of device.

### Myth 2: "If I don't see shifts, my CLS is fine"

You might not notice shifts if you're on a fast connection with fast cache. But users on slower networks will see more shifts because images and ads take longer to load. Always test with throttling.

### Myth 3: "CLS doesn't matter much for SEO"

It does. CLS is one of the three Core Web Vitals, and Google explicitly uses it as a ranking signal. A poor CLS can hurt your search rankings.

---

## Final Thoughts

CLS is one of those metrics that's easy to ignore because it doesn't directly affect functionality. Users might not consciously notice the shifts, but they do affect perceived performance — the site feels "janky" or "unpolished."

The good news is that fixing CLS is usually straightforward once you know what to look for. The vast majority of layout shifts come down to one thing: **elements changing size after initial render**.

If you remember nothing else from this article, remember this: **always reserve space for elements that load asynchronously**. Images, ads, embeds — anything that pops in later needs to have its space accounted for upfront.

Once you've done that, CLS mostly takes care of itself.

---

*This was based on real-world optimization work on [wuhuajin.com](https://wuhuajin.com). If you have questions or want to share your own CLS fixes, feel free to reach out.*
