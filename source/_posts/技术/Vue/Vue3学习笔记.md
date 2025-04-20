---
title: Vue3学习笔记
date: 2025-03-10 23:11:02
updated: 2025-3-10 23:12:12
category: ['技术']
tags: ['前端','Vue3']
cover: https://s1.imagehub.cc/images/2025/04/09/adec073e7f03b1bd918cde85fc46ad5e.md.webp
main_color: "#42B883"
keywords:
description:
top_img:
comments:
aside: 
---

# 全局API

## nextTick

等待下一次`DOM`更新刷新的工具方法。

在`Vue`中更改响应式状态时，最终的`DOM`更新并不是同步生效，而是由`Vue`将它们缓存在一个队列中，直到下一个`tick`才一起执行。这样是为了确保每个组件无论发生多少状态改变，都仅执行一次更新。

`nextTick()`可以在状态改变后立即使用，以等待`DOM`更新完成。

## app.provide

提供一个值，可以在应用中的所有后代组件中注入使用。

第一个参数应当是注入的`key`，第二个参数则是提供的值。返回应用实例本身。

```js
import { provide } from 'vue';
provide('message', 'hello');

// 组件
import { inject } from 'vue';
inject('message');
```

## app.config.errorHandler

用于为应用内抛出的未捕获错误指定一个全局处理函数。

## 访问Props

`setup`函数的第一个参数是组件的`props`。和标准的组件一致，一个`setup`函数的`props`是响应式的，并且会在传入新的`props`时同步更新。

如果解构了`props`对象，解构出的变量将会丢失响应性。因此我们推荐通过`props.xxx`的形式来使用其中的`props`。

如果确实需要解构`props`对象，或需要将某个`props`传到一个外部函数中并保持响应性，那么你可以使用`toRefs()`和`toRef()`这两个工具函数。

```js
import { toRef, toRefs } from 'vue';
const props = defindeProps({});
const { title } = toRefs(props);
const title = toRef(props, 'title');
```
# 组合式API

## setup

传入`setup`函数的第二个参数是一个`setup`上下文。

```js
export default {
  setup(props, context) {
    // 透传 Attributes (非响应式的对象，等价于 $attrs)
    console.log(context.attrs);

    // 插槽（非响应式的对象，等价于 $slot）
    console.log(context.slots);

    // 触发事件（函数，等价于 $emit）
    console.log(context.emit);

    // 暴露公共属性（函数）
    console.log(context.expose);
  },
};
```

该上下文对象是非响应式的，可以安全地解构：
```js
export default {
  setup(props, { attrs, slots, emit, expose }) {},
};
```
`attrs`和`slots`都是有状态的对象，它们总是会随着组件自身的更新而更新。这意味着应当避免解构它们，并始终通过`attrs.x`或`slots.x`的形式使用其中的属性。此外还需注意，和`props`不同，`attrs`和`slots`的属性都不是响应式的。如果想要基于`attrs`或`slots`的改变来执行副作用，那么你应该在`onBeforeUpdate`生命周期狗子中编写相关逻辑。

## expose

`expose`函数用于显示地限制该组件暴露出的属性，当父组件通过模板引用访问该组件的实例时，将仅能访问`expose函数暴露出的内容`：

```js
export default {
  setup(props, { expose }) {
    // 让组件实例处于“关闭状态”
    // 即不向父组件暴露任何东西
    expose();

    const publicCount = ref(0);
    const privateCount = ref(0);
    // 有选择地暴露局部状态
    expose({ count: publicCount });
  },
};
```

## h

`setup`也可以返回一个渲染函数，此时在渲染函数中可以直接使用在同一作用域下声明的响应式状态：

```js
import { h, ref } from 'vue';

export default {
  setup() {
    const count = ref(0);
    return () => h('div', count.value);
  },
};
```

返回一个渲染函数将会阻止我们返回其他东西。对于组件内部来说，这样没问题，但如果我们想通过模板引用将这个组件的方法暴露给父组件，那就有问题了。

可以通过调用`expose()`解决这个问题：

```js
import { h, ref } from 'vue';

export default {
  setup(props, { expose }) {
    const count = ref(0);
    const increment = () => ++count.value;

    expose({ increment });
    
    return () => h('div', count.value);
  },
};
```
此时父组件可以通过模板引用来访问这个`increment`方法。

# 响应式API：核心

## ref

接受一个内部值，返回一个响应式的、可更改的`ref`对象，此对象只有一个指向其内部值的属性`.value`。

如果将一个对象赋值给`ref`，那么这个对象将通过`reactive()`转为具有深层次响应式的对象。这也意味着如果对象中包含了嵌套的`ref`，它们将被深层地解包。

如果要避免这种深层次的转换，请使用`shallowRef()`来替代。

## computed

接受一个`getter`函数，返回一个只读的响应式`ref`对象。该`ref`通过`.value`暴露`getter`函数的返回值。它可以接受一个带有`get`和`set`函数的对象来创建一个可写的`ref`对象。

## reactive

返回一个对象的响应式代理。

响应式转换是“深层”的：它会影响到所有嵌套的属性。一个响应式对象也将深层地解包任何`ref`属性，同时保持响应性。

值得注意的是，当访问到某个响应式数组或`Map`这样的原生集合类型中的`ref`元素时，不会执行`ref`的解包。

若要避免深层响应式转换，只想保留对这个对象顶层次访问的响应性，请使用`shallowReactive()`来替代。

返回的对象以及其中嵌套的对象都会通过`ES Proxy`包裹，因此不等于源对象，建议只使用响应式代理，避免使用原始对象。

注意当访问到某个响应式数组或`Map`这样的原生集合类型中的`ref`元素时，不会执行`ref`的解包：

```js
import { ref, reactive } from 'vue';

const books = reactive([ref('Vue 3 Guide')]);
console.log(books[0].value);

const map = reactive(new Map([['count', ref(0)]]));
console.log(map.get('count').value);
```
将一个`ref`赋值给一个`reactive`属性时，该`ref`会被自动解包。

## readonly

接受一个对象（响应式或普通对象）或是一个`ref`，返回一个原值的只读代理。

只读代理师深层的：对任何嵌套属性的访问都将是只读的。它的`ref`解包行为与`reactive`相同，但解包得到的值是只读的。

要避免深层级的转换行为，请使用`shallowReadonly()`来替代。

```js
import { reactive, readonly,watchEffect() } from 'vue';

const original = reactive({ count: 0 });
const copy = readonly(original);

watchEffect(()=>{
  // 用来做响应式追踪
  console.log(copy.count);
})

// 更改源属性会触发其依赖的侦听器
original.count++

// 更改该只读副本将会失败，并会得到一个警告
copy.count++ // warning!
```

## watchEffect

立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行。

第一个参数就是要运行的副作用函数。这个副作用函数的参数也是一个函数，用来注册清理毁掉。清理回调会在该副作用下一次执行前被调用，可以用来清理无效的副作用。

第二个参数是一个可选的选项，可以用来调整副作用的刷新时机或调试副作用的依赖。

默认情况下，侦听器将在组件渲染之前执行。设置`flush: 'post'`将会使侦听器延迟到组件渲染之后再执行。在某些特殊情况下（例如要使缓存失效），可能有必要在响应式依赖发生改变时立即触发侦听器。这可以通过设置`flush: 'sync'`来实现。然而，该设置应谨慎使用，因为如果有多个属性同时更新，这将导致一些性能和数据一致性的问题。

返回值是一个用来停止该副作用的函数。

```js
const count = ref(0);
watchEffect(() => console.log(count.value)); // 输出0
count.value++; // 输出1
```

**停止侦听器：**

```js
const stop = watchEffect(() => {});
// 当不再需要此侦听器时
stop();
```

**暂停/恢复侦听器：**

```js
const { stop, pause, resume } = watchEffect(() => {});

// 暂停侦听器
pause();
// 恢复
resume();
// 停止
stop();
```

