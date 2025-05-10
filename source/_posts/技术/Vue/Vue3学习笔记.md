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

# 响应式API：工具

## isRef()
检查某个值是否为`ref`。

返回值是一个类型板顶，这意味着`isRef`可以被用作类型守卫。

## toRef()
可以将值、`refs`或`getters`规范化为`refs`(3.3+)。

也可以基于响应式对象上的一个属性，创建一个对应的`ref`。这样创建的`ref`与其源属性保持同步：改变源属性的值将更新`ref`的值，反之亦然。
```js
const state = reactive({
  foo: 1,
  bar: 2,
});

// 双向ref，会与源属性同步
const fooRef = toRef(state, 'foo');
// 更改ref会更新源属性
fooRef.value++;
// 更改源属性也会更新该ref
state.foo++;

// 请注意，这不同于
const fooRef = ref(state.foo);
// 这个ref不会和 state.foo保持同步，因为这个ref()接收到的是一个纯数值
```

`toRef()`这个函数在你想要把一个`props`的`ref`传递给一个组合式函数时会很有用。

当`toRef`与组件`props`结合使用时，关于禁止对`props`做出更改的限制依然有效。尝试将新的值传递给`ref`等效于尝试直接更改`props`，这是不允许的。在这种场景下，你可以考虑使用带有`get`和`set`的`computed`替代。

当使用对象属性签名时，即使源属性当前不存在，`toRef()`也会返回一个可用的`ref`。这让它在处理可选`props`的时候格外实用，相比之下`toRefs()`就不会为可选`props`创建对应的`refs`。

## toRefs()

将一个响应式对象转换为一个普通对象，这个普通对象的每个属性都是指向源对象相应属性的`ref`。每个独立的`ref`都是使用`toRef()`创建的。

```js
const state = reactive({
  foo: 1,
  bar: 2,
});

const stateAsRefs = toRefs(state);
/* stateAsRefs 的类型：{
  foo: Ref<number>,
  bar: Ref<number>
} */
state.foo++;
stateAsRefs.foo.value++;
```

当从组合式函数中返回响应式对象时，`toRefs`相当有用。使用它，消费者组件可以解构/展开返回的对象而不会失去响应性。
```js
const useFeatureX = () => {
  const state = reactive({
    foo: 1,
    bar: 2,
  });

  // 基于状态的操作逻辑
  // 在返回时都转为ref
  return toRefs(state);
};

// 可以解构而不会失去响应性
const { foo, bar } = useFeatureX();
```
`toRefs`在调用时只会为源对象上可以枚举的属性创建`ref`。如果要为可能还不存在的属性创建`ref`，请改用`toRef`。

## isProxy()

检查一个对象是否是由`reactive()`、`readonly()`、`shallowReactive()`或`shallowReadonly()`创建的代理。

## isReactive()

检查一个对象是否是由`reactive()`或`shallowReactive()`创建的代理。

## isReadonly()

检查传入的值是否为只读对象。只读对象的属性可以更改，但它们不能通过传入的对象直接赋值。

通过`readonly()`和`shallowReadonly()`创建的代理都是只读的，类似于没有`set`函数的`computed()`的`ref`。

# 响应式API：进阶

## shallowRef()

`ref（）`的浅层作用形式。

和`ref()`不同，浅层`ref`的内部值将会原样存储和暴露，并且不会被深层递归地转为响应式。只有对`.value`的访问是响应式的。

`shallowRef()`常常用于对大型数据结构的性能优化或是与外部的状态管理系统集成。
```js
const state = shallowRef({ count: 1 });

// 不会触发更改
state.value.count = 2;
// 会触发更改
state.value = { count: 2 };
```

## customRef()

创建一个自定义的`ref`，显式声明对其依赖追踪和更新触发的控制方式。

`customRef()`预期接收一个工厂函数作为参数，这个工厂函数接受`track`和`trigger`两个函数作为参数，并返回一个带有`get`和`set`方法的对象。

一般来说，`track()`应该在`get()`方法中调用，而`trigger()`应该在`set()`中调用。然而事实上，你对何时调用、是否应该调用它们有完全的控制权。
```js
import { customRef } from 'vue';

export const useDebouncedRef = (value, delay = 200) => {
  let timer = null;
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
};

// 在组件中使用
import { useDebouncedRef } from './deboucedRef';
const text = useDebouncedRef('hello');
```

## toRaw()

根据一个`Vue`创建的代理返回其原始对象。

`toRaw()`可以返回由`reactive()`、`readonly()`、`shallowReactive()`或者`shallowReadonly()`创建的代理对应的原始对象。

这是一个可以用于临时读取而不引起代理访问/跟踪开销，或是写入而不触发更改的特殊方法。不建议保存对原始对象的持久引用，请谨慎使用。

## markRaw()

将一个对象标记为不可被转为代理。返回该对象本身。

## effectScope()

创建一个`effect`作用域，可以捕获其中所创建的响应式副作用（即计算属性和侦听器），这样捕获到的副作用可以一起清理。
```js
const scope = effectScope();

scope.run(() => {
  const doudled = computed(() => counter.value * 2);
  watch(doudled, () => console.log(doudled.value));
  watchEffect(() => console.log('Count:', doudled.value));
});

// 处理掉当前作用域内的所有effect
scope.stop();
```

## onScopeDispose()

在当前活跃的`effect`作用域上注册一个处理回调函数。当相关的`effect`作用域停止时会调用这个回调函数。

这个方法可以作为可复用的组合式函数中`onUnmounted`的替代品，它并不与组件耦合，因为每一个`Vue`组件的`setup()`函数也是在一个`effect`作用域中调用的。

如果在没有活跃的`effect`作用域的情况下调用此函数，将会抛出警告。在`3.5+`版本中，可以通过将第二个参数设为`true`来消除此警告。

# 组合式API：生命周期钩子

**这些钩子在服务器端渲染期间不会被调用。**

## onMounted()

注册一个回调函数，在组件挂载完成后执行。

组件在以下情况下被视为已挂载：

- 其所有同步子组件都已经被挂载（不包含异步组件或`<Suspense>`树内的组件）。
- 其自身的`DOM`树已经创建完成并完成插入了父容器中。注意仅当根容器在文档中时，才可以保证组件`DOM`树也在文档中。

这个钩子通常用于执行需要访问组件所渲染的`DOM`树相关的副作用，或是在服务端渲染应用中用于确保`DOM`相关代码仅在客户端执行。

## onUpdated()

注册一个回调函数，在组件因为响应式状态变更而更新其`DOM`树之后调用。

父组件的更新钩子将在其子组件的更新钩子之后调用。

这个钩子会在组件的任意`DOM`更新后被调用，这些更新可能是由不同的状态变更导致的，因为多个状态变更可以在同一个渲染周期中批量执行。如果你需要在某个特定的状态更改后访问更新后的`DOM`，请使用`nextTick`作为替代。

## onUnmounted()

注册一个回调函数，在组件实例被卸载之后调用。

一个组件在以下情况下被视为已卸载：

- 其所有子组件都已经被卸载。
- 所哟相关的响应式作用（渲染作用以及`setup()`时创建的计算属性和侦听器）都已经停止。

可以在这个钩子中手动清理一些副作用，例如计时器、`DOM`事件监听器或者与服务器的连接。

## onBeforeMount()

注册一个钩子，在组件被挂载之前被调用。

当这个钩子被调用时，组件已经完成了其响应式状态的设置，但还没有创建`DOM`节点。它即将首次执行`DOM`渲染过程。

## onBeforeUpdate()

注册一个钩子，在组件即将因为响应式状态变更而更新其`DOM`树之前调用。

这个钩子可以用来在`Vue`更新`DOM`之前访问`DOM`状态。在这个钩子中更改状态也是安全的。

## onBeforeUnmount()

注册一个钩子，在组件实例被卸载之前调用。

当这个钩子被调用时，组件实例依然还保有全部的功能。

## onErrorCaptured()

注册一个钩子，在捕获了后代组件传递的错误时调用。

错误可以从以下几个来源中捕获：

- 组件渲染
- 事件处理器
- 生命周期钩子
- `setup()`函数
- 侦听器
- 自定义指令钩子
- 过渡钩子

这个钩子带有三个实参：错误对象、触发该错误的组件实例，以及一个说明错误来源类型的信息字符串。

你可以在`errorCaptured()`中更改组件状态来为用户显示一个错误状态。注意不要让错误状态再次渲染导致本次错误的内容，否则组件会陷入无线循环。

这个钩子可以通过返回`false`来阻止错误继续向上传递。

**错误传递规则**

- 默认情况下，所有的错误都会被发送到应用级的`app.config.errorHandler`（前提是这个函数已经被定义），这些错误都能在一个同意的地方报告给分析服务。
- 如果组件的继承链或组件链上存在多个`errorCaptured`钩子，对于同一个错误，这些钩子会被按从底至上的顺序一一调用。这个过程被称为“向上传递”，类似于原生`DOM`事件的冒泡机制。
- 如果`errorCaptured`钩子本身抛出了一个错误，那么这个错误和原来捕获到的错误都将被发送到`app.config.errorHandler`。
- `errorCaptured`钩子可以通过返回`false`来阻止错误继续向上传递。即表示“这个错误已经被处理了，应当被忽略”，它将阻止其他的`errorCaptured`钩子或`app.config.errorHandler`因这个错误而被调用。

## onActivated()

注册一个对调函数，若组件实例是`<keepAlive>`缓存树的一部分，当组件被插入到`DOM`中时调用。

## onDeactivated()

注册一个回调函数，若组件实例是`<keepAlive>`缓存树的一部分，当组件从`DOM`中被移除时调用。

## onSrverPrefetch<sup>`SSR only`</sup>

注册一个异步函数，在组件实例在服务器上被渲染之前调用。

如果这个钩子返回了一个`Promise`，服务端渲染会在渲染该组件前等待该`Promise`完成。

这个钩子仅会在服务端渲染中执行，可以用于执行一些仅存在于服务端的数据抓取过程。

# 组合式API：依赖注入

## provide()

提供一个值，可以被后代组件注入。

`provide()`接受两个参数：第一个参数是要注入的`key`，可以是一个字符串或者一个`symbol`，第二个参数是要注入的值。

当使用`Typescript`时，`key`可以是一个被类型断言为`InjectionKey`的`symbol`。`InjectionKey`是一个`Vue`提供的工具类型，继承自`Symbol`，可以用来同步`provide()`和`inject()`之间值的类型。

与注册生命周期钩子的`API`类型，`provide()`必须在组件的`setup()`阶段同步调用。

## inject()

注入一个由祖先组件或整个应用（通过`app.provide()`）提供的值。

第一个参数是注入的`Key`。`Vue`会遍历父组件链，通过匹配`Key`来确定所提供的值。如果父组件链上多个组件对同一个`Key`提供了值，那么离得更近的组件将会“覆盖”链上更远的组件所提供的值。如果没有能通过`Key`匹配的值，`inject()`将返回`undefined`，除非提供了一个默认值。

第二个参数也可以是一个工厂函数，用来返回某些创建起来比较复杂的值。在这种情况下，你必须将`true`作为第三个参数传入，表面这个函数将作为工厂函数使用，而非值本身。

与注册生命周期钩子的`API`类似，`inject()`必须在组件的`setup()`阶段同步调用。

当使用`TypeScript`时，`Key`可以是一个类型为`InjectionKey`的`Symbol`。`InjectionKey`是一个`Vue`提供的工具类型，继承自`Symbol`，可以用来同步`provide()`和`inject()`之间值的类型。

# 组合式API：辅助

## useAttrs()

从`setup`上下文中返回`attrs`对象，其中包含当前组件的透传`attributes`。这是用于`<script setup>`中的，因为在`<script setup>`中无法获取`setup`上下文对象。

## useSlots()

从`setup`上下文中返回`slots`对象，其中包含父组件传递的插槽。这些插槽为可调用的函数，返回虚拟`DOM`节点。这是用于`<script setup>`中的，因为在`<script setup>`中无法获取`setup`上下文对象。

如果使用`TypeScript`，建议优先使用`defineSlots()`。

## useModel()

这是驱动`defineModel()`的底层辅助函数。如果使用`<script setup>`，应当优先使用`defineModel()`。

仅在`3.4+`版本中可用。

