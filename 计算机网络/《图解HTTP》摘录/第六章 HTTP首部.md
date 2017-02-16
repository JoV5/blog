## 第六章 HTTP首部


### 6.1 HTTP报文首部


### 6.2 HTTP首部字段

#### 6.2.1 HTTP首部字段传递重要信息
HTTP首部字段是构成HTTP报文的要素之一。
在客户端与服务器之间以HTTP协议进行通信的过程中，
无论是请求还是响应都会使用首部字段，它能起到额外重要信息的作用。  
使用首部字段是为了给浏览器和服务器提供报文主体大小、所使用的的语言、认证信息等内容。

#### 6.2.2 HTTP首部字段结构
> 首部字段名: 字段值  

例如  
> Content-Type: text/html  

字段值对应单个HTTP首部字段可以有多个值，如
> Keep-Alive: timeout=15, max=100

若HTTP首部字段重复了，根据浏览器内部处理逻辑的不同，结果可能不一致。

#### 6.2.3 4种HTTP首部字段类型
##### HTTP首部字段根据实际用途被分为以下4种类型：
1. 通用首部字段
2. 请求首部字段
3. 响应首部字段
4. 实体首部字段

#### 6.2.4 HTTP/1.1 首部字段一览
HTTP/1.1规范定义了如下47种首部字段
##### 通用首部字段
Cache-Control 控制缓存行为  
Connection 逐跳首部、连接的管理  
Date 创建报文的日期时间  
Pragma 报文指令  
Trailer 报文末端的首部一览  
Transfer-Encoding 指定报文主体的传输编码方式  
Upgrade 升级为其他协议  
Via 代理服务器的相关信息
Warning 错误通知  

##### 请求首部字段
Accept 用户代理可处理的媒体类型  
Accept-Charset 优先的字符集  
Accept-Encoding 优先的内容编码  
Accept-Language 优先的语言  
Authorization Web认证信息  
Except 期待服务器的特定行为  
From 用的电子邮箱地址  
Host 请求资源所在服务器  
if-Match 比较实体标记(Etag)  
if-Modified-Since 比较资源的更新时间  
if-None-Match 比较实体标记(与if-Match相反)  
if-Range 资源未更新时发送实体Byte的范围请求  
if-Unmodified-Since 比较资源的更新时间(与if-Modified-Since相反)  
Max-Forwards 最大传输逐跳数  
Proxy-Authorization 代理服务器要求客户端的认证信息  
Range 实体的字节范围请求  
Renferer 对请求中URI的原始获取方  
TE 传输编码的优先级  
User-Agent HTTP客户端程序的信息  

##### 响应首部字段  
Accept-Ranges 是否接受字节范围请求  
Age 推算资源创建经过时间  
ETag 资源的匹配信息  
Location 令客户端重定向至指定URI  
Proxy-Authenticate 代理服务器对客户端的认证信息  
Retry-After 对再次发起请求的时机要求  
Server HTTP服务器的安装信息  
Vary 代理服务器缓存的管理信息  
WWW-Authenticate 服务器对客户端的认证信息  
 
##### 实体首部字段
Allow 资源可支持的HTTP方法  
Content-Encoding 实体主体适用的编码方式  
Content-Language 实体主体的自然语言  
Content-Length 实体主体的大小  
Content-Location 替代对应资源的URI  
Content-MD5 实体主体的报文摘要  
Content-Range 实体主体的位置范围  
Content-Type 实体主体的媒体类型  
Expires 实体主体过期的日期时间  
Last-Modified 资源的最后修改日期

#### 6.2.5 非HTTP/1.1 首部字段
在HTTP协议通信交互中使用到的首部字段，不限于RFC2616中定义的47种首部字段。
还有Cookie、Set-Cookie和Content-Disposition等其他RFC种定义的首部字段。  
这些非正式的首部字段统一归纳在REC4229 HTTP Header Field Registrations中。

