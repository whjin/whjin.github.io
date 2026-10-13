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
  let bodyHtml = marked.parse(stripFrontMatter(md));
  // 外链图片加 no-referrer：绕过图床防盗链（如语雀 cdn.nlark.com），请求不携带站点 Referer
  bodyHtml = bodyHtml.replace(
    /<img\b(?![^>]*\breferrerpolicy\s*=)(?=[^>]*\bsrc\s*=\s*["'](?:https?:)?\/\/)/g,
    '<img referrerpolicy="no-referrer"'
  );
  const rel = '/src/template/posts/' + folder + '/html/' + file + '.html';
  const url = SITE + '/src/template/posts/' + encodeURIComponent(folder) + '/html/' + encodeURIComponent(file) + '.html';
  const title = it.title;
  const desc = String(it.description || '').replace(/\s+/g, ' ').trim();
  const date = it.date || '';
  // feed 已按 md front matter 计算 reward：true/缺省默认显示卡片，仅 reward:false 隐藏
  const rewardOn = it.reward !== false;

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
  <meta name="robots" content="${(folder === '简历' || (folder === '生活' && file.includes('基金持仓'))) ? 'noindex, follow' : 'index, follow'}" />
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
  <link rel="stylesheet" href="/src/components/image-viewer/index.css" />
  <link rel="stylesheet" href="/src/components/loading/index.css" />
  <link rel="stylesheet" href="/src/components/navigation/index.css" />
  <link rel="stylesheet" href="/src/components/banner/index.css" />
  <script type="application/ld+json">
  ${JSON.stringify(ld, null, 2)}
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}" crossorigin="anonymous"></script>
  <script async custom-element="amp-auto-ads" src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"></script>
</head>
<body data-reward="${rewardOn ? 'true' : 'false'}">
  <div class="layout-container">
    <div class="nav-container"></div>
    <div class="content-area">
      <div id="markdown-content" class="markdown-content viewer" data-reward="${rewardOn ? 'true' : 'false'}">${bodyHtml}</div>
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
  <script src="/src/components/image-viewer/index.js"></script>
  <script src="/src/components/scroll/index.js"></script>
  <script src="/src/components/cookie-consent/index.js"></script>
  ${rewardOn ? '<script src="/src/components/reward-tip/index.js"></script><script>(function(){var mc=document.getElementById(\'markdown-content\');if(window.RewardTip&&mc)window.RewardTip.renderInto(mc);})();</script>' : ''}
  <!-- Cloudflare Web Analytics (本地跳过，线上加载) -->
  <script>
    (function () {
      if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
      var s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      s.setAttribute('data-cf-beacon', '{"token": "5d0359eb0b054372bc2d153bab40d1f6"}');
      document.head.appendChild(s);
    })();
  </script>
  <!-- End Cloudflare Web Analytics -->
  <!-- 访问计数上报（D1 累计，本地跳过） -->
  <script>
    (function () {
      if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
      fetch('https://stats.wuhuajin.com/hit', { method: 'POST' }).catch(function () {});
    })();
  </script>
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
      // 正文已静态内联（利于爬虫收录），此处仅做增强：目录、代码高亮、外链新窗口、广告填充。
      function finish() {
        try {
          if (typeof generateTOC === 'function') generateTOC();
          // 静态正文代码块尚未高亮，用 hljs 补充高亮（此时不存在重复高亮问题）
          if (typeof hljs !== 'undefined') {
            document.querySelectorAll('#markdown-content pre code').forEach(function (el) {
              try { hljs.highlightElement(el); } catch (e) {}
            });
          }
          document.querySelectorAll('#markdown-content a').forEach(function (a) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
          });
        } catch (e) {}
        if (window.adsbygoogle) (window.adsbygoogle = window.adsbygoogle || []).push({});
        if (typeof hideLoading === 'function') hideLoading();
      }
      finish();
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

// 清理冗余 html：md 改名/删除后，删除不再对应任何当前文章的旧静态页，避免残留。
// 仅清理 build-articles 自己的输出目录（posts/<分类>/html/），绝不触碰 Link/ 等菜单页等其他 html。
const validHtml = new Set();
articles.forEach((it) => { if (it && it.category && it.title) validHtml.add(it.category + '\u0000' + it.title); });
function walkCleanHtml(dir, inHtmlSubdir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkCleanHtml(p, e.name === 'html');
    } else if (/\.html$/.test(e.name) && inHtmlSubdir) {
      const rel = path.relative(POSTS, path.dirname(p));
      const folder = rel.split(path.sep)[0];
      const base = e.name.replace(/\.html$/, '');
      if (!validHtml.has(folder + '\u0000' + base)) {
        try { fs.unlinkSync(p); console.log('RM  ' + path.relative(POSTS, p)); }
        catch (e2) { console.log('RMERR ' + p + ' ' + e2.message); }
      }
    }
  }
}
walkCleanHtml(POSTS, false);


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
