## 第九章 基于HTTP的功能追加协议
### 9.1 基于HTTP的协议
HTTP协议存在限制及自身性能有限。功能不足可通过创建一套全新的协议来弥补。但基于HTTP
的Web浏览器的使用环境已遍布全球，因此无法完全抛弃HTTP。有一些新协议的规则是基于HTTP的，
并在此基础上添加了新的功能。

### 9.2 消除HTTP瓶颈的SPDY
Google在2010年发布了SPDY，其开发目标旨在解决HTTP的性能瓶颈，缩短Web页面的加载时间（50%）.

#### 9.2.1 HTTP的瓶颈
HTTP标准存在以下瓶颈
* 一条连接上只可发送一个请求。
* 请求只能从客户端开始。客户端不可以接收除响应以外的指令。
* 请求/响应首部未经压缩就发送。首部信息越多延迟越大。
* 发送冗长的首部。每次互相发送相同的首部造成的浪费较多。
* 可任意选择数据压缩格式。非强制压缩发送。

##### Ajax的解决办法
Ajax（Asynchronous JavaScript and XML，异步JavaScript与XML技术）是一种有效利用JavaScript
和DOM的操作，已达到局部Web页面替换加载的异步通信手段。
Ajax的核心技术是名为XMLHttpRequest的API，通过JavaScript脚本语言的调用就能和服务器
进行HTTP通信。借由这种手段，就能从已加载完毕的Web页面上发起请求，只更新局部页面。  
而利用Ajax实时地从服务器获取内容，有可能会导致大量请求产生。另外，HTTP协议本身的问题仍未解决。

##### Comet的解决办法
一旦服务器端有内容更新了，Comet不会让请求等待，而是直接给客户端返回响应。这是一种通过延迟
应答，模拟实现服务器端向客户端推送（Server Push）的功能。  
通常，服务器端接收到请求，在处理完毕后就会立即返回响应，但为了实现推送功能，Comet会先将响
应置于挂起状态，当服务器端有内容更新时，再返回该响应。因此，服务器端一旦有更新，就可以立即
反馈给客户端。  
内容上虽然可以做到实时更新，单位了保留响应，一次连接的持续时间也变长了。期间，为了维持连接
会消耗更多的资源。另外，Comet也仍未解决HTTP协议本身存在的问题。

##### SPDY的目标
为了进行根本性的改善，需要有一些协议层面上的改动。SPDY协议正是为了消除HTTP所遭遇的瓶颈。

#### 9.2.2 SPDY的设计与功能
SPDY没有完全改写HTTP协议，而是在TCP/IP的应用层与运输层之间通过新加会话层的形式运作。
同时，考虑到安全性问题，SPDY规定通信中使用SSL。  
SPDY以会话层的形式加入，控制对数据的流动，但还是采用HTTP建立通信连接。因此，可照常
使用HTTP的GET和POST等方法、Cookie以及HTTP报文等。  
使用SPDY后，HTTP协议额外获得以下功能。

##### 多路复用流
通过单一的TCP连接，可以无限制处理多个HTTP请求。所有请求的处理都在一条TCP连接上完成，
因此TCP的处理效率得到提高。

##### 赋予请求优先级
SPDY不仅可以无限制地并发处理请求，还可以请求逐个分配优先级顺序。这样主要是为了在发送
多可请求时，解决因带宽而导致响应变慢的问题。 

##### 压缩HTTP首部
压缩HTTP请求和响应的首部，通信产生的数据包数量和发送的字节数就更少了。

##### 推送功能 
支持服务器主动向客户端推送数据的功能。这样，服务器可直接放松数据，而不必等待客户端的请求。

##### 服务器提示功能
服务器可以主动提示客户端请求所需的资源。由于在客户端发现资源之前就可以获知资源的存在，
因此在资源已缓存等情况下，可以避免发送不必要的请求。

#### 9.2.3 SPDY消除Web瓶颈了吗
SPDY基本上只是将单个域名（IP地址）的通信多路复用，所以当一个Web网站上使用多个域名下
的资源，改善效果就会受到限制。  
SPDY的确是一种可有效消除HTTP瓶颈的技术，但很多Web网站存在的问题并非仅仅是由HTTP瓶颈
所导致的。对Web本身的速度提升，还应该从其他可细致钻研的地方入手，比如改善Web内容的编写方式等。

### 9.3 使用浏览器进行全双工通信的WebSocket
#### 9.3.1 WebScoket的设计与功能
WebSocket，即Web浏览器与Web服务器之间全双工通信标准。其中，WebSocket协议由IETF定为
标准，WebSocket API由W3C定为标准。WebSocket主要为了解决Ajax和Comet里XMLHttpRequest
附带的缺陷所引起的问题。

