# 第7章 Ajax

## 数据传输
Ajax，从最基本的层面来说，是一种与服务器通信而无须重载页面的方法；数据额可以从服务器获取或发送给服务器。

### 请求数据
有五种常用技术用于向服务器请求数据：
* XMLHttpRequest（XHR）
* Dynamic script insertion 动态脚本注入
* iframes
* Comet
* Multipart XHR

#### XMLHttpRequest
XMLHttpRequest（XHR）是目前最常用的技术，它允许异步发送和接受数据。所有的主流浏览器它都提供了完善的支持，而且他还能精确地控制发送请求和数据接收。你可以在请求中添加任何头信息和参数（包括GET和POST），病毒去服务器返回的所有头信息，以及响应文本。