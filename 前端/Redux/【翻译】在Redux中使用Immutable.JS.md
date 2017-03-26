# 在Redux中使用Immutable.JS
## 目录
- [Why should I use an immutable-focused library such as Immutable.JS?](#why-use-immutable-library)
- [Why should I choose Immutable.JS as an immutable library?](#why-choose-immutable-js)
- [What are the issues with using Immutable.JS?](#issues-with-immutable-js)
- [Is Immutable.JS worth the effort?](#is-immutable-js-worth-effort)
- [What are some opinionated Best Practices for using Immutable.JS with Redux?](#immutable-js-best-practices)

<a id="why-use-immutable-library"></a>
## 为什么我应该使用关注不可变的库比如Immutable.JS？

关注不可变的库像Immutable.JS旨在克服JavaScript本身的不可变性，为您提供所有不可变性带来的好处,以满足应用程序的性能需要。

无论您是选择这样的库，或使用纯JavaScript，取决于在您能否在应用程序中舒适的使用其他依赖，或者您确定如何避免JavaScript本身的不可变性带来的陷阱。

无论您选哪个，确定您已经熟悉[不可变性, 副作用 和突变](http://redux.js.org/docs/recipes/reducers/PrerequisiteConcepts.html#note-on-immutability-side-effects-and-mutation)这些概念，尤其是确保您已经深入理解了JavaScript进行更新和复制时的过程，以防止意外的突变降低您应用程序的性能，或者完全破坏了它。

#### Further Information

**Documentation**
- [Recipes: immutability, side effects and mutation](http://redux.js.org/docs/recipes/reducers/PrerequisiteConcepts.html#note-on-immutability-side-effects-and-mutation)

**Articles**
- [Introduction to Immutable.js and Functional Programming Concepts](https://auth0.com/blog/intro-to-immutable-js/)
- [Pros and Cons of using immutability with React.js](http://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)


<a id="why-choose-immutable-js"></a>
## 为什么我应该选择Immutable.JS作为不可变库?
Immutable.JS旨在以高效的方式提供不变性，以克服JavaScript中不变性的限制。其主要优点包括：

#### 保证不可变性

封装在Immutable.JS对象中的数据永远不会突变。总是返回一个新的拷贝。这与JavaScript不同，一些操作不会突变您的数据(例如一些Array方法，包括 map，filter，forEach，等)，但有些会 (Array的pop，push，concat，splice，等)。

#### 丰富的API

Immutable.JS提供了一组丰富的不可变对象来封装你的数据 (比如 Maps，Lists，Sets，Records，等),以及一系列扩展的方法去操作它，包括对数据进行排序，过滤和分组，将数据反向，平坦化和创建子集的方法。

#### 性能

Immutable.JS在幕后做了很多工作来优化性能。这是它强力的关键，因为使用不可变数据结构可能涉及大量昂贵的复制。特别是，不变地操作大型复杂的数据集，比如一个嵌套的Redux state树，会产生许多对象的中间拷贝，这将消耗内存并降低性能，因为浏览器的垃圾回收器会忙于清理这些。

Immutable.JS avoids this by [cleverly sharing data structures](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2#.z1g1ofrsi) under the surface, minimizing the need to copy data. It also enables complex chains of operations to be carried out without creating unnecessary (and costly) cloned intermediate data that will quickly be thrown away. 

You never see this, of course - the data you give to an Immutable.JS object is never mutated. Rather, it’s the *intermediate* data generated within Immutable.JS from a chained sequence of method calls that is free to be mutated. You therefore get all the benefits of immutable data structures with none (or very little) of the potential performance hits.

#### Further Information

**Articles**
- [Immutable.js, persistent data structures and structural sharing](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2#.6nwctunlc)
- [PDF: JavaScript Immutability - Don’t go changing](https://www.jfokus.se/jfokus16/preso/JavaScript-Immutability--Dont-Go-Changing.pdf)

**Libraries**
- [Immutable.js, persistent data structures and structural sharing](https://facebook.github.io/immutable-js/)


<a id="issues-with-immutable-js"></a>
## 使用Immutable.JS的问题?

虽然强力，Immutable.JS 需要小心使用，因为它有自己的问题。但是请注意，所有这些问题都可以通过仔细的编码来轻松解决。

#### Difficult to interoperate with

JavaScript不提供不可变数据结构。As such, for Immutable.JS to provide its immutable guarantees, your data must be encapsulated within an Immutable.JS object (such as a `Map` or a `List`, etc.). Once it’s contained in this way，那么数据很难与其他纯JavaScript对象进行互操作。

例如，您将无法再通过标准JavaScript点或括号符引用对象的属性。取而代之，您必须通过Immutable.JS的get()或getIn()方法引用它们，该方法使用通过字符串数组访问属性的尴尬语法，每个字符串表示属性键。

例如，不再是是`myObj.prop1.prop2.prop3`, 您将使用`myImmutableMap.getIn([‘prop1’, ‘prop2’, ‘prop3’])`。

这不但使您难于操作自己的代码，而且包括其他库比如lodash或ramda，这些库可能期望纯的JavaScript对象。

请注意，Immutable.JS对象确实有一个`toJS()`方法，它以纯JavaScript数据结构的形式返回数据，但是这种方法非常慢，而且广泛使用它会否定Immutable.JS提供的性能优势。

### 一旦使用，Immutable.JS将在您的代码库中传播

Once you encapsulate your data with Immutable.JS, you have to use Immutable.JS’s `get()` or `getIn()` property accessors to access it. 

This has the effect of spreading Immutable.JS across your entire codebase, including potentially your components, where you may prefer not to have such external dependencies. Your entire codebase must know what is, and what is not, an Immutable.JS object. It also makes removing Immutable.JS from your app difficult in the future, should you ever need to.

This issue can be avoided by [uncoupling your application logic from your data structures](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2#.z1g1ofrsi), as outlined in the [best practices section](#immutable-js-best-practices) below.

### No Destructuring or Spread Operators

Because you must access your data via Immutable.JS’s own `get()` and `getIn()` methods, you can no longer use JavaScript’s destructuring operator (or the proposed Object spread operator), making your code more verbose.

### Not suitable for small values that change often

Immutable.JS works best for collections of data, and the larger the better. It can be slow when your data comprises lots of small, simple JavaScript objects, with each comprising a few keys of primitive values. 

Note, however, that this does not apply to the Redux state tree, which is (usually) represented as a large collection of data.

### Difficult to Debug

Immutable.JS objects, such as `Map`, `List`, etc., can be difficult to debug, as inspecting such an object will reveal an entire nested hierarchy of Immutable.JS-specific properties that you don’t care about, while your actual data that you do care about is encapsulated several layers deep. 

To resolve this issue, use a browser extension such as the [Immutable.js Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog), which surfaces your data in Chrome Dev Tools, and hides Immutable.JS’s properties when inspecting your data.

### Breaks object references, causing poor performance

One of the key advantages of immutability is that it enables shallow equality checking, which dramatically improves performance. 

If two different variables reference the same immutable object, then a simple equality check of the two variables is enough to determine that they are equal, and that the object they both reference is unchanged. The equality check never has to check the values of any of the object’s properties, as it is, of course, immutable.

However, shallow checking will not work if your data encapsulated within an Immutable.JS object is itself an object. This is because Immutable.JS’s `toJS()` method, which returns the data contained within an Immutable.JS object as a JavaScript value, will create a new object every time it’s called, and so break the reference with the encapsulated data.

Accordingly, calling `toJS()` twice, for example, and assigning the result to two different variables will cause an equality check on those two variables to fail, even though the object values themselves haven’t changed.

This is a particular issue if you use `toJS()` in a wrapped component’s `mapStateToProps` function, as React-Redux shallowly compares each value in the returned props object.  For example, the value referenced by the `todos` prop returned from `mapStateToProps` below will always be a different object, and so will fail a shallow equality check.

```
// AVOID .toJS() in mapStateToProps
function mapStateToProps(state) {
  return { 
        todos: state.get('todos').toJS() // Always a new object
    }
}
```

When the shallow check fails, React-Redux will cause the component to re-render. Using `toJS()` in `mapStateToProps` in this way, therefore, will always cause the component to re-render, even if the value never changes, impacting heavily on performance.

This can be prevented by using `toJS()` in a Higher Order Component, as discussed in the [Best Practices section](#immutable-js-best-practices) below.

#### Further Information

**Articles**
- [Immutable.js, persistent data structures and structural sharing](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2#.hzgz7ghbe)
- [Immutable Data Structures and JavaScript](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)
- [React.js pure render performance anti-pattern](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f#.9ucv6hwk4)
- [Building Efficient UI with React and Redux](https://www.toptal.com/react/react-redux-and-immutablejs)

**Chrome Extension**
- [Immutable Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog)


<a id="is-immutable-js-worth-effort"></a>
## Immutable.JS是否值得使用?

Frequently, yes. There are various tradeoffs and opinions to consider, but there are many good reasons to use Immutable.JS. Do not underestimate the difficulty of trying to track down a property of your state tree that has been inadvertently mutated.

Components will both re-render when they shouldn’t, and refuse to render when they should, and tracking down the bug causing the rendering issue is hard, as the component rendering incorrectly is not necessarily the one whose properties are being accidentally mutated.

这个问题主要是通过从Redux reducer返回一个突变的state对象。使用Immutable.JS，这个问题根本不存在，从而从你的应用程序中删除了一大堆错误。

这与其性能和丰富的数据操作API相结合，是为什么Immutable.JS是值得使用的。

#### Further Information

**Documentation**
- [Troubleshooting: Nothing happens when I dispatch an action](http://redux.js.org/docs/Troubleshooting.html#nothing-happens-when-i-dispatch-an-action)


<a id="immutable-js-best-practices"></a>
## 使用Immutable.JS与Redux有什么最佳实践？

Immutable.JS可以为您的应用程序提供显著的可靠性和性能改进，但必须正确使用。如果您选择使用Immutable.JS（记住，还有其他不可变的库可以使用），遵循这些最佳实践，您将能够充分利用它，而不会在任何可能导致的问题上绊倒。

### 不要将纯JavaScript对象与Immutable.JS混合使用

不要让纯JavaScript对象包含Immutable.JS属性。同样，永远不要让Immutable.JS对象包含一个纯JavaScript对象。

#### Further Information

**Articles**
- [Immutable Data Structures and JavaScript](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)


### 使您的整个Redux state树成为一个Immutable.JS对象

对于Redux应用程序，您的整个state树应该是一个Immutable.JS对象，根本不使用任何纯的JavaScript对象。

* Create the tree using Immutable.JS’s `fromJS()` function. 

* Use an Immutable.JS-aware version of the `combineReducers` function, such as the one in [redux-immutable](https://www.npmjs.com/package/redux-immutable), as Redux itself expects the state tree to be a plain JavaScript object.

* When adding JavaScript objects to an Immutable.JS Map or List using Immutable.JS’s `update`, `merge` or `set` methods, ensure that the object being added is first converted to an Immutable object using `fromJS()`.

**Example**

```
// avoid
const newObj = { key: value};
const newState = state.setIn(['prop1’], newObj); // <-- newObj has been added as a plain
    // JavaScript object - NOT as an Immutable.JS Map

// recommend
const newObj = { key: value};
const newState = state.setIn(['prop1’], fromJS(newObj)); // <-- newObj is now an
    // Immutable.JS Map
```

#### Further Information

**Articles**
- [Immutable Data Structures and JavaScript](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)

**Libraries**
- [redux-immutable](https://www.npmjs.com/package/redux-immutable)


### 全面使用Immutable.JS，除了你的dumb components

全面使用Immutable.JS，保持你的代码性能。 在你的smart components，selectors，sagas或者thunks, action creators，尤其是你的reducers。 

然而，不要在你的dumb components中使用Immutable.JS。

#### Further Information

**Articles**
- [Immutable Data Structures and JavaScript](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)
- [Smart and Dumb Components in React](http://jaketrent.com/post/smart-dumb-components-react/)

### 限制使用`toJS()`

`toJS()`是一个昂贵的方法，否定了使用Immutable.JS的目的。应避免使用。

#### Further Information

** Discussions**
- [Lee Byron on Twitter: “Perf tip for #immutablejs…”](https://twitter.com/leeb/status/746733697093668864)

### 您的selectors应返回Immutable.JS对象

总是。

### 在您的Smart Components中使用Immutable.JS对象

Smart components that access the store via React Redux’s `connect` function must use the Immutable.JS values returned by your selectors.  Make sure you avoid the potential issues this can cause with unnecessary component re-rendering. Memoize your selectors using a library such as reselect if necessary.

#### Further Information

**Documentation**
- [Recipes: Computing Derived Data](http://redux.js.org/docs/recipes/ComputingDerivedData.html)
- [FAQ: Immutable Data](/docs/faq/ImmutableData.html#immutability-issues-with-react-redux)
- [Reselect Documentation: How do I use Reselect with Immutable.js?](https://github.com/reactjs/reselect/#q-how-do-i-use-reselect-with-immutablejs)

**Articles**
- [Redux Patterns and Anti-Patterns](https://tech.affirm.com/redux-patterns-and-anti-patterns-7d80ef3d53bc#.451p9ycfy)

**Libraries**
- [Reselect: Selector library for Redux](https://github.com/reactjs/reselect)

### Never use `toJS()` in `mapStateToProps`

Converting an Immutable.JS object to a JavaScript object using `toJS()` will return a new object every time. If you do this in `mapSateToProps`, you will cause the component to believe that the object has changed every time the state tree changes, and so trigger an unnecessary re-render.

#### Further Information

**Documentation**
- [FAQ: Immutable Data](http://localhost:4000/docs/faq/ImmutableData.html#how-can-immutability-in-mapstatetoprops-cause-components-to-render-unnecessarily)

### 永远不要在您的Dumb Components中使用Immutable.JS

Your dumb components should be pure; that is, they should produce the same output given the same input, and have no external dependencies. If you pass such a component an Immutable.JS object as a prop, you make it dependent upon Immutable.JS to extract the prop’s value and otherwise manipulate it.

Such a dependency renders the component impure, makes testing the component more difficult, and makes reusing and refactoring the component unnecessarily difficult.

#### Further Information

**Articles**
- [Immutable Data Structures and JavaScript](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)
- [Smart and Dumb Components in React](http://jaketrent.com/post/smart-dumb-components-react/)
- [Tips For a Better Redux Architecture: Lessons for Enterprise Scale](https://hashnode.com/post/tips-for-a-better-redux-architecture-lessons-for-enterprise-scale-civrlqhuy0keqc6539boivk2f)

### Use a Higher Order Component to convert your Smart Component’s Immutable.JS props to your Dumb Component’s JavaScript props

Something needs to map the Immutable.JS props in your Smart Component to the pure JavaScript props used in your Dumb Component. That something is a Higher Order Component (HOC) that simply takes the Immutable.JS props from your Smart Component, and converts them using `toJS()` to plain JavaScript props, which are then passed to  your Dumb Component.

Here is an example of such a HOC:

```
import React from 'react';
import { Iterable } from 'immutable';

export const toJS = (WrappedComponent) =>
   (wrappedComponentProps) => {
       const KEY = 0;
       const **VALUE = 1;

       const propsJS = Object.entries(wrappedComponentProps)
            .reduce((newProps, wrappedComponentProp)  => {
                newProps[wrappedComponentProp[KEY]] = 
                    Iterable.isIterable(wrappedComponentProp[VALUE]) 
                        ? wrappedComponentProp[VALUE].toJS() 
                        : wrappedComponentProp[VALUE];
                return newProps;
            }, {});

       return <WrappedComponent {...propsJS} />
   };

```

And this is how you would use it in your Smart Component:

```
import { connect } from 'react-redux';

import { toJS } from `./to-js';

import DumbComponent from './dumb.component';

const mapStateToProps = (state) => {
   return {
      /**
      obj is an Immutable object in Smart Component, but it’s converted to a plain 
      JavaScript object by toJS, and so passed to DumbComponent as a pure JavaScript 
      object. Because it’s still an Immutable.JS object here in mapStateToProps, though, 
      there is no issue with errant re-renderings.
      */
       obj: getImmutableObjectFromStateTree(state)
   }
};

export default connect(mapStateToProps)(toJS(DumbComponent));
```
By converting Immutable.JS objects to plain JavaScript values within a HOC, we achieve Dumb Component portability, but without the performance hits of using `toJS()` in the Smart Component.

_Note: if your app requires high performance, you may need to avoid `toJS()` altogether, and so will have to use Immutable.JS in your dumb components. However, for most apps this will not be the case, and the benefits of keeping Immutable.JS out of your dumb components (maintainability, portability and easier testing) will far outweigh any perceived performance improvements of keeping it in._

_In addition, using `toJS` in a Higher Order Component should not cause much, if any, performance degradation, as the component will only be called when the connected component’s props change. As with any performance issue, conduct performance checks first before deciding what to optimise._

#### Further Information

**Documentation**
- [React: Higher-Order Components](https://facebook.github.io/react/docs/higher-order-components.html)

**Articles**
- [React Higher Order Components in depth](https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e#.dw2qd1o1g)

**Discussions**
- [Reddit: acemarke and cpsubrian comments on Dan Abramov: Redux is not an architecture or design pattern, it is just a library.](https://www.reddit.com/r/javascript/comments/4rcqpx/dan_abramov_redux_is_not_an_architecture_or/d5rw0p9/?context=3)

**Gists**
- [cpsubrian: React decorators for redux/react-router/immutable ‘smart’ components](https://gist.github.com/cpsubrian/79e97b6116ab68bd189eb4917203242c#file-tojs-js)

### 使用Immutable Object Formatter Chrome扩展来辅助调试

Install the [Immutable Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog) , and inspect your Immutable.JS data without seeing the noise of Immutable.JS's own object properties.

#### Further Information

**Chrome Extension**
- [Immutable Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog)