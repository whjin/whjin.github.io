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