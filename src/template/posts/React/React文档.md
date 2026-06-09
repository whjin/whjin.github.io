## 核心技术

- `JSX`开发思想
- 虚拟 `dom` 渲染
- 单项数据流
- `state` 与 `props`
- 类组件与组件的生命周期
- 函数式组件与副作用处理机制
- `hooks`
- 事件处理
- 条件渲染
- 列表与数据塑形
- `ajax`异步处理
- 跨组件数据传递 `Context`
- `Provider`
- `CSS in JS`
- 模块化样式加载
- `UI`渲染原理

## `JSX`

`JSX = JavaScript + XML`

- `{}`模板语法
- 添加注释
- 属性渲染变量
- 事件渲染函数
- `style`渲染对象
- `{}`渲染 `JSX`

## `Redux`

- `Store` 的连接与订阅
- `Action`
- `Reducer`
- `react-redux`
- `redux-thunk`
- 自定义中间件

**`redux-thunk`中间件处理异步操作**

- `dispatch`默认只支持对象字面量，通过 `redux-thunk`可以让它支持回调函数
- 通过 `applyMiddleware`方法，让中间件生效

**`React`方法**

- `setState`参数：`setState((prevState, nextProps)=>{},callback)`

## 生命周期

- 初始化：构建函数 -> `getDerivedStateFromProps` -> `render()`渲染 `UI` -> `componentDidMount`
- 更新：`getDrivedStateFromProps` -> `shouldComponentUpdate` -> `render`渲染 `UI` -> `componentDidUpdate`
- 销毁：`componentWillUnmount`

## `Hooks`

- `useEffect`: `useEffect(()=>{..., return ()=>{...}},[])`
- 只在最顶层使用 `Hooks`
- 只在 `React` 函数中调用 `Hooks`

## 路由

- `react-router-dom` 用于浏览器，处理 `Web App` 的路由
  - 自动安装 `react-router`核心框架
  - `<Link />`组件可以渲染出 `<a />`标签
  - `<BrowserRouter />`组件利用 `H5 API`实现路由切换
  - `<HashRouter />`组件利用原生 `JS`中的 `window.location.hash`实现路由切换
- `react-router-native` 用于移动端 `React Native`，处理手机APP的路由
- `react-router-redux` 提供了路由中间件，处理 `redux`的集成
- `react-router-config` 用来静态配置路由

**网站路由系统**

- 路由导航与原生浏览器操作行为一致 `<BrowserRouter />`
- 路由的路径解析原理与原生浏览器一致，可以自动识别 `URL`路径 `<Route />`
- 路径的切换以页面为单位，不要页面堆叠 `<Switch />`

**在 `URL`中添加参数**

- 第一种最常见 使用 `?`来引导参数 `http://localhost:3000/path?name1=value1&name2=value2`
- 第二种：分段路由 `Segments` `http://localhost:3000/products/31415926`

## 国际化

- `i18next` 目前最主流的框架
- `react-i18next` `i18next`的 `React` 插件
