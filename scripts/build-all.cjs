/**
 * build-all.cjs
 * 顺序执行完整构建链：feed → 文章静态页 → 首页静态列表 → sitemap。
 * 用于 dev 启动、md 变更后的实时重建、以及部署前的一次性构建。
 * 用法：node scripts/build-all.cjs
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

// 清理 macOS AppleDouble 文件（exFAT 盘上每次写文件都会产生 ._*）
function cleanAppleDouble(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) cleanAppleDouble(full);
    else if (entry.name.startsWith('._')) fs.unlinkSync(full);
  }
}
cleanAppleDouble(ROOT);

const STEPS = ['build-feed.cjs', 'build-articles.cjs', 'build-home.cjs', 'build-sitemap.cjs', 'build-links.cjs'];

for (const s of STEPS) {
  const file = path.join(ROOT, 'scripts', s);
  process.stdout.write('▸ ' + s + ' ... ');
  try {
    execSync('node "' + file + '"', { stdio: 'inherit', cwd: ROOT });
  } catch (err) {
    console.error('\n[build-all] 失败: ' + s + ' → ' + err.message);
    process.exit(1);
  }
}
// build 结束后再清一次（build 过程中新生成的文件会产生新的 ._*）
cleanAppleDouble(ROOT);
console.log('✔ 完整构建链完成');
