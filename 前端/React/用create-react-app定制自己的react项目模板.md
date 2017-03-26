# 用create-react-app定制自己的react项目模板

> 本文记录了在开发[`react-cnode`](https://github.com/JoV5/react-cnode)时，所使用的react项目模板[react-starter](https://github.com/JoV5/react-starter)。[`create-react-app`](https://github.com/facebookincubator/create-react-app)是非常优秀的官方脚手架，已经提供了丰富的功能，该模板是基于[`create-react-app`](https://github.com/facebookincubator/create-react-app)创建的项目eject后，在不影响原有功能的前提下，根据个人的需要进行了一些定制。

## 目录
- [使用webpack2](#使用webpack2)
- [多入口](#多入口)
- [分离第三方库](#分离第三方库)
- [支持react组件热更新](#支持react组件热更新)
- [react组件按需加载](#react组件按需加载)
- [支持alias配置](#支持alias配置)


<a id="使用webpack2"></a>
## 使用webpack2
使用webpack v2替换原来的webpack v1，webpack v1和v2的差异不在这里赘述了，可以参考官方文档[Migrating from v1 to v2](https://webpack.js.org/guides/migrating/)，也有相应的中文文档[从 v1 迁移到 v2](https://doc.webpack-china.org/guides/migrating/)。

需要注意的是，webpack2内建支持ES2015模块，所以设置babel中es2015配置的modules为false，同时这也是支持react组件热更新所必要的配置，修改babel配置为：
```js
  "babel": {
    "presets": [
      [
        "es2015",
        {
          "modules": false
        }
      ],
      "stage-0",
      "react"
    ]
  }
```
这里没有用原来的`babel-preset-react-app`，而是用了`es2015` + `stage-0` + `react`，因为`babel-preset-react-app`不支持一些实验性的语言特性，所以使用时自行斟酌。

<a id="多入口"></a>
## 多入口
每次新建项目都进行一次create-react-app，尤其有时候可能只是一个简单的页面，是比较繁琐的，因为create-react-app只支持一个文件入口，所以支持多入口是有必要。

要支持多入口，只需要对[`config/paths.js`](https://github.com/JoV5/react-starter/blob/master/config/paths.js)进行一些改动。

读取npm命令时的参数：
```js
let appname = process.argv.find(arg => arg.indexOf('app=') === 0);
appname = appname ? appname.split('=')[1] : '';
```
然后修改一下输出路径：
```js
  appBuild: resolveApp(`build/${appname}`),
  appPublic: resolveApp(`public/${appname}`),
  appHtml: resolveApp(`public/${appname}/index.html`),
  appIndexJs: resolveApp(`src/${appname}/index.js`),
```
就这么简单，┑(￣Д ￣)┍，修改之后兼容之前的项目结构，也就是可以直接在src目录下添加代码文件，要使用多入口，需要分别在`src`和`public`目录下新建相同名称的目录，比如：
* public  
  * react
  * react-router
* src
  * react
  * react-router

然后分别在目录下添加代码文件，具体可以参考[react-starter](https://github.com/JoV5/react-starter)的项目结构。

在npm命令时加入`-- app=appname`参数，示例如下：
  * `npm start -- app=appname`
  * `npm run build -- app=appname`
  * `serve -s build/appname`


<a id="分离第三方库"></a>
## 分离第三方库
> 注意：此时需要一个配置文件，我起名为`appconfig.js`，将它固定放在各自项目目录下与`index.js`同级，放在其他地方就找不到啦~  

增加一个配置文件很简单，首先需要一个[fsExistsSync方法](https://github.com/JoV5/react-starter/blob/master/config/fsExistsSync.js)判断这个配置文件是否存在，然后在[config/paths.js](https://github.com/JoV5/react-starter/blob/master/config/paths.js#L76)中增加配置文件路径:
```js
appConfigJs: resolveApp(`src/${appname}/appconfig.js`)
```
接着只需要在webpack配置[webpack.config.dev.js](https://github.com/JoV5/react-starter/blob/master/config/webpack.config.dev.js#L22-L23)和[webpack.config.prod.js](https://github.com/JoV5/react-starter/blob/master/config/webpack.config.prod.js#L44-L45)引入`appconfig.js`文件加载配置:
```js
const appConfig = fsExistsSync(paths.appConfigJs) ? require(paths.appConfigJs) : {};
const appConfigEntry = appConfig.entry;
```
最后再修改[`webpack.config.prod.js`](https://github.com/JoV5/react-starter/blob/master/config/webpack.config.prod.js#L79-L97)的entry配置为：
```js
Object.assign({
    main: [
      require.resolve('./polyfills'),
      paths.appIndexJs
    ]
}, appConfigEntry)
```
[`webpack.config.dev.js`](https://github.com/JoV5/react-starter/blob/master/config/webpack.config.dev.js#L38-L60)的修改类似，这里我固定了应用文件打包后文件名为`main.js`。

对于想要打包在一个文件中的库文件，比如想把`react`和`react-dom`这两个库文件一起打包进`react.js`文件中，以及其他打包进`vendors.js`中，可以在`appconfig.js`中进行以下配置：
```js
module.exports = {
  entry: {
    react: ['react', 'react-dom'],
    vendors: ['rxjs', 'immutable', 'axios', 'react-redux', 'react-router-dom', 'redux', 'redux-observable']
  }
};
```
这是非常有必要的，具体原因可以参考官方对[code-splitting-libraries](https://webpack.js.org/guides/code-splitting-libraries/)的说明，中文文档[代码分离 - Libraries](https://doc.webpack-china.org/guides/code-splitting-libraries/)。


<a id="支持react组件热更新"></a>
## 支持react组件热更新
这里使用react hot loader 3来支持react组件的热更新。

1. 在`webpack.config.dev.js`的entry配置中加入`'react-hot-loader/patch'`，注意它需要放在顶部，即：
    ```js
    entry: Object.assign({
        main: [
            'react-hot-loader/patch',
            require.resolve('react-dev-utils/webpackHotDevClient'),
            require.resolve('./polyfills'),
            paths.appIndexJs
        ]
    }, appConfigEntry)
    ```
2. 在babel-loader的配置plugins中加入`react-hot-loader/babel`，即：
    ```js
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          plugins: [
            'react-hot-loader/babel'
          ]
        }
      }
    ```
3. `<AppContainer/>`是处理模块重新加载以及错误处理的组件。应用程序的根组件应该作为子组件嵌套在AppContainer中。在生产环境中，AppContainer自动禁用，只返回其子组件。具体使用代码如下：
    ```js
    import React from 'react';
    import ReactDOM from 'react-dom';
    import {AppContainer} from 'react-hot-loader';

    import App from './App';
    import './index.css';

    const root = document.getElementById("root");

    const render = (Component) => {
        ReactDOM.render(
            <AppContainer>
                <Component />
            </AppContainer>,
            root
        );
    };

    render(App);

    // Hot Module Replacement API
    if (module.hot) {
        module.hot.accept('./App', () => {
            render(App);
        });
    }
    ```
    具体可以参考示例[`react-router`](https://github.com/JoV5/react-starter/blob/master/src/react-router/index.js)或者示例[`react`](https://github.com/JoV5/react-starter/blob/master/src/react/index.js)。

[官方react hot loader3的使用指南](https://github.com/gaearon/react-hot-loader/tree/master/docs#migration-to-30)



<a id="react组件按需加载"></a>
## react组件按需加载

你可以使用[`lazy-load-react`](https://github.com/JoV5/lazy-load-react)来进行组件的按需加载，使用[`lazy-load-react`](https://github.com/JoV5/lazy-load-react)提供的方法加载文件，同时也支持热更新！
在本项目模板中已经内置，在其他项目中使用可通过：  

`npm install lazy-load-react`  

使用方法：
```js
import lazyme from 'lazy-load-react';

const HomePage = lazyme(() => System.import('./HomePage'));

<Route exact path="/" component={HomePage}/>
```
具体使用方法可以参考示例[`react-router App`](https://github.com/JoV5/react-starter/blob/master/src/react-router/containers/App.js)或者[`react-cnode App`](https://github.com/JoV5/react-cnode/blob/master/src/containers/App/index.js)。


<a id="支持alias配置"></a>
## 支持alias配置
与配置第三方库文件类似，需要在`appconfig.js`中进行配置。

alias的使用方法请参考[官方文档resolve.alias](https://webpack.js.org/configuration/resolve/#resolve-alias)。resolve下也可以进行[官方文档Resolve](https://webpack.js.org/configuration/resolve)中其他配置项的配置。中文文档[解析(Resolve)](https://doc.webpack-china.org/configuration/resolve/)。`appconfig.js`配置示例如下：

```js
module.exports = {
  entry: {
    react: ['react', 'react-dom'],
    vendors: ['rxjs', 'immutable', 'axios', 'react-redux', 'react-router-dom', 'redux', 'redux-observable']
  }
  resolve: {
    alias: {
      'Containers': path.resolve(__dirname, 'containers/')
    }
  }
};
```

这有好处也有坏处，好处是可以简化引入模块是的路径，比如：
原来是
```js
import Page from '../../containers/page';
```
可以写成
```js
import Page from 'Containers/page';
```
然而这么做后，编辑器可能无法对路径进行解析，影响比如路径正确性检验、文件移动修改对应文件引用等功能，所以是否使用自行斟酌。