`useModel()`可以用于非单文件组件，例如在使用原始的`setup()`函数时，它预期的第一个参数是`props`对象，第二个参数是`model`名称。可选的第三个参数可以用于为生成的`model ref`声明自定义的`getter`和`setter`。请注意，与`defineModel()`不同，你需要自己声明`props`和`emits`。

## useTemplateRef()<sup>`3.5+`</sup>

返回一个浅层`ref`，其值将与模板中的具有匹配`ref attribute`的元素或组件同步。
```js
import { onMounted, useTemplateRef } from 'vue';

const inputRef = useTemplateRef('input');

onMounted(() => {
  inputRef.value.focus();
});
```

## useId()

用于为无障碍属性或表单元素生成每个应用内位移的`ID`。
```js
<template>
  <form>
    <label :for="id"></label>
    <input type="text" :id="id" />
  </form>
</template>

<script setup name="test">
import { useId } from 'vue';

const id = useId();
</script>
```

`useId()`生成的每个`ID`在每个应用内都是唯一的。它可以用于为表单元素或无障碍属性生成`ID`。在同一个组件中多次调用会生成不同的`ID`；同一个组件的多个实例调用`useId()`也会生成不同的`ID`。

`useId()`生成的`ID`在服务器端和客户端渲染之间时稳定的，因此可以安全地在`SSR`应用中使用，不会导致激活不匹配。

如果同一页面上有多个`Vue`应用实例，可以通过`app.config.idPrefix`为每个应用提供一个`ID`前缀，以避免`ID`冲突。

# 状态选项

## data

用于声明组件初始响应式状态的函数。

该函数应当返回一个普通`JavaScript`对象，`Vue`会将它转换为响应式对象。实例创建后，可以通过`this.$data`访问该响应式对象。组件实例也代理了该数据对象上所有的属性，因此`this.a`等价于`this.$data.a`。

所有会用到的顶层数据属性都应该提前在这个对象中声明。虽然理论上可以向`this.$data`添加新属性，但并不推荐这么做。如果一个属性的值在一开始还获取不到，应当先用`undefined`或是`null`值来占位，让`Vue`知道这个属性是存在的。

以`_`或`$`开头的属性将**不会**被组件实例代理，因为它们可能和`Vue`的内置属性、`API`方法冲突。你必须以`this.$data._property`的方式访问它们。

**不推荐**返回一个可能改变自身状态的对象，如浏览器`API`原生对象或是带原型的类实例等。理想情况下，返回的对象应是一个纯粹代表组件的普通对象。

注意，如果你为`data`属性使用了一个箭头函数，则`this`将不会指向该组件实例，不过你仍然可以通过该函数的第一个参数来访问实例。

## props

用于声明一个组件的`props`。

在`Vue`中，所有的组件`props`都需要被显式声明。组件`props`可以通过两种方式声明：

- 使用字符串数组的简易形式。
- 使用对象的完整形式。该对象的每个属性键是对应`props`的名称，值则是该`props`应具有的类型的构造函数，或是更高级的选项。

在基于对象的语法中，每个`props`可以进一步定义如下选项：

- `type`：可以是下列原生构造函数之一：`String`、`Number`、`Boolean`、`Array`、`Object`、`Date`、`Function`、`Symbol`、任何自定义构造函数，或由上述内容组成的数组。在开发模式中，`Vue`会检查一个`props`的值是否匹配其声明的类型，如果不匹配则会抛出警告。

还要注意，一个`Boolean`类型的`props`会影响它在开发或生产模式下的值转换行为。

- `default`：为该`props`指定一个当其没有被传入或值为`undefined`时的默认值。对象或数组的默认值必须从一个工厂函数返回。工厂函数也接收原始`props`对象作为参数。
- `required`：定义该`props`是否必须传入。在非生产环境中，如果`required`值为真值且`props`未被传入，一个控制台警告将会被抛出。
- `validator`：将`props`值作为唯一参数传入的自定义验证函数。在开发模式下，如果该函数返回一个假值（即验证失败），一个控制台警告将会被抛出。

```js
props: {
  height: Number,
  age: {
    type: Number,
    default: 0,
    required: true,
    validator: value => {
      return value >= 0;
    },
  },
},
```

## computed
用于声明要在组件实例上暴露的计算属性。

该选项接收一个对象，其中键是计算属性的名称，值是一个计算属性`getter`，或一个具有`get`和`set`方法的对象（用于声明可写的计算属性）。

所有的`getters`和`setters`会将它们的`this`上下文自动绑定为组件实例。

注意，如果你为一个计算属性使用了箭头函数，则`this`不会指向该组件实例，不过你仍然可以通过该函数的第一个参数来访问实例。
```js
computed(vm => vm.a * 2);
```

## methods

用于声明要混入到组件实例中的方法。

声明的方法可以直接通过组件实例访问，或者在模板语法表达式中使用。所有的方法都会将它们的`this`上下文自动绑定为组件实例，即使在传递时也如此。

在声明方法时避免使用箭头函数，因为它们不能通过`this`访问组件实例。

## watch

用于声明在数据更改时调用的侦听回调。

`watch`选项期望接受一个对象，其中键是需要侦听的响应式组件实例属性（例如，通过`data`或`computed`声明的属性）——值是相应的回调函数。该回调函数接受被侦听源的新和旧值。

除了一个根级属性，键名也可以是一个简单的由点分隔的路径。注意，这种用法**不支持**复杂表达式——仅支持由点分隔的路径。如果你需要侦听复杂的数据源，可以使用命令式`$watch() API`。

值也可以是一个方法名称的字符串（通过`methods`声明），或包含额外选项的对象。当使用对象语法时，回调函数应被声明在`handler`中。额外的选项包含：

- `immediate`：在侦听器创建时立即触发回调。第一次调用时，旧值将为`undefined`。
- `deep`：如果源时对象或数组，则强制深度遍历源，以便在深度变更时触发回调。
- `flush`：调整回调的刷新时机。
- `onTrack/onTrigger`：调试侦听器的依赖关系。

声明侦听器回调时避免使用箭头函数，因为它们将无法通过`this`访问组件实例。

## emits

用于声明由组件触发的自定义事件。

可以以两种形式声明触发的事件：

