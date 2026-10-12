---
title: Vue文档
date: 2026-09-11
category: Vue
description: "Vue 3 开发文档 Vue 是什么 Vue 是一套用于构建用户界面的渐进式框架。它的核心专注于视图层，易学易用，同时也能通过官方生态（Vue Router、Pinia）与工具链支持构建复杂的单页应用（SPA）。Vue 3 引入了组合式 API（Composition API）、更快的虚拟 DOM 与更好的 TypeScript 支持，是目前主流的前端框架之一。 组件基础 组件是 Vue 应用的基本单元，一个组件由模板、脚本与样式组成： 使用 <script setup 是 Vue 3 推荐的写法，代码更简洁，且自动获得更好的类型推导。 响应式原理 Vue 的响应式系统让数据变化自动驱动视图更"
---

# Vue 3 开发文档

## Vue 是什么

Vue 是一套用于构建用户界面的**渐进式框架**。它的核心专注于视图层，易学易用，同时也能通过官方生态（Vue Router、Pinia）与工具链支持构建复杂的单页应用（SPA）。Vue 3 引入了组合式 API（Composition API）、更快的虚拟 DOM 与更好的 TypeScript 支持，是目前主流的前端框架之一。

## 组件基础

组件是 Vue 应用的基本单元，一个组件由模板、脚本与样式组成：

```vue
<script setup>
import { ref } from 'vue';

const count = ref(0);
function increment() {
  count.value++;
}
</script>

<template>
  <button @click="increment">点击次数：{{ count }}</button>
</template>

<style scoped>
button { padding: 8px 16px; }
</style>
```

使用 `<script setup>` 是 Vue 3 推荐的写法，代码更简洁，且自动获得更好的类型推导。

## 响应式原理

Vue 的响应式系统让数据变化自动驱动视图更新。核心 API 是 `ref` 与 `reactive`：

```javascript
import { ref, reactive, computed } from 'vue';

// ref 包装基本类型
const name = ref('张三');
name.value = '李四'; // 通过 .value 修改

// reactive 包装对象
const state = reactive({ list: [] });
state.list.push(1);

// computed 派生状态
const doubled = computed(() => count.value * 2);
```

在模板中 `ref` 会自动解包，直接写 `{{ name }}` 即可，无需 `.value`。

## 组合式 API 与生命周期

组合式 API 通过 `setup` 内的函数组织逻辑，并把可复用的逻辑抽取成自定义函数（Composable）：

```javascript
import { onMounted, onUnmounted, ref } from 'vue';

export function useWindowSize() {
  const width = ref(window.innerWidth);
  function onResize() { width.value = window.innerWidth; }
  onMounted(() => window.addEventListener('resize', onResize));
  onUnmounted(() => window.removeEventListener('resize', onResize));
  return { width };
}
```

常用生命周期钩子：`onMounted`（挂载后）、`onUpdated`（更新后）、`onUnmounted`（卸载前）。在 `onUnmounted` 中清理事件监听与定时器，避免内存泄漏。

## 插槽与动态组件

**插槽（Slot）** 用于组件内容分发，让父组件向子组件传入模板：

```vue
<!-- 子组件 Card.vue -->
<template>
  <div class="card">
    <slot name="title">默认标题</slot>
    <slot />
  </div>
</template>

<!-- 父组件 -->
<Card>
  <template #title>我的卡片</template>
  这是卡片内容
</Card>
```

**动态组件** 通过 `<component :is="...">` 按需切换：

```vue
<component :is="currentComponent" />
```

## Vue Router 路由

Vue Router 是 Vue 官方的路由解决方案。核心概念包括路由表、动态路由、导航守卫与传参。

### 路由配置

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Detail from '../views/Detail.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/detail/:id', name: 'detail', component: Detail },
  ],
});
```

### 路由对象与路由方法

在组件中通过组合式 API 访问路由：

```javascript
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();   // 当前路由对象
const router = useRouter(); // 路由实例

// 读取路由参数 $route.params
console.log(route.params.id);

// 编程式导航 $router.push
router.push({ name: 'detail', params: { id: 42 } });
```

- `$route.params`：动态路由参数（`:id`）。
- `$route.query`：查询参数（`?page=1`）。
- `$route.name`：路由名称。

### 导航守卫

导航守卫在路由跳转前/后执行，常用于登录鉴权：

```javascript
router.beforeEach((to, from, next) => {
  const isLogin = localStorage.getItem('token');
  if (to.meta.requiresAuth && !isLogin) {
    next({ name: 'login' });
  } else {
    next();
  }
});
```

### 路由传参

- **路径参数**：`/detail/:id`，读取 `route.params.id`。
- **查询参数**：`router.push('/list?page=2')`，读取 `route.query.page`。
- **props 传参**：在路由表中配置 `props: true`，让参数直接作为组件 props 传入，更利于组件复用与测试。

## 状态管理选型

Vue 3 官方推荐 **Pinia** 作为状态管理库：

```javascript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  function setUser(u) { user.value = u; }
  return { user, setUser };
});
```

只在跨组件共享的状态才放入全局 store，局部状态用 `ref` 即可。

## 工程化建议

1. **项目结构**：按功能模块组织 `views` / `components` / `composables` / `stores`。
2. **TypeScript**：Vue 3 对 TS 支持优秀，建议开启以获得类型安全。
3. **性能**：路由懒加载（`import()`）、组件异步、虚拟列表，减少首屏体积。
4. **代码规范**：配合 ESLint + Prettier 统一风格。
5. **组合式优先**：用 Composable 抽取可复用逻辑，提升可维护性。

掌握组件、响应式、路由与状态管理，即可用 Vue 3 高效构建结构清晰、可维护的现代前端应用。
