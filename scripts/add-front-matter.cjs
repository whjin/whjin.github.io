// 批量给 posts/**/*.md 补 YAML front matter（仅补 title/date/category/description，精选补 sticky:1；已带 front matter 的文件跳过）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const POSTS = path.join(ROOT, 'src/template/posts');
const MENU_PATH = path.join(ROOT, 'src/template/menu/data.json');

// 精选 5 篇（按 title，与既有决策一致）
const FEATURED = new Set(['AI应用开发学习路线图', '功能代码集合', 'Node.js实战', 'Solidity文档', 'WebRTC性能优化']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.md$/.test(e.name)) out.push(p);
  }
  return out;
}

function hasFrontMatter(text) {
  return /^---\r?\n/.test(text);
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
    if (s.length >= 8) return s.length > 60 ? s.slice(0, 60) + '…' : s;
  }
  return '';
}

const menu = JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'));
const card = menu.find((c) => c.title === '原创文章');
const byUrl = new Map((card ? card.items : []).map((it) => [it.url, it]));

let added = 0, skipped = 0, missing = 0;
for (const file of walk(POSTS)) {
  const rel = path.relative(POSTS, file);
  const parts = rel.split(path.sep);
  const fileBase = parts.pop().replace(/\.md$/, '');
  const folder = parts.join('/');
  const raw = fs.readFileSync(file, 'utf8');
  if (hasFrontMatter(raw)) { skipped++; continue; }

  const wantUrl = `/src/template/viewer.html?path=${folder}_${fileBase}`;
  const m = byUrl.get(wantUrl);
  const title = (m && m.title) || fileBase;
  const mt = fs.statSync(file).mtime;
  const date = `${mt.getFullYear()}-${String(mt.getMonth() + 1).padStart(2, '0')}-${String(mt.getDate()).padStart(2, '0')}`;
  const desc = cleanPara(raw);

  let fm = `---\ntitle: ${title}\ndate: ${date}\ncategory: ${folder}\n`;
  if (desc) fm += `description: ${desc}\n`;
  if (FEATURED.has(title)) fm += 'sticky: 1\n';
  fm += '---\n\n';

  const newText = fm + raw;
  fs.writeFileSync(file, newText, 'utf8');
  if (!fs.existsSync(file)) missing++;
  added++;
}

console.log('FRONT_MATTER_ADDED=' + added + ' SKIPPED(已有)=' + skipped + ' MISSING=' + missing);
console.log('FEATURED=', [...FEATURED].join('; '));
