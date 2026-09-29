// 2.3 批量补字段：menu/data.json「原创文章」卡条目写入 home/category/date/readTime/excerpt，并标记 featured
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const menuPath = path.join(ROOT, 'src/template/menu/data.json');
const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

// featured 精选（跨分类 5 篇，可按需改）
const FEATURED = new Set([
  'AI应用开发学习路线图',
  '功能代码集合',
  'Node.js实战',
  'Solidity文档',
  'WebRTC性能优化',
]);

function parsePath(url) {
  const m = /path=([^&]+)/.exec(url || '');
  if (!m) return null;
  const p = m[1].split('_');
  const file = p.pop();
  return { folder: p.join('/'), file };
}

function cleanLine(line) {
  let s = line
    .replace(/```/g, ' ')
    .replace(/`/g, '')
    .replace(/^[#>*\-\s]+/, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!?\[.*?\]\(.*?\)/g, '')
    .trim();
  return s;
}

function excerptOf(raw, fallback) {
  const lines = raw.split('\n');
  for (const ln of lines) {
    const c = cleanLine(ln);
    if (c.length >= 8) {
      return c.length > 42 ? c.slice(0, 42) + '…' : c;
    }
  }
  const f = cleanLine(fallback);
  return f.length > 42 ? f.slice(0, 42) + '…' : f || '';
}

function enrich(item) {
  const p = parsePath(item.url);
  if (!p) return item;
  const md = path.join(ROOT, 'src/template/posts', p.folder, `${p.file}.md`);
  const out = { ...item };
  out.home = true;
  out.category = p.folder; // 分类 = 文章所属目录
  if (fs.existsSync(md)) {
    const raw = fs.readFileSync(md, 'utf8');
    const mt = fs.statSync(md).mtime;
    out.date = `${mt.getFullYear()}-${String(mt.getMonth() + 1).padStart(2, '0')}-${String(mt.getDate()).padStart(2, '0')}`;
    const chars = raw.replace(/\s/g, '').length;
    out.readTime = Math.max(1, Math.round(chars / 280));
    out.excerpt = excerptOf(raw, item.title);
  } else {
    out.date = '';
    out.readTime = 1;
    out.excerpt = item.title;
  }
  if (FEATURED.has(item.title)) out.featured = true;
  return out;
}

const card = menu.find((c) => c.title === '原创文章');
if (!card) { console.error('未找到 原创文章 卡'); process.exit(1); }
card.items = card.items.map(enrich);
fs.writeFileSync(menuPath, JSON.stringify(menu, null, 2) + '\n', 'utf8');

const feat = card.items.filter((it) => it.featured).map((it) => it.title);
const missing = card.items.filter((it) => !it.date || !it.excerpt).map((it) => it.title);
console.log('FEATURED(' + feat.length + '):', feat.join('; '));
console.log('MISSING_FIELDS:', missing.length ? missing.join('; ') : '无');
console.log('HOME_ITEMS:', card.items.filter((it) => it.home).length);
