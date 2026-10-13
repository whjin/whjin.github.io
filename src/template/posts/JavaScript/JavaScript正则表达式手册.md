---
title: JavaScript正则表达式手册
date: 2026-10-12 14:45:11
category: JavaScript
tags: ['javascript', '正则表达式', '正则表达式手册']
description: "正则表达式是处理字符串最强大的工具，但也是最容易写错、最难调试的工具。本手册分为四部分：JS 正则怎么用 → 语法速查 → 常用表达式合集 → 常见坑，收藏后随查随用。 官方参考：完整的 RegExp 语法定义见 MDN Regular Expressions 文档，本文是其实战提炼。 一、JavaScript 正则的四种用法 创建正则 四种核心方法 方法 所属对象 返回值 适用场景 regex.test(str) RegExp true / false 只判断是否匹配，如表单校验 str.match(regex) String 匹配结果数组或 null 提取匹配内容，最简单 str.matc"
top: true
---

正则表达式是处理字符串最强大的工具，但也是最容易写错、最难调试的工具。本手册分为四部分：**JS 正则怎么用 → 语法速查 → 常用表达式合集 → 常见坑**，收藏后随查随用。

> 官方参考：完整的 RegExp 语法定义见 [MDN Regular Expressions 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions)，本文是其实战提炼。

## 一、JavaScript 正则的四种用法

### 创建正则

```js
// 字面量（推荐，性能更好）
const re = /\d{4}-\d{2}-\d{2}/

// 构造函数（需要动态拼接正则时用）
const re = new RegExp('\\d{4}-' + month + '-\\d{2}')
```

### 四种核心方法

| 方法 | 所属对象 | 返回值 | 适用场景 |
|------|---------|--------|---------|
| `regex.test(str)` | RegExp | `true` / `false` | 只判断是否匹配，如表单校验 |
| `str.match(regex)` | String | 匹配结果数组或 `null` | 提取匹配内容，最简单 |
| `str.matchAll(regex)` | String | 可迭代对象 | 需要遍历所有匹配项（必须加 `g` 标志） |
| `regex.exec(str)` | RegExp | 匹配详情或 `null` | 需要获取捕获组位置、全局遍历 |
| `str.replace(regex, newStr)` | String | 替换后的新字符串 | 文本替换、格式化 |
| `str.split(regex)` | String | 数组 | 按正则分割字符串 |

**示例：提取日期中的年、月、日**

```js
const str = '发布于 2026-10-13'
const re = /(\d{4})-(\d{2})-(\d{2})/

str.match(re)
// ['2026-10-13', '2026', '10', '13', index: 3, input: '发布于 2026-10-13']

// exec 配合 g 标志可以遍历所有匹配：
while ((m = re.exec(str)) !== null) {
  console.log(m[1], m[2], m[3]) // 2026 10 13
}
```

### 六个标志位

| 标志 | 名称 | 作用 | 常见坑 |
|------|------|------|--------|
| `g` | global | 匹配所有，不遇第一个就停 | 不加 `g` 时 `exec` 不会遍历 |
| `i` | ignoreCase | 忽略大小写 | `/ABC/i` 匹配 `abc` |
| `m` | multiline | `^` `$` 匹配每行首尾，而非整个字符串首尾 | 多行文本处理时必加 |
| `s` | dotAll | `.` 匹配包括换行符 `\n` 在内的任意字符 | 默认 `.` 不匹配换行 |
| `u` | unicode | 正确处理 Unicode 码点（如 emoji） | 匹配中文/emoji 建议加 |
| `y` | sticky | 从 `lastIndex` 指定位置精确匹配 | 较少使用 |

**示例：多行匹配**

```js
const text = 'line1\nline2\nline3'

// 不加 m：只匹配整个字符串开头
/^line/.test(text) // false

// 加 m：匹配每一行开头
/^line/m.test(text) // true
```

## 二、元字符全集速查

### 字符类与简写

| 字符 | 描述 | 示例 |
|------|------|------|
| `\d` | 数字，等价 `[0-9]` | `/\d+/` 匹配 `2026` |
| `\D` | 非数字，等价 `[^0-9]` | |
| `\w` | 单词字符：字母、数字、下划线，等价 `[A-Za-z0-9_]` | |
| `\W` | 非单词字符 | |
| `\s` | 空白字符：空格、Tab、换行等 | |
| `\S` | 非空白字符 | |
| `.` | 除换行符外任意字符（加 `s` 标志后含换行） | |
| `\b` | 单词边界 | `/\ber\b/` 匹配 `never` 中的 `er`，不匹配 `verb` |
| `\B` | 非单词边界 | |

