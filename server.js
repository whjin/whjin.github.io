const http = require('http');
const fs = require('fs');
const path = require('path');

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_VERCEL = !!process.env.VERCEL;

let chokidar, WebSocket;
let watcher, wss;
if (IS_DEV) {
  chokidar = require('chokidar');
  WebSocket = require('ws');
}

const DEBOUNCE_DELAY = 100;
const PORT = process.env.PORT || 8000;
const rootDir = process.cwd();
const resolveRoot = path.resolve(rootDir);

function isInsideRoot(p) {
  const resolved = path.resolve(p);
  return resolved === resolveRoot || resolved.startsWith(resolveRoot + path.sep);
}

const server = http.createServer((req, res) => {
  // 使用 new URL 解析请求的 URL 全路径
  let url = `https://${req.headers.host}${req.url}`;
  const parsedUrl = new URL(url);
  let pathname = parsedUrl.pathname;
  // 对 URL 进行解码，处理中文字符（非法编码返回 400，避免进程崩溃）
  try {
    pathname = decodeURIComponent(pathname);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>400 - 无效的URL编码</h1>');
    return;
  }

  // 构建请求的文件路径
  let filePath = path.join(rootDir, pathname === '/' ? 'index.html' : pathname);

  if (!isInsideRoot(filePath)) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>403 - 禁止访问</h1>');
    return;
  }

  // 获取文件扩展名，用于设置正确的 Content-Type
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.md':
      contentType = 'text/markdown;charset=utf-8';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.ico':
      contentType = 'image/x-icon';
      break;
    case '.json':
      contentType = 'application/json;charset=utf-8';
      break;
    // 补充SEO必备文件类型
    case '.xml':
      contentType = 'application/xml;charset=utf-8';
      break;
    case '.txt':
      contentType = 'text/plain;charset=utf-8';
      break;
  }

  // 读取并返回文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 文件不存在
        if (pathname === '/favicon.png') {
          // 对于 favicon.png，返回一个空的响应
          res.writeHead(204);
          res.end();
          return;
        }

        // 尝试查找文件的其他可能位置（同样经过越界过滤）
        const possiblePaths = [
          filePath,
          // 尝试在 src/template 目录下查找
          path.join(rootDir, 'src', 'template', pathname),
          // 尝试去掉开头的 /src/template
          pathname.startsWith('/src/template/')
            ? path.join(rootDir, pathname.slice('/src/template'.length))
            : null,
        ].filter((p) => p && p !== filePath && isInsideRoot(p));

        // 检查可能的路径
        let fileFound = false;

        for (const possiblePath of possiblePaths) {
          if (possiblePath && fs.existsSync(possiblePath)) {
            filePath = possiblePath;
            fileFound = true;

            // 重新读取文件
            fs.readFile(filePath, (err, data) => {
              if (err) {
                res.writeHead(404, {
                  'Content-Type': 'text/html; charset=utf-8',
                });
                res.end(`<h1>404 - 文件未找到</h1><p>尝试读取文件时出错: ${err.message}</p>`);
              } else {
                res.writeHead(200, {
                  'Content-Type': contentType,
                });
                res.end(data);
              }
            });

            return;
          }
        }

        if (!fileFound) {
          res.writeHead(404, {
            'Content-Type': 'text/html; charset=utf-8',
          });
          res.end(`
            <html>
              <head><title>404 - 文件未找到</title></head>
              <body>
                <h1>404 - 文件未找到</h1>
                <p>尝试的文件路径: ${filePath}</p>
                <p>解码后路径: ${pathname}</p>
                <p>请确保文件存在于以下位置之一:</p>
                <ul>
                  <li>${rootDir}${pathname}</li>
                  <li>${path.join(rootDir, 'src', 'template', pathname)}</li>
                  <li>${path.join(rootDir, 'src/template/posts', pathname.includes('/posts/') ? pathname.split('/posts/')[1] : '')}</li>
                </ul>
              </body>
            </html>
          `);
        }
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(content);
    }
  });
});

if (IS_DEV) {
  wss = new WebSocket.Server({ server });
  // 使用 chokidar 监视项目根目录下的文件变化
  watcher = chokidar.watch(rootDir, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
  });
  // 防抖刷新函数
  let reloadTimer = null;
  const triggerReload = (filePath) => {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      if (path.extname(filePath).match(/\.(html|md|js|css|json)$/)) {
        // 向所有已连接的 WebSocket 客户端发送刷新指令
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
          }
        });
      }
    }, DEBOUNCE_DELAY);
  };
  watcher
    .on('add', triggerReload)
    .on('change', triggerReload)
    .on('unlink', triggerReload)
    .on('error', (error) => console.error('[Live Server] 监听错误:', error));

  // 本地开发进程清理
  process.on('SIGINT', () => {
    watcher.close();
    wss.close();
    server.close();
    process.exit(0);
  });
}

if (!IS_VERCEL) {
  server.listen(PORT, () => {
    console.log('🚀 Live Server 正在运行: http://localhost:' + PORT);
  });
}

module.exports = server;
