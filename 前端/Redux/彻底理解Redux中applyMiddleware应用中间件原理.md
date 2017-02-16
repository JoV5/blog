# 彻底理解Redux中applyMiddleware中间件原理

本文逐步讲解了中间件是如何通过applyMiddleware方法应用的，看完本文，应该可以理解
中间件原理，中间件该怎么写，以及为什么这么写。

假设现在有这样两个中间件
```js
const logger = store => next => action => {
	console.log('dispatching', action);
	let result = next(action);
	console.log('next state', store.getState());
	return result;
};

const crashReporter = store => next => action => {
	try {
		return next(action)
	} catch (err) {
		console.error('Caught an exception!', err)
		Raven.captureException(err, {
			extra: {
				action,
				state: store.getState()
			}
		})
		throw err
	}
}
```

要应用这两个中间件，一般经过以下两步，标记为【代码段X】
```js
// 第一步
const enhancer = applyMiddleware(
    logger,
    crashReporter
);

// 第二步
const store = createStore(reducers, enhancer);
```

接下来将详细讲解这两步代码【代码段X】的过程，以下为[applyMiddleware](https://github.com/reactjs/redux/blob/master/src/applyMiddleware.js)、
[createStore](https://github.com/reactjs/redux/blob/master/src/createStore.js)方法源码
```js
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    var store = createStore(reducer, preloadedState, enhancer)
    var dispatch = store.dispatch
    var chain = []

    var middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```

```js
function createStore(reducer, preloadedState, enhancer) {

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    // 【1.对中间件进行应用】
    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  // 【2.创建store流程】
  // 以下省略
  ...
}
```

经过【代码段X】第一步后
```js
const enhancer = applyMiddleware(
    logger,
    crashReporter
);

middlewares = [logger, crashReporter];

enhancer = (createStore) => (reducer, preloadedState, enhancer) => {
	var store = createStore(reducer, preloadedState, enhancer)
	var dispatch = store.dispatch
	var chain = []

	var middlewareAPI = {
		getState: store.getState,
		dispatch: (action) => dispatch(action)
	}
	chain = middlewares.map(middleware => middleware(middlewareAPI))
	dispatch = compose(...chain)(store.dispatch)

	return {
		...store,
		dispatch
	}
}
```

进入【代码段X】第二步
```js
const store = createStore(reducers, enhancer);

// 因为传递了enhancer, 所以进入createStore方法中【1.对中间件进行应用】
store = enhancer(createStore)(reducer, preloadedState);
// 拆解一下
const store_1 = enhancer(createStore);
const store_2 = store_1(reducer, preloadedState);
```

首先执行store_1
```js
middlewares = [logger, crashReporter];
_createStore = createStore; // 这里用前加'_'来保留传递进来的参数，后面同理

store_1 = (reducer, preloadedState, enhancer) => {
	var store = _createStore(reducer, preloadedState, enhancer)
	var dispatch = store.dispatch
	var chain = []

	var middlewareAPI = {
		getState: store.getState,
		dispatch: (action) => dispatch(action)
	}
	chain = middlewares.map(middleware => middleware(middlewareAPI))
	dispatch = compose(...chain)(store.dispatch)

	return {
		...store,
		dispatch
	}
}
```

接着进入store_2
```js
middlewares = [logger, crashReporter];
_createStore = createStore;
_reducer = reducer;
_preloadedState = preloadedState;
_enhancer = undefined;

// 此处再次进入createStore方法，但是进入【2.创建store流程】
var store = _createStore(_reducer, _preloadedState, undefined)
/*
创建store后
store = {
	dispatch,
	subscribe,
	getState,
	replaceReducer,
	[$$observable]: observable
}
*/

var dispatch = store.dispatch
var chain = []

var middlewareAPI = {
	getState: store.getState,
	dispatch: (action) => dispatch(action)
}
// middlewares = [logger, crashReporter]
// 【重点A】注意：中间件第一次调用时的参数store就是middlewareAPI，即提供给中间件的接口
chain = middlewares.map(middleware => middleware(middlewareAPI))
// 执行后 chain = [logger(middlewareAPI), crashReporter(middlewareAPI)]
// 执行chain内部后
chain = [
	next => action => {
		console.log('dispatching', action);
		let result = next(action);
		console.log('next state', middlewareAPI.getState());
		return result;
	},
	next => action => {
		try {
			return next(action)
		} catch (err) {
			console.error('Caught an exception!', err)
			Raven.captureException(err, {
				extra: {
					action,
					state: middlewareAPI.getState()
				}
			})
			throw err
		}
	}
]

// 跳至下一段阅读
dispatch = compose(...chain)(store.dispatch)

return {
	...store,
	dispatch
}
```


请先理解[compose](http://cn.redux.js.org/docs/api/compose.html)方法

```js
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  const last = funcs[funcs.length - 1]
  const rest = funcs.slice(0, -1)
  return (...args) => rest.reduceRight((composed, f) => f(composed), last(...args))
}
```
### compose(...functions)

从右到左来组合多个函数。

这是函数式编程中的方法，为了方便，被放到了 Redux 里。
当需要把多个 store 增强器 依次执行的时候，需要用到它。

##### 参数

(arguments): 需要合成的多个函数。每个函数都接收一个函数作为参数。它将提供一个在函数左边的参数作为返回值，等等。唯一的例外是最右边的参数可以接受多个参数，因为它将提供由此产生的函数的签名。
返回值

(Function): 从右到左把接收到的函数合成后的最终函数。

举个例子
```js
compose(f1, f2, f3)(arg) = f1(f2(f3(arg)))
```

```js
// 上文我们得到
store = {
	dispatch,
	subscribe,
	getState,
	replaceReducer,
	[$$observable]: observable
}
dispatch = compose(...chain)(store.dispatch);

// 进行拆解
const dispatch_1 = compose(...chain);
const dispatch_2 = dispatch_1(store.dispatch);

// 执行dispatch_1后
dispatch_1 = (...args) => chain.slice(0, -1).reduceRight((composed, f) => f(composed), chain[funcs.length - 1](...args))

// 【重点B】传入原始的dispatch即store.dispatch执行dispatch_1，
// 每个中间件接收上一个经过中间件包装后的dispatch作为第二次调用的参数即next，形成嵌套
// 执行dispatch_2后
dispatch_2 = action => {
	console.log('dispatching', action);
	let result = (action => { // 此行
		try {
			return store.dispatch(action)
		} catch (err) {
			console.error('Caught an exception!', err)
			Raven.captureException(err, {
				extra: {
					action,
					state: middlewareAPI.getState()
				}
			})
			throw err
		}
	})(action); // 到此行将next替换为chain[1](store.dispatch)
	console.log('next state', middlewareAPI.getState());
	return result;
}

```

dispatch_2就是经过中间件包装后的dispatch

【重点C】中间件就是对store.dispatch进行一系列的包装，dispatch_2就是新的dispatch

至此，应该可以理解下面对Middleware的描述：

Middleware 可以让你包装 store 的 dispatch 方法来达到你想要的目的。同时， middleware 还拥有“可组合”这一关键特性。多个 middleware 可以被组合到一起使用，形成 middleware 链。其中，每个 middleware 都不需要关心链中它前后的 middleware 的任何信息。

所以，middleware 的函数签名是 ({ getState, dispatch }) => next => action。


最后
```js
return {
	...store,
	dispatch // 返回新的dispatch
}
```

【重点D】需要强调的是，要触发action，中间件内部实现必需保证next(action)的执行，否则中间件将不能正确的链接，在缺失next(action)的中间件之后将会中断，导致原始的store.dispatch也不能执行，但是在有意截断action时比如redux-thunk在action是function时故意截断

比如说logger缺失next(action)
```js
const logger = store => next => action => {
	console.log('dispatching', action);
	//let result = next(action);
	console.log('next state', store.getState());
	//return result;
};

const crashReporter = store => next => action => {
	try {
		return next(action)
	} catch (err) {
		console.error('Caught an exception!', err)
		Raven.captureException(err, {
			extra: {
				action,
				state: store.getState()
			}
		})
		throw err
	}
}
```
执行

applyMiddleware(logger, crashReporter)

||

\\/

dispatch_2 = compose(...chain)(store.dispatch);


dispatch_2会是什么？

结果应该是：
```js
dispatch_2 = action => {
	console.log('dispatching', action);
	//let result = next(action);
	console.log('next state', middlewareAPI.getState());
	//return result;
}
```


参考阅读:

[applyMiddleware](http://cn.redux.js.org/docs/api/applyMiddleware.html)

[Middleware](http://cn.redux.js.org/docs/advanced/Middleware.html)


