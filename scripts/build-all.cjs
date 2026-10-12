/**
 * build-all.cjs
 * 顺序执行完整构建链：feed → 文章静态页 → 首页静态列表 → sitemap。
 * 用于 dev 启动、md 变更后的实时重建、以及部署前的一次性构建。
 * 用法：node scripts/build-all.cjs
 */
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STEPS = ['build-feed.cjs', 'build-articles.cjs', 'build-home.cjs', 'build-sitemap.cjs'];

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
console.log('✔ 完整构建链完成');
