---
title: AI项目文档
date: 2026-09-11
category: AI
description: "Next.js 是 React 生态最流行的服务端渲染框架。它把 React 项目需要自己配的 Webpack、路由、代码拆分、服务端渲染全部内置了。这篇文章快速过一遍它的核心特性。 一、零配置 开箱即用：自动编译、打包、热更新，不需要写 Webpack 配置。TypeScript、CSS、Sass、图片优化全部内置支持。 二、三种渲染模式 Next.js 最大的优势是在一个项目里同时支持三种渲染： 模式 全称 什么时候渲染 适用场景 SSG Static Site Generation 构建时预渲染成静态 HTML 博客、文档、营销页 SSR Server-Side Rendering 每次"
---

Next.js 是 React 生态最流行的服务端渲染框架。它把 React 项目需要自己配的 Webpack、路由、代码拆分、服务端渲染全部内置了。这篇文章快速过一遍它的核心特性。

## 一、零配置

开箱即用：自动编译、打包、热更新，不需要写 Webpack 配置。TypeScript、CSS、Sass、图片优化全部内置支持。

## 二、三种渲染模式

Next.js 最大的优势是在一个项目里同时支持三种渲染：

| 模式 | 全称 | 什么时候渲染 | 适用场景 |
|------|------|-------------|---------|
| **SSG** | Static Site Generation | 构建时预渲染成静态 HTML | 博客、文档、营销页 |
| **SSR** | Server-Side Rendering | 每次请求时服务端渲染 | 数据频繁变化的页面 |
| **ISR** | Incremental Static Regeneration | 构建后按需增量更新静态页 | 兼顾性能和新鲜度 |

```js
// pages/blog/[id].js
export async function getStaticProps() {
  // 构建时执行，返回的数据注入页面
  return { props: { posts: await fetchPosts() } };
}
```

## 三、文件系统路由

`pages` 目录下的每个文件自动成为一个路由，不需要手动配路由表：

```
pages/
├── index.js          → /
├── about.js          → /about
├── blog/
│   ├── index.js      → /blog
│   └── [id].js       → /blog/:id（动态路由）
└── api/
    └── hello.js      → /api/hello（后端 API）
```

## 四、API 路由

在 `pages/api/` 目录下写 Node.js 函数，直接变成后端 API：

```js
// pages/api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello!' });
}
```

这意味着一个项目同时包含前端页面和后端接口，不需要单独起 Express 服务。

## 五、内置优化

- **自动代码拆分**：每个页面只加载需要的 JS
- **预取导航**：`<Link>` 组件在视口内自动预取目标页面
- **CSS Modules**：组件级样式隔离，无需额外配置
- **Sass 支持**：装 `sass` 包即可用
- **图片优化**：`<Image>` 组件自动压缩、懒加载、响应式

## 六、什么时候选 Next.js

- **SEO 要求高**：博客、电商、企业官网需要服务端渲染
- **全栈项目**：想在一个仓库里同时写前端和后端 API
- **React 项目需要优化**：自动代码拆分和图片优化开箱即用

## 相关阅读

- [AI应用开发学习路线图](https://wuhuajin.com/src/template/posts/AI/html/AI应用开发学习路线图.html) — AI 开发学习路径
- [AI前端](https://wuhuajin.com/src/template/posts/AI/html/AI前端.html) — AI 前端技术栈
- [Next.js 官方文档](https://nextjs.org/docs)
