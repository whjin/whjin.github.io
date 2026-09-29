// 统一 JSON 数据字段名：
//   标题 -> title ；副标题/描述 -> desc ；链接 -> url
//   menu/data.json : 条目 text->title, title->desc, href->url
//   文章/教程/工具/友链 data.json : 分组 subtitle->desc, 条目 name->title
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 保序重命名对象键
function remapKeys(obj, keyMap) {
  const out = {};
  for (const k of Object.keys(obj)) {
    const nk = keyMap[k] || k;
    out[nk] = obj[k];
  }
  return out;
}

// menu: 数组 of 卡片，只改 items 内的条目
function transformMenu(menu) {
  return menu.map((card) => {
    if (card && Array.isArray(card.items)) {
      card.items = card.items.map((it) => remapKeys(it, { text: 'title', title: 'desc', href: 'url' }));
    }
    return card;
  });
}

// 内容文件(文章/教程/工具/友链): 对象 of 分组，分组 subtitle->desc，条目 name->title
function transformSections(data) {
  const out = {};
  for (const key of Object.keys(data)) {
    const section = data[key];
    if (section && typeof section === 'object' && !Array.isArray(section)) {
      const ns = remapKeys(section, { subtitle: 'desc' });
      if (Array.isArray(ns.list)) {
        ns.list = ns.list.map((it) => remapKeys(it, { name: 'title' }));
      }
      out[key] = ns;
    } else {
      out[key] = section;
    }
  }
  return out;
}

const plan = [
  { file: 'src/template/menu/data.json', fn: transformMenu },
  { file: 'src/template/posts/文章/data.json', fn: transformSections },
  { file: 'src/template/posts/教程/data.json', fn: transformSections },
  { file: 'src/template/posts/工具/data.json', fn: transformSections },
  { file: 'src/template/posts/友链/data.json', fn: transformSections },
];

let changed = 0;
for (const { file, fn } of plan) {
  const abs = path.join(ROOT, file);
  const raw = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const next = fn(raw);
  const text = JSON.stringify(next, null, 2) + '\n';
  fs.writeFileSync(abs, text, 'utf8');
  changed++;
}