### 量词

| 字符 | 描述 | 示例 |
|------|------|------|
| `*` | 零次或多次，等价 `{0,}` | `/zo*/` 匹配 `z`、`zoo` |
| `+` | 一次或多次，等价 `{1,}` | `/zo+/` 匹配 `zo`、`zoo`，不匹配 `z` |
| `?` | 零次或一次，等价 `{0,1}` | `/colou?r/` 匹配 `color`、`colour` |
| `{n}` | 恰好 n 次 | `\d{11}` 匹配 11 位数字 |
| `{n,}` | 至少 n 次 | |
| `{n,m}` | n 到 m 次 | |
| `+?` `*?` `??` | 非贪婪模式（尽量少匹配） | `/".+?"/` 匹配 `"a" b"` 中的 `"a"` |

### 分组与捕获

| 语法 | 描述 |
|------|------|
| `(pattern)` | 捕获分组，匹配结果存入 `$1`、`$2`... |
| `(?:pattern)` | 非捕获分组，只分组不存储。如 `/(?:http)s?/` |
| `(?<name>pattern)` | 命名捕获组，`/(?<year>\d{4})/`，用 `m.groups.year` 读取 |
| `\1` `\2` | 反向引用，引用前面第 n 个分组 |

**示例：匹配重复单词**

```js
const re = /(\w+)\s+\1/gi
'the the cat'.match(re) // ['the the']
```

### 预查（断言）

预查不消耗字符，只判断"后面/前面是否跟着某个模式"。

| 语法 | 名称 | 描述 |
|------|------|------|
| `(?=pattern)` | 正向肯定预查 | 后面跟着 pattern 才匹配 |
| `(?!pattern)` | 正向否定预查 | 后面不跟着 pattern 才匹配 |
| `(?<=pattern)` | 反向肯定预查 | 前面是 pattern 才匹配 |
| `(?<!pattern)` | 反向否定预查 | 前面不是 pattern 才匹配 |

**示例：匹配金额数字（前面有 ¥ 符号）**

```js
const re = /(?<=¥)\d+(\.\d{2})?/
'¥99.00'.match(re) // ['99.00']
```

### 锚点与其他

| 字符 | 描述 |
|------|------|
| `^` | 字符串开头（加 `m` 后匹配每行开头） |
| `$` | 字符串结尾（加 `m` 后匹配每行结尾） |
| `[xyz]` | 字符集合，匹配其中任意一个字符 |
| `[^xyz]` | 排除集合，匹配不在其中的字符 |
| `[a-z]` | 字符范围 |
| <code>x&#124;y</code> | 匹配 x 或 y |
| `\uXXXX` | Unicode 字符，如 `\u4e2d` 匹配"中" |
| `\xXX` | 十六进制 ASCII，如 `\x41` 匹配 `A` |

## 三、常用正则合集

### 表单校验类

