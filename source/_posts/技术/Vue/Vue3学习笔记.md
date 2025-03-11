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
2. [app.provide()](#provide)
3. [app.config.errorHandler](#errorHandler)
4. [访问Props](#Props)

# nextTick

等待下一次`DOM`更新刷新的工具方法。

在`Vue`中更改响应式状态时，最终的`DOM`更新并不是同步生效，而是由`Vue`将它们缓存在一个队列中，直到下一个`tick`才一起执行。这样是为了确保每个组件无论发生多少状态改变，都仅执行一次更新。

`nextTick()`可以在状态改变后立即使用，以等待`DOM`更新完成。

# provide

提供一个值，可以在应用中的所有后代组件中注入使用。

第一个参数应当是注入的`key`，第二个参数则是提供的值。返回应用实例本身。

```javascript
import { provide } from 'vue';
provide('message', 'hello');

// 组件
import { inject } from 'vue';
inject('message');
```

# errorHandler

用于为应用内抛出的未捕获错误指定一个全局处理函数。

# Props

`setup`函数的第一个参数是组件的`props`。和标准的组件一致，一个`setup`函数的`props`是响应式的，并且会在传入新的`props`时同步更新。

如果解构了`props`对象，解构出的变量将会丢失响应性。因此我们推荐通过`props.xxx`的形式来使用其中的`props`。

如果确实需要解构`props`对象，或需要将某个`props`传到一个外部函数中并保持响应性，那么你可以使用`toRefs()`和`toRef()`这两个工具函数。

```javascript
import { toRef, toRefs } from 'vue';
const props = defindeProps({});
const { title } = toRefs(props);
const title = toRef(props, 'title');
```

