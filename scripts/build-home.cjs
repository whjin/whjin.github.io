/**
 * build-home.cjs
 * 生成首页静态文章列表（SEO 友好），注入 index.html 的 #markdown-content。
 * 目的：让爬虫与无 JS 用户无需执行脚本即可读取到全部文章标题、摘要与链接，
 * 消除首页「对搜索引擎是空页」的问题（AdSense 低价值内容的核心根因）。
 * 用法：node scripts/build-home.cjs （在 build-feed 之后运行）
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FEED = path.join(ROOT, 'src/template/feed/data.json');
const INDEX = path.join(ROOT, 'index.html');

const START = '<!--HOME-STATIC-START-->';
const END = '<!--HOME-STATIC-END-->';

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const feed = JSON.parse(fs.readFileSync(FEED, 'utf8'));
const articles = (feed.find((c) => c.type === 'articles') || { list: [] }).list || [];

if (!articles.length) {
  console.error('feed 中无文章，请先运行 node scripts/build-feed.cjs');
  process.exit(1);
}

// 前 RECENT_COUNT 篇保留完整描述（SEO 最新内容权重最高），
// 后续文章只保留标题/日期/分类，减少首页 HTML 体积。
const RECENT_COUNT = 15;

const items = articles
  .map((a, idx) => {
    const title = escHtml(a.title || '');
    const url = escHtml(a.url || '');
    const date = escHtml(a.date || '');
    const category = escHtml(a.category || '');
    const desc = escHtml(a.desc || '');
    const lines = [
      '<article class="static-post">',
      '  <h3 class="static-post-title"><a href="' + url + '">' + title + '</a></h3>',
      '  <p class="static-post-meta"><time datetime="' + date + '">' + date + '</time> · ' + category + '</p>',
    ];
    // 仅前 N 篇输出描述段，老文章省略描述以减小首屏 HTML 体积
    if (idx < RECENT_COUNT && desc) {
      lines.push('  <p class="static-post-desc">' + desc + '</p>');
    }
    lines.push('</article>');
    return lines.join('\n');
  })
  .join('\n');

const block = '\n      <div class="static-home-feed" aria-label="文章列表">\n' + items + '\n      </div>\n';

let html = fs.readFileSync(INDEX, 'utf8');
const si = html.indexOf(START);
const ei = html.indexOf(END);
if (si === -1 || ei === -1 || ei <= si) {
  console.error('index.html 中未找到静态注入标记（' + START + ' / ' + END + '），请先添加标记');
  process.exit(1);
}
const head = html.slice(0, si + START.length);
const tail = html.slice(ei);
const newHtml = head + block + tail;
fs.writeFileSync(INDEX, newHtml, 'utf8');
console.log('首页静态文章列表已注入 index.html：' + articles.length + ' 篇');
