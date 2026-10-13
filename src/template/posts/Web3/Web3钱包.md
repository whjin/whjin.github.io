---
title: Web3钱包
date: 2026-09-11
category: Web3
description: "这篇文章梳理以太坊开发中最核心的几个概念：gas 费怎么算、合约怎么接收转账、前端怎么连接钱包。不需要有 Solidity 基础也能看懂。 一、gas 是什么 区块链上每笔交易的执行都需要消耗计算资源，矿工（验证者）执行这些工作需要激励。gas 就是支付给矿工的费用，ETH 是这个生态系统的通行货币。 关键点：转账就是函数调用。在以太坊上，你向地址转 ETH 和调用合约函数本质上是同一回事——都是发送一笔交易。 二、gaslimit 与 gasleft() 概念 说明 gaslimit（交易级） 交易发起者设定最多愿意消耗多少 gas gaslimit（合约间调用） 合约之间调用时，调用者可以"
---

这篇文章梳理以太坊开发中最核心的几个概念：gas 费怎么算、合约怎么接收转账、前端怎么连接钱包。不需要有 Solidity 基础也能看懂。

## 一、gas 是什么

区块链上每笔交易的执行都需要消耗计算资源，矿工（验证者）执行这些工作需要激励。**gas 就是支付给矿工的费用**，ETH 是这个生态系统的通行货币。

关键点：**转账就是函数调用**。在以太坊上，你向地址转 ETH 和调用合约函数本质上是同一回事——都是发送一笔交易。

## 二、gaslimit 与 gasleft()

| 概念 | 说明 |
|------|------|
| gaslimit（交易级） | 交易发起者设定最多愿意消耗多少 gas |
| gaslimit（合约间调用） | 合约之间调用时，调用者可以设定本次调用的 gas 上限 |
| gaslimit（区块级） | 每个区块本身有 gas 上限，限制区块大小 |
| gasleft() | 合约中查看当前还剩多少可用 gas |

**退款规则**：
- 没用完的 gas 会**原路退回**给发起者
- 如果 gas 耗尽（out of gas），交易立即终止，已消耗的 gas 不退
- 交易执行失败时，已用的 gas 也不退（因为矿工确实执行了工作）

## 三、receive() 与 fallback() 函数

当你向合约地址转账 ETH 时，合约需要特殊函数来接收：

### 调用解析逻辑

当一笔交易发给合约时，EVM 按以下顺序匹配：

1. 自定义函数匹配 `selector`（函数签名哈希）
2. `receive()` 函数——当 calldata 为空时匹配
3. `fallback()` 函数——兜底
4. 如果都不匹配，交易回退

> 注意：除了 `fallback` 必须在尾部，其他顺序无关。

### payable 修饰符

解析成功后还会检查：**如果发送了 ETH（value > 0）但函数没有 `payable` 修饰符，交易直接失败**。这是防止误转账的安全机制。

## 四、地址的 checksum

以太坊地址有 40 个十六进制字符，大小写混合的 **checksum 格式**是一种校验机制：

- checksum 在**链下**完成（比如 ethers.js 这类前端库自动处理）
- 链上**不会**校验 checksum
- 作用是防止你复制粘贴地址时出错（大小写错了会被库提前发现）

## 五、前端连接钱包的流程

以 MetaMask 为例，前端连接钱包的标准流程：

```js
// 1. 请求连接钱包
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});
// 返回 ['0x123...'] 当前连接的地址

// 2. 检查当前网络是否正确
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
if (chainId !== '0x1') { // 1 = 主网
  // 3. 提示用户切换网络
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x1' }]
  });
}
```

### 代码组织建议

- **写操作**（发交易、签消息）：必须连接钱包
- **读操作**（查合约数据）：如果不需要当前账户，可以直接用 `JsonRpcProvider` 连公共节点，不用弹窗请求钱包
- 把合约访问逻辑封装在 `service` 层组件中，UI 层只调用

## 相关阅读

- [Solidity文档](https://wuhuajin.com/src/template/posts/Web3/html/Solidity文档.html) — Solidity 语法速查
- [Web3文档](https://wuhuajin.com/src/template/posts/Web3/html/Web3文档.html) — Web3 前端开发入门
- [以太坊官方文档](https://ethereum.org/zh/developers/docs/) — 权威资料
