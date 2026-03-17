---
title: React实战文档
date: 2026-03-12 10:08:37
updated: 2026-03-16 15:26:20
category: ['技术']
tags: ['前端', 'React', '实战']
cover: https://s1.imagehub.cc/images/2026/03/12/aa2d27c9b2e55158adcf4d4d7909f94b.md.png
main_color: '#087EA4'
keywords:
description:
top_img:
comments:
aside:
sticky:
---

# useCallback

`use callback` + `React.memo` 是React中解决“内联回调导致子组件重渲染”的 **标准性能优化组合**，既保证了功能不变，又能高效稳定地减少冗余渲染。

`useCallback`是React专门用于 **缓存函数引用**的Hook，它会在依赖列表不变时，返回同一个函数引用。
将内联回调用 `use callback` 包裹，并精准限制依赖列表（只包含回调真正需要的变量），就能保证回调引用稳定，让 `React.memo` 的浅比较生效，从而避免子组件无意义重渲染，同时完全不改变原有功能。
