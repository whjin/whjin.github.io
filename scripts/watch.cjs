/**
 * watch.cjs
 * 监听 src/template/posts/**\/*.md 的变化，自动重建完整构建链（feed + 文章静态页 + 首页 + sitemap）。
 * 用于「md 实时转为 html」：改文章源文件后无需手动跑构建。
 * 用法：npm run build:watch   （headless，不启动本地服务器）
 * 说明：若想「改 md 后浏览器自动刷新」，请用 npm run dev（server.js 内置热刷新）。
 */
const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const POSTS = path.join(ROOT, 'src', 'template', 'posts');
const BUILD_ALL = path.join(ROOT, 'scripts', 'build-all.cjs');

let timer = null;
function rebuild(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log('\n[watch] 检测到 md 变更（' + reason + '），开始重建...');
    try {
      execSync('node "' + BUILD_ALL + '"', { stdio: 'inherit', cwd: ROOT });
    } catch (err) {
      console.error('[watch] 重建失败: ' + err.message);
    }
  }, 200);
}

const watcher = chokidar.watch(POSTS, {
  // 忽略生成产物：html 子目录与 json，避免构建结果触发自身循环
  ignored: (p) => /[\\/]html[\\/]/.test(p) || /\.(json)$/i.test(p) || p.endsWith(path.sep),
  persistent: true,
  ignoreInitial: true,
});

watcher
  .on('add', (p) => rebuild(p))
  .on('change', (p) => rebuild(p))
  .on('unlink', (p) => rebuild(p))
  .on('error', (e) => console.error('[watch] 监听错误:', e));

console.log('[watch] 正在监听 md 变更: ' + POSTS);
console.log('[watch] 按 Ctrl+C 退出');

process.on('SIGINT', () => {
  watcher.close();
  process.exit(0);
});