#### 6.2.6 End-to-End首部和Hop-by-hop首部
HTTP首部字段将定义成缓存代理和非缓存代理的行为，分成2种类型。
##### 端到端首部(End-to-end Header)
分再次类别的首部会转发给请求/响应对应的最终接收目标，
且必须保存在由缓存生成的响应中、另外规定它必须被转发。
##### 逐跳首部(Hop-by-hop Header)
分在此类别的首部只对单次转发有效，会因通过缓存或代理而不在转发。
HTTP/1.1和之后版本中，如果要使用hop-by-hop首部，需要提供Connection首部。  
逐跳首部包括：
* Connection
* Keep-Alive
* Proxy-Authenticate
* Proxy-Authorization
* Trailer
* TE
* Transfer-Encoding
* Upgrade  
其他所有字段都属于端到端首部。

### 6.3 HTTP/1.1 通用首部字段
通用首部字段指请求报文和响应报文双方都会使用的首部。

#### 6.3.1 Catch-Control
用于操作缓存的工作机制。  
指令的参数是可选的，多个指令之间通过","分隔，如：
> Cache-Control: private, max-age=0, no-Cache  

可用的指令按请求和响应分类如下所示。
##### 缓存请求指令
指令 参数 说明  
* no-cache 无 强制向源服务器再次验证  
* no-store 无 不缓存请求或响应的任何内容  
* max-age=[秒] 必需 响应的最大Age值  
如果判定缓存的缓存时间值比指定时间的数值更小，那客户端就接收缓存的资源。  
当指定max-age值为0，那缓存服务器通常需要将请求转发给源服务器。  
* max-stale(=[秒]) 可省略 接受已过期的响应  
如果未指定参数，那无论经过多久，客户端都会接受响应；  
如果指定具体数值，即使过期，只要处于max-stale指定时间内仍会被客户端接收。  
* min-fresh=[秒] 必需 期望在指定时间内的响应仍有效  
指令要求缓存服务器返回至少还未过指定时间的缓存资源。  
* no-transform 无 代理不可更改媒体类型  
可防止缓存或代理压缩图片等类似操作。
* only-if-cached 无 从缓存获取资源  
客户端仅在缓存服务器本地缓存目标资源的情况下才会要求其返回。  
若发生请求缓存服务器的本地缓存无响应，则返回状态吗504。
* cache-extension - 新指令标记(token)  
通过cache-extension标记(token)，可以扩展Cache-Control首部字段内的指令。

##### 缓存响应指令
指令 参数 说明  
* public 无 可向任意方提供响应的缓存  
* private 可省略 仅向特定用户返回响应  
* no-cache 可省略 缓存前必须先确认其有效性  
无参数值的首部字段可以使用缓存，只能在响应指令中指定该参数。   
* no-store 无 不缓存请求或响应的任何内容  
* no-transform 无 代理不可更改媒体类型   
* must-revalidate 无 可缓存但必须再向源服务器进行确认  
代理会向源服务器再次验证即将返回的响应缓存目前是否仍然有效。    
若无法再次获取有效资源，缓存必需给客户端一条504状态码。  
该指令会忽略请求的max-stale指令。
* proxy-revalidate 无 要求中间缓存服务器对缓存的响应有效性在进行确认  
* max-age=[秒] 必需 响应的最大Age值  
缓存服务器将不对资源的有效性再做确认，而max-age数值代表资源保存为缓存的最长时间。 
应用HTTP/1.1版本的缓存服务器遇到同时存在Expires首部字段的情况时，会优先处理max-age指令而忽略Expires首部字段。  
HTTP/1.0版本缓存服务器情况相反。   
* s-maxage=[秒] 必需 公共缓存服务器相应的最大Age值  
对于向同一个用户重复返回响应的服务器来说，这个指令没有任何作用。  
当使用s-maxage指令后，则直接忽略对Expires首部字段及max-age指令的处理。  
* cache-extension - 新指令标记(token)  

