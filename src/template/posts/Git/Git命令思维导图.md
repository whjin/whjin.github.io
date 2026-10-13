---
title: Git命令思维导图
date: 2026-10-12 01:25:07
category: Git
description: "Git 命令很多，但日常高频使用的集中在：提交规范、分支操作、远程协作、撤销回退这几类。下面整理了 7 张思维导图，每张附文字要点。 1. Conventional Commits 提交规范 规范化的提交信息让每次变更一目了然，还能自动生成 CHANGELOG。 格式：type(scope): description 核心 type 类型： type 含义 示例 feat 新功能 feat(login): 添加微信登录 fix 修复 Bug fix(home): 修复首页轮播图不自动播放 docs 文档变更 docs(readme): 更新安装说明 refactor 重构 refactor(a"
top: true
---

Git 命令很多，但日常高频使用的集中在：提交规范、分支操作、远程协作、撤销回退这几类。下面整理了 7 张思维导图，每张附文字要点。

## 1. Conventional Commits 提交规范

规范化的提交信息让每次变更一目了然，还能自动生成 CHANGELOG。

**格式**：`type(scope): description`

**核心 type 类型**：

| type | 含义 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(login): 添加微信登录` |
| `fix` | 修复 Bug | `fix(home): 修复首页轮播图不自动播放` |
| `docs` | 文档变更 | `docs(readme): 更新安装说明` |
| `refactor` | 重构 | `refactor(api): 重构用户接口参数校验` |
| `perf` | 性能优化 | `perf(list): 优化长列表渲染性能` |
| `build` | 构建系统 | `build(webpack): 升级 webpack 5` |
| `ci` | 持续集成 | `ci(gitlab): 修改 CI 流水线配置` |
| `chore` | 杂项 | `chore: 更新 .gitignore` |
| `test` | 测试 | `test(utils): 补充工具函数单元测试` |
| `style` | 代码格式 | `style: 统一缩进为 2 空格` |

![Git提交规范](https://s1.imagehub.cc/images/2026/10/11/f973f47c4b8e2aa5d50d0317d4689799.md.webp)

## 2. 破坏性变更标记

在 type 后加 `!` 表示 BREAKING CHANGE：

```
feat!: 重构用户接口，不兼容旧版
```

或在 body 中写：
```
BREAKING CHANGE: /api/user 接口参数从 id 改为 userId
```

![Git破坏性变更](https://s1.imagehub.cc/images/2026/10/11/4ea3172e1cffd9daa568358e6eefc035.md.webp)

## 3. 分支管理

**常用分支模型**：
- `main` / `master`：生产分支
- `develop`：开发分支
- `feature/*`：功能分支
- `hotfix/*`：紧急修复分支

**高频命令**：
```bash
git branch feature/login    # 创建分支
git checkout feature/login  # 切换分支
git merge feature/login     # 合并分支
git branch -d feature/login # 删除分支
```

![Git分支管理](https://s1.imagehub.cc/images/2026/10/11/09cc0ee7256a7d1370eba525505df2e4.md.webp)

## 4. 远程协作

```bash
git remote add origin <url>   # 添加远程仓库
git push -u origin main       # 推送并设置上游
git pull origin main          # 拉取远程更新
git fetch origin              # 仅拉取不合并
```

![Git远程协作](https://s1.imagehub.cc/images/2026/10/11/8a59bddb0378c308e7c2c1a92ba48b92.md.webp)

## 5. 撤销与回退

```bash
git checkout -- file         # 撤销工作区修改
git reset HEAD file          # 撤销暂存区
git revert <commit>          # 创建反向提交（安全，不改历史）
git reset --hard <commit>    # 强制回退（危险，改历史）
```

![Git撤销回退](https://s1.imagehub.cc/images/2026/10/11/235531f0e325c9c557aa31ff7691ff8b.md.webp)

## 6. 暂存与储藏

```bash
git stash                    # 临时储藏当前修改
git stash list               # 查看储藏列表
git stash pop                # 恢复最近一次储藏
git stash drop               # 删除储藏
```

![Git暂存储藏](https://s1.imagehub.cc/images/2026/10/11/a18530b781aa22d95ad2a8cf88aa4a5b.md.webp)

## 7. 标签与版本

```bash
git tag v1.0.0               # 打轻量标签
git tag -a v1.0.0 -m "发布 1.0"  # 打附注标签
git push origin v1.0.0       # 推送标签
```

![Git标签版本](https://s1.imagehub.cc/images/2026/10/11/7efbc6eaf5a293618f47ff711db3dc36.md.webp)

## 相关阅读

- [Git文档](https://wuhuajin.com/src/template/posts/Git/html/Git文档.html) — Git 完整命令速查
- [ADB命令集合](https://wuhuajin.com/src/template/posts/Android/html/ADB命令集合.html) — Android 调试命令
- [Conventional Commits 官方规范](https://www.conventionalcommits.org/zh-hans/v1.0.0/)
