> 出自MDN

### Function.prototype.apply()

**apply** 方法在指定this值和参数（参数以数组或类数组独享的形式存在）的情况下调用某个函数。

> 注意：该函数的语法和call()方法的语法几乎一致，唯一的区别在于，call()方法接受的是一个参数列表，而apply()方法接受的是一个包含多个参数的数组（或类数组对象）。

#### 语法
```js
fun.apply(thisArg[, argArray])
```
#### 参数
**thisArg**  
在 fun 函数运行时指定的 this 值。需要注意的是，指定的 this 值并不一定是该函数执行时真正的 this 值，如果这个函数处于非严格模式下，则指定为 null 或 undefined 时会自动指向全局对象（浏览器中就是window对象），同时值为原始值（数字，字符串，布尔值）的 this 会指向该原始值的自动包装对象。  

**argsArray**    
一个数组或者类数组对象，其中的数组元素将作为单独的参数传给 fun 函数。如果该参数的值为null 或 undefined，则表示不需要传入任何参数。从ECMAScript 5 开始可以使用类数组对象。

---

### Function.prototype.call()
**call**方法在使用一个指定的this值和若干个指定的参数值的前提下调用某个函数或方法。

> 注意：该方法的作用和 apply() 方法类似，只有一个区别，就是call()方法接受的是若干个参数的列表，而apply()方法接受的是一个包含多个参数的数组。

#### 语法
```js
fun.call(thisArg[, arg1[, arg2[, ...]]])
```

#### 参数
**thisArg**  
在fun函数运行时指定的this值。需要注意的是，指定的this值并不一定是该函数执行时真正的this值，如果这个函数处于非严格模式下，则指定为null和undefined的this值会自动指向全局对象(浏览器中就是window对象)，同时值为原始值(数字，字符串，布尔值)的this会指向该原始值的自动包装对象。  

**arg1, arg2, ...**  
指定的参数列表。

#### 返回值
返回结果包括指定的this值和参数。

#### 描述
可以让call()中的对象调用当前对象所拥有的function。你可以使用call()来实现继承：写一个方法，然后让另外一个新的对象来继承它（而不是在新对象中再写一次这个方法）。  

---

### Function.prototype.bind()
**bind** 方法会创建一个新函数。当这个新函数被调用时，bind()的第一个参数将作为它运行时的 this, 之后的一序列参数将会在传递的实参前传入作为它的参数。

#### 语法
```js
fun.bind(thisArg[, arg1[, arg2[, ...]]])
```

#### 参数
**thisArg**  
当绑定函数被调用时，该参数会作为原函数运行时的 this 指向。当使用new 操作符调用绑定函数时，该参数无效。  

**arg1, arg2, ...**  
当绑定函数被调用时，这些参数将置于实参之前传递给被绑定的方法。  

#### 返回值
返回由指定的this值和初始化参数改造的原函数拷贝

#### 描述
**bind** 函数会创建一个新函数（称为绑定函数），新函数与被调函数（绑定函数的目标函数）具有相同的函数体（在 ECMAScript 5 规范中内置的call属性）。当目标函数被调用时 this 值绑定到 bind() 的第一个参数，该参数不能被重写。绑定函数被调用时，bind() 也接受预设的参数提供给原函数。一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。

#### Polyfill（兼容旧浏览器）
```js
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== 'function') {
			// cloest thing possble to the ECMAScript 5
			// internal IsCallable function 
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP
						? this
						: oThis || this,
					aArgs.concat(Array.prototype.slice.call(arguments))
				)
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBonud;
	}
}
```