#### 6.3.2 Connection
具备如下两个作用。  

1. 控制不再转发给代理的首部字段
> Connection: 不再转发的首部字段名  

2. 管理持久连接
> Connection: close
> Connection: keep-alive

#### 6.3.3 Date
首部字段Date表明创建HTTP报文的日期和时间。
HTTP/1.1协议使用在RFC1123中规定的日期时间的格式，如：
> Date: Tue, 03 Jul 2012 04:40:59 GMT

#### 6.3.4 Pragma
HTTP/1.1之前版本的历史遗留字段，仅作为与HTTP/1.0的向后兼容而定义。
> Pragma: no-cache

属于通用首部字段，但只用在客户端发送的请求。  
客户端会要求所有的中间服务器不返回缓存的资源。

#### 6.3.5 Trailer
事先说明在报文主体后记录了那些首部字段。  
该首部字段可应用在HTTP/1.1版本分块传输编码时。

#### 6.3.6 Transfer-Encoding
规定传输报文主体时采用的编码方式。 
HTTP/1.1的传输编码方式仅对分块传输编码有效。
> Transfer-Encoding: chunked

### 6.3.7 Upgrade
首部字段Upgrade用于检测HTTP协议及其他协议是否可使用更高的版本进行通信，其参数值可以用来指定一个完全不同的通信协议。  
Upgrade首部字段产生作用的Upgrade对象仅限于客户端和邻接服务器之间。  
使用首部字段Upgrade时，还需要额外指定Connection: Upgrade。  
对于附有首部字段Upgrade的请求，服务器可用101 状态码作为响应返回。

#### 6.3.8 Via
用于追踪客户端与服务器之间的请求和响应报文的传输路径。  
还可以避免请求回环的发生。所以必须在经过代理时附加该首部字段内容。  
经常会和TRACE方法一起使用。

#### 6.3.9 Warning
用于告知用户一些与缓存相关的问题的警告。  
格式如下，日期时间部分可省略：
> Warning: [警告码][警告的主机: 端口号] "[警告内容]" ([日期时间])


### 6.4 请求首部字段
从客户端发送请求报文中所使用的字段，用于补充请求的附加信息、客户端信息、对响应内容相关的优先级等内容。

#### 6.4.1 Accept
告知服务器用户代理能够处理的媒体类型及媒体类型的相对优先级。  
若想要给显示的媒体类型真假优先级，则使用q=来额外表示权重值，用分号(;)进行分隔。
权重值q的范围是0~1(可精确到小数点后3位)，且1为最大值。不指定权重q值时，默认权重为1.0。  
当服务器提供多种内容时，将会首先返回权重最高的媒体类型。

#### 6.4.2 Accept-Charset
通知服务器用户代理支持的字符集及字符集的相对优先顺序。
可一次性指定多种字符集。可以用权重q值来表示相对优先级。

#### 6.4.3 Accept-Encoding
告知服务器用户代理的内容编码及内容编码的优先级顺序。可一次性指定多种内容编码。
* gzip
由文件压缩程序gzip生成的编码格式。
* compress
由UNIX文件压缩程序compress生成的编码格式
* deflate
组合使用zlib格式及由deflate压缩算法生成的编码格式。
* identity
不执行压缩或不会变化的默认编码格式

采用权重q来表示相对优先级。
可使用星号(*)作为通配符，指定任意的编码格式。

#### 6.4.4 Accept-Language
告知服务器用户代理能处理的自然语言集及自然语言集的相对优先级。可一次指定多种自然语言集。
按权重值q来表示相对优先级。

#### 6.4.5 Authorization
告知服务器用户代理的认证信息。
通常，想要通过服务器认证的用户代理会在接收到返回的401状态码响应后，把首部字段Authorization加入请求。
公用缓存在接收到含有Authorization首部字段的请求时的操作处理会略有差异。

