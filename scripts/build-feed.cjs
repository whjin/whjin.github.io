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
        // 支持单行数组：['a', 'b'] 或 ["a","b"] → 解析为数组（category/tags 用 [] 包裹写法）
        const arrMatch = /^\[(.*)\]$/.exec(val);
        if (arrMatch) {
          front[lastKey] = arrMatch[1]
            .split(',')
            .map((x) => x.trim().replace(/^["']|["']$/g, ''))
            .filter((x) => x !== '');
        } else {
          front[lastKey] = val.replace(/^["']|["']$/g, '');
        }
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
  // 静态文章页统一输出在 html/ 子目录（与 build-articles.cjs 一致），feed url 必须指向该路径
  return `/src/template/posts/${folder}/html/${fileBase}.html`;
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
  return urlToMd.get(`/src/template/posts/${folder}/html/${file}.html`) || null;
}

// 清理描述：去掉结尾省略号字符（…/...），保证 title 弹框完整显示、不出现省略号
function cleanDesc(s) {
  return String(s == null ? '' : s).trim().replace(/(?:…|\.\.\.)\s*$/g, '');
}

// 取描述：只要 md 里手动写了 description 行（不管长短），就尊重用户输入；
// 只有完全没写这一行时，才从正文自动生成摘要。
function descriptionFor(md) {
  if (!md) return '';
  if (md.front && Object.prototype.hasOwnProperty.call(md.front, 'description')) {
    return cleanDesc(String(md.front.description || ''));
  }
  return generateSummary(md.body);
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
    // 仅当 md 里完全没有 description 行时，才把自动生成的摘要回写进 front matter；
    // 已有 description 行则尊重用户输入，绝不覆盖。
    if (!(front && Object.prototype.hasOwnProperty.call(front, 'description')) && desc) setMdDescription(mdObj, desc);
    const item = {
      title: (front && front.title) || fileBase,
      url: mdUrl(folder, fileBase),
      category: (Array.isArray(front && front.category) ? front.category[0] : (front && front.category)) || folder,
      date: (front && front.date) || `${mt.getFullYear()}-${String(mt.getMonth() + 1).padStart(2, '0')}-${String(mt.getDate()).padStart(2, '0')}`,
      readTime: Math.max(1, Math.round(bodyChars / 280)),
      desc: desc,
    };
    const fmTags = Array.isArray(front && front.tag) ? front.tag : (front && Array.isArray(front.tags) ? front.tags : null);
    if (fmTags && fmTags.length) item.tags = fmTags;
    if (front && front.cover) item.cover = front.cover;
    if (front && (front.sticky || front.featured === 'true' || front.featured === true)) item.featured = true;
    // top：置顶最高优先级，专门用于将某篇文章置顶
    if (front && (front.top === 'true' || front.top === true)) item.top = true;
    // topic：归属到 data.json 里 title 等于该值的卡片（如 "我的"）；未配置则只进「原创文章」卡
    if (front && front.topic) item._topic = String(front.topic).trim();
    // reward：文章页底部赞赏卡片开关，默认显示；仅 reward:false 时隐藏
    item.reward = !(front && (front.reward === 'false' || front.reward === false));
    items.push(item);
  }
  // 排序规则（显式分组，避免 sort 比较函数的边界问题）：
  // 1) 所有文章按 category 分桶，同分类的排在一起；
  // 2) 桶内排序：top 文章优先（在本组内排最前），其余按日期倒序；
  // 3) 桶之间按"该分类最新一篇文章的日期"倒序——最近有更新的分类排前面；
  // 4) 日期相同时按分类名做稳定次序。
  // 注意：top 不再跨分类强制置顶，只在自己分类组内优先，保证同分类聚拢。
  const buckets = new Map(); // category -> items[]
  for (const it of items) {
    const c = it.category || '';
    if (!buckets.has(c)) buckets.set(c, []);
    buckets.get(c).push(it);
  }
  // 桶内排序：top 优先，再按日期倒序
  for (const list of buckets.values()) {
    list.sort((a, b) => {
      if (!!a.top !== !!b.top) return a.top ? -1 : 1;
      const ad = a.date || '', bd = b.date || '';
      return ad < bd ? 1 : ad > bd ? -1 : 0;
    });
  }
  // 桶间按桶内最新文章日期倒序
  const bucketKeys = [...buckets.keys()].sort((ca, cb) => {
    const la = buckets.get(ca)[0]?.date || '';
    const lb = buckets.get(cb)[0]?.date || '';
    if (la !== lb) return la < lb ? 1 : -1;
    return ca < cb ? -1 : ca > cb ? 1 : 0;
  });
  // 拼接各桶
  const sorted = [];
  for (const k of bucketKeys) sorted.push(...buckets.get(k));
  return sorted;
}

// 规范化其他卡条目为 feed 结构
function normalizeLinkItem(it, cardTitle) {
  const md = resolveMd(it.url);
  const out = { title: it.title, url: it.url };
  if (md) {
    out.category = (Array.isArray(md.front && md.front.category) ? md.front.category[0] : (md.front && md.front.category)) || cardTitle;
    if (md.front && md.front.date) out.date = md.front.date;
    out.readTime = Math.max(1, Math.round(md.body.replace(/\s/g, '').length / 280));
    out.desc = descriptionFor(md);
    // 仅当 md 里完全没有 description 行时才补写；已有则尊重用户输入，不回写。
    if (!(md.front && Object.prototype.hasOwnProperty.call(md.front, 'description')) && out.desc) setMdDescription(md, out.desc);
    const fmTags2 = Array.isArray(md.front && md.front.tag) ? md.front.tag : (md.front && Array.isArray(md.front.tags) ? md.front.tags : null);
    if (fmTags2 && fmTags2.length) out.tags = fmTags2;
    if (md.front && md.front.cover) out.cover = md.front.cover;
    if (md.front && (md.front.sticky || md.front.featured === 'true' || md.front.featured === true)) out.featured = true;
    if (md.front && (md.front.top === 'true' || md.front.top === true)) out.top = true;
    if (md.front && md.front.reward !== undefined) {
      out.reward = !(md.front.reward === 'false' || md.front.reward === false);
    }
  } else {
    out.category = cardTitle;
    out.desc = cleanDesc(it.desc != null ? String(it.desc) : '');
  }
  if (it.marked) out.marked = true;
  if (it.featured) out.featured = true;
  if (it.image) out.image = it.image;
  return out;
}

// 友链数据源：核心推荐/推荐两节从友链 data.json 自动同步（避免手动维护两份）
const LINK_DATA_PATH = path.join(ROOT, 'src/template/posts/Link/友链/data.json');
// 友链 section key → feed 节标题
const LINK_SECTION_MAP = {
  recommend: '核心推荐',
  recommend1: '推荐',
  product: '商品',
};

buildUrlMap();

const menu = JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'));

// 0) 从友链数据源增量同步「核心推荐」「推荐」两节
//    - 已存在条目：覆盖 title/desc/image/marked
//    - feed 独有条目：位置保持不动
//    - 友链条目：按友链顺序排入原本属于友链条目的位置；友链新增条目追加到末尾
if (fs.existsSync(LINK_DATA_PATH)) {
  const linkData = JSON.parse(fs.readFileSync(LINK_DATA_PATH, 'utf8'));
  Object.entries(LINK_SECTION_MAP).forEach(([linkKey, feedTitle]) => {
    const linkSec = linkData[linkKey];
    if (!linkSec || !Array.isArray(linkSec.list)) return;
    const feedCard = menu.find((c) => c.title === feedTitle);
    if (!feedCard) return;

    // 友链有效条目（按友链顺序）
    const linkItems = linkSec.list.filter((it) => it && it.show !== false && it.url);
    const linkUrlSet = new Set(linkItems.map((it) => it.url));

    // 1) 按 url 索引 feed 现有条目，先打补丁（覆盖 title/desc/image/marked）
    const byUrl = new Map();
    (feedCard.list || []).forEach((it) => { if (it.url) byUrl.set(it.url, it); });
    linkItems.forEach((it) => {
      const patch = { title: it.title, desc: it.desc || '', image: it.image || it.cover || '', marked: !!it.marked };
      if (byUrl.has(it.url)) Object.assign(byUrl.get(it.url), patch);
      else { const fresh = Object.assign({ url: it.url }, patch); byUrl.set(it.url, fresh); }
    });

    // 2) 重建顺序：feed 独有条目保持原位；友链条目按友链顺序填入原友链条目位置
    const syncedQueue = linkItems.map((it) => byUrl.get(it.url));
    const result = [];
    (feedCard.list || []).forEach((it) => {
      if (it.url && linkUrlSet.has(it.url)) {
        // 原位置是友链条目 → 从友链队列取下一个
        result.push(syncedQueue.shift());
      } else {
        // feed 独有 → 保持原位
        result.push(it);
      }
    });
    // 友链新增（原 feed 没有）的条目追加到末尾
    while (syncedQueue.length) result.push(syncedQueue.shift());
    feedCard.list = result;
  });
}

// 1) 「原创文章」卡：重新生成 feed 字段（含 desc）
//    - md 里配置了 topic 的文章，不进「原创文章」卡，只进 topic 指定的卡片，避免跨卡重复。
const artCard = menu.find((c) => c.type === ARTICLE_CARD_TYPE) || menu.find((c) => c.title === ARTICLE_CARD_FALLBACK_TITLE);
if (!artCard) { console.error('未找到 原创文章 卡'); process.exit(1); }
const items = buildFeed();
artCard.list = items.filter((it) => !it._topic);

// 2) 其余卡：规范化条目为 feed 结构
for (const c of menu) {
  if (c.type === ARTICLE_CARD_TYPE || c.title === ARTICLE_CARD_FALLBACK_TITLE) continue;
  if (!Array.isArray(c.list)) continue;
  c.list = c.list.map((it) => normalizeLinkItem(it, c.title));
}

// 3) 按 md front matter 的 topic 字段，把文章归到对应卡片（如 topic: 我的 → "我的"卡）
//    - 保留目标卡原有手动条目；
//    - 按 url 去重：已存在的条目用 md 生成的基础字段覆盖，手动标记（marked/image/sticky 等）保留；
//    - 不存在的新文章追加到末尾；
//    - 未配置 topic、或找不到对应 title 卡片时，文章只留在「原创文章」卡。
//    - 归属完成后，对被影响的卡片内部排序：top=true 的排前面，多条 top 按日期倒序（新的在前）；
//      非 top 条目保持相对顺序稳定（手动条目不被打乱）。
const cardByTitle = new Map();
menu.forEach((c) => { if (c && c.title) cardByTitle.set(c.title, c); });
const touchedCards = new Set();
for (const it of items) {
  const topic = it._topic;
  if (!topic) continue;
  const card = cardByTitle.get(topic);
  if (!card || !Array.isArray(card.list)) continue;
  const patch = {
    title: it.title, url: it.url, category: it.category, date: it.date,
    readTime: it.readTime, desc: it.desc, reward: it.reward,
  };
  if (it.tags) patch.tags = it.tags;
  if (it.top) patch.top = true;
  if (it.featured) patch.featured = true;
  // 先按 url 精确匹配；找不到再按 title 匹配（兼容旧 viewer.html 链接与新静态 html 链接同文不同 url 的情况）
  let idx = card.list.findIndex((x) => x && x.url === it.url);
  if (idx < 0) idx = card.list.findIndex((x) => x && x.title === it.title);
  if (idx >= 0) {
    card.list[idx] = Object.assign({}, card.list[idx], patch);
  } else {
    card.list.push(patch);
  }
  touchedCards.add(card);
}
// 清理内部字段，不写入 data.json
for (const it of items) delete it._topic;

// 对被 topic 影响过的卡片做内部排序：
// - 先按 title 去重（合并同 title 条目，保留字段更全的那条）；
// - top=true 的排前面；多条 top 按日期倒序（新的在前）；
// - 非 top 条目按稳定顺序保持原相对次序（不破坏手动排列）。
for (const card of touchedCards) {
  const list = card.list || [];
  // 按 title 去重：同 title 只保留一条，后出现的补充缺失字段
  const byTitle = new Map();
  for (const it of list) {
    const t = it.title || '';
    if (!byTitle.has(t)) {
      byTitle.set(t, Object.assign({}, it));
    } else {
      const exist = byTitle.get(t);
      for (const k of Object.keys(it)) {
        if (exist[k] == null || exist[k] === '') exist[k] = it[k];
      }
    }
  }
  card.list = [...byTitle.values()];

  const indexed = card.list.map((it, i) => ({ it, i }));
  indexed.sort((a, b) => {
    const at = !!a.it.top, bt = !!b.it.top;
    if (at !== bt) return at ? -1 : 1;
    if (at && bt) {
      const ad = a.it.date || '', bd = b.it.date || '';
      if (ad !== bd) return ad < bd ? 1 : -1;
    }
    return a.i - b.i; // 稳定：同组内保持原始相对顺序
  });
  card.list = indexed.map((x) => x.it);
}

fs.writeFileSync(MENU_PATH, JSON.stringify(menu, null, 2) + '\n', 'utf8');
