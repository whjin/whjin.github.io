---
title: 大数据集Tree组件
date: 2026-02-11 15:36:05
updated:
category: ['技术']
tags: ['前端', '表格', 'Tree组件', '大数据集']
cover: https://s1.imagehub.cc/images/2026/02/11/0d52c1904c992c456467acd5a4619aaa.md.png
main_color:
keywords:
description:
top_img:
comments:
aside:
---

> 虚拟列表：只渲染可视区域元素，通过占位容器模拟滚动条。
> 树的特殊性：需出来层级关系、展开折叠动态变化，二者结合即为虚拟树（Virtual Tree）。

### 数据结构转化

递归遍历树节点，转化为线性数组并记录层级、展开状态、父子关系：

```javascript
function flattenTree(root, level = 0, result = []) {
  const node = { ...root, level, expanded: false };
  result.push(node);
  if (node.children && node.expanded) {
    node.children.forEach(child => flattenTree(child, level + 1, result));
  }
  return result;
}
```

### 滚动事件

通过容器`scrollTop`动态计算当前可视区域索引：

```javascript
const startIdx = Math.floor(scrollTop / itemHeight);
const endIdx = startIdx + Math.ceil(containerHeight / itemHeight);
```

### 动态渲染可视节点

仅对`const visibleNodes = flatData.slice(startIdx, endIdx)`执行`DOM`渲染。

### 占位元素模拟滚动条

设置占位块高度为 **总高度 = 节点数 x 单节点高度**

### 关键问题与解决策略

| 难点                 | 原因                   | 解决方案          |
| -------------------- | ---------------------- | ----------------- |
| 展开折叠导致高度突变 | 子节点隐藏后总高度减少 | ①递归更新子节点`visible`状态 ②重算高度并重置`scrollTop` |
| 动态节点高度兼容 | 内容换行/图标差异导致高度不一 | ①使用`resizeObserver`监听高度变化 ②缓存节点实际高度，滚动用高度累加值计算 |
| 搜索/定位性能瓶颈 | 递归遍历万级节点耗时长 | 建立节点索引`Map (id -> {node, parent })` + 后端返回节点路径只展开关键分支 |
| 内存占用暴涨 | 海量数据转响应式对象开销大 | ①`Object.freeze`冻结非活动数据 ②使用`shallowRef`替代`reactive` |
| 浏览器渲染上限 | 滚动容器最大高度约1677像素 | 分块加载（懒加载 + 虚拟滚动结合） |

### 性能优化方向

**1、懒加载 + 虚拟滚动**

- 初始只加载首屏数据
- 展开父节点时异步请求子数据，动态插入扁平列表
- 已加载节点纳入虚拟滚动管理

**2、渲染性能极限优化**

- 减少重复渲染：`v-once` (Vue)或`React.memo` 缓存静态节点
- GPU加速滚动：`transform: translateY()`取代`top`定位
- 请求空闲期处理：用`requestIdleCallback`预计算展开路径


> 引用原文：https://juejin.cn/post/7533048503934976009
