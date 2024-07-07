---
title: typescript开发文档
date: 2019-10-13 21:43:15
update: 2024-7-7 17:08:33
category: ["技术"]
tags: ["前端","TypeScript"]
comments: 
---

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

<!--more-->
