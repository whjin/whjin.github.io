/**
 * build-links.cjs
 * 把 Link 导航页的 data.json 在构建时渲染成静态 HTML，注入页面容器。
 * 目的：Google/AdSense 爬虫不跑 JS 也能看到实质链接内容，避免被判定为"低价值空壳页"。
 * JS 加载后仍会覆盖容器渲染成卡片网格（用户体验不变），静态 HTML 仅作为 SEO 兜底。
 *
 * 同时把这些页面的 robots 从 noindex, follow 改回 index, follow。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LINK_DIR = path.join(ROOT, 'src/template/posts/Link');

// 每页的独特介绍文字（AdSense 看重每页是否有独立内容，不能所有页都同一段）
const PAGE_META = {
  '文章/article.html': {
    h1: '技术文章导航',
    intro:
      '本页收录吴华锦博客的全部技术文章导航，按分类组织，涵盖 JavaScript、Node.js、Vue、React、AI、Web3、工程化、GIS 等方向。每篇文章均为原创或整理的学习笔记与实战总结，方便快速定位与回顾。',
  },
  '友链/link.html': {
    h1: '推荐资源与友链',
    intro:
      '本页收录吴华锦亲测可用的优质 AI 工具、产品与友链资源，包括 AI 视频生成、AI 设计、电商配图等一站式在线服务。所有推荐均经实际使用验证，持续更新。',
  },
};

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 渲染 link/index.js 那套数据结构：{ sectionKey: { title, desc, list: [{title, desc, url}] } }
function renderLinkData(data) {
  const sections = Object.keys(data).filter((key) => {
    const item = data[key];
    return item && typeof item === 'object' && Array.isArray(item.list) && item.list.length > 0;
  });
  let html = '';
  sections.forEach((key) => {
    const sec = data[key];
    const title = sec.title || key;
    const desc = sec.desc || '';
    const list = sec.list;
    html += `<section class="seo-section">\n`;
    html += `  <h2>${escapeHtml(title)} <span>(${list.length})</span></h2>\n`;
    if (desc) html += `  <p>${escapeHtml(desc)}</p>\n`;
    html += `  <ul>\n`;
    list.forEach((item) => {
      const name = item.title || item.name || '';
      const itemDesc = item.desc || '';
      const url = item.url || '#';
      html += `    <li><a href="${escapeHtml(url)}" rel="noopener">${escapeHtml(name)}</a>`;
      if (itemDesc) html += ` — ${escapeHtml(itemDesc.replace(/\r?\n/g, ' '))}`;
      html += `</li>\n`;
    });
    html += `  </ul>\n`;
    html += `</section>\n`;
  });
  return html;
}

// 渲染 resource.html 用的 feed/data.json：数组，每项 { title, tagName, list: [{title, url, desc}] }
function renderFeedData(feed) {
  let html = '';
  feed.forEach((group) => {
    if (!group || !group.list || group.list.length === 0) return;
    if (group.show === false) return;
    const title = group.title || '';
    const items = group.list;
    html += `<section class="seo-section">\n`;
    html += `  <h2>${escapeHtml(title)} <span>(${items.length})</span></h2>\n`;
    html += `  <ul>\n`;
    items.forEach((item) => {
      const name = item.title || '';
      const desc = item.desc || '';
      const url = item.url || '#';
      html += `    <li><a href="${escapeHtml(url)}" rel="noopener">${escapeHtml(name)}</a>`;
      if (desc) html += ` — ${escapeHtml(desc)}`;
      html += `</li>\n`;
    });
    html += `  </ul>\n`;
    html += `</section>\n`;
  });
  return html;
}

function buildLinkPage(relPath, meta) {
  const htmlPath = path.join(LINK_DIR, relPath);
  const dataPath = path.join(LINK_DIR, path.dirname(relPath), 'data.json');
  if (!fs.existsSync(htmlPath)) {
    console.warn('[skip] 页面不存在: ' + relPath);
    return;
  }
  let html = fs.readFileSync(htmlPath, 'utf8');

  let staticHtml = `<noscript><div class="seo-content" style="max-width:900px;margin:0 auto;padding:20px;">\n`;
  staticHtml += `  <h1>${escapeHtml(meta.h1)}</h1>\n`;
  staticHtml += `  <p>${escapeHtml(meta.intro)}</p>\n`;

  if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    staticHtml += renderLinkData(data);
  }

  staticHtml += `</div></noscript>\n`;

  // 幂等：先移除上次注入的 seo-content 块（含 noscript 外壳）
  html = html.replace(/<noscript><div class="seo-content"[\s\S]*?<\/div><\/noscript>\n?/g, '');
  html = html.replace(/<div class="seo-content"[\s\S]*?<\/div>\n?/g, '');

  // 把静态 HTML 注入到容器内（兼容 <div> 和 <main> 两种标签）
  // JS 运行后会覆盖 innerHTML 渲染卡片，但 Google 初始抓取时看到的是静态内容
  const containerPattern = /<(div|main) class="link-container">\s*<\/\1>/;
  if (containerPattern.test(html)) {
    html = html.replace(
      containerPattern,
      (m, tag) => `<${tag} class="link-container">${staticHtml}</${tag}>`
    );
  } else {
    // 兜底：插到 <body> 后面
    html = html.replace(/<body[^>]*>/, (m) => m + '\n' + staticHtml);
  }

  // robots: noindex, follow → index, follow
  html = html.replace(
    /<meta name="robots" content="noindex, follow"\s*\/>/,
    '<meta name="robots" content="index, follow" />'
  );

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('[ok] ' + relPath + ' 已注入静态 SEO 内容');
}

function buildResourcePage() {
  const htmlPath = path.join(LINK_DIR, '资源/resource.html');
  if (!fs.existsSync(htmlPath)) {
    console.warn('[skip] resource.html 不存在');
    return;
  }
  let html = fs.readFileSync(htmlPath, 'utf8');
  const feedPath = path.join(ROOT, 'src/template/feed/data.json');
  const meta = {
    h1: '全站资源导航',
    intro:
      '本页是吴华锦博客 wuhuajin.com 的全站资源索引，按分类整理了技术文章、教程、工具推荐、原创内容与生活记录。所有链接均指向本站内页或外部推荐资源，持续更新。',
  };

  let staticHtml = `<noscript><div class="seo-content" style="max-width:900px;margin:0 auto;padding:20px;">\n`;
  staticHtml += `  <h1>${escapeHtml(meta.h1)}</h1>\n`;
  staticHtml += `  <p>${escapeHtml(meta.intro)}</p>\n`;

  if (fs.existsSync(feedPath)) {
    const feed = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
    staticHtml += renderFeedData(feed);
  }
  staticHtml += `</div></noscript>\n`;

  // 幂等：先移除上次注入的 seo-content 块
  html = html.replace(/<noscript><div class="seo-content"[\s\S]*?<\/div><\/noscript>\n?/g, '');
  html = html.replace(/<div class="seo-content"[\s\S]*?<\/div>\n?/g, '');

  const containerPattern = /<(div|main) class="card-container">\s*<\/\1>/;
  if (containerPattern.test(html)) {
    html = html.replace(
      containerPattern,
      (m, tag) => `<${tag} class="card-container">${staticHtml}</${tag}>`
    );
  } else {
    html = html.replace(/<body[^>]*>/, (m) => m + '\n' + staticHtml);
  }

  html = html.replace(
    /<meta name="robots" content="noindex, follow"\s*\/>/,
    '<meta name="robots" content="index, follow" />'
  );

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('[ok] 资源/resource.html 已注入静态 SEO 内容');
}

// 执行
Object.entries(PAGE_META).forEach(([rel, meta]) => buildLinkPage(rel, meta));
buildResourcePage();
console.log('Link 导航页静态 SEO 内容构建完成');
