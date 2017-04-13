> 摘自《你不知道的JavaScript》和《ECMAScript 6 入门》

# Promise
## 什么是Promise
Promise的决议结果可能是拒绝而不是完成。拒绝值和完成值的Promise不一样：完成值总是编程给出，而拒绝值，通常称为*拒绝原因（rejection reason）*，可能是程序逻辑直接设置的，也可能是从运行异常隐式得出的值。

一旦Promise决议，它就永远保持在这个状态。此时它成为了*不变值（immutable value）*，可以根据需求多次查看。

`new Promise(function () {...})` 模式通常称为revealing constructor。传入的函数会立即执行（不会像then(..)中的回调一样异步延迟），它有两个参数，在这里分别称为`resolve`和`reject`。这些是promise的决议函数。`resole(..)`通常标识完成，而`reject(..)`标识拒绝。

## 具有then方法的鸭子类型
识别Promise（或者行为类似于Promise的东西）就是定义某种称为thenable的东西，将其定义为任何具有`then(..)`方法的对象和函数。我们认为，任何这样的值就是Promise一致的thenable。

根据一个值的形态（具有那些属性）对这个值得类型做出一些假定。这种*类型检查（type check）*一般用术语*鸭子类型（duck typing）*来表示--“如果它看起来像只鸭子，叫起来像只鸭子，那它一定就是鸭子”。


## Promise信任问题

### 调用过早
对一个Promise调用`then(..)`的时候，即使这个Promise已经决议，提供给`then(..)`的回调总会被异步调用。

### 调用过晚
一个Promise决议后，这个Promise上所有的通过`then(..)`注册的回调都会在下一个异步时间点上依次被立即调用。这些回调中的任意一个都无法影响或延误对其他回调的调用。

不应该依赖于不同Promise间回调的顺序和调度。

### 回调未调用
没有任何东西（甚至JavaScript错误）能阻止Promise想你通知它的决议（如果它决议了的话）。如果你对一个Promise注册了一个完成回调和一个拒绝回调，那么Promise在决议时总是会调用其中的一个。

如果你的回调函数本身包含JavaScript错误，那可能看不到你期望的结果，但实际上回调还是调用了。

如果Promise本身永远不被决议，可以使用一种称为*竞态*的高级抽象机制。

### 调用次数过少或过多
Promise只能被决议一次。所以任何通过`then(..)`注册的（每个）回调只会被调用一次。

### 未能传递参数/环境值
如果使用多个参数调用`resolve(..)`或者`reject(..)`，第一个参数之后的所有参数都会被默默忽略。要传递多个值，必须把它们封装在单个值中传递，比如通过一个数组或对象。

### 吞掉错误或异常
在Promise的创建过程或在产看决议结果过程中的任何时间点上出现了一个JavaScript异常错误，那么这个异常就会被捕捉，并且会使这个Promise被拒绝。

如果Promise完成后在查看结果时（`then(..)`注册的回调中）出现了JavaScript异常错误，因为`then(..)`本身返回了另一个promise，正是这个promise将会因TypeError异常而被拒绝。

### 是可信任的Promise吗
如果向`Promise.resolve()`传递一个非Promise、非thenable的立即值，就会得到一个用这个值填充的promise。而如果向`Promise.resolve()`传递一个真正的Promise，就会返回同一个promise。更重要的是，如果向`Promise.resolve()`传递一个非Promise的thenable值，前者就会试图展开这个值，而且展开过程会持续到提取出一个具体的非类Promise的最终值。

### 建立信任
Promise这种模式通过可信任的语义把回调作为参数传递，使得这种行为更可靠更合理。通过把回调的控制反转反转回来，我们把控制权放在一个可信任的系统（Promise）中。这种系统的设计目的就是为了使异步编码更清晰。


## 链式流
我们可以把Promise连接到一起以表示一系列异步步骤。这种方式的实现关键在于以下两个Promise固有行为特性：  
* 每次你对Promise调用`then(..)`，它都会创建返回一个新的Promise，我们可以将其链接起来；
* 在完成或拒绝处理函数内部，如果返回一个值或抛出一个异常，新返回的（可链接的）Promise就相应地决议。
* 如果完成或拒绝处理函数返回一个Promise，它将会被展开，这样一来，不管它的决议值是什么，都会成为当前`then(..)`返回的链接Promise的决议值。

