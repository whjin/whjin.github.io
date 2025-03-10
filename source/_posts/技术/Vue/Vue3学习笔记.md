---
title: Vue3学习笔记
date: 2025-03-10 23:11:02
updated: 2025-3-10 23:12:12
category: ['技术']
tags: ['前端','Vue3']
cover: https://image-static.segmentfault.com/351/673/351673032-67cf045cefb8b_cover
main_color:
keywords:
description:
top_img:
comments:
aside: "#42B883"
---

1. [nextTick()](#nextTick)

# nextTick

等待下一次`DOM`更新刷新的工具方法。

在`Vue`中更改响应式状态时，最终的`DOM`更新并不是同步生效，而是由`Vue`将它们缓存在一个队列中，直到下一个`tick`才一起执行。这样是为了确保每个组件无论发生多少状态改变，都仅执行一次更新。

`nextTick()`可以在状态改变后立即使用，以等待`DOM`更新完成。