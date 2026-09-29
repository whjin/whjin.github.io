// 2.4 兼容校验：字段完整性 + home 仅限「原创文章」卡 + featured 数量 + JSON 有效
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const menuPath = path.join(ROOT, 'src/template/menu/data.json');
const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
let errs = [];
let featuredCount = 0;
let homeOutside = 0;

for (const card of menu) {
  if (!Array.isArray(card.items)) continue;
  for (const it of card.items) {
    const isArt = card.title === '原创文章';
    if (it.featured) featuredCount++;
    if (it.home === true) {
      if (!isArt) homeOutside++;
      if (isArt) {
        if (!it.category || typeof it.category !== 'string') errs.push(`${it.title}: category 缺失`);
        if (!dateRe.test(it.date || '')) errs.push(`${it.title}: date 格式错误(${it.date})`);
        if (!(it.readTime >= 1)) errs.push(`${it.title}: readTime 缺失`);
        if (!it.excerpt || !String(it.excerpt).trim()) errs.push(`${it.title}: excerpt 缺失`);
      }
    }
  }
}
