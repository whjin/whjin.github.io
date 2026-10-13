---
title: Hermes引擎文档
date: 2026-09-11
category: RN
description: "从 React Native 0.70 开始，Hermes 成为 Android 和 iOS 双平台的默认 JavaScript 引擎。它解决了 RN 长期被诟病的启动慢、内存高、包体积大三大问题。这篇文章讲清楚它为什么能做到。 核心工作原理 Hermes 采用 AOT（Ahead-Of-Time）预编译策略： - 构建时：Hermes 编译器介入，直接将 JS 代码编译为紧凑的字节码（.hbc 文件） - 运行时：App 启动时 Hermes 虚拟机直接加载并执行字节码，完全绕过运行时解析与 JIT 编译环节 对比传统引擎（V8/JSC）的 JIT（Just-In-Time）模式： - 运行"
---

从 React Native 0.70 开始，Hermes 成为 Android 和 iOS 双平台的默认 JavaScript 引擎。它解决了 RN 长期被诟病的启动慢、内存高、包体积大三大问题。这篇文章讲清楚它为什么能做到。

## 核心工作原理

Hermes 采用 **AOT（Ahead-Of-Time）预编译策略**：

- **构建时**：Hermes 编译器介入，直接将 JS 代码编译为紧凑的字节码（`.hbc` 文件）
- **运行时**：App 启动时 Hermes 虚拟机直接加载并执行字节码，**完全绕过运行时解析与 JIT 编译环节**

对比传统引擎（V8/JSC）的 **JIT（Just-In-Time）模式**：

- 运行时解析 JS 代码 → 解析执行 → 动态分析热点 → 编译成机器码

| 执行阶段 | 传统引擎（JSC/V8） | Hermes（AOT） |
|---------|-------------------|---------------|
| 构建阶段 | 代码压缩与混淆 | **预编译为字节码（.hbc）** |
| 运行时加载 | 解析 JS 源码 | 直接加载字节码 |
| 运行时编译 | 动态分析热点代码（JIT） | **无需编译，直接执行** |

## 三大核心优势

### 1. 极速启动

字节码预编译意味着 App 启动时不需要解析和编译 JS，直接执行。这是 Hermes 最直观的提升——打开 App 的等待时间大幅缩短。

### 2. 低内存占用与低延迟 GC

最新的 **Hades 垃圾回收器**采用并发标记-清除算法，在后台线程完成内存回收，UI 线程暂停时间压缩到 **2ms 以内**。对比 V8 的 Stop-The-World GC，滑动场景中可减少 **70% 的掉帧**。

### 3. 更小的安装包

生成的 `.hbc` 字节码比原始 JS 源码体积小 **30%-50%**，有效缩减 APK/IPA 体积。

## 局限性

1. **无 JIT，计算密集型场景稍弱**：不含即时编译器，复杂动画渲染、大量数据处理等长时间运行场景下，性能可能不如 V8/JSC 的 JIT 优化版本。
2. **部分第三方库兼容性问题**：使用了 `Proxy`、`WeakRef` 等高级特性或非标准写法的原生库，可能出现兼容性问题。
3. **功能子集**：目前不完全支持所有最新的 ES 特性。

## 什么时候需要关注 Hermes

- **新 RN 项目**：默认开启，无需额外配置
- **老项目从 0.69 升级**：会自动切换到 Hermes，需要测试第三方原生库兼容性
- **遇到计算密集型性能问题**：可以在 `android/app/build.gradle` 中关闭 Hermes 对比测试

## 相关阅读

- [React Native 官方文档](https://reactnative.dev/docs/hermes) — Hermes 配置与调试
- [Web3文档](https://wuhuajin.com/src/template/posts/Web3/html/Web3文档.html) — Web3 前端开发入门
