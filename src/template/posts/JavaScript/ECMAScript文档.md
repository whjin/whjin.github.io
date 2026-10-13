---
title: ECMAScript文档
date: 2026-09-11
category: JavaScript
description: "ES6（ES2015）之后，JavaScript 每年都有新版本，语法变化很大。这篇文章把日常开发最常用的 ES6+ 特性整理成速查手册，配合代码示例，随时翻阅。 一、var / let / const 特性 var let const 重复声明 允许 不允许 不允许 块级作用域 不支持（函数级） 支持 支持 变量提升 提升并初始化为 undefined 提升但存在暂存死区 同 let 挂载到 window 是 否 否 重新赋值 允许 允许 不允许 最佳实践：默认用 const，需要重新赋值时用 let，永远不用 var。 二、ES6 Module 与 CommonJS 的区别 特性 Comm"
---

ES6（ES2015）之后，JavaScript 每年都有新版本，语法变化很大。这篇文章把日常开发最常用的 ES6+ 特性整理成速查手册，配合代码示例，随时翻阅。

## 一、var / let / const

| 特性 | `var` | `let` | `const` |
|------|-------|-------|--------|
| 重复声明 | 允许 | 不允许 | 不允许 |
| 块级作用域 | 不支持（函数级） | 支持 | 支持 |
| 变量提升 | 提升并初始化为 `undefined` | 提升但存在暂存死区 | 同 let |
| 挂载到 window | 是 | 否 | 否 |
| 重新赋值 | 允许 | 允许 | 不允许 |

**最佳实践**：默认用 `const`，需要重新赋值时用 `let`，永远不用 `var`。

```js
// 错误：const 声明时必须赋值
const x; // SyntaxError

// 正确：const 声明对象可以修改属性（绑定不可变，值可变）
const obj = { a: 1 };
obj.a = 2; // 允许
obj = {};  // TypeError
```

## 二、ES6 Module 与 CommonJS 的区别

| 特性 | CommonJS | ES6 Module |
|------|----------|------------|
| 加载时机 | 运行时同步加载 | 编译时静态加载 |
| 导出方式 | 值的拷贝 | 值的只读引用 |
| Tree Shaking | 不支持 | 原生支持 |
| 浏览器 | 不原生支持 | `<script type="module">` 原生支持 |
| 顶层 this | 指向 `module.exports` | 指向 `undefined` |
| 动态加载 | 不支持 | `import()` 返回 Promise |

```js
// CommonJS
const fs = require('fs');
module.exports = { read: () => {} };

// ES6 Module
import fs from 'fs';
export function read() {}

// 动态导入
const module = await import('./config.js');
```

**为什么 ES6 Module 能 Tree Shaking**：因为 `import/export` 是静态声明，编译时就能确定哪些导出被使用，未使用的可以被打包工具移除。CommonJS 的 `require` 是动态的，运行时才知道加载什么。

## 三、箭头函数

```js
// 普通函数
const add = function(a, b) { return a + b; };

// 箭头函数
const add = (a, b) => a + b;

// 无参数
const sayHi = () => console.log('hi');

// 单参数可省略括号
const double = n => n * 2;

// 返回对象需加括号
const makeUser = (name) => ({ name });
```

**箭头函数的关键点**：
- 没有自己的 `this`，继承外层作用域的 `this`
- 没有 `arguments` 对象（用 `...args` 代替）
- 不能作为构造函数，不能 `new`

## 四、解构赋值

```js
// 数组解构
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first=1, second=2, rest=[3,4,5]

// 对象解构
const { name, age = 18 } = user;

// 重命名
const { name: userName } = user;

// 函数参数解构
function getUser({ id, name }) { return name; }
```

## 五、展开运算符与剩余参数

```js
// 数组合并
const all = [...arr1, ...arr2];

// 对象合并（后者覆盖前者）
const merged = { ...defaults, ...userInput };

// 函数参数收集为数组
function sum(...nums) { return nums.reduce((a, b) => a + b); }
```

## 六、模板字符串

```js
// 多行字符串
const html = `
  <div>
    <p>${title}</p>
  </div>
`;

// 嵌套表达式
const message = `共 ${items.filter(i => i.active).length} 条活跃`;
```

## 七、Class 与继承

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(this.name);
  }
}

class Dog extends Animal {
  speak() {
    super.speak();
    console.log('Woof!');
  }
}
```

## 八、Promise 与 async/await

```js
// Promise 基本用法
fetch('/api/user')
  .then(res => res.json())
  .catch(err => console.error(err));

// async/await（更清晰的写法）
async function getUser() {
  try {
    const res = await fetch('/api/user');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

// 并行执行
const [users, posts] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/posts').then(r => r.json())
]);
```

## 九、可选链与空值合并（ES2020）

```js
// 可选链：安全访问深层属性
const city = user?.address?.city;

// 空值合并：只在 null/undefined 时使用默认值
const name = input ?? '匿名';

// 对比 ||：|| 会把 '' 和 0 也当 falsy
const name2 = input || '匿名'; // '' 也会被替换成默认值
```

## 十、其他高频特性

```js
// 默认参数
function greet(name = '访客') {}

// Set / Map
const set = new Set([1, 2, 3, 3]); // Set(3) {1, 2, 3} 自动去重
const map = new Map([['key', 'value']]);

// for...of 遍历
for (const item of arr) { console.log(item); }

// 对象方法简写
const obj = { method() {} };

// 对象属性名计算
const key = 'dynamic';
const obj = { [key]: 123 }; // { dynamic: 123 }
```

## 相关阅读

- [JavaScript正则表达式手册](https://wuhuajin.com/src/template/posts/JavaScript/html/JavaScript正则表达式手册.html) — 正则速查
- [设计模式文档](https://wuhuajin.com/src/template/posts/JavaScript/html/设计模式文档.html) — JS 设计模式
- [MDN JavaScript 参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript) — 完整官方文档
