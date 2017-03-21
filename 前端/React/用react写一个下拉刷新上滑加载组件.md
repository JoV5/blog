> 本文记录了个人在编写项目[react-cnode](https://github.com/JoV5/react-cnode)实现下拉刷新上滑加载功能时的实现思路。

首先分析下下拉刷新的整个流程，直接上图：  
![下拉刷新](https://raw.githubusercontent.com/JoV5/blog/master/images/%E4%B8%8B%E6%8B%89%E5%88%B7%E6%96%B0.png)  

根据流程图，代码编写就比较清晰了，具体代码的实现可以[参考此处PullView](https://github.com/JoV5/react-cnode/blob/master/src/components/PullView.js)，已经添加了必要的注释。  

这里只贴一下组件可接受的参数props、自身的state以及属性：
```js
  static propTypes = {
    onPulling: PropTypes.func, // 状态非0且正在下拉时的事件，返回pull的距离
    onPullEnd: PropTypes.func, // 下拉结束即从状态2切换到状态3时的事件
    onScrollToBottom: PropTypes.func, // 滚动到底部事件，当滚动到距离底部toBottom位置时触发，可用于下滑加载更多
    onScrollUp: PropTypes.func, // 向上滚动事件，可用于上滚隐藏AppHeader等
    onScrollDown: PropTypes.func, // 向下滚动事件，可用于下滚显示AppHeader等
    onPullViewUnmount: PropTypes.func, // 在PullView将要Unmount时调用，可用于记录当前滚动位置，在下次Mount时作为下面的mountScrollTop参数传入，回到上次滚动位置
    onStatusChange: PropTypes.func, // 当status变化时的事件，返回改变后的状态，结合个人需要对不同状态做出相应视图改变，比如比如下拉时顶部显示相应的提示
    onPauseStopped: PropTypes.func, // 当toStopPause传递为true后，stopPause完成后的事件
    mountScrollTop: PropTypes.number,// 初始化时的滚动位置
    toBottom: PropTypes.number, // 当滚动到距离底部toBottom位置时将触发onScrollToBottom事件
    pulledPauseY: PropTypes.number, // 处于pause状态即status为3时的Y方向应所在的位置
    toStopPause: PropTypes.bool, // 是否需要终止暂停状态
    scaleY: PropTypes.number, // 下拉距离缩放比例，将会影响能够下拉的距离
    unit: PropTypes.string // 单位，在移动端用的单位可能不是px，pulledPauseY和state中的pulledY都将使用这一单位，在使用px之外的单位时，需要设置好scaleY
  };
  
  state = {
    pulledY: 0 // 下拉的距离
  };

  touching = false; // 是否处于touch状态，其实是用于兼容PC端，在mousedown之后才允许mousemove的逻辑
  startY = undefined; // 记录pull起始位置
  endY = undefined; // 记录pull当前位置
  status = 0; // 0. 未touchstart 1.pulling但未达到pulledPauseY 2.pulling达到pulledPauseY 3.进入pause状态
  lastScrollTop = undefined; // 上次scrollTop的位置，用于和当前滚动位置比较，判断是向上滚还是向下滚
  container = document.body; // pull的对象，事件将绑定在该元素
```

这里只将pulledY置于state中，是因为和组件render方法有关的属性只有pulledY。  

另外需要说的一点是container属性，其实原本container并不希望是body，而是一个body子元素，在这一子元素内进行滚动，但实践后发现存在的一个问题是，在Android的Chrome下，子元素内的滚动上滑不能带动地址栏隐藏，未找到合适的解决办法（iScroll可以解决？但这又增加了引用），但又不想舍弃隐藏地址栏这一功能，所以最后将pull的对象设置为body。所以这一组件存在一定的局限性，就是只能下拉整个页面即body，而不适用于局部位置下拉。

[PullView](https://github.com/JoV5/react-cnode/blob/master/src/components/PullView.js)是一个比较基础的组件，它不包含样式等其他功能，只是在某些动作触发及状态改变的时候触发相应的事件回调。通常下拉刷新时，会显示对下拉状态的改变进行展示，这一状态的展示样式每个人会有不一样的需求，所以将这些与组件分离，实际使用还需要一些代码的编写。  

对于同一个应用来说，通常下拉刷新的样式和状态变更时的逻辑是相同的，所以可以对[PullView](https://github.com/JoV5/react-cnode/blob/master/src/components/PullView.js)进行二次封装，[PullViewWrap](https://github.com/JoV5/react-cnode/blob/master/src/components/PullViewWrap.js)是一个简单的对PullView的二次封装的实现。 

[PullViewWrap](https://github.com/JoV5/react-cnode/blob/master/src/components/PullViewWrap.js)的实现如下：
```js
class PullViewWrap extends PureComponent {

  static defaultProps = {
    statusText: ['↓ 下拉刷新', '↓ 下拉刷新', '↑ 释放更新', '加载中...'], // 文字对应状态
    unit: 'px'
  };

  // 大部分同PullView的props
  static propTypes = {
    onScrollToBottom: PropTypes.func,
    onScrollUp: PropTypes.func,
    onScrollDown: PropTypes.func,
    onPullViewUnmount: PropTypes.func,
    onPauseStopped: PropTypes.func,
    mountScrollTop: PropTypes.number,
    toBottom: PropTypes.number,
    toStopPause: PropTypes.bool,
    pulledPauseY: PropTypes.number,
    scaleY: PropTypes.number,
    statusDivStyleClass: PropTypes.string, // 状态变更div的className
    LoadingComponent: PropTypes.func, // 加载中显示的组件
    unit: PropTypes.string,
    styleClass: PropTypes.string // wrap的className
  };

  constructor() {
    super(...arguments);
    this.onPulling = this.onPulling.bind(this);
    this.onStatusChange = this.onStatusChange.bind(this);
  }

  state = {
    pulledY: 0, // 下拉的距离
    status: 0 // 当前状态
  };

  // PullView状态变更逻辑
  onStatusChange(status) {
    const {pulledPauseY} = this.props;
    
    switch (status) {
      case 0:
        this.setState({
          status,
          pulledY: 0
        });
        break;
      case 3:
        this.setState({
          status,
          pulledY: pulledPauseY
        });
        break;
      default:
        this.setState({
          status
        });
        break;
    }
  }

  // PullView触发onPulling逻辑
  onPulling(pulledY) {
    this.setState({
      pulledY
    });
  }

  render() {
    const {props, state: {pulledY, status}, onPulling, onStatusChange} = this;
    const {statusDivStyleClass, LoadingComponent, statusText, unit, styleClass} = props;

    return (
      <div className={styleClass}>
        <div
          className={statusDivStyleClass}
          style={{
            transform: `translateY(${pulledY}${unit})`
          }}
        >
          {status === 3 && LoadingComponent ? <LoadingComponent/> : statusText[status]}
        </div>
        <PullView 
          {...props}
          onStatusChange={onStatusChange}
          onPulling={onPulling}
        />
      </div>
    )
  }
}
```
这里只是在状态变更是对文字内容进行了改变，实际上完全可以实现动画，比如有看到过一些应用下拉时实现了太阳升起的效果。  

最后就可以将[PullViewWrap](https://github.com/JoV5/react-cnode/blob/master/src/components/PullViewWrap.js)用于页面中的，向[PullViewWrap](https://github.com/JoV5/react-cnode/blob/master/src/components/PullViewWrap.js)传入props，主要是各个事件比如onPullEnd（下拉结束重新拉取数据）、onScrollToBottom（滑到了底部加载更多）等逻辑，具体的实现比如[TopicsPage](https://github.com/JoV5/react-cnode/blob/master/src/containers/TopicsPage/TopicsPageCreator.js)、[TopicPage](https://github.com/JoV5/react-cnode/blob/master/src/containers/TopicPage/index.js)。

需要说明的一个参数是，因为用了redux，所以个人处理是在componentWillReceiveProps这一组件周期中，如下:
```js
    componentWillReceiveProps(nextProps) {
      if (!nextProps.isReloading && this.props.isReloading) {
        this.setState({
          toStopPause: true
        });
      } else {
        this.setState({
          toStopPause: false
        });
      }
    }
```
通过比较前后props数据拉取状态的变化，来改变toStopPause。这里是从数据正在拉取状态转向数据拉取结束结束时，toStopPause置为true，否则为false。这里实现的一个缺陷是，需要在onPauseStoped事件中将toStopPause置回false，否则只能等下次componentWillReceiveProps触发，在这期间PullView状态可能不能如预期切换。  

实现的效果可以访问[react-cnode在线地址](http://cnode.padabon.com)，大部分页面都加入了下拉刷新功能。

[react-cnode](https://github.com/JoV5/react-cnode)采用了以下技术栈，通过normalizr + reselect + immutable对数据做了持久化的处理，可以极大地减少数据请求，并且提升应用的响应速度，达到App的效果，相关内容将在下一篇进行分享。
* react
* react router 4
* redux
* redux-observable
* rxjs
* immutable
* normalizr
* reselect
 