#### 6.4.6 Expect
告知服务器，期望出现的某种特定行为。因服务器无法理解客户端的期望做出回应而发生错误时，
会返回状态码417 Expectation Failed。  
HTTP/1.1规范只定义了100-continue(状态码100 Continue之意)。    
等待状态码100响应的客户端在发生请求时，需要指定Expect: 100-continue。

#### 6.4.7 From
告知服务器使用用户代理的用户电子邮件地址。

#### 6.4.8 Host
告知服务器请求的资源所处的互联网主机名和端口号。
Host首部字段在HTTP/1.1规范内是唯一一个必须被包含在请求内的首部字段。
相同的IP地址下部署运行着多个域名，就需要使用首部字段Host来明确指出请求的主机名。
若服务器未设定主机名，那直接发送一个空值即可。

#### 6.4.9 If-Match
形如If-xxx这种样式的请求首部字段，都可称为条件请求。服务器接收到附带条件的请求后，
只有判断指定条件为真时，才会执行请求。  
首部字段If-Match，属附带条件之一，它会告知服务器匹配资源所用的实体标记(ETag)值。
这时的服务器无法使用弱ETag值。  
服务器会对比If-Match的字段值和资源的ETag值，仅当两者一致时，才会执行请求。
反之，返回状态码412 Precondition Failed的响应。  
还可以使用星号(*)指定If-Match的字段值。这种情况，服务器会忽略ETag的值，只要资源存在就处理请求。

#### 6.4.10 If-Modified-Since
属附带条件之一，它会告知服务器若If-Modified-Since字段值早于资源的更新时间，则希望处理该请求。
而在指定If-Modified-Since字段值的日期时间之后，如果请求的资源都没有更新过，则返回状态码304 Not Modified的响应。

#### 6.4.11 If-None-Match
属于附带条件之一。它和首部字段If-Match作用相反。用于指定If-None-Match字段值得实体标记(ETag)
值与请求资源的ETag不一致时，他就告知服务器处理该请求。

#### 6.4.12 If-Range
属于附带条件之一。它告知服务器指定的If-Range字段值(ETag值或者时间)和请求资源的ETag值或时间相一致时，
则作为范围请求处理。反之，则返回全体资源。

#### 6.4.13 If-Unmodified-Since
告知服务器指定的请求资源只有在字段值内指定的日期时间之后，未发生更新的情况下，才能处理请求。
如果在指定日期时间后发生了更新，则以状态码412 PreCondition Failed作为响应返回。

#### 6.4.14 Max-Forwards
通过TRACE方法或OPTIONS方法，发送包含首部字段Max-Forwards的请求时，
该字段以十进制整数形式指定可经过的服务器最大数目。服务器在往下一个服务器转发请求之前，
Max-Forwards的值减1后重新赋值。当服务器接收到Max-Forwards值为0的请求时，则不再进行转发，而是直接返回响应。

#### 6.4.15 Proxy-Authorization
接收到从代理服务器发来的认证质询时，客户端会发送包含首部字段Proxy-Authorization的请求，
以告知服务器认证所需要的信息。  
这个行为是客户端和服务器之间的HTTP访问认证类似的，不同之处在于，
认证行为发生在客户端与代理之间。客户端与服务器之间的认证，使用首部字段Authorization可起到相同的作用。

#### 6.4.16 Range
对于只需获取部分资源的范围请求，包含首部字段Range即可告知服务器资源的指定范围。  
接收到附带Range首部字段请求的服务器，会在处理请求之后返回状态码为206 Partial Content的响应。
无法处理该范围请求时，则会返回状态码200 OK的响应及全部资源。

#### 6.4.17 Referer
告知服务器请求的原始资源的URI

#### 6.4.18 TE
> TE: gzip, deflate;q=0.5

