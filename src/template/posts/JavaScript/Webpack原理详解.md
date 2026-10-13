---
title: Webpack原理详解
date: 2026-10-12 16:36:45
category: JavaScript
tags: ['javascript', 'webpack', '构建工具']
description: '本篇文章系统讲解 Webpack 这一现代前端核心构建工具的工作原理。Webpack 本质上是一个静态模块打包工具，它会从配置的入口文件出发，自动构建项目的依赖图，将所有模块打包成浏览器可直接运行的静态资源。文章首先结合最新官方文档介绍 Webpack 的核心概念，包括入口 Entry、输出 Output、Loader 模块转换器、Plugin 插件、模式 Mode 以及浏览器兼容性与运行环境要求，并说明各概念的实际配置方式。随后深入剖析 Webpack 的三大构建阶段，即初始化、编译与输出，讲解 Compiler 与 Compilation 对象的职责、Loader 转换模块的流程以及依赖图递归构建的过程。最后通过分析输出文件 bundle 的源码结构，解释多个模块如何被合并为一个文件、浏览器端如何通过模拟 require 的加载函数运行模块，以及代码分割的原理，帮助读者真正理解 Webpack 的底层机制。'
top: true
---

# Webpack 原理详解

## 一、引言：Webpack 是什么

在现代前端开发中，Webpack 几乎是工程化的代名词。从本质上看，**Webpack 是一个用于现代 JavaScript 应用程序的静态模块打包工具**。当它处理应用程序时，会在内部从一个或多个入口点构建一张依赖图（Dependency Graph），然后把项目中所需的每一个模块组合成一个或多个 bundles，这些 bundle 均为可直接在浏览器中运行的静态资源。

从 v4.0.0 开始，Webpack 可以不用引入任何配置文件即可完成打包，但它依然保留了高度可配置性，能够满足各类复杂工程的定制需求。理解 Webpack 的运行原理，不仅能帮你写出更合理的配置，更能让你在遇到构建问题时快速定位根因。

## 二、核心概念

在使用和阅读本文之前，需要先掌握 Webpack 的五个核心概念：入口、输出、Loader、插件与模式。

### 1. 入口 Entry

入口起点指示 Webpack 应该使用哪个模块，作为构建其内部依赖图的开始。进入入口起点后，Webpack 会找出有哪些模块和库是入口起点直接或间接依赖的。默认值是 `./src/index.js`，但可以通过 `entry` 属性指定一个或多个不同的入口：

```js
module.exports = {
  entry: './path/to/my/entry/file.js',
};
```

### 2. 输出 Output

`output` 属性告诉 Webpack 在哪里输出它创建的 bundle，以及如何命名这些文件。主输出文件默认是 `./dist/main.js`，其他生成文件默认放置在 `./dist` 文件夹中。可通过 `output.path` 和 `output.filename` 自定义：

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack.bundle.js',
  },
};
```

### 3. Loader

Webpack 本身只能理解 JavaScript 和 JSON 文件，这是它开箱自带的处理能力。而 **Loader 让 Webpack 能够去处理其他类型的文件**，并将它们转换为有效模块，以供应用程序使用并添加到依赖图中。在配置中，Loader 有两个必须的属性：

- `test`：识别哪些文件会被转换；
- `use`：定义进行转换时应该使用哪个 Loader。

```js
module.exports = {
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
};
```

需要特别注意的是：规则必须定义在 `module.rules` 而不是 `rules` 中；匹配文件时应使用正则表达式 `/\.txt$/`，而不是带引号的字符串 `'/\.txt$/'`，否则会匹配到名称恰好为 `.txt` 的单个文件，与预期不符。

### 4. 插件 Plugin

Loader 用于转换某些类型的模块，而插件则可以执行范围更广的任务，包括**打包优化、资源管理、注入环境变量**等。使用插件时只需 `require()` 它，然后添加到 `plugins` 数组中，并通过 `new` 创建实例：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
};
```

### 5. 模式 Mode

通过选择 `development`、`production` 或 `none` 中的一个，可以启用 Webpack 在相应环境下内置的优化，默认值为 `production`：

```js
module.exports = {
  mode: 'production',
};
```

### 6. 浏览器兼容性与环境

Webpack 支持所有符合 ES5 标准的浏览器（不支持 IE8 及以下版本）。其 `import()` 和 `require.ensure()` 依赖 `Promise`，如需支持旧浏览器，需要提前加载 polyfill。Webpack 5 运行于 Node.js v10.13.0+ 的版本。

## 三、工作原理

### 1. 基本概念

在深入了解流程前，需要明确两个内部概念：

- **Module（模块）**：在 Webpack 中一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
- **Chunk（代码块）**：一个 Chunk 由多个模块组合而成，用于代码合并与分割。

### 2. 构建流程概括

Webpack 的运行流程是一个串行的过程，从启动到结束依次执行以下步骤：