- 使用字符串数组的简易形式。
- 使用对象的完整形式。该对象的每个属性键是事件的名称，值是`null`或一个验证函数。

验证函数会接收到传递给组件的`$emit`调用的额外参数。

注意，`emits`选项会影响一个监听器被解析为组件事件监听器，还是原生`DOM`事件监听器。被声明为组件事件的监听器不会被透传到组件的根元素上，且将从组件的`$attrs`对象中移除。

## expose

用于声明当组件实例被父组件通过模板引用访问时暴露的公共属性。

默认情况下，当通过`$parent`、`$root`或模板引用访问时，组件实例将向父组件暴露所有的实例属性。这可能不是我们希望看到的，因为组件很可能拥有一些应保持私有的内部状态或方法，以避免紧耦合。

`expose`选项值应当是一个包含要暴露的属性名称字符串的数组。当使用`expose`时，只有显式列出的属性将在组件实例上暴露。

`expose`仅影响用户定义的属性——它不会过滤掉内置的组件实例属性。

# 渲染选项

## template

用于声明组件的字符串模板。

通过`template`选项提供的模板将会在运行时即时编译。这仅在使用了包含模板编译器的`Vue`构建版本的情况下支持。文件名中带有`runtime`的`Vue`构建版本**未包含**模板编译器，例如`vue.runtime.esm-bundler.js`。   

如果该字符以`#`开头，它将被用作`querySelector`的选择器，并使用所选中元素的`innerHTML`作为模板字符串。这让我们能够使用原生`<template>`元素来书写源模板。


如果`render`选项也同时存在于该组件中，`template`将被忽略。

如果应用的根组件不包含任何`template`或`render`选项，`Vue`将会尝试使用所挂载元素的`innerHTML`来作为模板。

## render

用于编程式地创建组件虚拟`DOM`树的函数。

`render`是字符串模板的一种替代，可以使你利用`JavaScript`的丰富表达力来完全编程式地声明组件最终的渲染输出。

预编译的模板，例如单文件组件中的模板，会在构建时被编译为`render`选项。如果一个组件中同时存在`render`和`template`，则`render`将具有更高的优先级。

## compilerOptions

用于配置组件模板的运行时编译器选项。

这个配置选项仅在使用完整构建版本（即可以在浏览器中编译模板的`vue.js`文件）时才有效。它支持与应用级的`app.config.compilerOptions`想通的选项，并针对当前组件有更高的优先级。

## slots

一个在渲染函数中以编程方式使用插槽时辅助类型推断的选项。

该选项的运行时值不会被使用。实际类型应通过`SlotsType`类型辅助工具进行类型转换来声明。

# 其他杂项选项

## name

用于显式声明组件展示时的名称。

组件的名字有以下用途：

- 在组件自己的模板中递归引用自己时
- 在`Vue`开发者工具中的组件树显示时
- 在组件抛出的警告追踪栈信息中显示时

当你在使用单文件组件时，组件已经会根据其文件名推导出其名称。举例来说，一个名为`MyComponent.vue`的文件会推导出显示名称为`MyComponent`。

另一种场景是当一个组件通过`app.component`被全局注册时，这个全局`ID`就自动被设为了其名称。

使用`name`选项使你可以覆盖推导出的名称，或是在没有推导出名字时显式提供一个。（例如没有使用构建工具时，或是一个内联的非单文件组件）

有一种场景下`name`必须是已显式声明的：即`<KeepAlive>`通过其`include/exclude``prop`来匹配其需要缓存的组件时。

> 在`3.2.34`或以上的版本中，使用`<script setup>`的单文件组件会自动根据文件名生成对应的`name`选项，即使是在配合`<KeepAlive>`使用时也无需再手动声明。

## inheritAttrs

用于控制是否启用默认的组件`attribute`透传行为。

默认情况下，父组件传递的，但没有被子组件解析为`props`的`attributes`绑定会被`透传`。这意味着当我们有一个单根节点的子组件时，这些绑定会被作为一个常规的`HTML attribute`应用在子组件的根节点元素上。当你编写的组件想要在一个目标元素或其他组件外面包一层时，可能并不期望这样的行为。我们可以通过设置`inheritAttrs`为`false`来禁用这个默认行为。这些`attributes`可以通过`$attrs`这个实例属性来访问，并且可以通过`v-bind`来显式绑定在一个非根节点的元素上。

```js
// child.vue
<template>
  <view class="container" @click="onMyClick"> </view>
</template>

<script setup name="child">
import { useAttrs } from 'vue';

const emits = defineEmits(['onClick']);

const attrs = useAttrs();
const onMyClick = index => {
  if (attrs.onBeforeClick) {
    attrs.onBeforeClick(index, flag => {
      if (flag) {
        emit('onClick', index);
      }
    });
  } else {
    emits('onClick', index);
  }
};
</script>

// parent.vue
<template>
  <view class="container" @beforeClick="onBeforeClick" @onClick="onClick"> </view>
</template>

<script setup name="parent">
import { useStore } from 'vuex';

const store = useStore();

const onBeforeClick = (index, next) => {
  if (index == 1) {
    if (store.state.app.tabState) {
      next(false);
    } else {
      next(false);
    }
  } else {
    next(true);
  }
};
</script>
```
在一个使用了`<script setup>`的组件中声明这个选项时，可以使用`defineOptions`宏。

## components

一个对象，用于注册对当前组件实例可用的组件。

## directives

一个对象，用于注册对当前组件实例可用的指令。

# 组件实例

> 本节文档描述了组件公共实例（即`this`）上暴露的内置属性和方法，本节罗列的所有属性，除了`$data`下的嵌套属性之外，都是只读的。

## $data

从`data`选项函数中返回的对象，会被组件赋为响应式。组件实例将会代理对其数据对象的属性访问。

## $props

表示组件当前已解析的`props`对象。

这里只包含通过`props`选项声明的`props`。组件实例将会代理对其`props`对象上属性的访问。

## $el

该组件实例管理的`DOM`根节点。

`$el`直到组件挂载完成`mounted`之前都会是`undefined`。
- 对于单一根元素的组件，`$el`将会指向该跟元素。
- 对于以文本节点为根的组件，`$el`将会指向该文本节点。
- 对于以多个元素为根的组件，`$el`将是一个仅作占位符的`DOM`节点，`Vue`使用它来跟踪组件在`DOM`中的位置（文本节点或`SSR`激活模式下的注释节点）。