| 场景 | 正则 | 说明 |
|------|------|------|
| 用户名 | `/^[a-zA-Z0-9_-]{3,16}$/` | 3-16 位字母数字下划线短横线 |
| 强密码 | `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/` | 至少 8 位，含大小写字母和数字 |
| 邮箱 | `/^[\w.-]+@[\w-]+(\.[\w-]+)*\.[a-zA-Z]{2,}$/` | 通用邮箱格式 |
| 中国大陆手机号 | `/^1[3-9]\d{9}$/` | 11 位，1 开头，第二位 3-9 |
| 身份证号 | `/^\d{17}[\dXx]$/` | 18 位，末位可为 X |
| URL | `/^https?:\/\/[\w-]+(\.[\w-]+)+([\/\w\-._~:?#[\]@!$&'()*+,;=%]*)*$/` | 匹配 http/https 链接 |
| IPv4 地址 | <code>/^((25[0-5]&#124;2[0-4]\d&#124;1?\d?\d)\.){3}(25[0-5]&#124;2[0-4]\d&#124;1?\d?\d)$/</code> | 每段 0-255 |
| 十六进制颜色 | <code>/^#([0-9a-fA-F]{3}&#124;[0-9a-fA-F]{6})$/</code> | `#fff` 或 `#ffffff` |
| QQ 号 | `/^[1-9]\d{4,10}$/` | 5-11 位，非 0 开头 |
| 邮政编码 | `/^[1-9]\d{5}$/` | 6 位 |

### 文本处理类

| 场景 | 正则 | 说明 |
|------|------|------|
| 提取 HTML 标签内文本 | `/<[^>]+>(.*?)<\/[^>]+>/g` | 配合 `m[1]` 获取内容 |
| 去除 HTML 标签 | `/<[^>]+>/g` | `str.replace(re, '')` |
| 匹配中文 | `/[\u4e00-\u9fa5]/g` | 匹配所有汉字 |
| 压缩连续空格 | `/\s+/g` | `str.replace(re, ' ')` |
| 去除首尾空白 | <code>/^\s+&#124;\s+$/g</code> | 或直接用 `str.trim()` |
| 匹配文件扩展名 | `/\.(\w+)$/` | 从 `photo.jpg` 提取 `jpg` |
| 匹配 Markdown 图片 | `/!\[([^\]]*)\]\(([^)]+)\)/g` | 提取 alt 和 src |
| 匹配 Markdown 链接 | `/\[([^\]]+)\]\(([^)]+)\)/g` | 提取链接文字和 URL |

### 数字处理类

| 场景 | 正则 |
|------|------|
| 整数 | `/^-?\d+$/` |
| 浮点数 | `/^-?\d+(\.\d+)?$/` |
| 千分位分隔 | `str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')` |
| 匹配日期 YYYY-MM-DD | <code>/^\d{4}-(0[1-9]&#124;1[0-2])-(0[1-9]&#124;[12]\d&#124;3[01])$/</code> |

## 四、常见坑与最佳实践

### 1. 别用正则解析 HTML

> "Some people, when confronted with a problem, think 'I know, I'll use regular expressions.' Now they have two problems."

正则无法正确处理嵌套标签。复杂 HTML 解析请用 `DOMParser` 或 cheerio。

### 2. 贪婪 vs 非贪婪

```js
const str = '<div>hello</div><div>world</div>'

// 贪婪：匹配到最后一个 </div>
str.match(/<div>.*<\/div>/) // ['<div>hello</div><div>world</div>']

// 非贪婪：只匹配第一个完整 div
str.match(/<div>.*?<\/div>/) // ['<div>hello</div>']
```

### 3. `g` 标志下的 `test` 陷阱

```js
const re = /\d/g
re.test('1') // true
re.test('1') // false ← 意外？
re.test('1') // true
```

**原因**：加了 `g` 标志后，`test` 和 `exec` 会在正则对象上维护 `lastIndex`，下次调用从上次结束位置继续。

**解决**：不要在循环里复用同一个带 `g` 的正则，或者每次新建正则：

```js
// 正确做法：每次新建正则对象
/\d/g.test('1') // true
/\d/g.test('1') // true
```

### 4. 转义特殊字符

正则里 `. * + ? ^ $ { } ( ) | [ ] \` 都是特殊字符。要匹配字面量，必须加 `\`：

```js
// 错误：匹配 .com 实际会匹配任意字符 + com
/^.com/.test('xcom') // true

// 正确
/^\.com/.test('xcom') // false
/^\.com/.test('.com') // true
```

### 5. 调试工具推荐

写正则时善用在线可视化工具：

- **regex101.com**：实时高亮匹配结果，解释每个符号的含义
- **regexr.com**：社区收藏的正则合集

先在工具里调试好，再复制到代码里。

---

这份手册建议收藏。遇到字符串处理问题时，先想想"正则能不能解决"，再查对应的语法。写好正则的关键不是记住所有语法，而是**知道有这个语法存在，用时再查**。

## 相关阅读

- [JavaScript功能代码集合](https://wuhuajin.com/src/template/posts/JavaScript/html/功能代码集合.html) — 常用 JS 工具函数与代码片段
- [ECMAScript文档](https://wuhuajin.com/src/template/posts/JavaScript/html/ECMAScript文档.html) — ES6+ 新特性速查
- [设计模式文档](https://wuhuajin.com/src/template/posts/JavaScript/html/设计模式文档.html) — JS 常用设计模式
- 在线工具：[regex101](https://regex101.com/) · [regexr](https://regexr.com/)
