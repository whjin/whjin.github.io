# 博客

- [个人主页](https://wuhuajin.com)
- [讨论站点](https://github.com/whjin/whjin.github.io/issues)

# 功能项

1. 基于 `Node.js`构建服务实现 `Live Server` 功能，实时监听内容变更，`WebSocket` 推送触发浏览器自动刷新
   1. `http` 创建静态文件服务器
   2. `url` 模块解析请求 `url`
   3. `decodeURIComponent` 对 `url` 进行解码，处理中文字符
   4. 处理文件扩展名，设置 `Content-Type`
   5. `fs.readFile` 读取文件，返回状态码和配置跨域
   6. 注入 `WebSocket` 客户端监听 `html` 消息
   7. 使用 `chokidar` 监视项目根目录下文件变化 `add` `change` `unlink` `error`，向所有已连接的 `WebSocket` 客户端发送刷新指令
   8. 向 `html` 状态 `socket` 事件监听函数，接收服务器发来的 `reload` 消息，刷新页面
   9. 增加防抖刷新处理
2. 使用 `marked.js` 处理 `markdown` 转换 `html`
3. 集成 `marked.js` 、`highlight.js` 处理代码高亮
4. 使用 `sessionStorage`，监听`scroll`事件，`window.scrollTo`实现滚动定位
5. 通过 `window.location` 检测当前环境，只在生产环境启用 `loading` 组件
6. 增加 `deploy.sh` 代码部署脚本，一键部署
7. `shell` 脚本增加提取 `commit.md` 提交信息和有效期机制
8. 添加 `viewer.html` 预览页面，兼容处理 `md` 和 `pdf` 文件
9. 移动端 `pdf` 文档高清渲染，处理手势缩放
10. 增加社交导航栏，动态图标显示
11. 增加文章目录导航功能，可切换隐藏/显示，目录根据标签结构动态缩进
12. 设计卡片式首页，`Grid minmax` 布局适配移动端
13. 增加 `json` 配置文件热更新
14. 增加首页卡片置顶和日期排序功能
15. 增加 `APlayer` 音乐播放器，通过社交导航音乐图标进行开关切换
16. 增加文章赞赏功能和付费阅读功能
17. 更换网站访问统计插件 `busuanzi` -> `vercount`
18. 增加 `Meting.js` 播放器插件，禁止首页手动缩放

## 功能优化

- `APlayer`切换下一曲播放时报错 `classList`为 `undefined`，在 `APlayer.min.js`依赖查找`classList.add("aplayer-lrc-current")`改为 `?.classList.add("aplayer-lrc-current")`即可解决问题。
- 优化社交图标栏显示隐藏切换功能，适配移动端设计