> 为保持一致性，我们推荐使用模板引用来直接访问元素而不是依赖`$el`。

## $options

已解析的用于实例化当前组件的组件选项。

这个`$options`对象暴露了当前组件的已解析选项，并且会是以下几种可能来源的合并结果：
- 全局`mixin`
- 组件`extends`的基组件
- 组件级`mixin`

它通常用于支持自定义组件选项。

## $parent

当前组件可能存在的父组件实例，如果当前组件是顶层组件，则为`null`。

## $root

当前组件树的根组件实例。如果当前实例没有父组件，那么这个值就是它自己。

## $slots

一个表示父组件所传入插槽的对象。

通常用于手写渲染函数，但也可以用于检测是否存在插槽。

每一个插槽都在`this.$slots`上暴露为一个函数，返回一个`vnode`数组，同时`Key`名对应这插槽名。默认插槽暴露为`this.$slots.default`。

如果插槽是一个作用域插槽，传递给该插槽函数的参数可以作为插槽的`props`提供给插槽。

## $refs

一个包含`DOM`元素和组件实例的对象，通过模板引用注册。

## $attrs

一个包含了组件所有透传`attributes`的对象。

透传`attributes`是指由父组件传入，且没有被子组件声明为`props`或是组件自定义事件的`attributes`和事件处理函数。

默认情况下，若是单一根节点组件，`$attrs`中的所有属性都是直接自动继承自组件的根元素。而多根节点组件则不会如此，同时你也可以通过配置`inheritAttrs`选项来显式地关闭该行为。

## $watch

用于命令式地创建侦听器的`API`。

第一个参数是侦听来源。可以是一个组件的属性名的字符串，一个简单的由点分隔的路径字符串，或是一个`getter`函数。

第二个参数是回调函数。它接收的参数分别是侦听来源的新值、旧值。
- `immediate`：指定在侦听器创建时是否立即触发回调。在第一次调用时旧值为`undefined`。
- `deep`：指定在侦听来源时一个对象时，是否强制深度遍历，这样回调函数就会在深层级发生变更时被触发。
- `flush`：指定回调函数的刷新时机。
- `onTrack/onTrigger`：调试侦听器的依赖。

## $emit()

在当前组件触发一个自定义事件。任何额外的参数都会传递给事件监听器的回调函数。

## $forceUpdate()

强制该组件重新渲染。

鉴于`Vue`的全自动响应性系统，这个功能应该很少会被用到。唯一可能需要它的情况是，你使用高阶响应式`API`显式创建了一个非响应式的组件状态。

## $nextTick()

绑定在实例上的`nextTick()`函数。

和全局版本的`nextTick()`的唯一区别就是组件传递给`this.$nextTick()`的回调函数会带上`this`上下文，其绑定了当前组件实例。

# 内置指令

## v-text

更新元素的文本内容。
- **期望的绑定值类型：**`string`

`v-text`通过设置元素的`textContent`属性来工作，因此它将覆盖元素中所有现有的内容。如果你需要更新`textContent`的部分，应该使用`mustache interpolations`代替。

## v-html

更新元素的`innerHTML`。

`v-html`的内容直接作为普通`HTML`插入——`Vue`模板语法时不会被解析的。如果你发现自己正打算用`v-html`来编写模板，不如重新想想怎么使用组件来代替。

在单文件组件，`scoped`样式将不会作用于`v-html`里的内容，因为`HTML`内容不会被`Vue`的模板编译器解析。如果你想让`v-html`的内容也支持`scoped CSS`，你可以使用`CSS modules`或使用一个额外的全局`<style>`元素，手动设置类似`BEM`的作用域策略。

## v-show

基于表达式值的真假性，来改变元素的可见性。

**期望的绑定值类型：**`key`

- `v-show`通过设置内联样式的`display``CSS`属性来工作，当元素可见时将使用初始`display`值。当条件改变时，也会触发过渡效果。

## v-if

基于表达式值的真假性，来条件性地渲染元素或模板片段。

当`v-if`元素被触发，元素及其所包含的指令/组件都会销毁和重构。如果初始条件是假，那么其内部的内容根本都不会被渲染。

可用于`<template>`表示仅包含文本或多个元素的条件块。

当条件改变时会触发过渡效果。

当同时使用，`v-if`比`v-for`优先级更高。并不推荐在一元素上同时使用这两个指令。

## v-else

表示`v-if`或`v-if`/`v-else-if`链式调用的“`else`块”。

- **无需传入表达式**
- 限定：上一个兄弟元素必须有`v-if`或`v-else-if`。
- 可用于`<template>`表示仅包含文本或多个元素的条件块。

## v-else-if

表示`v-if`的“`else if`块”。可以进行链式调用。

- 限定：上一个兄弟必须有`v-if`或`v-else-if`。
- 可用于`<template>`表示仅包含文本或多个元素的条件块。

## v-for

基于原始数据多次渲染元素或模板块。

- **期望的绑定值类型：**`Array|Object|number|string|Iterable`

指令值必须使用特殊语法为正在迭代的元素提供一个别名，或者，也可以为索引指定别名（如果用在对象，则时键值）

`v-for`的默认方式是尝试就地更新元素而不一定它们。要强制其重新排序元素，你需要用特殊`attribute key`来提供一个排序提示。

`v-for`也可以用于`Iterable Protocol`的实现，包括原生`Map`和`Set`。

## v-on

给元素绑定事件监听器。

- **缩写：**`@`
- **期望的绑定值类型：**`Function|Inline Statement|Object（不带参数）`
- **参数：**`event`（使用对象发则为可选项）
- 修饰符
    - `.stop`-调用`event.stopPropagation()`
    - `.prevent`-调用`event.preventDefault()`
    - `.capture`-在捕获模式添加事件监听器
    - `.self`-只有事件从元素本身发出才触发处理函数
    - `.{keyAliase}`-只在某些按键下触发处理函数
    - `.once`-最多触发一次处理函数
    - `.left`-只在鼠标左键事件触发处理函数
    - `.right`-只在鼠标右键事件触发处理函数
    - `.middle`-只在鼠标中键事件触发处理函数
    - `.passive`-通过`{passive: true}`附加一个`DOM`事件

事件类型由参数来指定。表达式可以是一个方法名，一个内联声明，如果由修饰符则可省略。

当用于普通元素，只监听**原生`DOM`事件**。当用于自定义元素组件，则监听子组件触发的**自定义事件**。

当监听原生`DOM`事件时，方法接收原生事件作为唯一参数。如果使用内联声明，声明可以访问一个特殊的`$event`变量：`v-on:click="handle('ok',$event)"`。

`v-on`还支持绑定不带参数的事件/监听器对的对象。**请注意，当使用对象语法时，不支持任何修饰符**。

```html
<!-- 方法处理函数 -->
<button v-on:click="doThis"></button>
<!-- 动态事件 -->
<button v-on:[event]="doThis"></button>
<!-- 缩写 -->
<button @click="doThis"></button>
<!-- 使用缩写的动态事件 -->
<button @[event]="doThis"></button>
<!-- 停止传播 -->
<button @click.stop="doThis"></button>
<!-- 阻止默认事件 -->
<button @click.prevent="doThis"></button>
<!-- 不带表达式地阻止默认事件 -->
<button @submit.prevent></button>
<!-- 链式调用修饰符 -->
<button @click.stop.prevent="doThis"></button>
<!-- 按键用于keyAlias修饰符 -->
<button @keyup.enter="onEnter"></button>
<!-- 点击事件将最多触发一次 -->
<button v-on:click.once="doThis"></button>
<!-- 对象语法 -->
<button v-on="{ mousedown: doThis, mouseup: doThat }"></button>
```

监听子组件的自定义事件（当子组件的`my-event`事件被触发，处理函数将被调用）。

```html
<MyComponent @my-event="handleThis" />
<!-- 内联声明 -->
<MyComponent @my-event="handleThis(123, $event)" />
```

## v-bind

动态的绑定一个或多个`attribute`，也可以是组件的`prop`。

**缩写：**
- `:`或者`.`（当使用`.prop`修饰符）
- 值可以省略（当`attribute`和绑定的值同名时，需要`3.4+`版本）
- **期望：**`any（带参数）|Object（不带参数）`
- **参数：**`attrOrProp（可选的）`
- **修饰符**
    - `.camel`-将短横线命名的`attribute`转变为驼峰式命名。
    - `.prop`-强制绑定为`DOM property(3.2+)`。
    - `.attr`-强制绑定为`DOM attribute(3.2+)`。
- **用途**    

当用于绑定`class`或`style``attribute`，`v-bind`支持额外的值类型如数组或对象。

在处理绑定时，`Vue`默认会利用`in`操作符来检查该元素上是否定义了和绑定的`key`同名的`DOM property`。如果存在同名的`property`，则`Vue`会将它作为`DOM property`赋值，而不是作为`attribute`设置。这个行为大多数情况都符合期望的绑定值类型，但是你也可以显式用`.prop`和`.attr`修饰符来强制绑定方式。有时这是必要的，特别是在和**自定义元素**打交道时。

当用于组件`props`绑定时，所绑定的`props`必须在子组件中已被正确声明。

当不带参数使用时，可以用于绑定一个包含了多个`attribute`名称-绑定值对的对象。

```html
<!-- 绑定attribute -->
<img v-bind:src="imageSrc" />
<!-- 动态attribute名 -->
<button v-bind:[key]="value"></button>
<!-- 缩写 -->
<img :src="imageSrc" />
<!-- 缩写形式的动态 attribute 名（3.4+），扩展为:src="src" -->
<img :src />
<!-- 动态attribute名的缩写 -->
<button :[key]="value"></button>
<!-- 内联字符串拼接 -->
<img :src="'/path/to/image/' + fileName" />
<!-- class绑定 -->
<div :class="{ red: isRed }"></div>
<div :class="[classA, classB]"></div>
<div :class="[classA, { classB, isB, classC: isC }]"></div>
<!-- style绑定 -->
<div :style="{ fontSize: size + 'px' }"></div>
<div :style="[styleObjectA, styleObjectB]"></div>
<!-- 绑定对象形式的attribute -->
<div v-bind="{ id: someProp, 'other-attr': otherProp }"></div>
<!-- prop绑定。prop必须在子组件中已声明 -->
<MyComponent :prop="someThing" />
<!-- 传递子父组件共有的prop -->
<MyComponent v-bind="$props" />
<!-- XLink -->
<svg><a :xlink:special="foo"></a></svg>
```

`prop`修饰符也有专门的缩写，`.`：
```html
<div :someProperty.prop="someObject"></div>
<!-- 等同于 -->
<div .someProperty="someObject"></div>
```

当在`DOM`内模板使用`.camel`修饰符，可以驼峰化`v-bind``attribute`的名称，例如`viewBox``attribute`：
```html
<svg :view-box.camel="viewBox"></svg>
```

如果使用字符串模板或使用构建步骤预编译模板，则不需要`.camel`。

## v-model

在表单输入元素或组件上创建双向绑定。

- **期望的绑定值类型：**根据表单输入元素或组件输出的值而变化
- **仅限：**
    - `<input>`
    - `<select>`
    - `<textarea>`
    - `components`
- **修饰符**
    - `.lazy`-监听`change`事件而不是`input`
    - `.number`-将输入的合法字符串转为数字
    - `.trim`-移除输入内容两端空格

## v-slot

用于声明具名插槽或是期望接收`props`的作用域插槽。

- **缩写：**`#`
- 期望的绑定值类型：能够合法在函数参数位置使用的`JavaScript`表达式。支持解构语法。绑定值是可选的——只有在给作用域插槽传递`props`才需要。
- **参数：**插槽名（可选，默认是`default`）
- **仅限：**
    - `<template>`
    - `component`（用于带有`prop`的单个默认插槽）

```html
<!-- 具名插槽 -->
<BaseLayout>
    <template v-slot:header>Header content</template>
    <template v-slot:default>Default slot content</template>
    <template v-slot:footer>Footer content</template>
  </BaseLayout>
<!-- 接收prop的具名插槽 -->
<InfiniteScroll>
    <template v-slot:item="slotProps">
      <div class="item">{{ slotProps.item.text }}</div>
    </template>
  </InfiniteScroll>
<!-- 接收prop的默认插槽，并解构 -->
<Mouse v-slot="{ x, y }">Mouse position: {{ x }},{{ y }}</Mouse>
```

