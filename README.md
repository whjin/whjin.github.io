# 吴华锦的个人主页

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
17. 更换网站访问统计方案：`busuanzi` → `vercount` → **GoatCounter**（最终方案见 #40，海外隐私友好，国内海外同一后台）
18. 增加 `Meting.js` 播放器插件，禁止首页手动缩放
19. `APlayer`切换下一曲播放时报错 `classList`为 `undefined`，在 `APlayer.min.js`依赖查找`classList.add("aplayer-lrc-current")`改为 `?.classList.add("aplayer-lrc-current")`即可解决问题。
20. 优化社交图标栏显示隐藏切换功能，适配移动端设计。
21. 主页卡片 `PC`端鼠标 `hover` 时显示滚动条，鼠标移出隐藏滚动条。
22. 卡片高度内容自适应处理，提升空间利用率。
23. 增加首页卡片滚动条记忆功能。
24. 优化整体布局，滚动行为，导航栏优化，`PDF` 文档预览与打印功能。
25. 增加 `HTML` 的 `meta` 标签，搜索引擎 `SEO` 优化。
26. 新增功能项：首页和文章详情页增加 `HTML` 文档渲染，处理引入外部 `css`、`js` 文件。
27. 新增功能项：增加 `爱发电` 支持，点击图标跳转爱发电页面。
28. 实现AI应用功能，点击图标跳转AI应用页面。
29. 新增原创歌曲栏目，点击图标跳转原创歌曲页面。
30. 优化 `html` 原生页面渲染处理逻辑，页面滚动记忆功能。
31. 优化 `html` 原生页面渲染处理，删除、合并冗余重复代码，改造硬编码代码为动态配置，增强整体扩展。
32. 修改网页标题为动态标题，增加数据字段整体兼容处理。
33. 增加兼容 **`Macbook`** 一键提交脚本
34. `Docker`部署 `Meting-API` 服务，并把服务地址映射为 `meting.wuhuajin.com` 二级域名，部署技术文档访问技术文章栏目
35. 整体优化首页布局：卡片区域布局、顶部导航栏优化、播放器和弹窗边距优化。
36. 增加 `sitemap.xml` `robots.txt` 文件，优化搜索引擎 `SEO` 优化。
37. 修改阿里云默认 DNS 解析为 `Cloudflare`，优化域名解析速度。
38. 接入 **`Google AdSense`** 广告，增加文章页广告位。
39. 增加 `ads.txt` 文件，优化广告展示。

# 近期升级改造（2026-10 海外网站出海）

