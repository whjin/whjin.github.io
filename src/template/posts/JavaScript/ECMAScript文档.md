## 1. `var`、`let`、`const`之间的区别

- `var`：
  - 声明变量可以重复声明
  - 不受限于块级
  - 会跟 `window` 相映射
  - 声明上方访问变量
- `let`：
  - 不可以重复声明
  - 受限制于块级
  - 暂存死区
- `const`：
  - 声明后必须赋值
  - 常量，不能修改

## 2. `ES6 Module` 与 `CommonJS`核心区别

<!-- prettier-ignore-start -->
|**特性**|**`CommonJS`**|**`ES6 Module`**|
|--|--|--|
|加载时机|运行时同步加载|编译时静态加载|
|导出特性|值的拷贝（修改原变量不影响导出）|值的只读引用（原变量修改会同步）|
|静态分析|不支持（无法 `tree-shaking`）|支持（可移除未使用代码）|
|浏览器支持|不原生支持|原生支持（`<script type="module">`）|
|循环依赖|加载到哪里导出哪里|同样支持，但可能得到 `undefined`|
|顶层 `this`|指向 `module.exports`|指向 `undefined`|

<!-- prettier-ignore-end -->
