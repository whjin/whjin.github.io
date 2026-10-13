---
title: Vite与Webpack对比
date: 2026-09-11
category: 工程化
description: "最本质的差异：Webpack 是先打包、后服务的 Bundle 驱动模式；Vite 是先服务、按需编译的 ESM 原生驱动模式。 这一个架构差异，决定了两者在启动速度、热更新、生产构建、配置复杂度上的所有区别。 延伸阅读：想深入理解 Webpack 的内部打包机制，可参考我之前写的 Webpack原理详解。 一、架构原理：为什么 Vite 启动这么快 Webpack 的工作方式 Webpack 从入口文件 index.js 开始，递归分析所有 import 和 require，把整个依赖树打包成一个或多个 bundle.js。这个过程必须在启动开发服务器之前完成。项目越大，依赖越多，打包时间越"
---

> 最本质的差异：**Webpack 是先打包、后服务的 Bundle 驱动模式；Vite 是先服务、按需编译的 ESM 原生驱动模式。** 这一个架构差异，决定了两者在启动速度、热更新、生产构建、配置复杂度上的所有区别。
>
> 延伸阅读：想深入理解 Webpack 的内部打包机制，可参考我之前写的 [Webpack原理详解](https://wuhuajin.com/src/template/posts/JavaScript/html/Webpack原理详解.html)。

## 一、架构原理：为什么 Vite 启动这么快

### Webpack 的工作方式

Webpack 从入口文件 `index.js` 开始，递归分析所有 `import` 和 `require`，把整个依赖树打包成一个或多个 `bundle.js`。这个过程必须在**启动开发服务器之前**完成。项目越大，依赖越多，打包时间越长。

一个中等规模的 React 项目（300+ 模块），Webpack 冷启动通常需要 **10 秒到 1 分钟**。大型 monorepo 项目甚至要几分钟。

### Vite 的工作方式

Vite 利用现代浏览器原生支持的 **ES Module（ESM）** 特性，把"打包"这件事拆成了两步：

1. **预构建依赖**：用 `esbuild`（Go 编写，比 JS 快 10-100 倍）把第三方 npm 包预编译成 ESM 格式。这一步只在 `node_modules` 变化时执行一次。
2. **按需编译源码**：浏览器请求哪个模块（比如 `/src/App.jsx`），Vite 才即时编译那个文件并返回。未被请求的模块完全不处理。

这就是为什么 Vite 冷启动几乎与项目规模无关——**不管你有 10 个文件还是 10000 个文件，启动时间都是 1-3 秒。**

```
Webpack:  打包全部 → 启动服务器 → 浏览器加载 bundle
Vite:     预构建依赖 → 启动服务器 → 浏览器请求哪个文件，编译哪个文件
```

## 二、开发体验对比

### 冷启动与二次启动

| 维度 | Webpack | Vite |
|------|---------|------|
| 冷启动耗时 | 与项目规模正相关，中型项目 10-60s，大型项目 1-5min | 几乎与规模无关，通常 1-3s |
| 二次启动 | 依赖缓存优化，但仍需重新打包变更的依赖树 | 预构建结果强缓存（`node_modules/.vite`），二次启动几乎瞬时 |
| 首次 `npm run dev` | 需完整打包，无缓存可用 | esbuild 预构建依赖后即可启动 |

### 热更新（HMR）

HMR（Hot Module Replacement）是开发体验的核心——改一行代码，浏览器只替换变更模块而不刷新整个页面。

| 维度 | Webpack | Vite |
|------|---------|------|
| 更新原理 | 重新打包变更模块及其所有依赖，替换整个 chunk | 基于 ESM 精确更新变更的单个模块，不影响其他模块 |
| 更新耗时 | 与项目规模正相关，大型项目 5-10s | 毫秒级，与项目规模完全无关 |
| 状态保留 | 部分框架需要额外插件支持，容易状态丢失 | 原生支持更好，React/Vue 状态保留稳定 |
| 整页刷新 | 复杂变更可能触发整页刷新 | 极少触发整页刷新 |

**实际感受**：Webpack 项目改完代码，切到浏览器要等几秒才能看到效果；Vite 项目几乎是"打字即所见"。

## 三、生产构建对比

开发时 Vite 快，但生产环境才是真正决定用户体验的环节。

| 维度 | Webpack | Vite |
|------|---------|------|
| 构建工具 | 自身全流程打包 | 开发用 esbuild 预构建，生产用 Rollup 打包 |
| 构建速度 | 中等，大型项目耗时较长 | 比 Webpack 快 2-5 倍 |
| Tree Shaking | 支持，但需正确配置 `sideEffects` | Rollup 天然支持，默认更彻底 |
| 代码分割 | 需手动配置 `optimization.splitChunks` | 内置自动代码分割，动态 `import()` 自动分包 |
| 产物体积 | 通常更大（冗余代码多） | 通常更小（Rollup 优化更激进） |
| CSS 处理 | 需 `mini-css-extract-plugin` 等插件 | 内置 CSS 代码分割、压缩 |
| 浏览器兼容 | 原生支持低版本浏览器（IE11 等） | 默认仅支持现代浏览器，需 `@vitejs/plugin-legacy` |

> **关键提醒**：Vite 生产构建用的是 [Rollup](https://rollupjs.org/) 而非 [esbuild](https://esbuild.github.io/)，因为 Rollup 在代码分割、Tree Shaking、产物体积优化上更成熟。esbuild 目前不支持代码分割，不适合生产打包。

## 四、配置复杂度与生态

### 配置方式

```js
// Webpack: 一个完整的 React 配置可能需要 200+ 行
module.exports = {
  entry: './src/index.js',
  output: { filename: 'bundle.js', path: '/dist' },
  module: {
    rules: [
      { test: /\.jsx?$/, use: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.(png|jpg)$/, type: 'asset' },
    ]
  },
  plugins: [new HtmlWebpackPlugin({ template: './public/index.html' })],
  optimization: { splitChunks: { chunks: 'all' } }
}

// Vite: 大部分需求零配置，vite.config.js 通常不到 20 行
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
})
```

Vite 内置了 TypeScript、JSX、CSS Modules、JSON、静态资源处理，不需要装 loader。配置量比 Webpack 减少约 70%。

### 生态成熟度

| 维度 | Webpack | Vite |
|------|---------|------|
| Loader/Plugin 数量 | 极其丰富，几乎任何构建需求都有现成方案 | 主流框架官方支持，小众场景插件仍在增长 |
| 文档与社区 | 十余年积累，问题搜索命中率极高 | 文档完善，社区活跃但案例相对少 |
| 企业级项目存量 | 大量老项目仍在使用 | 新项目首选 |
| 自定义构建逻辑 | 通过 plugin API 可以深度介入打包流程 | Rollup 插件 API，能力稍弱但够用 |

## 五、什么时候选 Vite，什么时候选 Webpack

### 选 Vite 的情况

- **新项目**：React、Vue、Svelte、Solid 等主流框架的新项目
- **追求开发体验**：每天大量时间在 `npm run dev` 上
- **现代浏览器为主**：不需要兼容 IE11 及以下
- **中小型应用**：SPA、中后台管理系统、文档站

### 仍需 Webpack 的情况

- **需要兼容 IE11**：Vite 的 legacy 插件虽能解决，但配置成本高，不如 Webpack 直接
- **极其复杂的自定义构建**：比如需要在打包流程中做深度定制的企业级项目
- **老项目迁移成本高**：已有大量 Webpack 定制 plugin，迁移收益不大
- **模块联邦（Module Federation）**：Webpack 的微前端方案生态更成熟，Vite 虽有支持但案例较少

## 六、从 Webpack 迁移到 Vite 的步骤

1. **安装依赖**：`npm install vite @vitejs/plugin-react -D`
2. **调整入口**：把 `public/index.html` 移到项目根目录，改成 Vite 的入口 HTML（用 `<script type="module" src="/src/index.jsx">` 引入）
3. **创建 `vite.config.js`**：按需配置别名、代理、环境变量
4. **替换 require**：Webpack 的 `require.context` 改成 Vite 的 `import.meta.glob`
5. **处理 `process.env`**：改成 `import.meta.env.VITE_XXX`
6. **删除 webpack 相关配置**：移除 `webpack.config.js`、loader、plugin
7. **更新 scripts**：`"dev": "vite"`, `"build": "vite build"`, `"preview": "vite preview"`

### 常见迁移坑

- **`require()` 写法**：Vite 不支持 CommonJS 的 `require`，全部改成 `import`
- **静态资源路径**：Webpack 里 `require('./image.png')` 改成 `import image from './image.png'` 或用 `new URL('./image.png', import.meta.url).href`
- **环境变量**：`process.env.NODE_ENV` 改成 `import.meta.env.MODE`，自定义变量必须以 `VITE_` 开头
- **CSS 预处理器**：Vite 内置支持 Sass/Less/Stylus，装对应的 npm 包即可

## 总结

| 场景 | 推荐选择 |
|------|---------|
| 新项目、现代浏览器、追求开发速度 | **Vite** |
| 需要兼容老浏览器、复杂定制构建、模块联邦 | **Webpack** |
| 老项目维护 | 继续 Webpack，不急着迁移 |
| 学习目的 | 两个都学，理解打包原理比工具本身重要 |

Vite 不是 Webpack 的替代品，而是**面向现代浏览器的新一代构建工具**。它用架构创新解决了 Webpack 的核心痛点——慢。但工具的选择始终服务于项目需求，没有银弹。

## 相关阅读

- [Webpack原理详解](https://wuhuajin.com/src/template/posts/JavaScript/html/Webpack原理详解.html) — 深入 Webpack 打包机制、Loader、Plugin
- [Docker部署Meting API服务](https://wuhuajin.com/src/template/posts/工程化/html/Docker部署Meting%20API服务.html) — 自托管服务的完整部署流程
- 官方文档：[Vite](https://vitejs.dev/guide/) · [Webpack](https://webpack.js.org/concepts/) · [esbuild](https://esbuild.github.io/) · [Rollup](https://rollupjs.org/)
