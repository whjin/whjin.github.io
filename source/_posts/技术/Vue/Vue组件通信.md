---
title: Vue组件通信
date: 2019-10-12 00:36:21
updated: 2026-03-03 12:41:59
category: ['技术']
tags: ['前端', 'Vue']
cover: https://s1.imagehub.cc/images/2026/03/03/8e4f1f01d22dbc77372423dbbb68f8e0.md.jpeg
main_color: '#42B883'
---

> 父子组件通信
> 兄弟组件通信
> 祖孙 后代 通信
> 非关系组件通信

# 父子组件通信

父组件 --> 子组件 `props`
子组件 --> 父组件 `$emit` `ref`

# 兄弟组件通信

- `EventBus`

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

- `parent` `root` 适用于 有共同祖先

```javascript
this.$parent.emit('add');
this.$parent.on('add', this.add);
```

- `attrs` `listeners` 祖先传递给子孙 隔代传递

```javascript
<p>{{ $attrs.foo }}</p>
<Child foo="foo"></Child>

<Childs msg="hello" @some-event="onSomeEvent"></Childs>
<GrandSon v-bind="$attrs" v-on="$listeners"></GrandSon>
<div @click="$emit('some-event','msg from grandson')"></div>
```

# provide inject 

`provide` 父组件 
`inject` 子组件

# vuex

`vuex`是一个状态管理器插件，适合数据共享多的项目。

- `state`：定义存储数据的仓库，可通过`this.$store.state`或`mapState`访问；
- `getters`：获取`store`值，可认为是`store`的计算属性，可通过`this.$store.getters`或`mapGetters`访问；
- `mutations`：同步改变`store`值，为什么会设计成同步，因为`mutation`是直接改变`store`值，`Vue`对操作进行了记录，如果是异步无法追踪改变，可通过`mapMutations`调用；
- `actions`：异步调用函数执行`mutation`，进而改变`store`值，可通过`this.$dispatch`或`mapActions`访问；
- `modules`：模块，如果状态过多，可以拆分成模块，最后在入口通过`...`解构引入。