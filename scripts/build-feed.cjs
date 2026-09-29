// Hexo 式 feed 生成器：扫描 posts/**/*.md，解析 YAML front matter，生成 feed 并写回 menu/data.json「原创文章」卡
// 用法：node scripts/build-feed.cjs   （部署前运行，等价 hexo generate）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const POSTS = path.join(ROOT, 'src/template/posts');
const MENU_PATH = path.join(ROOT, 'src/template/menu/data.json');

function parseFrontMatter(content) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
  if (!m) return { front: null, body: content };
  const front = {};
  const lines = m[1].split(/\r?\n/);
  let i = 0;
  let lastKey = null;
  while (i < lines.length) {
    const kv = /^([A-Za-z_][\w]*)\s*:\s*(.*)$/.exec(lines[i]);
    if (kv) {
      lastKey = kv[1];
      const val = kv[2].trim();
      if (val === '') {
        const items = [];
        let j = i + 1;
        while (j < lines.length && /^\s*-\s+/.test(lines[j])) {
          items.push(lines[j].replace(/^\s*-\s+/, '').trim());
          j++;
        }
        if (items.length) { front[lastKey] = items; i = j; continue; }
        front[lastKey] = '';
      } else {
        front[lastKey] = val.replace(/^["']|["']$/g, '');
      }
      i++;
    } else if (/^\s*-\s+/.test(lines[i]) && lastKey) {
      const cur = front[lastKey];
      const item = lines[i].replace(/^\s*-\s+/, '').trim();
      front[lastKey] = Array.isArray(cur) ? cur.concat(item) : [item];
      i++;
    } else {
      i++;
    }
  }
  return { front, body: content.slice(m[0].length) };
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.md$/.test(e.name)) out.push(p);
  }
  return out;
}

function cleanPara(text) {
  const lines = text.split(/\r?\n/);
  for (const ln of lines) {
    const s = ln
      .replace(/```/g, ' ')
      .replace(/`/g, '')
      .replace(/^[#>*\-\s]+/, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/!?\[.*?\]\(.*?\)/g, '')
      .trim();
    if (s.length >= 8) return s.length > 42 ? s.slice(0, 42) + '…' : s;
  }
  return '';
}

// 摘要提取：优先 description，否则自动提取
function extractExcerpt(front, body) {
  if (front && front.description) return front.description;
  return cleanPara(body);
}

function buildFeed() {
  const files = walk(POSTS);
  const items = [];
  for (const file of files) {
    const rel = path.relative(POSTS, file);
    const parts = rel.split(path.sep);
    const fileBase = parts.pop().replace(/\.md$/, '');
    const folder = parts.join('/');
    const raw = fs.readFileSync(file, 'utf8');
    const { front, body } = parseFrontMatter(raw);
    const published = front && front.published !== undefined
      ? !(front.published === 'false' || front.published === false)
      : true;
    if (!published) continue;
    const bodyChars = body.replace(/\s/g, '').length;
    const mt = fs.statSync(file).mtime;
    const item = {
      title: (front && front.title) || fileBase,
      url: `/src/template/viewer.html?path=${folder}_${fileBase}`,
      category: (front && front.category) || folder,
      date: (front && front.date) || `${mt.getFullYear()}-${String(mt.getMonth() + 1).padStart(2, '0')}-${String(mt.getDate()).padStart(2, '0')}`,
      readTime: Math.max(1, Math.round(bodyChars / 280)),
      excerpt: extractExcerpt(front, body) || fileBase,
    };
    if (front && Array.isArray(front.tags) && front.tags.length) item.tags = front.tags;
    if (front && front.cover) item.cover = front.cover;
    if (front && (front.sticky || front.featured === 'true' || front.featured === true)) item.featured = true;
    items.push(item);
  }
  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return items;
}

const menu = JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'));
const card = menu.find((c) => c.title === '原创文章');
if (!card) { console.error('未找到 原创文章 卡'); process.exit(1); }

// 生成 feed（完整字段 → 专属 feed 文件，供首页 feed 渲染）
const items = buildFeed();
const FEED_DIR = path.join(ROOT, 'src/template/feed');
const FEED_PATH = path.join(FEED_DIR, 'data.json');
if (!fs.existsSync(FEED_DIR)) fs.mkdirSync(FEED_DIR, { recursive: true });
const feed = { updated: new Date().toISOString().slice(0, 10), items };
fs.writeFileSync(FEED_PATH, JSON.stringify(feed, null, 2) + '\n', 'utf8');

// menu「原创文章」卡只保留导航所需的 title+url（保持导航同步，feed 字段不再入 menu）
card.items = items.map(({ title, url }) => ({ title, url }));
fs.writeFileSync(MENU_PATH, JSON.stringify(menu, null, 2) + '\n', 'utf8');

const feat = items.filter((it) => it.featured).map((it) => it.title);
console.log('FEED_GENERATED items=' + items.length + ' featured=' + feat.length + ' -> ' + path.relative(ROOT, FEED_PATH));
console.log('FEATURED:', feat.join('; ') || '无');
console.log('MENU_原创文章 items=' + card.items.length + ' (仅 title+url)');
