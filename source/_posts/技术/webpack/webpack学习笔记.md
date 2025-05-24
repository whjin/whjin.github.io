---
title: webpack学习笔记
date: 2025-05-18 11:18:26
updated: 2025-5-18 11:22:02
category: ["技术"]
tags: ["前端","webpack","工程化","模块化"]
cover: https://s1.imagehub.cc/images/2025/05/18/6dc9922eae70f64e993fb443dec0c08a.md.webp
main_color: "#1D72B4"
keywords:
description:
top_img:
comments:
aside:
---

# 入口和出口

- **单个入口**
```js
module.exports = {
  entry: {
    main: './index.js',
  },
};
```
- **多个入口（数组）**
```js
module.exports = {
  entry: ['./index1.js', './index2.js'],
  output: {
    filename: './dist/bundle.js',
  },
};
```
- **多个入口（对象）**
```js
// webpack.config.js
module.exports = {
  entry: {
    main: './src/app.js',
    vendor: './src/vendor.js'
  }
};

// webpack.prod.js
module.exports = {
  output: {
    filename: '[name].[contenthash].bundle.js',
  },
};

// webpack.dev.js
module.exports = {
  output: {
    filename: '[name].bundle.js',
  },
};
```

**入口配置参数：**
- `dependOn`：当前入口所依赖的入口。它们必须在该入口被加载前被加载。

```js
module.exports = {
  entry: {
    app: './src/app.js',
    search: './src/search.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  }
};

module.exports = {
  output: {
    path: '/home/proj/cdn/assets/[fullhash]',
    publicPath: 'https://cdn.xxx.com/assets/[fullhash]/'
  }
};
```

# loader

`loader`从右到左执行。
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          { loader: 'sass-loader' }
        ]
      }
    ]
  }
};
```

**内联方式**
```js
import Styles from '!style-loader!css-loader?modules!./style.css';
```

# plugin

`webpack`插件是一个具有`apply`方法的`JavaScript`对象。`apply`方法会被`webpack compiler`调用，并且在整个编译生命周期都可以访问`compiler`对象。

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new webpack.ProgressPlugin()
  ]
};
```

`ProgressPlugin`用于自定义编译过程中的进度报告，`HtmlWebpackPlugin`将生成一个`HTML`文件，并在其中使用`script`引入一个名为`my-first-webpack.bundle.js`的`JS`文件。

# 模块解析

`resolver`是一个帮助寻找模块绝对路径的库。

**`webpack`中的解析规则**

使用`enhanced-resolve`，`webpack`能解析三种文件路径：

- 绝对路径
```js
import '/home/me/file';
import 'C:\\Users\\me\\file';
```

- 相对路径
```js
import '../src/file1';
import './file2';
```
使用`import`或`require`的资源文件所处的目录，被认为是上下文目录。在`import/require`中给定的相对路径，会拼接此上下文路径，来生成模块的绝对路径。

- 模块路径
```js
import 'module';
import 'module/lib/file';
```
在`resolve.modules`中指定的所有目录中检索模块。通过配置别名的方式来替换初始模块路径。
- 如果`package`中包含`package.json`文件，在`resolve.exportsFields`配置选项中指定的字段会被一次查找。

根据规则解析路径，`resolver`将会检查路径是指向文件还是文件夹。

如果路径指向文件：
- 文件具有扩展名，则直接将文件打包。
- 否则，使用`resolve.extensions`选项作为文件扩展名来解析。

如果路径指向一个文件夹：
- 如果文件夹中包含`package.json`文件，则会根据`resolve.mainFields`配置中的字段顺序查找，并根据`package.json`中的符合配置要求的第一个字段来确定文件路径。
- 如果不存在`package.json`文件或`resolve.mainFields`没有返回有效路径，则会根据`resolve.mainFields`配置选项中指定的文件名顺序查找，看是否能在`import/require`的目录下匹配到一个存在的文件名。
- 然后使用`resolve.extensions`选项，以类似的方式解析文件扩展名。

**缓存**

每次文件系统访问文件都会被缓存，以便于更快触发对同一文件的多个并行或串行请求。在`watch`模式下，只有修改过的文件会被从缓存中移除。如果关闭`watch`模块，则会在每次编译前清理缓存。