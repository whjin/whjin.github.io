// 2.2 数据盘点：把 menu/data.json「原创文章」卡条目映射到 .md 文件，采集字段依据（只读）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const menu = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/template/menu/data.json'), 'utf8'));
const card = menu.find((c) => c.title === '原创文章');
if (!card) { console.log('未找到 原创文章 卡'); process.exit(0); }

function parsePath(url) {
  const m = /path=([^&]+)/.exec(url || '');
  if (!m) return null;
  const p = m[1].split('_');
  const file = p.pop();
  return { folder: p.join('/'), file };
}

function mdPath(item) {
  const p = parsePath(item.url);
  if (!p) return null;
  return path.join(ROOT, 'src/template/posts', p.folder, `${p.file}.md`);
}

function firstPara(text) {
  const lines = text.split('\n');
  for (const ln of lines) {
    const s = ln.replace(/^[#>*`\-\s]+/, '').trim();
    if (s) return s.slice(0, 60);
  }
  return '';
}

console.log('共', card.items.length, '个条目\n');
card.items.forEach((it, i) => {
  const mp = mdPath(it);
  const p = parsePath(it.url);
  let info = '?';
  if (mp && fs.existsSync(mp)) {
    const raw = fs.readFileSync(mp, 'utf8');
    const mt = fs.statSync(mp).mtime;
    const date = `${mt.getFullYear()}-${String(mt.getMonth() + 1).padStart(2, '0')}-${String(mt.getDate()).padStart(2, '0')}`;
    const chars = raw.replace(/\s/g, '').length;
    const rt = Math.max(1, Math.round(chars / 280));
    info = `folder=${p.folder} file=${p.file} date=${date} chars=${chars} readTime=${rt} excerpt="${firstPara(raw)}"`;
  } else {
    info = `MISSING md for folder=${p.folder} file=${p.file}`;
  }
  console.log(`${i + 1}. [${it.title}] ${info}`);
});
