---
title: JavaScript思维导图合集
date: 2026-10-12 01:27:12
category: JavaScript
description: "这里整理了 JavaScript 入门阶段最核心的 8 个知识点思维导图。每张图覆盖一个主题，图下附文字要点，方便快速回顾。 1. 变量 要点： - 声明方式：var（函数作用域）、let（块级）、const（常量） - 数据类型：原始类型（number、string、boolean、null、undefined、symbol、bigint）和引用类型（object、array、function） - 类型转换：隐式转换（==、+ 运算）和显式转换（Number()、String()、Boolean()） - 作用域：全局、函数、块级；作用域链查找规则 2. 运算符 要点： - 算术运算符：+"
top: true
---

这里整理了 JavaScript 入门阶段最核心的 8 个知识点思维导图。每张图覆盖一个主题，图下附文字要点，方便快速回顾。

## 1. 变量

**要点**：
- 声明方式：`var`（函数作用域）、`let`（块级）、`const`（常量）
- 数据类型：原始类型（number、string、boolean、null、undefined、symbol、bigint）和引用类型（object、array、function）
- 类型转换：隐式转换（`==`、`+` 运算）和显式转换（`Number()`、`String()`、`Boolean()`）
- 作用域：全局、函数、块级；作用域链查找规则

![JavaScript变量](https://cdn.nlark.com/yuque/0/2020/gif/172511/1590632791744-4ed7cd55-970d-495c-99d0-4db4d24c2664.gif)

## 2. 运算符

**要点**：
- 算术运算符：`+` `-` `*` `/` `%` `**`
- 比较运算符：`==`（值相等）vs `===`（值和类型都相等）
- 逻辑运算符：`&&` `||` `!`，短路求值规则
- 位运算符：`&` `|` `~` `^` `<<` `>>`
- 三元运算符：`condition ? a : b`
- 扩展：可选链 `?.`、空值合并 `??`

![JavaScript运算符](https://cdn.nlark.com/yuque/0/2020/gif/172511/1590632900919-e29e24c2-469f-44b5-977d-35ff15618b3a.gif)

## 3. 数组

**要点**：
- 创建与访问：`[]`、索引从 0 开始
- 常用方法：`push/pop`（尾部增删）、`shift/unshift`（头部增删）、`slice/splice`（截取/删除）
- 遍历：`forEach`、`map`、`filter`、`reduce`、`find`、`some`、`every`
- 排序：`sort()` 默认按字符串排序，数字排序需传比较函数
- 展开与合并：`[...arr1, ...arr2]`、`concat`

![JavaScript数组](https://cdn.nlark.com/yuque/0/2020/gif/172511/1590632941508-deb08020-6824-4698-b4a3-f381fdc3f10f.gif)

## 4. 流程语句

**要点**：
- 条件：`if/else`、`switch/case`、三元运算符
- 循环：`for`、`while`、`do...while`、`for...of`（遍历值）、`for...in`（遍历键）
- 跳转：`break`（跳出循环）、`continue`（跳过本次）
- 异常：`try/catch/finally`

![JavaScript流程语句](https://cdn.nlark.com/yuque/0/2020/gif/172511/1590633050728-74824a09-3fc5-498d-bfbd-f3d99b49a272.gif)

## 5. 字符串函数

**要点**：
- 查找：`indexOf`、`includes`、`startsWith`、`endsWith`
- 截取：`slice`、`substring`、`substr`
- 修改：`replace`、`toUpperCase`、`toLowerCase`、`trim`
- 分割与拼接：`split`、`concat`
- 模板字符串：反引号 `` `${var}` ``

![JavaScript字符串函数](https://cdn.nlark.com/yuque/0/2020/gif/172511/1590633088168-5fc66d83-88af-4092-bb9d-611595a2912f.gif)

## 6. 函数基础

**要点**：
- 函数声明 vs 函数表达式 vs 箭头函数
- 参数：默认参数、剩余参数 `...args`、arguments 对象
- 作用域与闭包：内层函数访问外层变量
- 回调函数：作为参数传递的函数
- 立即执行函数 IIFE：`(function(){})()`

![JavaScript函数基础](https://cdn.nlark.com/yuque/0/2020/gif/172511/1590633110772-508a12d2-719b-4955-a852-e507f9329a6b.gif)

## 7. DOM 操作

**要点**：
- 获取元素：`getElementById`、`querySelector`、`querySelectorAll`
- 修改内容：`innerHTML`、`textContent`
- 修改样式：`element.style.color = 'red'`
- 修改属性：`getAttribute`、`setAttribute`
- 事件监听：`addEventListener('click', fn)`
- 创建与删除：`createElement`、`appendChild`、`removeChild`

![JavaScript基础DOM操作](https://cdn.nlark.com/yuque/0/2020/gif/172511/1590633142814-b643230d-2663-43cd-b293-44735d9cfa06.gif)

## 8. 正则表达式

**要点**：
- 元字符：`\d` `\w` `\s` `\b` `.`
- 量词：`*` `+` `?` `{n,m}`
- 分组：`(pattern)` 捕获，`(?:pattern)` 非捕获
- 标志位：`g`（全局）、`i`（忽略大小写）、`m`（多行）
- 方法：`test`、`match`、`replace`、`exec`

![JavaScript正则表达式](https://cdn.nlark.com/yuque/0/2020/gif/172511/1590633174157-6bdf0a83-ea2b-4f27-b9c0-5ec4ad276445.gif)

## 相关阅读

- [JavaScript正则表达式手册](https://wuhuajin.com/src/template/posts/JavaScript/html/JavaScript正则表达式手册.html) — 完整正则速查
- [ECMAScript文档](https://wuhuajin.com/src/template/posts/JavaScript/html/ECMAScript文档.html) — ES6+ 语法
- [设计模式文档](https://wuhuajin.com/src/template/posts/JavaScript/html/设计模式文档.html) — 设计模式
