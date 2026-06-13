> `Solidity`面向合约、为实现智能合约而创建的高级编程语言。受到了 `C++`，`Python` 和 `JavaScript` 语言的影响，设计的目的是能在以太坊虚拟机（`EVM`）上运行。  
> `Solidity` 是静态类型语言，支持集成、库和复杂的用户定义类型等特性。

# 智能合约

关键字 `pragma` (编译指令)是告知编译器如何处理源代码的指令。`Solidity` 中的合约就是一组代码和数据，它们位于以太坊区块链的一个特定地址上。

所有的标识符（合约名、函数名和变量名）都只能使用 `ASCII` 字符集。`UTF-8` 编码的数据可以用字符串变量的形式存储。

## 数据类型

### 值类型 `value type`

- 整数 枚举 布尔 `address` `contract` `fixed-size byte array`

#### `integer(int/uint)`

- 以 `8` 位字长递增
- 对于整形数类型 `x`，可以用 `type(x)min()`和 `type(x)max()`取这个类型的最大值或最小值
- 以太坊虚拟机是 `256`位的机器
- 低版本取模，高版本：抛出异常 `SafeMath`

#### `enum type`

- 枚举是用户创建自定义类型的一种方法 `contract` `struct` `enum`
- 可以与整形数显式转换（隐式不行）
- 整形到枚举的转换会检查是否越界
- 枚举最少一个成员，最多 `256`个成员（`uint8`），默认值是第一个成员
- 从 `0`开始的无符号整形数

#### `address`

- `20`个字节长度
- 关于可支付：
  - `address payable`可支付，有成员函数 `transfer`和 `send`
  - `address payable`可转换为 `address`，反之需要显式转换
  - 可转换为 `unit160`和 `bytes20`
  - 合约账户地址与外部账户地址 `EOA External Owner Account`
  - `call` `balance` 很大程度上 `address`并不只是一个数据类型

#### `contract`

- 合约可以隐式转换为它的父合约（多态）
- 可以显式转换为地址类型 `address`
- 不支持任何运算符
- 从合约变量（实例）调用合约函数
- 可用 `new`操作符部署另一合约

#### `fiexed-size byte array`

- 从 `bytes1`到 `bytes32`
- 通过下标访问元素
- 通过 `length`读取长度

### 引用类型 `reference type`

- 数组 `struct` `mapping`
- 引用类型，变量本身域变量指向的数据块分离，赋值操作是引用拷贝，数据块不受影响
- 通常的面向对象语言中所有引用类型变量之间赋值操作，都是引用拷贝
- 这一点在 `solidity`的引用类型中不再成立：`solidity`的引用类型的变量之间可能发生值拷贝

#### `location`

- `EVM`从三个地方访问数据：`memory` `storage` `calldata`，这三个地方就是变量的 `location`
- `calldata`实际上是 `Transation`的数据字段

#### 数组`array`

- 与 `location`不同，完全是两种类型
- `storage`和 `memory`中的动态数组
- 数组元素的类型限制

#### 结构 `struct`

- 结构如同 `contract`和 `enum`，用来自定义数据类型
- 状态变量、局部变量、参数与返回值均可用结构
- 结构可放在 `mapping`和数组中，结构的成员可以是 `mapping`或数组

#### 映射 `mapping`

- 声明形式：`mapping(key type=>value type)` `mapping(string=>uint8) ages;` `mapping(string => uint8) storage _ages = ages;`
- `keytype`可以是任何基本类型，包括 `bytes`和 `string`，不包括用户自定义的复杂类型——合约、枚举、结构、映射
- `value type`可以是包括 `mapping`在内的任何类型
- 可以作为状态变量、`storage`型局部变量、库函数的参数；不能作为共有函数的参数或返回值
- `public`的 `mapping`会自动生成 `getter`；嵌套的 `mapping`生成的 `mapper`会有多个参数
- `mapping`无法遍历 `storage layout`
- `public`函数参数或返回值不可能出现 `mapping`类型

## 合约函数

`function fname`（[参数]）[可见性][交易相关] `returns`(返回值) `{}`

