---
title: typescript开发文档
date: 2019-10-13 21:43:15
update: 2026-03-05 23:24:07
category: ['技术']
tags: ['前端', 'TypeScript']
comments:
---

# 特性

- 类型批注 和编译时类型检查
- 类型推断
- 类型擦除
- 接口
- 枚举 `enum`
- `mixin`
- 泛型编程
- 名字空间
- 元组 tuple

# 类型

- `boolean` 布尔值
- `number` 数值
- `string` 字符串
- any`

**安装编译工具**

```javascript
"scripts": {
  "start": "tsc && concurrently \"npm run tsc:w\" \"npm run lite\"",
  "lite": "lite-server",
  "tsc": "tsc",
  "tsc:w": "tsc -w"
},
"devDependencies": {
  "concurrently": "^5.0.0",
  "lite-server": "^2.5.4"
}
```

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "extendsions": [".js", ".vue", ".json", ".ts", ".tsx"]
}
```