告知服务器客户端能够处理响应的传输编码方式及相对优先级。
它和首部字段Accept-Encoding的功能很像，但是用于传输编码。  
还可以指定伴随trailer字段的分块传输编码的方式，只需把trailers赋值给该字段。
> TE: trailers

#### 6.4.19 User-Agent
会将创建请求的浏览器和用户代理名称等信息传达给服务器。


### 6.5 响应首部字段
由服务器端向客户端返回响应报文中所使用的字段，用于补充响应的附加信息、服务器信息，以及对客户端的附加要求等信息。

#### 6.5.1 Accept-Ranges
告知客户端服务器是否能处理范围请求，以指定获取服务器端某个部分的资源。  
可指定的字段值有两种，可处理范围请求时指定其为bytes，反之则指定其为none。

#### 6.5.2 Age
告知客户端源服务器在多久前创建了响应。字段值的单位为秒。  
若创建该响应的服务器是缓存服务器，Age值是指缓存后的响应再次发起认证到认证完成的时间值。
代理创建响应时必须加上首部字段Age。


#### 6.5.3 ETag
告知客户端实体标识。它是一种可将资源以字符串形式做唯一性标识的方式。
服务器会为每份资源分配对应的ETag值。  
当资源更新时，ETag值也需要更新。生成ETag值时，并没有统一的算法规则，而仅仅有服务器来分配。  
资源被缓存时，就会被分配唯一性标识，仅凭URI指定缓存的资源是相当困难的。 

##### 强ETag值和若ETag值
ETag中有强ETag值和弱ETag值之分。
* 强ETag值，不论实体发生多么细微的变化都会改变其值。
> ETag: "usagi-1234"
* 弱ETag值只用于提示资源是否相同。只有资源发生了根本改变，
产生差异时才会改变ETag值。这时会在字段值最开始处附加W/值。
> ETag: W/"usage-1234"

#### 6.5.4 Location
将响应接收方引导至某个与请求URI位置不同的资源。  
基本上，该字段会配合3xx: Redirection的响应，提供重定向的URI。  
几乎所有的浏览器在就收到包含首部字段Location的响应后，都会强制性地尝试对已提示的重定向资源的访问。

#### 6.5.5 Proxy-Authenticate
> Proxy-Authenticate: Basic realm="Usahidesign Auth"  

会把由代理服务器所要求的认证信息发送给客户端。  
它与客户端和服务器之间的HTTP访问认证的行为相似，不同之处在于其认证行为是在客户端与代理之间进行的。
而客户端与服务器之间进行认证时，首部字段WWW-Authorization有着相同的作用。

#### 6.5.6 Retry-After
告知客户端应该在多久之后再次发送请求。主要配合状态码503 Service Unavailable响应，或3xx Redirect响应一起使用。  
字段值可以指定为具体的日期时间，也可以是创建响应后的秒数。

#### 6.5.7 Server 
告知客户端当前服务器上安装的HTTP服务器应用程序的信息。不单单会标出服务器上的软件应用名称，
还有可能包括版本号和安装时启用的可选项。
> Server: Apache/2.2.6 (Unix) PHP/5.2.5  

#### 6.5.8 Vary
可对缓存进行控制。源服务器会向代理服务器传达关于本地缓存使用方法的命令。  
当代理服务器就收到带有Vary首部字段指定获取资源的请求时，如果使用的Accept-Language
字段的值相同，那么就直接从缓存返回响应。反之，则需要先从源服务器端获取资源后才能作为响应。

#### 6.5.9 WWW-Authenticate
用于HTTP访问认证。它会告知客户端适用于访问请求URI所指定资源的认证方案和带参数提示的质询。  
状态码401 Unauthorized响应中，肯定带有首部字段WWW-Authenticate。


### 6.6 实体首部字段
实体首部字段是包含在请求报文和响应报文中的实体部分所使用的的首部，用于补充内容的更新时间等与实体相关的信息。  

