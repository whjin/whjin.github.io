/**
 * build-articles.cjs
 * 为「原创文章」的每篇 md 生成预渲染静态 HTML 页面（内容内联，利于爬虫/收录）。
 * 输出到 src/template/posts/<分类>/html/<标题>.html，feed 指向该路径；viewer.html 保留可回退。
 */
const fs = require('fs');
const path = require('path');
const marked = require('../src/js/marked.min.js');

const ROOT = path.resolve(__dirname, '..');
const POSTS = path.join(ROOT, 'src/template/posts');
const FEED = path.join(ROOT, 'src/template/feed/data.json');
const SITE = 'https://wuhuajin.com';
const AD_CLIENT = 'ca-pub-3179609405594046';

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function stripFrontMatter(text) {
  if (/^---\r?\n/.test(text)) {
    const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(text);
    if (m) return text.slice(m[0].length);
  }
  return text;
}

const feed = JSON.parse(fs.readFileSync(FEED, 'utf8'));
const articles = (feed.find((c) => c.type === 'articles') || { items: [] }).items || [];

function buildPage(it) {
  const folder = it.category || '';
  const file = it.title || '';
  if (!folder || !file) return { title: it.title, error: '缺 category/title' };
  const mdPath = path.join(POSTS, folder, file + '.md');
  if (!fs.existsSync(mdPath)) return { title: it.title, error: 'md 不存在: ' + mdPath };

  const md = fs.readFileSync(mdPath, 'utf8');
  const bodyHtml = marked.parse(stripFrontMatter(md));
  const rel = '/src/template/posts/' + folder + '/html/' + file + '.html';
  const url = SITE + '/src/template/posts/' + encodeURIComponent(folder) + '/html/' + encodeURIComponent(file) + '.html';
  const title = it.title;
  const desc = String(it.description || '').replace(/\s+/g, ' ').trim();
  const date = it.date || '';

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: desc,
    author: { '@type': 'Person', 'name': '吴华锦', 'url': SITE + '/' },
    publisher: { '@type': 'Person', 'name': '吴华锦', 'url': SITE + '/' },
    datePublished: date,
    inLanguage: 'zh-CN',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }
  };

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <meta name="author" content="吴华锦" />
  <title>${escHtml(title)} « 吴华锦</title>
  <meta name="description" content="${escHtml(desc)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${escHtml(url)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Wu Huajin" />
  <meta property="og:title" content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(desc)}" />
  <meta property="og:url" content="${escHtml(url)}" />
  <meta property="og:image" content="${SITE}/src/images/favicon.png" />
  <meta property="og:locale" content="zh_CN" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(desc)}" />
  <link rel="icon" href="/src/images/favicon.png" />
  <link rel="stylesheet" href="/src/css/bootstrap.min.css" />
  <link rel="stylesheet" href="/src/css/font-awesome.min.css" />
  <link rel="stylesheet" href="/src/css/github-dark.min.css" />
  <link rel="stylesheet" href="/src/components/render/index.css" />
  <link rel="stylesheet" href="/src/components/loading/index.css" />
  <link rel="stylesheet" href="/src/components/navigation/index.css" />
  <link rel="stylesheet" href="/src/components/banner/index.css" />
  <script type="application/ld+json">
  ${JSON.stringify(ld, null, 2)}
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}" crossorigin="anonymous"></script>
  <script async custom-element="amp-auto-ads" src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"></script>
