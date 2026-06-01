> `Solidity`面向合约、为实现智能合约而创建的高级编程语言。受到了 `C++`，`Python` 和 `JavaScript` 语言的影响，设计的目的是能在以太坊虚拟机（`EVM`）上运行。  
> `Solidity` 是静态类型语言，支持集成、库和复杂的用户定义类型等特性。

## 智能合约

关键字 `pragma` (编译指令)是告知编译器如何处理源代码的指令。`Solidity` 中的合约就是一组代码和数据，它们位于以太坊区块链的一个特定地址上。

所有的标识符（合约名、函数名和变量名）都只能使用 `ASCII` 字符集。`UTF-8` 编码的数据可以用字符串变量的形式存储。

**数据类型**

- 值类型 `value type`
  - 整数 枚举 布尔 `address` `contract` `fixed-size byte array`
- 引用类型 `reference type`
  - 数组 `struct` `mapping`
- 引用类型，变量本身域变量指向的数据块分离，赋值操作是引用拷贝，数据块不受影响
- 通常的面向对象语言中所有引用类型变量之间赋值操作，都是引用拷贝
- 这一点在 `solidity`的引用类型中不再成立：`solidity`的引用类型的变量之间可能发生值拷贝

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

**`contract`**

- 合约可以隐式转换为它的父合约（多态）
- 可以显式转换为地址类型 `address`
- 不支持任何运算符
- 从合约变量（实例）调用合约函数
- 可用 `new`操作符部署另一合约

**`fiexed-size byte array`**

- 从 `bytes1`到 `bytes32`
- 通过下标访问元素
- 通过 `length`读取长度

**`location`**

- `EVM`从三个地方访问数据：`memory` `storage` `calldata`，这三个地方就是变量的 `location`
- `calldata`实际上是 `Transation`的数据字段

**数组`array`**

- 与 `location`不同，完全是两种类型
- `storage`和 `memory`中的动态数组
- 数组元素的类型限制

**结构 `struct`**

- 结构如同 `contract`和 `enum`，用来自定义数据类型
- 状态变量、局部变量、参数与返回值均可用结构
- 结构可放在 `mapping`和数组中，结构的成员可以是 `mapping`或数组

**映射 `mapping`**

- 声明形式：`mapping(key type=>value type)` `mapping(string=>uint8) ages;` `mapping(string => uint8) storage _ages = ages;`
- `keytype`可以是任何基本类型，包括 `bytes`和 `string`，不包括用户自定义的复杂类型——合约、枚举、结构、映射
- `value type`可以是包括 `mapping`在内的任何类型
- 可以作为状态变量、`storage`型局部变量、库函数的参数；不能作为共有函数的参数或返回值
- `public`的 `mapping`会自动生成 `getter`；嵌套的 `mapping`生成的 `mapper`会有多个参数
- `mapping`无法遍历 `storage layout`
- `public`函数参数或返回值不可能出现 `mapping`类型

**合约的基本结果**

- 合约中的成员变量
- 合约中的成员函数
- `event` `modifier` `constructor`

**函数可见性**
默认值变化 `private` `public` `internal` `external`

- `public` - `memory`
- `internal` - `storage` 成员变量 定义时需要赋值

**合约函数的交易属性**

- `view` 合约状态读操作
- `pure` 与合约状态无关的函数
- 默认是写操作 全网广播，共识确认

**上下文变量**

- 合约函数的背后是 `transaction`，上下文变量访问的是 `transaction`中的信息
- 两个上下文变量：`tx`和 `msg`

### 子货币（`Subcurrency`）

## 安全

- **重入攻击（`Reentrancy`）-最高危**

**问题本质：**向外部合约转账/调用时，控制权会转移给对方，恶意合约可在原函数执行完成前回调，重复执行敏感逻辑（如多次提款）

## 问题汇总

- **有效载荷 `payload`**：随交易一起发送的字节码“数据”
- **创建一个可以被中止并退款的合约**：在构造函数中，将 `creator` 赋值为 `msg.sender`，并保持。然后调用 `selfdestruct(creator)` 来中止程序并进行退款。
