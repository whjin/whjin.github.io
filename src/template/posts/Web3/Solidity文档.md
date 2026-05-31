> `Solidity`面向合约、为实现智能合约而创建的高级编程语言。受到了 `C++`，`Python` 和 `JavaScript` 语言的影响，设计的目的是能在以太坊虚拟机（`EVM`）上运行。  
> `Solidity` 是静态类型语言，支持集成、库和复杂的用户定义类型等特性。

## 智能合约

关键字 `pragma` (编译指令)是告知编译器如何处理源代码的指令。`Solidity` 中的合约就是一组代码和数据，它们位于以太坊区块链的一个特定地址上。

所有的标识符（合约名、函数名和变量名）都只能使用 `ASCII` 字符集。`UTF-8` 编码的数据可以用字符串变量的形式存储。

**数据类型**

- 值类型 `value type`
  - 整数 枚举 布尔
  - `address` `contract`
  - `fixed` `byte` `array`
- 引用类型 `reference type`

**`integer(int/uint)`**

- 以 `8` 位字长递增
- 对于整形数类型 `x`，可以用 `type(x)min()`和 `type(x)max()`取这个类型的最大值或最小值
- 以太坊虚拟机是 `256`位的机器

**`enum type`**

- 枚举是用户创建自定义类型的一种方法 `contract` `struct` `enum`
- 可以与整形数显式转换（隐式不行）
- 整形到枚举的转换会检查是否越界
- 枚举最少一个成员，最多 `256`个成员（`uint8`），默认值是第一个成员
- 从 `0`开始的无符号整形数

**`address`**

- `20`个字节长度
- 关于可支付：
  - `address payable`可支付，有成员函数 `transfer`和 `send`
  - `address payable`可转换为 `address`，反之需要显式转换
  - 可转换为 `unit160`和 `bytes20`
  - 合约账户地址与外部账户地址 `EOA External Owner Account`
  - `call` `balance` 很大程度上 `address`并不只是一个数据类型

**合约的基本结果**

- 合约中的成员变量
- 合约中的成员函数
- `event` `modifier` `constructor`

**函数可见性**
默认值变化 `private` `public` `internal` `external`

**合约函数的交易属性**

- `view` 合约状态读操作
- `pure` 与合约状态无关的函数
- 默认是写操作 全网广播，共识确认

### 子货币（`Subcurrency`）

## 安全

- **重入攻击（`Reentrancy`）-最高危**

**问题本质：**向外部合约转账/调用时，控制权会转移给对方，恶意合约可在原函数执行完成前回调，重复执行敏感逻辑（如多次提款）

## 问题汇总

- **有效载荷 `payload`**：随交易一起发送的字节码“数据”
- **创建一个可以被中止并退款的合约**：在构造函数中，将 `creator` 赋值为 `msg.sender`，并保持。然后调用 `selfdestruct(creator)` 来中止程序并进行退款。
