# Promises/A+

**An open standard for sound, interoperable JavaScript promises—by implementers, for implementers.**

## 1. 术语
1.1 “promise”是一个具有`then`方法的对象或函数，`then`方法的行为符合本规范。

1.2 “thenable”是一个定义了`then`方法的对象或函数。

1.3 “value”是任意JavaScript合法值（包括`undefined`、一个`thenable`或一个`promise`）。

1.4 “exception”是一个`thrown`语句抛出的值。

1.5 “reason”是一个`promise`表明为什么被拒绝的值。


## 2. 要求

### 2.1. Promise的状态
一个promise必定是三种状态之一：`pending`（待决）、`fulfilled`（已决）或`rejected`（拒绝）。

2.1.1. 当处于`pending`状态，一个promise：
* 可以转变为`fulfilled`状态或`rejected`状态

2.1.2.  当处于`fulfilled`状态，一个promise：
* 绝不可转变为任何其他状态。
* 必须有一个`value`，且不可变。

2.1.3. 当处于`rejected`状态，一个promise：
* 绝不可转变为任何其他状态。
* 必须有一个`reason`，且不可变。

这里的“不可变”指的是immutable identity (i.e. ===), but does not imply deep immutability.

### 2.2. `then`方法
一个promise必须提供一个`then`方法来访问它当前或最终的`value`或`reason`。

一个promise的`then`方法接受两个参数：
```js
promise.then(onFulfilled, onRejected)
```

2.2.1. `onFulfilled`和`onRejected`都是可选的参数
* 如果`onFulfilled`不是函数，那它必须被忽略。
* 如果`onRejected`不是函数，那么必须被忽略。

2.2.2. 如果`onFulfilled`是一个函数：
* 它必须在`fulfilled`之后被调用，promise的`value`将作为它的第一个参数。
* 它不可在promise`filfilled`之前被调用。
* 它只可被调用一次。

2.2.3. 如果`onRejected`是一个函数：
* 它必须在`rejected`之后被调用，promise的`reason`将作为它的第一个参数。
* 它不可在promise`rejected`之前被调用。
* 它只可被调用一次。

2.2.4. `onFulfilled`或`onRejected`不可被调用直到执行上下文堆栈仅包含平台代码。[[3.1]](#3.1)

2.2.5. onFulfilled and onRejected must be called as functions (i.e. with no this value). [[3.2]](#3.2)

2.2.6. 在同一个promise中`then`可以被多次调用
* 如果/当promise进入`fulfilled`状态，

2.2.7 `then`必须返回一个promise[[3.3]](#3.3)
```js
promise2 = promise1.then(onFulfilled, onRejected);
```
* 

# 3. 注释

<a id="3.1"></a>

## 3.1
123