## v-pre

跳过该元素及其所有子元素的编译。

- **无需传入**

元素内具有`v-pre`，所有`Vue`模板语法都会被保留并按原样渲染。最常见的用例就是显式原始双大括号标签及内容。
```html
<span v-pre>{{ this will not be compiled }}</span>
```

## v-once

仅渲染元素和组件一次，并跳过之后的更新。

- **无需传入**

在随后的重新渲染，元素/组件及其所有子项将被当做静态内容并跳过渲染。这可以用来优化更新时的性能。

从`3.2`起，你也可以搭配`v-memo`的无效条件来缓存部分模板。

## v-memo

- 仅在`3.2+`中支持
- **期望的绑定值类型：**`any[]`

缓存一个模板的子树。在元素和组件上都可以使用。为了实现缓存，该指令需要传入一个固定长度的依赖值数组进行比较。如果数组里的每个值都与最后一次的渲染相同，那么整个子树的更新将被跳过。
```html
<div v-memo="[valueA, valueB]"></div>
```

当组件重新渲染，如果`valueA`和`valueB`都保持不变，这个`<div>`及其子项的所有更新都将被跳过。实际上，甚至虚拟`DOM`的`vnode`创建也将被跳过，因为缓存的子树副本可以被重新使用。

正确指定缓存数组很重要，否则应该生效的更新可能被跳过。`v-memo`传入空数组（`v-memo="[]"`）将与`v-once`效果相同。

**与`v-for`一起使用**

`v-memo`仅用于性能至上场景中的微小优化，应该很少需要。最常见的情况可能是有助于渲染海量`v-for`列表（长度超过`1000`的情况）。
```html
<div v-for="item in list" :key="item.id" v-memo="[item.id === selected]">
  {{ item.content }}
</div>
```

当组件的`selected`状态改变，默认会重新创建大量的`vnode`，尽管绝大部分都跟之前是一模一样的。`v-memo`用在这里本质上是在说“只有当该项的被选中状态改变时才需要更新”。这使得每个选中状态没有变的项能完全重用之前的`vnode`并跳过差异比较。注意这里`memo`依赖数组中并不需要包含`item.id`，因为`Vue`也会根据`item`的`:key`进行判断。

> 当搭配`v-for`使用`v-memo`，确保两者都绑定在同一个元素上。**`v-memo`不能用在`v-for`内部**。

`v-memo`也能被用于在一些默认优化失败的边际情况下，手动避免子组件出现不需要的更新。
但是一样的，开发者需要负责指定正确的依赖数组以免跳过必要的更新。

## v-cloak

用于隐藏尚未完成编译的`DOM`模板。

**该指令只在没有构建步骤的环境下需要使用。**

当使用直接在`DOM`中书写的模板时，可能会出现一种叫做“为编译模板闪现”的情况：用户可能先看到的是还没编译完成的双大括号标签，直到挂载的组件将它们替换为时机渲染的内容。

`v-cloak`会保留在所绑定的元素上，直到相关组件实例被挂载后才移除。配合像`[v-cloak] {display: none}`这样的`CSS`规则，它可以在组件编译完毕前隐藏原始模板。
```html
<div v-cloak>{{ message }}</div>

[v-cloak] {
  display: none;
}
```

# 内置组件

> 组件注册和使用
> 内置组件无需注册便可以直接在模板中使用。它们也支持`tree-shake`：仅在使用时才会包含在构建中。
> 在渲染函数中使用它们时，需要显式导入。

## `<Transition>`

为**单个**元素或组件提供动画过渡效果。

- `props`

```js
interface TransitionProps {
  // 用于自动生成过渡CSS class 名
  // 例如name fade将自动扩展为.fade-enter .fade-enter-active
  name?: string;
  // 是否应用CSS过渡class
  // 默认：true
  css?: boolean;
  // 指定要等待的过渡事件类型
  // 来确定过渡结束的时间
  // 默认情况下会自动检测
  // 持续时间较长的类型
  type?: 'transition' | 'animation';
  // 显式指定过渡的持续时间
  // 默认情况下是等待过渡效果的根元素的第一个transitionend
  // 或animationend事件
  duration?: number | { enter: Number, leave: number };
  // 控制离开/进入过渡的时序
  // 默认情况下是同时的
  mode?: 'in-out' | 'out-in' | 'default';
  // 是否对初始渲染使用过渡
  // 默认：boolean
  appear?: boolean;
  // 用于自定义过渡class的prop
  // 在模板中使用短横线命名，例如：enter-form-class="xxx"
  enterFromClass?: string;
  enterActiveClass?: String;
  enterToClass?: string;
  appearFromClass?: string;
  appearActiveClass?: string;
  appearToClass?: string;
  leaveFromClass?: string;
  leaveActiveClass?: string;
  leaveToClass?: string;
}
```

- **事件**
    - `@before-enter`
    - `@before-leave`
    - `@enter`
    - `@leave`
    - `@appear`
    - `@after-enter`
    - `@after-leave`
    - `@after-appear`
    - `@enter-cancelled`
    - `@leave-cancelled(v-show only)`
    - `@appear-cancelled`

通过改变`key`属性来强制过渡执行。

```html
<Transition>
  <div :key="text">{{ text }}</div>
</Transition>
```

动态组件，初始渲染时带有过渡模式+动画出现：
```html
<Transition name="fade" mode="out-in" appear>
  <component :is="view"></component>
</Transition>
```

监听过渡事件
```html
<Transition @after-enter="onTransitionComplete">
  <div v-show="ok">toggled content</div>
</Transition>
```

## `<TransitionGroup>`

为列表中的**多个**元素或组件提供过渡效果

- `props`

`<TransitionGroup>`拥有与`<Transition>`除了`mode`以外所有的`props`，并增加了两个额外的`props`

默认情况下，`<TransitionGroup>`不会渲染一个容器的`DOM`元素，但是可以通过`tag`prop启用。

注意，每个`<transition-group>`的子节点必须有**独立的`key`**，动画才能正常工作。