#### 6.6.1 Allow
用于通知客户端能够支持Request-URI指定资源的所有HTTP方法。当服务器收到不支持HTTP方法时，
会以状态码405 Method Not Allow作为响应返回。与此同时，还会把所有能支持的HTTP方法写入首部字段Allow后返回。

#### 6.6.2 Content-Encoding
告知客户端服务器对实体的主体部分选用的内容编码方式。
主要采用以下4种编码方式。
* gzip
* compress
* deflate 
* identity

#### 6.6.3 Content-Language
告知客户端实体主体使用的自然语言。


#### 6.6.4 Content-Length
表明实体主体部分的大小(单位是字节)。对实体主体进行内容编码传输时，不能在使用Content-Length首部字段。

#### 6.6.5 Content-Location
给出报文主体部分相对应的的URI。

#### 6.6.6 Content-MD5
首部字段Content-MD5是一串由MD5算法生成的值，其目的在于检查报文主体在传输工程中
是否保持完整以及确认传输到达。  
对报文主体执行MD5算法获得的128位二进制数，再通过Base64编码后将结果写入Content-MD5是一串由MD5算法生成的值，其目的在于检查报文主体在传输工程中字段值。
接收方的客户端会对报文主体再执行一次相同的MD5算法，计算出的值与字段值作比较后，即可判断报文主体的准确性。  
这种方法对内容的偶发性改变是无从查证的，也无法检测出恶意篡改。

#### 6.6.7 Content-Range
> Content-Range: bytes 5001-10000/10000

针对范围内请求，返回响应时使用的首部字段Content-Range，能告知客户端作为响应返回的实体
的哪个部分符合范围请求。字段值以字节为单位，表示当前发送部分及整个实体大小。

#### 6.6.8 Content-Type
> Content-Type: text/html; charset=UTF-8
说明实体主体内对象的媒体类型。和首部字段Accept一样，字段值用type/subtype形式赋值。  
参数charset使用iso-8859-1或ecu-jp等字符集进行赋值。

#### 6.6.9 Expires
将资源失效的日期告知客户端。缓存服务器在接收到含有首部字段Expires的响应后，会以缓存来应答请求，
在Expires字段值指定的时间之前，响应的副本会一直被保存。当超过指定的时间后，缓存服务器在请求
发送过来时，会转向源服务器请求资源。  
源服务器不希望缓存服务器对资源缓存时，最好在Expires字段内写入与首部字段Date相同的时间值。  
但是，当首部字段Cache-Control有指定max-age指令时，比起首部字段Expires，会优先处理max-age指令。

#### 6.6.10 Last-Modified
指明资源最终修改的时间。一般来说，这个值就是Request-URI指定资源被修改的时间。
但类似使用CGI脚本进行动态数据处理时，该值可能会变成数据最终修改时的时间。


### 6.7 为Cookie服务的首部字段
管理服务器与客户端之间状态的Cookie，虽然没有被编入标准化HTTP/1.1的RFC2616中，但在Web
网站方面得到了广泛的应用。  
Cookie的工作机制是用户识别及状态管理。Web网站为了管理用户的状态会通过Web浏览器，把
一些数据临时写入用的的计算机内。接着当用户访问该Web网站时，可通过通信方式取回之前
发放的Cookie。  
调用Cookie时，由于可校验Cookie的有效期，以及发送方的域、路径、协议等信息，所以
正规发布的Cookie内的数据不会因来自其他Web站点和攻击者的攻击而泄露。

##### 为Cookie服务的首部字段 
> 首部字段名 说明 首部类型  
> Set-Cookie 开始状态管理所使用的的Cookie信息 响应首部字段  
> Cookie 服务器接收到的Cookie信息 请求首部信息  

#### 6.7.1 Set-Cookie
当服务器准备开始管理客户端的状态时，会事先告知各种信息。

