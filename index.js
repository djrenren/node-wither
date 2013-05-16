"use strict";
var util = require('util');


function WitherError(name, err){
  Error.call(this, name);
  Error.captureStackTrace(this, this.constructor);
  this.name = name;
}
util.inherits(WitherError, Error);

var wither = module.exports = (function wither(func, opts){
  for(var key in opts){
    if(!(opts[key] instanceof Array))
      opts[key] = [opts[key]]
  }

  if('pre' in opts){
    func = wither.pre.apply(this, [func].concat(opts.pre));
  }

  if('post' in opts)
    func = wither.post.apply(this, [func].concat(opts.post));

  if('handle' in opts)
    func = wither.handle.apply(this, [func].concat(opts.handle));

  if('before' in opts)
    func = wither.before.apply(this, [func].concat(opts.before));    

  if('after' in opts)
    func = wither.after.apply(this, [func].concat(opts.after));

  return func;
});



function argsToArray(args){
  return Array.prototype.slice.call(arguments);
}


wither.handle = (function handler(func, err, handle){
  if(handle === undefined){
    handle = err;
    err = "_default";
  }

  if(func.hasOwnProperty("_witherHandles")){
    if(!func._witherHandles.hasOwnProperty(err))
      func._witherHandles[err] = [];
    func._witherHandles[err].push(handle);
    return func;
  }

  var out = function(){
    try {
      func.apply(this, arguments);
    } catch(e){
      var err = e.constructor;
      var args = argsToArray(arguments);
      args.unshift(e);
      if(err == WitherError){
        err = e.name;
      }
      if ( !out._witherHandles.hasOwnProperty(err) || out._witherHandles[err].length == 0)
        err = "_default";

      if(err == "_default" && out._witherHandles[err].length == 0)
        throw e;

      out._witherHandles[err].forEach(function(h){
        h.apply(this, args);
      });
    }
  }

  var handles = {
    _default: []
  };
  handles[err] = [handle]

  Object.defineProperty(out, "_witherHandles", {
    writable: false,
    enumberable: false,
    configurable: false,
    value: handles
  });

  return out;
});

wither.before = (function before(func, bef){
  return function(){
    bef.apply(this, arguments);
    func.apply(this, arguments);
  }
});

wither.after = (function after(func, fin){
  return wither.before(fin, func);
});

wither.post = (function post(func, name, post){
  if(name instanceof Function){
    cond = name;
    name = null;
  }

  return function(){
    var ret = func.apply(this, arguments);
    var args = argsToArray(arguments);

    if(!post.apply(this, ret, args))
      if(name == null)
        throw new Error("Validation Failed");
      else
        throw new WitherError(name);

    return ret;
  }
});

wither.pre = (function pre(func, name, cond){
  if(name instanceof Function){
    cond = name;
    name = null;
  }

  return function(){
    if(!cond.apply(this, arguments))
      if(name == null)
        throw new Error("Validation Failed");
      else
        throw new WitherError(name);
    func.apply(this, arguments);
  }
});