- 函数签名：`fname`(参数)
- 返回值：`returns`(返回值)

### 函数可见性

默认值变化 `private` `public` `internal` `external`

- `public` - `memory` 完全可见
- `private` 对本合约可见
- `internal` - `storage` 成员变量 定义时需要赋值 对继承自合约可见

### 合约函数的交易属性

- `view` 合约状态读操作
- `pure` 与合约状态无关的函数
- 默认是写操作 全网广播，共识确认

### 合约的基本结果

- 合约中的成员变量
- 合约中的成员函数
- `event` `modifier` `constructor`

### 上下文变量

- 合约函数的背后是 `transaction`，上下文变量访问的是 `transaction`中的信息
- 两个上下文变量：`tx`和 `msg`

### 合约之间的函数调用

- `EOA external owned account` 外部账号 例如 `metamask`
- 调用最终总是由 `EOA`发起
- 合约之间的调用使得一次完整的调用成为一个调用链条

### 合约间调用过程

- 调用者须持有被调用合约的地址
- 得到 **被调用合约的信息**
- 将地址重载为被调用合约，调用它的函数

#### 源文件之间

- `import`被调用合约的源文件
- 调用者将被调用合约的地址重载为合约实例
- 用合约实例调用合约函数

### `ABI`

1. `EOA`使用的 `ABI`数据域合约间调用时调用者持有的接口是等价的，都是对合约函数签名的完整描述
2. 调用者使用 `ABI`数据生成 `message`中的 `calldata`

### `transaction`和 `block`

任何合约函数调用最终都是由一个 `EOA`发起一个 `transaction`触发，并通过合约之间的进一步调用形成一个调用链条。无论这个链条有多长，任何环节的函数都能够看到、访问这个链条的发起者 `transaction`，它是一个完整调用链条的全局性上下文变量，变量名称 `tx`。`transaction`总是来自于一个区块，这个区块对应的上下文变量的名称是 `block`。

### `message`上下文的变化

1. 合约之间的调用也模拟 `transaction`的结构，并且叫 `message`，变量名 `msg`。
2. 直接被外部账号调用使用的 `message`可以认为是 `transaction`的一个拷贝
3. `message`在合约间调用时新产生。调用链条中，合约内部调用看到的是一个 `message`，不同合约看到不同的 `message`。

### `external`

- 函数 `should`应该只被外部函数调用
- 可以被内部调用，但是这种内部调用也有外部调用机制，即新产生 `message`

### `call`函数

`(bool success, bytes data) = <address>.call(bytes calldata)`

- `call`是 `address`的方法
- `call`返回值 `(bool success, bytes data)`
- **忽视返回值 `success`，会造成严重问题**
- `call`函数是运行时动态生成 `calldata`，并未用到静态 `ABI`数据，但 `encodeWithSignature`中函数签名字符串和参数列表信息，与 `ABI`、接口等价、等量。

#### `calldata`结构

- `call`参数是 `calldata`
- `calldata`的前四个字节是 `selector`，剩下的是参数编码
- `selector = bytes4(keccak256(<sig>))`
- `keccak256`：哈希 `sha3->256`

#### `Abi`工具函数

- `calldata = abi.encodeWithSignature(sig, ps)`
- 返回值解码 `abi.decode(bytes)`

#### `fallback`

- 动态调用 `call`绕过类型检查，或者自定义一个接口函数，但是这个函数并不存在，`fallback`才有机会起作用
- `proxy`模式中有重要应用：`delegatecall` 支持合约升级
- 转账功能中有重要作用

## 子货币（`Subcurrency`）

## 安全

- **重入攻击（`Reentrancy`）-最高危**

**问题本质：** 向外部合约转账/调用时，控制权会转移给对方，恶意合约可在原函数执行完成前回调，重复执行敏感逻辑（如多次提款）

## 问题汇总

- **有效载荷 `payload`**：随交易一起发送的字节码“数据”
- **创建一个可以被中止并退款的合约**：在构造函数中，将 `creator` 赋值为 `msg.sender`，并保持。然后调用 `selfdestruct(creator)` 来中止程序并进行退款。
