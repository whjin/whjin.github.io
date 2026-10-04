/**
 * build-sitemap.cjs
 * 依据 feed「原创文章」生成 sitemap.xml：基础页 + 文章静态 URL（保持与 feed 同步）。
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FEED = path.join(ROOT, 'src/template/feed/data.json');
const OUT = path.join(ROOT, 'sitemap.xml');
const SITE = 'https://wuhuajin.com';

const BASE = [
  { loc: SITE + '/', lastmod: '2026-09-19', freq: 'weekly', pri: '1.0' },
  { loc: SITE + '/about.html', lastmod: '2026-09-19', freq: 'monthly', pri: '0.6' },
  { loc: SITE + '/contact.html', lastmod: '2026-09-19', freq: 'yearly', pri: '0.5' },
  { loc: SITE + '/privacy.html', lastmod: '2026-09-19', freq: 'yearly', pri: '0.3' },
  { loc: SITE + '/terms.html', lastmod: '2026-09-19', freq: 'yearly', pri: '0.3' },
];

const feed = JSON.parse(fs.readFileSync(FEED, 'utf8'));
const articles = (feed.find((c) => c.type === 'articles') || { items: [] }).items || [];

const urls = BASE.concat(
  articles.map((a) => ({
    loc: SITE + '/src/template/posts/' + encodeURIComponent(a.category) + '/html/' + encodeURIComponent(a.title) + '.html',
    lastmod: a.date || '2026-09-19',
    freq: 'monthly',
    pri: '0.6',
  }))
);

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
];
urls.forEach((u) => {
  lines.push('  <url>');
  lines.push('    <loc>' + u.loc + '</loc>');
  lines.push('    <lastmod>' + u.lastmod + '</lastmod>');
  lines.push('    <changefreq>' + u.freq + '</changefreq>');
  lines.push('    <priority>' + u.pri + '</priority>');
  lines.push('  </url>');
});
lines.push('</urlset>');
fs.writeFileSync(OUT, lines.join('\n') + '\n', 'utf8');
console.log('sitemap 已生成: ' + urls.length + ' 条');