1. **初始化参数**：从配置文件和 Shell 语句中读取并合并参数，得出最终参数；
2. **开始编译**：用上一步得到的参数初始化 `Compiler` 对象，加载所有配置的插件，执行对象的 `run` 方法开始编译；
3. **确定入口**：根据配置中的 `entry` 找出所有的入口文件；
4. **编译模块**：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，递归执行本步骤直到所有入口依赖的文件都被处理；
5. **完成模块编译**：得到每个模块翻译后的最终内容以及它们之间的依赖关系；
6. **输出资源**：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入输出列表，这是修改输出内容的最后机会；
7. **输出完成**：根据配置确定输出的路径和文件名，把文件内容写入文件系统。

### 3. 三大阶段与事件机制

Webpack 的构建流程可归纳为三大阶段：**初始化、编译、输出**。如果只执行一次构建，各阶段将按顺序执行一次；若开启监听模式，一旦检测到文件变化，流程会从输出阶段回溯到编译阶段重新编译。

在每个大阶段中会发生很多事件，Webpack 会把这些事件广播出来供插件使用：

**初始化阶段**

- `初始化参数`：从配置与 Shell 读取合并参数，同时执行配置文件中 `new Plugin()` 的实例化语句；
- `实例化 Compiler`：初始化 `Compiler` 实例，它负责文件监听和启动编译，全局只有一个，包含完整的 Webpack 配置；
- `加载插件`：依次调用插件的 `apply` 方法，传入 `compiler` 实例引用，让插件可监听后续所有事件节点；
- `environment`：应用 Node.js 风格的文件系统到 compiler，便于后续文件寻找与读取；
- `entry-option`：读取配置的 Entrys，为每个 Entry 实例化一个对应的 `EntryPlugin`；
- `after-plugins`：调用完所有内置和配置插件的 `apply` 方法；
- `after-resolvers`：根据配置初始化完 resolver，负责在文件系统中寻找指定路径的文件。

**编译阶段**

- `run`：启动一次新的编译；`watch-run` 则是在监听模式下启动；
- `compile`：告知插件一次新的编译将要启动；
- `compilation`：开发模式下每当检测到文件变化，会创建一次新的 `Compilation`，它包含当前模块资源、编译生成资源、变化的文件等，并提供大量事件回调供插件扩展；
- `make`：新 Compilation 创建完毕，从 Entry 开始读取文件，根据文件类型和配置的 Loader 编译文件，编译完后再找出依赖文件，递归编译和解析；
- `after-compile`：一次 Compilation 执行完成；`invalid`：遇文件不存在或编译错误等异常时触发。

在编译阶段，最重要的当属 `compilation` 事件，因为这里调用了 Loader 完成每个模块的转换，其内部又包含多个小事件：`build-module` 使用对应 Loader 转换模块；`normal-module-loader` 用 acorn 解析转换后的内容，输出抽象语法树（AST）；`program` 从入口模块分析 AST，遇到 `require`、`import` 等导入语句时加入依赖模块列表并递归分析；`seal` 在所有模块转换完成后根据依赖关系开始生成 Chunk。

**输出阶段**

- `should-emit`：所有输出文件已生成，询问插件哪些需要输出；
- `emit`：确定输出文件后执行输出，可在此获取和修改输出内容；
- `after-emit`：文件输出完毕；`done` 成功完成一次完整编译输出；`failed` 在遇到异常时跳转，插件可在此获取具体错误原因。

## 四、输出文件分析

前面了解了构建流程，那么 Webpack 输出的 `bundle.js` 到底是什么样？为什么原来一个个模块被合并成一个文件？为什么它能在浏览器中直接运行？

`bundle.js` 本质上是一个立即执行函数，可简写为：

```js
(function (modules) {
  // 模拟 require 语句
  function __webpack_require__() {}

  // 执行存放所有模块数组中的第 0 个模块
  __webpack_require__(0);
})([
  /* 存放所有模块的数组 */
]);
```

**能在浏览器中运行的原因**：输出文件中通过 `__webpack_require__` 函数定义了一个可在浏览器中执行的加载函数，用来模拟 Node.js 中的 `require` 语句。

**模块被合并的原因**：浏览器不能像 Node.js 那样快速地在本地加载一个个模块文件，而必须通过网络请求获取。如果模块数量很多，加载时间会很长，因此 Webpack 把所有模块存放在一个数组中，一次网络加载即可完成。

**缓存优化**：仔细分析 `__webpack_require__` 的实现会发现，执行过的模块不会再执行第二次，其结果会缓存在内存中；当某模块第二次被访问时，会直接读取内存中被缓存的返回值。

**代码分割时的输出**：例如把源码中的 `main.js` 改为异步加载：

```js
import('./show').then((show) => {
  show('Webpack');
});
```

重新构建后会输出两个文件：执行入口文件 `bundle.js` 和异步加载文件 `0.bundle.js`，实现按需加载，从而优化首屏性能。

## 五、小结

Webpack 以入口为起点构建依赖图，通过 Loader 转换各类模块、Plugin 扩展构建能力，历经初始化、编译、输出三大阶段，最终将多个模块合并成浏览器可直接运行的 bundle。掌握它从模块打包到事件广播、再到输出文件结构的内在机制，是深入使用 Webpack 与排查构建问题的关键所在。
