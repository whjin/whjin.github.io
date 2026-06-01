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

## 核心框架 `Redux`

- `Store` 的连接与订阅
- `Action`
- `Reducer`
- `react-redux`
- `redux-thunk`
- 自定义中间件

**`redux-thunk`中间件处理异步操作**

- `dispatch`默认只支持对象字面量，通过 `redux-thunk`可以让它支持回调函数
- 通过 `applyMiddleware`方法，让中间件生效

## `React`方法

- `setState`参数：`setState((prevState, nextProps)=>{},callback)`

## 生命周期

- 初始化：构建函数 -> `getDerivedStateFromProps` -> `render()`渲染 `UI` -> `componentDidMount`
- 更新：`getDrivedStateFromProps` -> `shouldComponentUpdate` -> `render`渲染 `UI` -> `componentDidUpdate`
- 销毁：`componentWillUnmount`

## `Hooks`

- `useEffect`: `useEffect(()=>{..., return ()=>{...}},[])`
- 只在最顶层使用 `Hooks`
- 只在 `React` 函数中调用 `Hooks`
