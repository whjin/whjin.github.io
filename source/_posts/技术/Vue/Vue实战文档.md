---
title: Vue实战文档
date: 2019-10-12 00:36:21
updated: 2026-03-12 09:55:36
category: ['技术']
tags: ['前端', 'Vue']
cover: https://s1.imagehub.cc/images/2026/03/03/8e4f1f01d22dbc77372423dbbb68f8e0.md.jpeg
main_color: '#42B883'
---

# 作用域插槽

Vue3中 `h()` 函数的标准签名为：`h(组件/标签, 属性对象, 子节点/插槽对象)`。

作用域插槽的核心是 **通过函数接收子组件传递的上下文数据**，在Vue3中，给组件传递插槽必须放在 `h()` 的第三个参数，且格式为 `{ 插槽名: (scope) => 返回 VNode }`。

# 路由

Vue Router的路由守卫官方标准分为三类：全局路由守卫、路由独享（单个路由）守卫、组件内路由守卫。

**全局路由守卫 钩子函数**

- 全局前置守卫 `beforeEach`
- 全局解析守卫 `beforeResolve`
- 全局后置钩子 `afterEach`

**单个路由独享守卫 只有一个钩子**

`beforeEnter`，直接配置在单条路由的配置项中，仅对当前路由生效。

**组件内路由守卫 三个标准钩子**

- `beforeRouteEnter` 进入组件前触发
- `beforeRouteUpdate` 路由参数变化、组件复用时触发
- `beforeRouteLeave` 离开组件前触发

# 通信

> 父子组件通信
> 兄弟组件通信
> 祖孙 后代 通信
> 非关系组件通信

## 父子组件通信

父组件 --> 子组件 `props`
子组件 --> 父组件 `$emit` `ref`

## 兄弟组件通信

**`EventBus`**

```javascript
class EventBus {
  constructor() {
    this.callbacks = {};
  }
  $on(name, fn) {
    this.callbacks[name] = this.callbacks[name] || [];
    this.callbacks[name].push(fn);
  }
  $emit(name, args) {
    if (this.callbacks[name]) {
      this.callbacks[name].forEach((cb) => cb(args));
    }
  }
}

Vue.prototype.$bus = new EventBus();

this.$bus.$emit('foo');
this.$bus.$on('foo', handler);
```

**`parent` `root` 适用于 有共同祖先**

```javascript
this.$parent.emit('add');
this.$parent.on('add', this.add);
```

**`attrs` `listeners` 祖先传递给子孙 隔代传递**

```javascript
<p>{{ $attrs.foo }}</p>
<Child foo="foo"></Child>

<Childs msg="hello" @some-event="onSomeEvent"></Childs>
<GrandSon v-bind="$attrs" v-on="$listeners"></GrandSon>
<div @click="$emit('some-event','msg from grandson')"></div>
```

**provide inject**

`provide` 父组件
`inject` 子组件

**vuex**

`vuex`是一个状态管理器插件，适合数据共享多的项目。

- `state`：定义存储数据的仓库，可通过`this.$store.state`或`mapState`访问；
- `getters`：获取`store`值，可认为是`store`的计算属性，可通过`this.$store.getters`或`mapGetters`访问；
- `mutations`：同步改变`store`值，为什么会设计成同步，因为`mutation`是直接改变`store`值，`Vue`对操作进行了记录，如果是异步无法追踪改变，可通过`mapMutations`调用；
- `actions`：异步调用函数执行`mutation`，进而改变`store`值，可通过`this.$dispatch`或`mapActions`访问；
- `modules`：模块，如果状态过多，可以拆分成模块，最后在入口通过`...`解构引入。
