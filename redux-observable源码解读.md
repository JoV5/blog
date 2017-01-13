> 前置阅读:

> 了解RxJS，[RxJS Overview](http://reactivex.io/rxjs/manual/overview.html)，需要理解其中的Observable、Observer、Subject概念

> 了解redux中间件，[彻底理解Redux中applyMiddleware中间件原理](https://github.com/JoV5/blog/issues/1)

> 了解redux-observable中的Epic是什么，[Epics](https://redux-observable.js.org/docs/basics/Epics.html)

假设有这样一个epic
```js
function fetchReposByUser(action$) {
  return action$.ofType(ActionTypes.REQUESTED_USER_REPOS)
    .map(action => action.payload.user)
    .switchMap(user =>
      ajax.getJSON(`https://api.github.com/users/${user}/repos`)
        .map(receiveUserRepos.bind(null, user))
    );
}
```

要应用这个epic，通过以下步骤
```js
const rootEpic = combineEpics(fetchReposByUser);
const epicMiddleware = createEpicMiddleware(rootEpic);
```

以下是[combineEpics](https://github.com/redux-observable/redux-observable/blob/master/src/combineEpics.js)、
[createEpicMiddleware](https://github.com/redux-observable/redux-observable/blob/master/src/createEpicMiddleware.js)源码，后面将详细讲解：
```js
const combineEpics = (...epics) => (...args) =>
  merge(
    ...epics.map(epic => {
      const output$ = epic(...args);
      if (!output$) {
        throw new TypeError(`combineEpics: one of the provided Epics "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
      }
      return output$;
    })
  );

function createEpicMiddleware(epic, { adapter = defaultAdapter } = defaultOptions) {
  if (typeof epic !== 'function') {
    throw new TypeError('You must provide a root Epic to createEpicMiddleware');
  }

  const input$ = new Subject();
  const action$ = adapter.input(
    new ActionsObservable(input$)
  );
  const epic$ = new Subject();
  let store;

  const epicMiddleware = _store => {
    store = _store;

    return next => {
      epic$
        ::map(epic => {
        const output$ = epic(action$, store);
        if (!output$) {
          throw new TypeError(`Your root Epic "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
        }
        return output$;
      })
        ::switchMap(output$ => adapter.output(output$))
        .subscribe(store.dispatch);

      // Setup initial root epic
      epic$.next(epic);

      return action => {
        const result = next(action);
        input$.next(action);
        return result;
      };
    };
  };

  epicMiddleware.replaceEpic = epic => {
    // gives the previous root Epic a last chance
    // to do some clean up
    store.dispatch({ type: EPIC_END });
    // switches to the new root Epic, synchronously terminating
    // the previous one
    epic$.next(epic);
  };

  return epicMiddleware;
}
```

经过第一步combineEpics后，【坐标A】
```js
epics = [fetchReposByUser]
rootEpic = (...args) => // 参数为(action$, store)
  merge(
    ...epics.map(epic => {
      const output$ = epic(...args); // 这里可以看出每个epic接收的参数是action$和store
      if (!output$) { // 每个epic必需有返回
        throw new TypeError(`combineEpics: one of the provided Epics "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
      }
      //比如fetchReposByUser的output$就是
      //output$ = action$.ofType(ActionTypes.REQUESTED_USER_REPOS)
      //  .map(action => action.payload.user)
      //  .switchMap(user =>
      //    ajax.getJSON(`https://api.github.com/users/${user}/repos`)
      //      .map(receiveUserRepos.bind(null, user))
      //  );
      return output$;
    })
  ); // 最后合并为一个ArrayObservable
```

先看一下[ActionsObservable](https://github.com/redux-observable/redux-observable/blob/master/src/ActionsObservable.js)，以下是源码
```js
class ActionsObservable extends Observable {
  static of(...actions) {
    return new this(of(...actions));
  }

  static from(actions, scheduler) {
    return new this(from(actions, scheduler));
  }

  // 重写构造函数，初始化时需要参数作为source
  constructor(actionsSubject) {
    super();
    this.source = actionsSubject;
  }

  // 这里重写了lift方法
  lift(operator) {
    const observable = new ActionsObservable(this); // 这里new的是ActionsObservable，保持一致
    // observable.source = this; // 重写的lift方法去掉了去掉这一行，因为在new ActionsObservable(this)时设置了source
    observable.operator = operator;
    return observable;
  }

  // 过滤action的便利方法
  ofType(...keys) {
    return this::filter(({ type }) => {
      const len = keys.length;
      if (len === 1) {
        return type === keys[0];
      } else {
        for (let i = 0; i < len; i++) {
          if (keys[i] === type) {
            return true;
          }
        }
      }
      return false;
    });
  }
}
```

下一步把rootEpic丢进createEpicMiddleware
```js
_epic = rootEpic; // 用前加'_'表示传递进来的参数
adapter = defaultAdapter = {
  input: action$ => action$,
  output: action$ => action$
}; // 默认是defaultAdapter

if (typeof _epic !== 'function') {
  throw new TypeError('You must provide a root Epic to createEpicMiddleware');
}

const input$ = new Subject(); // 定义input$为Subject

// 默认的adapter则action$的结果为：action$ = new ActionsObservable(input$);
// 初始化action$为ActionsObservable，设置action$的source为input$
const action$ = adapter.input(
  new ActionsObservable(input$)
);

const epic$ = new Subject();
let store;

const epicMiddleware = _store => {
  store = _store;

  return next => {
    epic$
      ::map(epic => {
      const output$ = epic(action$, store); // 执行rootEpic，执行过程前往【坐标A】查看，返回一个合并后的ArrayObservable
      if (!output$) {
        throw new TypeError(`Your root Epic "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
      }
      return output$;
    })
      ::switchMap(output$ => adapter.output(output$)) // 在这里新起一个Observable，如果这里用mergeMap会发生什么？【问题A】
      .subscribe(store.dispatch); // 执行这个新起的Observable，因为设置了初始action$的起点source为input$，最终会在input$的observers中注册以监听input$，中间过程不在这里展开
      // 最终调用store.dispatch，所以这里应该接受一个action
      // 符合文档中对Epic的描述，It is a function which takes a stream of actions and returns a stream of actions. Actions in, actions out.
      // function (action$: Observable<Action>, store: Store): Observable<Action>;

    // 设置初始epic，即丢进来的rootEpic
    epic$.next(_epic);

    return action => {
      const result = next(action); // 中间件传递，这里可以看出reducers是先于epic接收到action的
      input$.next(action); // 执行，向input$中注册的observers广播action
      // 如果我们的epic是这样的 const actionEpic = (action$) => action$; // creates infinite loop
      // 可以看出它将会dispatch自己造成无限循环
      return result;
    };
  };
};

// 替换当前的中间件使用的epic
epicMiddleware.replaceEpic = epic => {
  // gives the previous root Epic a last chance
  // to do some clean up
  store.dispatch({ type: EPIC_END });
  // switches to the new root Epic, synchronously terminating
  // the previous one
  epic$.next(epic); // 上面的【问题A】，如果用mergeMap，它进行的不是替换而是合成
};
```
