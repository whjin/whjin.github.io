// Hexo 式 feed 生成器 + 菜单数据规范化：
// 1) 扫描 posts/**/*.md → 生成「原创文章」卡 items（完整 feed 字段：title/url/category/date/readTime/description/tags/cover/featured）
// 2) 规范化其余卡（核心推荐/推荐/我的/站点）条目为同一 feed 结构，md 链接自动生成 ~150 字 description
// 3) 摘要统一使用 description 字段（移除 excerpt），优先取 md 的 description，缺失/过短时自动生成并回写 md front matter
// 用法：node scripts/build-feed.cjs （部署前运行）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const POSTS = path.join(ROOT, 'src/template/posts');
const MENU_PATH = path.join(ROOT, 'src/template/feed/data.json');

const DESC_MIN = 250; // 少于该长度的 description 视为不合格，自动生成（目标 ~300 字）
const ARTICLE_CARD_TYPE = 'articles'; // 原创文章卡的稳定标识（与显示标题解耦）
const ARTICLE_CARD_FALLBACK_TITLE = '原创文章'; // 兼容旧数据（无 type 字段时的回退）

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

// 从正文自动提取 ~maxChars 字的摘要（清理代码块/链接/标记符号）
function generateSummary(body, maxChars = 300) {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*#>|~]/g, '')
    .replace(/^\s*(-{3,}|={3,})\s*$/gm, '')
    .replace(/\s+/g, ' ');
  let c = text.trim();
  if (!c) return '';
  c = c.replace(/^[\s\-.\d、*+]+/, '');
  if (c.length > maxChars) c = c.slice(0, maxChars).trim();
  return c;
}

function mdUrl(folder, fileBase) {
  return `/src/template/posts/${folder}/${fileBase}.html`;
}

// url → md 信息映射
const urlToMd = new Map();
function buildUrlMap() {
  urlToMd.clear();
  for (const file of walk(POSTS)) {
    const rel = path.relative(POSTS, file);
    const parts = rel.split(path.sep);
    const fileBase = parts.pop().replace(/\.md$/, '');
    const folder = parts.join('/');
    const raw = fs.readFileSync(file, 'utf8');
    const { front, body } = parseFrontMatter(raw);
    urlToMd.set(mdUrl(folder, fileBase), { file, folder, fileBase, front, body, raw });
  }
}

function resolveMd(url) {
  if (!url) return null;
  // 新格式：/src/template/posts/<folder>/<file>.html
  const s = /\/src\/template\/posts\/(.+?)\.html$/.exec(url);
  if (s) {
    return urlToMd.get(`/src/template/posts/${s[1]}.html`) || null;
  }
  // 旧格式：viewer.html?path=<folder>_<file>（兼容历史链接）
  const q = /path=([^&]+)/.exec(url);
  if (!q) return null;
  const parts = q[1].split('_');
  const file = parts.pop();
  const folder = parts.join('/');
  return urlToMd.get(`/src/template/posts/${folder}/${file}.html`) || null;
}

// 清理描述：去掉结尾省略号字符（…/...），保证 title 弹框完整显示、不出现省略号
function cleanDesc(s) {
  return String(s == null ? '' : s).trim().replace(/(?:…|\.\.\.)\s*$/g, '');
}

// 取描述：md 的 description 若合格则用，否则自动生成
function descriptionFor(md) {
  if (!md) return '';
  const fd = cleanDesc(md.front && md.front.description ? String(md.front.description) : '');
  return fd.length >= DESC_MIN ? fd : generateSummary(md.body);
}

// 把生成的 description 回写 md front matter（使其成为规范来源）
function setMdDescription(md, desc) {
  const raw = md.raw;
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m || !desc) return;
  let fm = m[1];
  const quoted = JSON.stringify(desc);
  if (/^description:/m.test(fm)) {
    fm = fm.replace(/^description:.*$/m, `description: ${quoted}`);
  } else {
    fm = fm.replace(/^title:.*$/m, `$&\ndescription: ${quoted}`);
  }
  const newText = raw.slice(0, m.index) + '---\n' + fm + '\n---\n' + raw.slice(m.index + m[0].length);
  fs.writeFileSync(md.file, newText, 'utf8');
}

// 生成「原创文章」卡 items
function buildFeed() {
  const items = [];
  for (const file of walk(POSTS)) {
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
    const mdObj = { file, folder, fileBase, front, body, raw };
    const desc = descriptionFor(mdObj);
    // 若 md 的 description 缺失/过短，把自动生成的摘要回写进 md front matter，保证两者一致
    const mdDesc = front && front.description ? String(front.description).trim() : '';
    if (mdDesc.length < DESC_MIN && desc) setMdDescription(mdObj, desc);
    const item = {
      title: (front && front.title) || fileBase,
      url: mdUrl(folder, fileBase),
      category: (front && front.category) || folder,
      date: (front && front.date) || `${mt.getFullYear()}-${String(mt.getMonth() + 1).padStart(2, '0')}-${String(mt.getDate()).padStart(2, '0')}`,
      readTime: Math.max(1, Math.round(bodyChars / 280)),
      description: desc,
    };
    if (front && Array.isArray(front.tags) && front.tags.length) item.tags = front.tags;
    if (front && front.cover) item.cover = front.cover;
    if (front && (front.sticky || front.featured === 'true' || front.featured === true)) item.featured = true;
    items.push(item);
  }
  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return items;
}

// 规范化其他卡条目为 feed 结构
function normalizeLinkItem(it, cardTitle) {
  const md = resolveMd(it.url);
  const out = { title: it.title, url: it.url };
  if (md) {
    out.category = (md.front && md.front.category) || cardTitle;
    if (md.front && md.front.date) out.date = md.front.date;
    out.readTime = Math.max(1, Math.round(md.body.replace(/\s/g, '').length / 280));
    out.description = descriptionFor(md);
    const fd = md.front && md.front.description ? String(md.front.description).trim() : '';
    if (fd.length < DESC_MIN && out.description) setMdDescription(md, out.description);
    if (md.front && Array.isArray(md.front.tags) && md.front.tags.length) out.tags = md.front.tags;
    if (md.front && md.front.cover) out.cover = md.front.cover;
    if (md.front && (md.front.sticky || md.front.featured === 'true' || md.front.featured === true)) out.featured = true;
  } else {
    out.category = cardTitle;
    out.description = cleanDesc(it.desc != null ? String(it.desc) : (it.description || ''));
  }
  if (it.marked) out.marked = true;
  if (it.featured) out.featured = true;
  return out;
}

buildUrlMap();

const menu = JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'));

// 1) 「原创文章」卡：重新生成 feed 字段（含 description）
const artCard = menu.find((c) => c.type === ARTICLE_CARD_TYPE) || menu.find((c) => c.title === ARTICLE_CARD_FALLBACK_TITLE);
if (!artCard) { console.error('未找到 原创文章 卡'); process.exit(1); }
const items = buildFeed();
artCard.items = items;

// 2) 其余卡：规范化条目为 feed 结构
for (const c of menu) {
  if (c.type === ARTICLE_CARD_TYPE || c.title === ARTICLE_CARD_FALLBACK_TITLE) continue;
  if (!Array.isArray(c.items)) continue;
  c.items = c.items.map((it) => normalizeLinkItem(it, c.title));
}

fs.writeFileSync(MENU_PATH, JSON.stringify(menu, null, 2) + '\n', 'utf8');
