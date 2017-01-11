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

combineEpics源码：
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
```

经过第一步combineEpics，【坐标A】
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

const input$ = new Subject();

// ActionsObservable继承自Observable，主要添加了ofType方法
// 并且设置source为初始化参数$input，当调用input$.next(action)时会将action推送至action$
// 默认的adapter则action$的结果为：action$ = new ActionsObservable(input$);
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
      const output$ = epic(action$, store); // 执行rootEpic，执行过程前往【坐标A】，返回一个合并后的Observable
      if (!output$) {
        throw new TypeError(`Your root Epic "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
      }
      return output$;
    })
      ::switchMap(output$ => adapter.output(output$)) // 这里新起一个Observable，如果这里用mergeMap会发生什么？【问题A】
      .subscribe(store.dispatch); // 订阅新起的Observable，这里可以看出一个epic返回的数应该也是个action$
      // 符合文档中对Epic的描述，It is a function which takes a stream of actions and returns a stream of actions. Actions in, actions out.
      // function (action$: Observable<Action>, store: Store): Observable<Action>;

    // 设置初始epic，即丢进来的rootEpic
    epic$.next(_epic);

    return action => {
      const result = next(action); // 中间件传递，这里可以看出reducers是先于epic接收到action的
      input$.next(action); // 执行，先流进上面merge产生的Observable，在流进每一个epic产生的Observable
      // 如果我们的epic是这样的 const actionEpic = (action$) => action$; // creates infinite loop
      // 可以看出它将会不断地dispatch产生无限循环
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