#### 9.3.2 WebSocket协议
一旦Web服务器与客户端之间建立起WebSocket协议的通信连接，之后所有的通信都依靠这个专用
协议进行。通信过程中可互相发送JSON、XML、HTML或图片等任意格式数据。  
由于是建立在HTTP基础上的协议，因此连接的泛起方仍是客户端，而一旦确立WebSocket通信连接，
不论服务器还是客户端，任意一方都可直接向对方发送报文。  
WebSocket协议的主要特点。

##### 推送功能
支持服务器向客户端推送数据的推送功能，不必等待客户端的请求。

##### 减少通信量
只要建立起WebSocket连接，就希望一直保持连接状态。和HTTP相比，不但每次连接时的总开销
减少，而且由于WebSocket的首部信息很小，通信量也相应减少了。  

为了实现WebSocket通信，在HTTP连接建立之后，需要完成一次“握手”（Handshaking）的步骤。
* 握手·请求
为了实现WebSocket通信，需要用到HTTP的Upgrade首部字段，告知服务器通信协议发生改变，已达到握手目的。
> GET /chat HTTP/1.1  
> Host: server.example.com  
> Upgrade: websocket  
> Connection: Upgrade  
> Sec-WebSocket-Key: dGhlIHNhbXbsZSBub25jZQ==
> Origin: http://example.com
> Sec-WebSocket-Protocol: chat, superchat
> Sec-WebSocket-Version: 13

Sec-WebSocket-Key字段内记录着握手过程中必不可少的减值。Sec-WebSocket-Protocol字段
内记录使用的子协议。  
子协议按WebSocket协议标准在连接分开使用时，定义那些连接的名称。

* 握手·响应
对于之前的请求，返回状态码101 Switching Protocols的响应。
> HTTP/1.1 101 Switching Protocols
> Upgrade: websocket
> Connection: Upgrade
> Sec-Websocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbk+xOo=
> Sec-WebSocket-Protocol: chat

Sec-Websocket-Accept的字段值是由握手请求的Sec-WebSocket-Key的字段值生成的。  
成功握手确立WebSocket连接之后，通信时不再使用HTTP的数据帧，而采用WebSocket独立的数据帧。

* WebSocket API 
JavaScript可调用“The WebSocket API”内提供的WebSocket程序接口，以实现WebSocket协议下
全双工通信。

### 9.4 期盼已久的HTTP/2.0

##### HTTP/2.0的特点
目标是改善用户在使用Web时的速度体验。
* SPDY 
* HTTP Speed + Mobility  
由微软起草，用于改善并提高移动端通信时的通信速度和性能的标准。建立在SPDY和WebSocket基础上。
* Network*Friendly HTTP Upgrade  
主要是在移动端通信时改善HTTP性能的标准。

##### HTTP/2.0的7项技术及讨论
* 压缩 SPDY、Friendly
* 多路复用 SPDY 
* TLS义务化 Speed + Mobility
* 协商 Speed + Mobility， Friendly
* 客户端拉拽（Client pull）/ 服务器端推送 Speed + Mobility
* 流量控制 SPDY
* WebSocket Speed + Mobility

### 9.5 Web服务器管理文件的WebDAV
WebDAV（Web-based Distributed Authoring and Versioning，基于万维网的分布式创作和
版本控制）是一个可对Web服务器上的内容直接进行文件复制、编辑等操作的分布式文件系统。  
除了创建、删除文件等基本功能，它还具备文件创建者管理、文件编辑过程中禁止其他用户内容
覆盖的加锁功能，以及对文件内容修改的版本控制功能。  
使用HTTP/1.1的PUT方法和DELETE方法，就可以对Web服务器上的文件进行创建和删除操作。
可是出于安全性及便捷性等考虑，一般不使用。

#### 9.5.1 扩展HTTP/1.1的WebDAV
针对服务器上的资源，WebDAV新增加了一些概念，如下所示。
* 集合（Collection）：是一种统一管理多个资源的概念。以集合为单位可进行各种操作。也可
实现类似集合的集合这样的叠加。
* 资源（Resource）：把文件和集合称为资源。
* 属性（Property）：定义资源的属性。定义以“名称=值”的格式执行。
* 锁（Lock）：把文件设置成无法编辑状态。多人同时编辑时，可防止在同一时间进行内容写入。

#### 9.5.2 WebDav内新增的方法及状态码
WebDAV为实现远程文件管理，向HTTP/1.1中追加了一下这些方法。
* PROPFIND：获取属性
* PROPPATCH：修改属性
* MKCOL：创建集合
* COPY：复制资源及属性
* MOVE：移动资源
* LOCK：资源加锁
* UNLOCK：资源解锁

为配合扩展的方法，状态码也随之扩展。
* 102 Processing：可正常处理请求，但目前是处理中状态
* 207 Multi-Status：存在多种状态
* 422 Unprocessible Entity： 格式正确，内容有误
* 423 Locked：资源已被加锁
* 424 Failed Dependency：处理与请求关联的请求失败，因此不再维持依赖关系
* 507 Insufficient Storage：保存空间不足
 