</head>
<body>
  <div class="layout-container">
    <div class="nav-container"></div>
    <div class="content-area">
      <div id="markdown-content" class="markdown-content viewer"></div>
      <noscript><div class="markdown-content viewer" style="padding:1em">${bodyHtml}</div></noscript>
      <div class="scroll-top opacity"><span class="arrow-icon" title="回到顶部"></span></div>
      <ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid"
           data-ad-client="${AD_CLIENT}" data-ad-slot="8781436700"></ins>
    </div>
    <aside class="sidebar-area">
      <div class="sidebar-title">文章目录</div>
      <nav id="toc-nav" class="toc-nav"></nav>
    </aside>
  </div>
  <script src="/src/components/loading/index.js"></script>
  <script src="/src/components/banner/index.js"></script>
  <script src="/src/components/navigation/index.js"></script>
  <script src="/src/js/highlight.min.js"></script>
  <script src="/src/js/marked.min.js"></script>
  <script src="/src/js/marked-highlight.min.js"></script>
  <script src="/src/components/render/index.js"></script>
  <script src="/src/components/scroll/index.js"></script>
  <script src="/src/components/cookie-consent/index.js"></script>
  <!-- Cloudflare Web Analytics -->
  <script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "5d0359eb0b054372bc2d153bab40d1f6"}'></script>
  <!-- End Cloudflare Web Analytics -->
  <script>
    (function () {
      /* 静态页滚动容器抗注入：部分预览环境会对 .layout-container/.content-area 整段 setAttribute style 为
         "height: auto !important"，使内部滚动容器按内容高度解析、滚不到底。
         用 MutationObserver 侦测 style 属性变化，一旦出现 auto 即用 JS 计算的视口像素高度（window.innerHeight，
         不受 100vh 被内容撑大的影响）重新施加，恢复 631 内部滚动。生产正常浏览器无注入时不触发。 */
      var l = document.querySelector('.layout-container');
      var ca = document.querySelector('.content-area');
      if (!l || !ca) return;
      function fixedH() {
        var b = parseInt(window.getComputedStyle(document.body).getPropertyValue('--banner-height')) || 0;
        return (window.innerHeight - b) + 'px';
      }
      function force() {
        var h = fixedH();
        var changed = false;
        if ((l.getAttribute('style') || '').indexOf('auto') !== -1) {
          l.setAttribute('style', 'height:' + h + ';');
          changed = true;
        }
        if ((ca.getAttribute('style') || '').indexOf('auto') !== -1) {
          ca.setAttribute('style', 'height:' + h + ';');
          changed = true;
        }
        return changed;
      }
      var timer = null;
      var mo = new MutationObserver(function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(force, 50);
      });
      mo.observe(l, { attributes: true, attributeFilter: ['style'] });
      mo.observe(ca, { attributes: true, attributeFilter: ['style'] });
      window.addEventListener('resize', force);
      force();
    })();
  </script>
  <script>
    (function () {
      // 运行时从相邻 .md 渲染：md 改动后刷新即更新；保留预渲染正文作为 no-JS / 爬虫回退
      var mdUrl = '../${encodeURIComponent(file)}.md';
      function finish() {
        try {
          if (typeof generateTOC === 'function') generateTOC();
          // markedHighlight 已在 handler 内完成代码高亮，此处不再重复 hljs.highlightElement，
          // 否则 highlight.js 会把已高亮的 <span> 误判为未转义 HTML 而触发安全告警。
          document.querySelectorAll('#markdown-content a').forEach(function (a) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
          });
        } catch (e) {}
        if (window.adsbygoogle) (window.adsbygoogle = window.adsbygoogle || []).push({});
        if (typeof hideLoading === 'function') hideLoading();
      }
      try {
        if (typeof handler === 'function') {
          handler('markdown-content', mdUrl, finish);
        } else {
          finish();
        }
      } catch (e) { finish(); }
    })();
  </script>
</body>
</html>`;

  const outFile = path.join(POSTS, folder, 'html', file + '.html');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html, 'utf8');
  return { title, rel, bytes: Buffer.byteLength(html) };
}

let ok = 0;
const errs = [];
articles.forEach((it) => {
  const r = buildPage(it);
  if (r.error) { errs.push(r.error); return; }
  ok++;
  console.log('OK  ' + r.rel + '  (' + r.bytes + ' B)');
});
console.log('--- 生成完成: ' + ok + '/' + articles.length + ' | 失败: ' + errs.length);
errs.forEach((e) => console.log('ERR ' + e));

// 更新 feed 中「原创文章」url 统一指向 html 子目录静态页（/posts/<分类>/html/<标题>.html）
let feedText = fs.readFileSync(FEED, 'utf8');
let changed = 0;
articles.forEach((it) => {
  const oldUrl = it.url;
  if (!oldUrl) return;
  const newUrl = '/src/template/posts/' + it.category + '/html/' + it.title + '.html';
  if (oldUrl !== newUrl && feedText.includes(oldUrl)) {
    feedText = feedText.split(oldUrl).join(newUrl);
    changed++;
  }
});
if (changed > 0) fs.writeFileSync(FEED, feedText, 'utf8');
console.log('--- feed url 已更新: ' + changed + '/' + articles.length);