40. 更换网站访问统计方案为 **GoatCounter**（海外隐私友好、无 `cookie`、GDPR 合规）：采用 **tracking pixel** 直连上报 `whjin.goatcounter.com/count`，绕开被限的 `gc.zgo.at` CDN，国内与海外访问计入**同一后台**；footer 显示「访问 N 次」。
41. 文章静态化：`scripts/build-articles.cjs` 将 md 文章预渲染为静态 HTML（`src/template/posts/<分类>/html/*.html`），`feed/data.json` 中文章链接指向静态页，提升加载速度与搜索引擎抓取。
42. 修复静态文章页 highlight.js **重复高亮**导致的控制台「unescaped HTML」警告：生成脚本不再对已高亮 `<code>` 二次 `highlightElement`。
43. 接入 Google AdSense **Consent Mode v2**：Cookie 同意横幅按用户选择同步 `gtag('consent')` 状态（含 `ads_data_redaction` 等隐私参数），GDPR / CCPA 合规。
44. 新增 Cookie Consent Banner 组件（`src/components/cookie-consent`），并配套隐私政策（`privacy.html`）、条款（`terms.html`）页面。
45. 付费会员订阅：接入 **Ko-fi**（绑定 PayPal），首页右侧新增「订阅」卡片，实现**免费 + 付费会员**内容模式。
46. 中英文国际化：新增 `src/components/i18n` 语言切换，导航、卡片、订阅、页脚等文案随 `lang.png` 语言图标切换中英文。
47. 移动端布局优化：窄屏 / 平板下主体右侧区域上移，导航栏新增 **collapse** 收缩/展开侧栏图标（`collapse.png`），便于快速查看搜索结果与筛选结果。
48. 海外网站出海 SEO 优化：扩写首页及各卡片 `meta description`（利于 Google AdSense 审核与爬虫抓取），新增静态 meta、Popular tags「最新资源」跳转链接等要素。
49. 访问统计最终方案：**Cloudflare Web Analytics**（beacon 从 Cloudflare 全球边缘加载，国内与海外访问计入同一后台）+ **Cloudflare Worker**（绑定自定义域 `stats.wuhuajin.com`，GraphQL 代理隐藏 API token）返回总浏览量；footer「访问 N 次」改为从 Worker 读取。GoatCounter tracking pixel 保留为后台详情备份。
50. Cloudflare 统计落地踩坑（排障实录）：①Web Analytics（RUM/beacon）**数据无公开 GraphQL/REST 取数**——`rumGroups` 字段在账户 schema 不存在、`rum/site_info` 只做站点管理不返回 pageViews，前端显示改用 **`httpRequests1dGroups`**（zone 级 HTTP `pageViews`，需 Zone ID + token 权限 **Account Analytics Read + Zone Analytics Read** + 域名 proxied）；②`workers.dev` 国内超时 → Worker 绑定自定义域名走 Cloudflare 边缘；③GraphQL `Authentication failed (code 9106)` → CF_API_TOKEN 需填**专用 API token**（非 beacon 的 site token、非 build token）；④口径：边缘 pageViews **含爬虫、按天聚合、非实时**（比 beacon 偏大属正常）。
51. 修复 Cloudflare beacon 本地控制台 CORS 报错：beacon 仅允许 origin http://localhost（无端口），本地 localhost:8000 不匹配被 CORS 拦截（线上 wuhuajin.com 不受影响）；改为**动态注入 + hostname 判断**（localhost/127.0.0.1 跳过），本地不加载 beacon、线上正常统计。
52. 访问统计升级（方案 A）：**Cloudflare Worker + D1 自维护计数器** 统计「建站以来全部累计访问」。背景：`httpRequests1dGroups` 只能查近 1 年（52w1d1h），跨年超限报 quota 返回 0。做法：建 D1 库 `stats-db`（表 `stats(id INTEGER PRIMARY KEY CHECK(id=1), total INTEGER NOT NULL DEFAULT 0)`，`INSERT OR IGNORE INTO stats(id,total) VALUES(1,12167)` 初始化起点）、Worker 绑定 D1（变量名 `DB`）、替换 D1 版代码（`/hit` POST 执行 `UPDATE stats SET total=total+1 WHERE id=1`，GET 返回 `{total}`，`fetch(request, env)` 签名）；前端全站（footer + 5 根页 + 42 文章页 + viewer 资源页）调 `fetch('https://stats.wuhuajin.com/hit', {method:'POST'})` 累加，**本地 localhost/127.0.0.1 跳过**不污染。结果：footer 显示持续累计，不受 1 年限制、D1 持久保存。
53. 修复首页/搜索出现重复卡片：同一文章在多分组（「我的」+文章分组）各存一条，导致搜"原创"出现两条相同"原创诗词"；在 `src/components/feed/index.js` `filtered()` 结果按「标题+分类」去重，优先保留静态页链接（顺带修复"中文简历/英文简历"同款重复，全量 94→91 无误删）。

54. 复刻 **zhheo 赞赏功能**：文章底部 post-copyright **赞赏卡片**（浅灰底圆角 12px、66px 圆形头像探顶 + 黄环 + 白底、hover 内部回缩动效、打赏红/订阅绿按钮 + codesign 字体图标、作者名 hover 主题色圆角框新标签跳首页、卡片插在广告上方）+ 独立**赞赏页 `reward.html`**（Hero 形象、微信/支付宝二维码卡 + Ko-fi 方形图标按钮卡、表格式支持者记录 + 金额分级（红≥50/橙≥20）+ 分页（首页/上一页/下一页/尾页）+ 排序（按日期/按金额）、规则卡）。
55. 项目审计清理：全项目 + git 历史扫描 **无真实泄密**（无 API key/token/密码/密钥/.env，命中均为教程示例、占位符、公开联系邮箱）；清理 ExFAT 自动生成的 6 个 `._` AppleDouble 文件与无引用图标 `src/images/icons/link.png`；确认全部 JS/CSS/组件在用、无死代码注释、无重复文件。

# 兼容处理部署脚本

```bash
git pull --rebase origin main

git rebase --continue

git push origin main
```
