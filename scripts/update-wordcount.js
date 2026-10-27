#!/usr/bin/env node
/**
 * 统计 feed/data.json 中每篇文章的真实字数，写回 wordCount 字段。
 * 字数 = 中文字符数 + 英文单词数（忽略空白、HTML 标签、script/style）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'src/template/feed/data.json');

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

function countWords(html) {
  // 去掉 script / style / nav / header / footer / 注释
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '');
  // 去标签
  s = s.replace(/<[^>]+>/g, '');
  // 解码常见 HTML 实体
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  // 中文字符
  const cn = (s.match(/[\u4e00-\u9fa5]/g) || []).length;
  // 英文单词
  const en = (s.match(/[a-zA-Z]+/g) || []).length;
  return cn + en;
}

let updated = 0;
let missing = 0;

data.forEach(group => {
  (group.list || []).forEach(item => {
    if (!item.url) return;
    const filePath = path.join(ROOT, item.url.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      missing++;
      return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    const wc = countWords(html);
    if (wc > 0) {
      item.wordCount = wc;
      updated++;
    }
  });
});

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`updated: ${updated}, missing: ${missing}`);