`Promise.resolve(..)`会将闯入的真正Promise返回，对传入的thenable则会展开。如果这个thenable展开得到一个拒绝状态，那么从`Promise.resolve(..)`返回的Promise实际上就是这同一个拒绝状态。

`Promise(..)`构造器的第一个参数回调会展开thenable(和`Promise.resolve(..)`一样)或真正的Promise，所以`Promise(..)`构造器的第一个回调参数的恰当称谓是`resolve(..)`。

`reject(..)`不会像`resolve(..)`一样进行展开。如果向`reject(..)`传入一个Promise/thenable值，它会把这个值原封不动地设置为拒绝理由。后续的拒绝处理接收到的是你实际传给`reject(..)`的那个Promise/thenable，而不是其底层的立即值。

## 错误处理
Promise使用了分离回调（split-callback）风格。一个回调于完成情况，一个回调于拒绝情况。

`catch(..)`方法是`then(null, rejection)`的别名，用于指定发生错误时的回调。

Promise在`resolve`语句后面，再抛出错误，不会被捕获，等于没有抛出错误。因为Promise的状态一旦改变，就永久保持该状态，不会再变了。

Promise对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个`catch`语句捕获。

如果没有使用`catch`方法指定错误处理的回调函数，Promise对象抛出的错误不会传递到外层代码，既不会有任何反应。**注意**：Chrome浏览器不遵守这条规定，它会抛出错误。

## Promise模式
### Promise.all([..])
`Promise.all([..])`需要一个参数，是一个数组，通常由Promise实例组成。从`Promise.all([..])`调用返回的promise会受到一个完成消息。这是一个由所有传入promise的完成消息组成的数组，与指定的顺序一致（与完成顺序无关）。

严格来说，传给`Promise.all([..])`的数组中的值可以是Promise、thenable，甚至是立即值。列表中的每个值都会通过`Promise.all([..])`过滤，以确保要等待的是一个真正的Promise，所以立即值会被规范化为为这个构建的Promise。如果数组是空的，主Promise就会立即完成。

从`Promise.all([..])`返回的主promise在且仅在所有的成员promise都完成才会完成。如果这些promise中有任何一个被拒绝的话，主`Promise.all([..])`promise就会立即被拒绝，并丢弃来自其他所有promise的全部结果。

永远要记住为每个promise关联一个拒绝/错误处理函数，特别是从`Promise.all([..])`返回的那一个。

### Promise.race([..])
`Promise.race([ .. ])`也接受单个数组。这个数组由一个或多个Promise、thenable或立即值组成。立即值之间的竞争在实践中没有太大意义，显然列表中的第一个会获胜。

与`Promise.race([ .. ])`类似，一旦有任何一个Promise决议完成，`Promise.race([ .. ])`就会完成，一旦有任何一个Promise决议为拒绝，它就会拒绝。

一项竞赛至少一个“参赛者”。所以，如果你传入一个空数组，主race([..])Promise永远不会决议。所以，要注意，永远不要传递空数组。

## Promise局限性
### 顺序错误处理
Promise链中的错误很容易被无意中默默忽略掉。由于一个Promise链仅仅是连接到一起的成员Promise，没有把整个链标识为一个个体的实体，这意味着没有外部方法可以用于观察可能发生的错误。

如果构建了一个没有错误处理函数的Promise链，链中任何错误都会在链中一直传播下去，直到被查看（通过在某个步骤注册拒绝处理函数）。

### 单一值
Promise只能有一个完成值或一个拒绝理由。
1. 分裂值  
有时候你可以/应该把问题分解为两个或更多Promise的信号。
2. 展开/传递参数  
使用ES6的解构。

### 单决议
Promise只能被决议一次（完成或拒绝）。但还有很多异步的情况适合另一种模式--一种类似于事件和/或数据流的模式

### 无法取消的Promise
一旦创建了一个Promise并为其注册了完成和/或拒绝处理函数，如果出现某种情况使得这个任务悬而未决的话，你没有办法从外部停止它的进程。

### Promise性能
Promise稍慢一些，但是作为交换，你得到的是大量内建的可信任性、对Zalgo的避免以及可组合性。


## 参考阅读：
[Promises/A+标准](https://promisesaplus.com/)