`<TransitionGroup>`支持通过`CSS transform`控制移动效果。当一个子节点在屏幕上的位置在更新之后发生变化时，它会被添加一个使其位移的`CSS class`（基于`name attribute`推导，或使用`move-class`prop显式配置）。如果使其位移的`class`被添加时CSS的`transform`属性是“可过渡的”，那么该元素会基于**`FLIP`技巧**平滑地达到动画终点。
```html
<TransitionGroup tag="ul" name="slide">
  <li v-for="item in items" :key="item.id">
    {{ item.text }}
  </li>
</TransitionGroup>
```

## **`<KeepAlive>`**

缓存包裹在其中的动态切换组件。

`<KeepAlive>`包裹动态组件时，会缓存不活跃的组件实例，而不是销毁它们。

任何时候都只能有一个活跃组件实例作为`<KeepAlive>`的直接子节点。

当一个组件在`<KeepAlive>`中被切换时，它的`activated`和`deactivated`声明周期钩子将被调用，用来替代`mounted`和`unmounted`。这适用于`<KeepAlive>`的直接子节点及其所有子孙节点。

## `<Teleport>`

将其插槽内容渲染到DOM中的另一个位置。
```html
<Teleport to="#some-id" />
<Teleport to=".some-class" />
<Teleport to="[data-teleport]" />
```

有条件的禁用：
```html
<Teleport to="#popup" :disabled="displayVideoInline">
  <video src="./my-movie.mp4">
</Teleport>
```

延迟目标解析<sup>`3.5+`</sup>
```html
<Teleport defer to="#late-div">...</Teleport>

<!-- 稍后出现于模板中的某处 -->
<div id="late-div"></div>
```

# 内置特殊元素

> 不是组件
> `component`、`slot`和`template`具有类似组件的特性，也是模板语法的一部分。但它们并非真正的组件，同时在模板编译期间会被编译掉。因此，它们通常在模板中用小写字母书写。

## `component`

一个用于渲染动态组件或元素的“元组件”。

要渲染的实际组件由`is`prop决定。
- 当`is`是字符串，它既可以是HTML标签名也可以是组件的注册名
- 或者，`is`也可以直接绑定到组件的定义

按注册名渲染组件:
```html
<template>
  <div class="home-container">
    <component :is="view" />
    <div>
      <button @click="onChange">change</button>
    </div>
  </div>
</template>

<script setup name="home">
import { shallowRef } from 'vue';
import Login from '@/views/login/index.vue';
import About from '@/views/about/index.vue';

let view = shallowRef(Login);
const onChange = () => {
  view.value = About;
};
</script>
```

按定义渲染组件：
```html
<template>
  <component :is="Math.random() > 0.5 ? Login : About" />
</template>

<script setup name="home">
import Login from '@/views/login/index.vue';
import About from '@/views/about/index.vue';
</script>
```

**内置组件**都可以传递给`is`，但是如果想通过名称传递则必须先对其进行注册。
```html
<template>
  <component :is="isGroup ? 'TransitionGroup' : 'Transition'"></component>
</template>

<script setup name="about">
import { ref } from 'vue';
import { Transition, TransitionGroup } from 'vue';

let isGroup = ref(false);
</script>
```

如果将组件本身传递给`is`而不是其名称，则不需要注册。

如果在`<component>`标签上使用`v-model`，模板编译器会将其扩展为`modelValue`prop和`update:modelValue`事件监听器，就像对任何其他组件一样。因此，在动态创建的原生元素上使用`v-model`将不起作用。

## `<slot>`

表示模板中的插槽内容出口。

`<slot>`元素可以使用`name``attribute`来指定插槽名。当没有指定`name`时，将会渲染默认插槽。传递给插槽元素的附加`attributes`将作为插槽`props`，传递给父级中定义的作用域插槽。

元素本身将被其所匹配的插槽内容替换。

Vue模板里的`<slot>`元素会被编译到JavaScript，因此不要与**原生`<slot>`元素**进行混淆。

## `<template>`

当我们想要使用内置指令而不在DOM中渲染元素时，`<template>`标签可以作为占位符使用。

对`<template>`的特殊处理只有在它与以下任一指令一起使用时才会被触发：
- `v-if`、`v-else-if`或`v-else`
- `v-for`
- `v-slot`

如果这些指令都不存在，那么它将被渲染成一个**原生的`<template>`元素**。

带有`v-for`的`<template>`也可以有一个`key`属性。所有其他的属性和指令都将被丢弃，因为没有相应的元素，它们就没有意义。

单文件组件使用**顶层的`<template>`标签**来包裹整个模板。该顶层标签不是模板本身的一部分，不支持指令等模板语法。

# 内置的特殊Attributes

## `key`

`key`这个特殊的`attribute`主要作为Vue的虚拟DOM算法提示，在比较新旧节点列表时用于识别`vnode`。

在没有`key`的情况下，Vue将使用一种最小化元素移动的算法，并尽可能地就地更新/复用相同类型的元素。如果传了`key`，则将根据`key`的变化顺序来重新排列元素，并且将始终移除/销毁`key`已经不存在的元素。

同一个父元素下的子元素必须具有**唯一的`key`**。重复的`key`将会导致渲染异常。

也可以用于强制替换一个元素/组件而不是复用它。
- 在适当的时候触发组件的生命周期钩子
- 触发过渡

```html
<transition>
  <span :key="text">{{ text }}</span>
</transition>
```
当`text`变化时，`<span>`总是会被替换而不是更新，因此transition将会被触发。

## `ref`

用于注册模板引用。

`ref`用于注册元素或子组件的引用。

使用选项式API，引用将被注册在组件的`this.$refs`对象里。

使用组合式API，引用将存储在与名字匹配的`ref`里。

如果用于普通DOM元素，引用将是元素本身；如果用于子组件，引用将是子组件的实力。

或者`ref`可以接收一个函数值，用于对存储引用位置的完全控制。
```html
<ChildComponent :ref="el => (child = el)" />
```

关于`ref`注册时机的重要说明：因为`ref`本身是作为渲染函数的结果来创建的，必须等待组件挂载后才能对它进行访问。

`this.$refs`也是非响应式的，因此你不应该尝试在模板中使用它来进行数据绑定。

## `is`

用于绑定**动态组件**。