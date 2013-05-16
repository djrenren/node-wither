node-wither
===========

A feature-full decorator library for node.js


###handle(func, [type], handler)
type is optional and can be:
* Name of a precondition
* Error Type

Wrap functions with error handling logic.  
This allows you to separate the meat of your function
from your error handling.
```javascript
function getElement(array, index){
  return array[index];
}

getElement = wither.handle(getElement, TypeError, function(e, array, index){
  console.log("Caught: " + e.message);
});

getElement(undefined, 4); // Caught: Cannot read property '4' of undefined
```
As you can see, the original arguments are still accessible in the handler. In this example we've specified the kind of error we want to catch. This means that only TypeErrors will be caught with this function. Other errors will fall through.

###before(func, before)
```javascript
function doSomething(){
  console.log("Something!");
}

doSomething = wither.before(doSomething, function(){
  console.log(arguments.callee.name + " called with (" + Array.prototype.slice(arguments) + ")");
});

doSomething(1,2,'a'); //doSomething called with (1,2,'a')
                      //Something!
```

###after(func, after)
```javascript
function doSomething(){
  console.log("Something!");
}

doSomething = wither.after(doSomething, function(){
  console.log("DONE!");
});

doSomething(); // Something!
               // DONE!
```

###pre(func, [name], condition)
Throws an error if condition returns false.
This error can be caught with a handle
```javascript
function divide(a, b){
  return a/b;
}

divide = wither.pre(divide, 'not-zero', function(a, b){
  return a != 0;
});

divide = wither.handle(divide, 'not-zero', function(e, a, b){
  console.log("Everything is not shiny!")
});

divide(1/0); // Everything is not shiny!;
```

###post(func, [name], condition)
```javascript
function add(a, b) //always returns two
  return a + b;
}

add = wither.post(add, 'two', function(ret, args){
  return ret == 2;
}

add = wither.handle(add, 'two', function(a,b){
  console.log("Sum of " + a + " and " + b + " is not 2!");
});

add(1,2); // Sum of 1 and 2 is not 2!
```