##### Set-Cookie字段的属性
> 属性 说明 
> NAME=VALUE 赋予Cookie的名称和其值(必需项)
> expires=DATE Cookie的有效期(若不明确指定则默认为浏览器关闭前)
> path=PATH 将服务器上的文件目录作为Cookie的适用对象(若不指定则默认为文档所在的文件目录)
> domain=域名 作为Cookie适用对象的域名(若不指定则默认为创建Cookie的服务器的域名)
> Secure 仅在HTTPS安全通信时才会发送Cookie
> HttpOnly 加以限制，使Cookie不能被JavaScript脚本访问

##### expires属性
Cookie的expires属性指定浏览器可发送Cookie的有效期。
当省略expires属性时，其有效期仅限于维持浏览器回话(Session)时间段内。这通常限于浏览器
程序应用被关闭之前。
另外，一旦Cookie从服务端发送至客户端，服务器端就不存在可以显式删除Cookie的方法。
但可以通过覆盖已过期的Cookie，实现对客户端Cookie的实质性删除操作。

##### path属性
Cookie的属性可用于限制指定Cookie的发送范围的文件目录。不过另有办法可以避开这一限制。

##### domain属性
通过Cookie的domain属性指定的域名可做到结尾匹配一致。如指定example.com后，除example.com以外，
www.example.com或www2.example.com等都可以发送Cookie。

##### secure属性
Cookie的secure属性作用限制Web页面仅在HTTPS安全连接时，才可以发送Cookie。  
当省略secure属性时，不论HTTP还是HTTPS，都会对Cookie进行回收。
> Set-Cookie: name=value; secure

##### HttpOnly属性
时Cookie的扩展功能，它使JavaScript脚本无法获得Cookie。其目的为防止跨站脚本攻击
(Cross-site-scripting, XSS)对Cookie的信息窃取。
> Set-Cookie: name=value; HttpOnly

### 6.7.2 Cookie
Cookie: status=enable
告知服务器当客户端想获得HTTP状态管理支持时，就会在请求中包含服务器接收到的Cookie。
接收到多个Cookie时，同样可以以多个Cookie形式发送。


## 6.8 其他首部字段
HTTTP首部字段是可以自行扩展的。所以在Web服务器和浏览器的应用上，会出现各种非标准的首部字段。

### 6.8.1 X-Frame-Options
> X-Frame-Options: DENY
属于响应首部，用于控制网站内容在其他Web网站的Frame标签内的显式问题。
主要为了防止点击劫持(clickjacking)攻击。  
首部字段X-Frame-Options有以下两个可指定搞得字段值。
* DENY 拒绝
* SAMEORIGN：仅同源域名下的页面匹配是许可。

### 6.8.2 X-XSS-Protection
> X-XSS-Protection: 1
属于HTTP响应首部，它是针对跨站脚本攻击(XSS)的一种对策，用于控制浏览器XSS防护机制的开关。  
可指定的字段值如下。
* 0：将XSS过滤设置成无效状态
* 1：将XSS过滤设置为有效状态

### 6.8.3 DNT
> DNT：1  

属于HTTP请求首部，是Do Not Track的简称，意为拒绝个人信息被收集，
是表示拒绝被拒绝广告追踪的一种方法。  
可指定的字段值如下。  
* 0：同意被追踪
* 1：拒绝被追踪
由于首部字段DNT的功能具备有效性所以Web服务器需要对DNT做对应的支持。

### 6.8.4 P3P
属于HTTP响应首部，通过利用P3P(The Platform for Privacy Preferences, 在线隐私偏好平台)
技术，可以让Web网站上的个人隐私变成一种仅供程序可理解的形式，已达到保护用于隐私的目的。  
要进行P3P的设定，需要进过以下步骤。
> 步骤1：创建P3P隐私  
> 步骤2：创建P3P隐私对照文件后，保存命名在/w3c/p3p.xml  
> 步骤3：从P3P隐私中新建Compact policies后，输出到HTTP响应中  