副作用清理：

```js
watchEffect(async onCleanUp => {
  const { response, cancel } = duAsyncWork(newId);
  // 如果id变化，则调用cancel
  // 如果之前的请求未完成，则取消该请求
  onWatcherCleanup(cancel);
  data.value = await response;
});
```

## watch

侦听一个或多个响应式数据源，并在数据源变化时调用所给的回调函数。

`watch`默认是懒侦听的，即仅在侦听源发生变化时才执行回调函数。

第一个参数是侦听器的源。这个来源可以是一下几种：

- 一个函数，返回一个值
- 一个`ref`
- 一个响应式对象
- 有以上类型的值组成的数组

第二个参数是在发生变化时要调用的回调函数。这个回调函数接受三个参数：新值、旧值，以及一个用于注册副作用清理的回调函数。该回调函数会在副作用下一次重新执行前调用，可以用来清楚无效的副作用，例如等待中的异步请求。

当侦听多个来源时，回调函数接受两个数组，分别对应来源数组中的新值和旧值。

第三个可选的参数是一个对象，支持以下这些选项：

- `immediate`：在侦听器创建时立即触发回调。第一次调用时旧值是`undefined`。
- `deep`：如果源时对象，强制深度遍历，以便在深层级变更时触发回调。在`3.5+`中，此参数还可以是指示最大遍历深度的数字。
- `flush`：调整回调函数的刷新时机。
- `onTrack/onTrigger`：调试侦听器的依赖。
- `once`：`3.4+`回调函数只会运行一次。侦听器将在回调函数首次运行后自动停止。

与`watchEffect()`相比，`watch`使我们可以：
- 懒执行副作用；
- 更加明确是应该由哪个状态触发侦听器重新执行；
- 可以访问所侦听状态的前一个值和当前值。

```js
// 侦听一个getter函数
const state = reactive({ count: 0 });
watch(
  () => state.count,
  (newVal, oldVal) => {}
);

// 侦听一个ref
const count = ref(0);
watch(
  () => count,
  (newVal, oldVal) => {}
);
```

当侦听多个来源时，回调函数接受两个数组，分别对应来源数组中的新值和旧值：
```js
let foo = ref('foo');
let bar = ref('bar');
watch([foo, bar], ([fooNewVal, barNewVal], [fooOldVal, barOldVal]) => {});
```

当使用`getter`函数作为源时，回调只在此函数的返回值变化时才会触发。如果你想让回调在深层级变更时也能触发，你需要使用`{ deep: true }`强制侦听器进入深层级模式。在深层级模式时，如果回调函数由于深层级的变更而被触发，那么新值和旧值将是同一个对象。
```js
const state = reactive({ count: 0 });
watch(
  () => state,
  (newVal, oldVal) => {},
  { deep: true }
);
```

当直接侦听一个响应式对象时，侦听器会自动启用深层模式。

`watch()`和`watchEffect()`享有相同的刷新时机和调试选项：
```js
watch(source, callback, {
  flush: 'post',
  onTrack(e) {
    debugger;
  },
  onTrigger(e) {
    debugger;
  },
});
```

停止侦听器：
```js
const { stop, pause, resume } = watch(source, callback);
// 暂停侦听器
pause();
// 稍后恢复
resume();
// 停止
stop();
```

副作用清理：
```js
watch(id, async (newId, oldId, onCleanup) => {
  const { response, cancel } = doAsyncWork(newId);
  // 当id变化时，cancel将被调用
  // 取消之前的未完成的请求
  onCleanup(cancel);
  data.value = await response;
});

// 3.5+中副作用清理
watch(id, async newId => {
  const { response, cancel } = doAsyncWork(newId);
  onWatcherCleanup(cancel);
  data.value = await response;
});
```

## onWatcherCleanup() <sup>`3.5+`</sup>

注册一个清理函数，在当前侦听器即将重新运行时执行。只能在`watchEffect`作用函数或`watch`回调函数的同步执行期间调用（即不能在异步函数的`await`语句之后调用）。

