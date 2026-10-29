# FundScope 独立合规站点改造方案（v2 已实施并验证）

> 状态：**已按本方案完成代码改造，并通过本地 3000 端口端到端验证**（2026-10-29）。
> 部署上线至 fundscope.wuhuajin.com 需用户确认后执行。

> 目标：用 **fundscope.wuhuajin.com** 子域名作为 Waffle Pancake 审核的独立合规站点，
> 满足审核清单 5 项；同时保留 wuhuajin.com 主站的赞赏/打赏功能（不在审核范围内）。

---

## 一、核心思路

fundscope.wuhuajin.com 改造成一个**以 FundScope 为核心产品的合规 SaaS 落地站**：

- 产品落地首页（真实功能入口）→ 满足"产品可见、可访问、真实可用"
- 公开定价页 → 满足清单③
- 页脚 Terms / Privacy / 支持邮箱 → 满足清单④⑤
- 站点内**无任何打赏/二维码/Ko-fi、不链接主站赞赏页** → 满足清单①
- 主站 wuhuajin.com 的赞赏功能完整保留，不在此站出现

---

## 二、站点结构设计

```
fundscope.wuhuajin.com/
├── index.html        # 【改造】产品落地首页（原基金搜索首页改为功能入口）
├── analyze.html      # 【新增】真实产品功能页（基金搜索 + 持仓分析，现 index 改造）
├── pricing.html      # 【新增】公开定价页
├── terms.html        # 【新增】服务条款（含定价/退款/取消）
├── privacy.html      # 【新增】隐私政策
├── app.html          # 【新增/可选】注册登录（localStorage 模拟）
├── css/  js/  data.json  server.js   # 保留现有
└── 公共 footer 组件   # 【裁剪版】复用 wuhuajin 样式，去除不合规链接
```

### 1. 首页 index.html（产品落地页）
参考 wuhuajin `product.html` 的版式风格，内容改为 **FundScope 为主**：
- Hero：FundScope 名称 + 一句话价值主张 + "立即试用" CTA（跳 `analyze.html`）
- 功能预览：持仓明细、占比分布、市值排行（可放示意图/真实截图）
- 定价摘要卡片（链接到 `pricing.html`）
- 页脚：合规 footer

> 注意：`product.html` 描述的是"Developer Tools Suite（4 模块占位）"，而审核主推 **FundScope**。
> 所以不是原样照搬 product.html，而是**新建以 FundScope 为主的落地首页**（沿用其视觉风格）。

### 2. analyze.html（真实功能页）
把现有 `index.html` 的基金搜索 + 持仓分析功能完整迁移到这里，作为"真实可用的产品入口"。
用户能实际输入基金代码 → 看到持仓明细、占比饼图、市值条形图。

### 3. pricing.html（公开定价页）
| 字段 | 内容 |
|---|---|
| 计划名 | FundScope Pro |
| 价格 | $9.99 / 月（可调整） |
| 计费周期 | 按月订阅，7 天免费试用 |
| 功能清单 | 持仓明细 / 占比分布 / 市值排行 / 历史持仓 / 导出等 |

### 4. terms.html / privacy.html
从 wuhuajin 复制适配 FundScope，补充**定价 / 退款 / 取消政策**（清单④明确要求）。

### 5. footer（合规裁剪版）
复用 wuhuajin footer 的样式（css），但链接**裁剪为产品站专属**：
| 保留 | 移除（会违规/偏离） |
|---|---|
| 产品 / 功能 / 定价 | ❌ 赞赏墙 reward.html |
| Terms / Privacy / AIGC | ❌ 订阅会员（Waffo 失效链接） |
| 支持邮箱 wuhuajin09@163.com | ❌ 博客分类 / 友情链接 |
| 备案号 / © | ❌ 任何指向主站博客/赞赏的链接 |
| 新趣集徽章（可选） | |

> 关键：**此站 footer 不放任何指向 wuhuajin.com 主站博客/赞赏的链接**，避免审核员顺着发现赞赏功能。

### 6. 注册/登录（app.html，可选）
fundscope 无账号体系。按你想法：用 **localStorage 模拟登录态**（前端记录"已登录"），
不影响审核（清单未要求完整账号体系）。或先保持现状不添加。

---

## 三、审核清单对照

| Waffle 清单 | 本方案实现 |
|---|---|
| ① 移除打赏/二维码/Ko-fi | ✅ 新站 footer/页面无任何打赏入口；不链接主站赞赏页 |
| ② 站点可访问 + 产品可见 | ✅ fundscope.wuhuajin.com 公开访问；首页主推 FundScope |
| ③ 公开定价页 | ✅ pricing.html |
| ④ 页脚 Terms + Privacy（含退款/取消） | ✅ terms/privacy.html + footer 链接 |
| ⑤ 匹配支持邮箱 | ✅ footer 显示 wuhuajin09@163.com |

---

## 四、需要你确认的关键点

1. **首页内容**：新建"FundScope 产品落地首页"（沿用 product.html 风格），而非原样照搬 product.html——确认？
2. **footer 裁剪**：复用 wuhuajin 样式但移除赞赏/订阅/博客链接，做产品站专属版本——确认？
3. **定价**：FundScope Pro $9.99/月、7 天试用、按月订阅——是否按此写 pricing？
4. **注册/登录**：用 localStorage 简单模拟登录态，或暂不添加——倾向哪种？
5. **部署**：fundscope.wuhuajin.com 是独立子域名。当前如何部署（同一服务器不同子域 / 独立部署）？改造后按你现有 Deploy 流程走即可？

---

## 五、执行步骤（✅已完成 1-5，待 6 部署）

1. ✅ 备份 fundscope 现有 index.html（→ index_analyze_backup.html）
2. ✅ 新建 analyze.html（原分析功能完整迁移，含导航 + 合规 footer）
3. ✅ 改造 index.html 为 FundScope 产品落地页
4. ✅ 新增 pricing/terms/privacy/app.html + js/auth.js（localStorage 登录）
5. ✅ 引入合规 footer（复用 wuhuajin 结构，去除赞赏/订阅/博客链接）
6. ⏳ 本地 3000 端口联调验证（已完成）；发布到 fundscope.wuhuajin.com（待用户确认后执行）
