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