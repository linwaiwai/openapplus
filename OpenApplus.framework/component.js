(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function(root, factory){
 if (typeof define === 'function') {
    cordova.define("cordova-plugin-googlemaps.BaseArrayClass", function(require, exports, module) {
                module.exports = factory(require);
                });
 } else if (typeof exports === 'object') {
    module.exports = factory(require);
 } else {
    root.returnExports = factory();
 }
 })(this, function(require) {
   
var utils = require('./utils'),
  BaseClass = require('./BaseClass');

var ARRAY_FIELD = typeof Symbol === 'undefined' ? '__array' + Date.now() : Symbol('array');

var resolvedPromise = typeof Promise == 'undefined' ? null : Promise.resolve();
var nextTick = resolvedPromise ? function(fn) { resolvedPromise.then(fn); } : function(fn) { setTimeout(fn); };

function BaseArrayClass(array) {
  BaseClass.apply(this);
  var self = this;
  self[ARRAY_FIELD] = [];

  if (array && (array instanceof Array || Array.isArray(array))) {
    for (var i = 0; i < array.length; i++) {
      self[ARRAY_FIELD].push(array[i]);
    }
  }
}

utils.extend(BaseArrayClass, BaseClass);

BaseArrayClass.prototype.mapSeries = function(fn, callback) {
  if (typeof fn !== "function" || typeof callback !== "function") {
    return;
  }
  var self = this;

  var results = [];
  var _arrayLength = self[ARRAY_FIELD].length;
  if (_arrayLength === 0) {
    callback.call(self, []);
    return;
  }
  var _looper = function(currentIdx) {
    fn.call(self, self[ARRAY_FIELD][currentIdx], function(value) {
      results[currentIdx] = value;
      if (_arrayLength === results.length) {
        callback.call(self, results);
      } else {
        nextTick(function() {
          _looper(currentIdx + 1);
        });
      }
    });
  };
  nextTick(function() {
    _looper(0);
  });
};

BaseArrayClass.prototype.mapAsync = function(fn, callback) {
  if (typeof fn !== "function" || typeof callback !== "function") {
    return;
  }
  var self = this;
  //------------------------
  // example:
  //    baseArray.mapAsync(function(item, idx, callback) {
  //       ...
  //       callback(value);
  //    }, function(values) {
  //
  //    });
  //------------------------
  var results = [];
  for (var i = 0; i < self[ARRAY_FIELD].length; i++) {
    results.push(null);
  }
  var _arrayLength = self[ARRAY_FIELD].length;
  var finishCnt = 0;
  if (_arrayLength === 0) {
    callback.call(self, []);
    return;
  }
  for (i = 0; i < self[ARRAY_FIELD].length; i++) {
    (function(item, idx) {
      nextTick(function() {
        fn.call(self, item, function(value) {
          results[idx] = value;
          finishCnt++;
          if (finishCnt === _arrayLength) {
            callback.call(self, results);
          }
        });
      });
    })(self[ARRAY_FIELD][i], i);
  }
};

BaseArrayClass.prototype.map = function(fn, callback) {
  var self = this;

  if (typeof fn !== "function") {
    return;
  }
  var results = [];
  if (typeof fn === "function" && typeof callback !== "function") {
    //------------------------
    // example:
    //    var values = baseArray.map(function(item, idx) {
    //       ...
    //       return someValue;
    //    });
    //------------------------
    return self[ARRAY_FIELD].map(fn.bind(self));
  }
  self.mapAsync(fn, callback);
};

BaseArrayClass.prototype.forEachAsync = function(fn, callback) {
  if (typeof fn !== "function" || typeof callback !== "function") {
    return;
  }
  var self = this;
  //------------------------
  // example:
  //    baseArray.forEach(function(item, callback) {
  //       ...
  //       callback();
  //    }, function() {
  //
  //    });
  //------------------------
  var finishCnt = 0;
  var _arrayLength = self[ARRAY_FIELD].length;
  if (_arrayLength === 0) {
    callback.call(self);
    return;
  }

  for (var i = 0; i < self[ARRAY_FIELD].length; i++) {
    (function(item, idx) {
      fn.call(self, item, function() {
        finishCnt++;
        if (finishCnt === _arrayLength) {
          callback.call(self);
        }
      });
    })(self[ARRAY_FIELD][i], i);
  }
};

BaseArrayClass.prototype.forEach = function(fn, callback) {
  var self = this;
  if (typeof fn !== "function") {
    return;
  }

  if (typeof fn === "function" && typeof callback !== "function") {
    //------------------------
    // example:
    //    baseArray.forEach(function(item, idx) {
    //       ...
    //    });
    //------------------------
    self[ARRAY_FIELD].forEach(fn.bind(self));
    return;
  }
  self.forEachAsync(fn, callback);
};

BaseArrayClass.prototype.filterAsync = function(fn, callback) {
  var self = this;
  if (typeof fn !== "function" || typeof callback !== "function") {
    return;
  }
  //------------------------
  // example:
  //    baseArray.filter(function(item, callback) {
  //       ...
  //       callback(true or false);
  //    }, function(filteredItems) {
  //
  //    });
  //------------------------
  var finishCnt = 0;
  var _arrayLength = self[ARRAY_FIELD].length;
  if (_arrayLength === 0) {
    callback.call(self, []);
    return;
  }
  var results = [];
  for (var i = 0; i < self[ARRAY_FIELD].length; i++) {
    (function(item, idx) {
      fn.call(self, item, function(isOk) {
        if (isOk) {
          results.push(item);
        }
        finishCnt++;
        if (finishCnt === _arrayLength) {
          callback.call(self, results);
        }
      });
    })(self[ARRAY_FIELD][i], i);
  }
};

BaseArrayClass.prototype.filter = function(fn, callback) {
  var self = this;
  if (typeof fn !== "function") {
    return;
  }
  if (typeof fn === "function" && typeof callback !== "function") {
    //------------------------
    // example:
    //    baseArray.filter(function(item, idx) {
    //       ...
    //       return true or false
    //    });
    //------------------------
    return self[ARRAY_FIELD].filter(fn);
  }
  self.filterAsync(fn, callback);
};

BaseArrayClass.prototype.indexOf = function(item) {
  return this[ARRAY_FIELD].indexOf(item);
};

BaseArrayClass.prototype.empty = function(noNotify) {
  var self = this;
  var cnt = self[ARRAY_FIELD].length;
  for (var i = 0; i < cnt; i++) {
    self.removeAt(0, noNotify);
  }
};

BaseArrayClass.prototype.push = function(value, noNotify) {
  var self = this;
  self[ARRAY_FIELD].push(value);
  if (noNotify !== true) {
    self.trigger("insert_at", self[ARRAY_FIELD].length - 1);
  }
  return self[ARRAY_FIELD].length;
};

BaseArrayClass.prototype.insertAt = function(index, value, noNotify) {
  var self = this;
  if (index > self[ARRAY_FIELD].length) {
    for (var i = self[ARRAY_FIELD].length; i <= index; i++) {
      self[ARRAY_FIELD][i] = undefined;
    }
  }
  self[ARRAY_FIELD][index] = value;
  if (noNotify !== true) {
    self.trigger("insert_at", index);
  }
};

BaseArrayClass.prototype.getArray = function() {
  //return _array.slice(0);  <-- Android browser keeps the same instance of original array
  return JSON.parse(JSON.stringify(this[ARRAY_FIELD]));
};

BaseArrayClass.prototype.getAt = function(index) {
  return this[ARRAY_FIELD][index];
};

BaseArrayClass.prototype.setAt = function(index, value, noNotify) {
  var self = this;
  var prev = self[ARRAY_FIELD][index];
  self[ARRAY_FIELD][index] = value;
  if (noNotify !== true) {
    self.trigger("set_at", index, prev);
  }
};

BaseArrayClass.prototype.removeAt = function(index, noNotify) {
  var self = this;
  var value = self[ARRAY_FIELD][index];
  self[ARRAY_FIELD].splice(index, 1);
  if (noNotify !== true) {
    self.trigger("remove_at", index, value);
  }
  return value;
};

BaseArrayClass.prototype.pop = function(noNotify) {
  var self = this;
  var index = self[ARRAY_FIELD].length - 1;
  var value = self[ARRAY_FIELD].pop();
  if (noNotify !== true) {
    self.trigger("remove_at", index, value);
  }
  return value;
};

BaseArrayClass.prototype.getLength = function() {
  return this[ARRAY_FIELD].length;
};

BaseArrayClass.prototype.reverse = function() {
  this[ARRAY_FIELD] = this[ARRAY_FIELD].reverse();
};

BaseArrayClass.prototype.sort = function(func) {
  this[ARRAY_FIELD] = this.sort(func);
};


//module.exports = BaseArrayClass;
   return BaseArrayClass;
});

},{"./BaseClass":2,"./utils":32}],2:[function(require,module,exports){
 (function(root, factory){
  if (typeof define === 'function') {
  cordova.define("cordova-plugin-googlemaps.BaseClass", function(require, exports, module) {
                 module.exports = factory(require);
                 });
  } else if (typeof exports === 'object') {
  module.exports = factory(require);
  } else {
  root.returnExports = factory();
  }
  })(this, function(require) {
    
var VARS_FIELD = typeof Symbol === 'undefined' ? '__vars' + Date.now() : Symbol('vars');
var SUBSCRIPTIONS_FIELD = typeof Symbol === 'undefined' ? '__subs' + Date.now() : Symbol('subscriptions');

function BaseClass() {
  this[VARS_FIELD] = {};
  this[SUBSCRIPTIONS_FIELD] = {};
  this.errorHandler = this.errorHandler.bind(this);

  Object.defineProperty(this, 'hashCode', {
    value: Math.floor(Date.now() * Math.random())
  });
}

BaseClass.prototype = {
  empty: function () {
    var vars = this[VARS_FIELD];

    Object.keys(vars).forEach(function (name) {
      vars[name] = null;
      delete vars[name];
    });
  },

  get: function (key) {
    return this[VARS_FIELD].hasOwnProperty(key) ? this[VARS_FIELD][key] : undefined;
  },

  set: function (key, value, noNotify) {
    var prev = this.get(key);

    this[VARS_FIELD][key] = value;

    if (!noNotify && prev !== value) {
      this.trigger(key + '_changed', prev, value, key);
    }

    return this;
  },

  bindTo: function (key, target, targetKey, noNotify) {
    targetKey = targetKey || key;

    // If `noNotify` is true, prevent `(targetKey)_changed` event occurrs,
    // when bind the value for the first time only.
    // (Same behaviour as Google Maps JavaScript v3)
    target.set(targetKey, target.get(targetKey), noNotify);

    this.on(key + '_changed', function (oldValue, value) {
      target.set(targetKey, value);
    });
  },

  trigger: function (eventName) {
    if (!eventName) {
      return this;
    }

    if (!this[SUBSCRIPTIONS_FIELD][eventName]) {
      return this;
    }

    var listeners = this[SUBSCRIPTIONS_FIELD][eventName];
    var i = listeners.length;
    var args = Array.prototype.slice.call(arguments, 1);

    while (i--) {
      listeners[i].apply(this, args);
    }

    return this;
  },

  on: function (eventName, listener) {
    if (!listener || typeof listener !== "function") {
      throw Error('Listener for on()/addEventListener() method is not a function');
    }
    var topic;
    this[SUBSCRIPTIONS_FIELD][eventName] = this[SUBSCRIPTIONS_FIELD][eventName] || [];
    topic = this[SUBSCRIPTIONS_FIELD][eventName];
    topic.push(listener);
    return this;
  },

  off: function (eventName, listener) {
    if (!eventName && !listener) {
      this[SUBSCRIPTIONS_FIELD] = {};
      return this;
    }

    if (eventName && !listener) {
      this[SUBSCRIPTIONS_FIELD][eventName] = null;
    } else if (this[SUBSCRIPTIONS_FIELD][eventName]) {
      var index = this[SUBSCRIPTIONS_FIELD][eventName].indexOf(listener);

      if (index !== -1) {
        this[SUBSCRIPTIONS_FIELD][eventName].splice(index, 1);
      }
    }

    return this;
  },

  one: function (eventName, listener) {
    if (!listener || typeof listener !== "function") {
      throw Error('Listener for one()/addEventListenerOnce() method is not a function');
    }

    var self = this;

    var callback = function () {
      self.off(eventName, arguments.callee);
      listener.apply(self, arguments);
      callback = undefined;
    };
    this.on(eventName, callback);

    return this;
  },

  destroy: function () {
    this.off();
    this.empty();
  },

  errorHandler: function (error) {
    if (error) {
      if (typeof console.error === "function") {
        if (this.id) {
          console.error(this.id, error);
        } else {
          console.error(error);
        }
      } else {
        if (this.id) {
          console.log(this.id, error);
        } else {
          console.log(error);
        }
      }
      this.trigger('error', error instanceof Error ? error : createError(error));
    }

    return false;
  }
};

BaseClass.prototype.addEventListener = BaseClass.prototype.on;
BaseClass.prototype.addEventListenerOnce = BaseClass.prototype.one;
BaseClass.prototype.removeEventListener = BaseClass.prototype.off;

function createError(message, methodName, args) {
  var error = new Error(methodName ? [
    'Got error with message: "', message, '" ',
    'after calling "', methodName, '"'
  ].join('') : message);

  Object.defineProperties(error, {
    methodName: {
      value: methodName
    },
    args: {
      value: args
    }
  });

  return error;
}

//module.exports = BaseClass;
    return BaseClass;
});

},{}],3:[function(require,module,exports){
 (function(root, factory){
  if (typeof define === 'function') {
  cordova.define("cordova-plugin-googlemaps.CameraPosition", function(require, exports, module) {
                 module.exports = factory(require);
                 });
  } else if (typeof exports === 'object') {
  module.exports = factory(require);
  } else {
  root.returnExports = factory();
  }
  })(this, function(require) {

/********************************************************************************
 * @name CameraPosition
 * @class This class represents new camera position
 * @property {LatLng} target The location where you want to show
 * @property {Number} [tilt] View angle
 * @property {Number} [zoom] Zoom level
 * @property {Number} [bearing] Map orientation
 * @property {Number} [duration] The duration of animation
 *******************************************************************************/
var CameraPosition = function(params) {
    var self = this;
    self.zoom = params.zoom;
    self.tilt = params.tilt;
    self.target = params.target;
    self.bearing = params.bearing;
    self.hashCode = params.hashCode;
    self.duration = params.duration;
};

//module.exports = CameraPosition;
return CameraPosition;
});

},{}],4:[function(require,module,exports){
(function(root, factory){
 if (typeof define === 'function') {
 cordova.define("cordova-plugin-googlemaps.Circle", function(require, exports, module) {
                module.exports = factory(require);
                });
 } else if (typeof exports === 'object') {
 module.exports = factory(require);
 } else {
 root.returnExports = factory();
 }
 })(this, function(require) {

var argscheck = require('./argscheck'),
  utils = require('./utils'),
  common = require('./Common'),
  LatLngBounds = require('./LatLngBounds'),
  Overlay = require('./Overlay');

/*****************************************************************************
 * Circle Class
 *****************************************************************************/
var Circle = function (map, circleOptions, _exec) {
  Overlay.call(this, map, circleOptions, 'Circle', _exec);

  var self = this;

  //-----------------------------------------------
  // Sets event listeners
  //-----------------------------------------------
  self.on("center_changed", function () {
    var center = self.get("center");
    center.lat = parseFloat(center.lat, 10);
    center.lng = parseFloat(center.lng, 10);
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setCenter', [self.getId(), center.lat, center.lng]);
  });
  self.on("fillColor_changed", function () {
    var color = self.get("fillColor");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setFillColor', [self.getId(), common.HTMLColor2RGBA(color, 0.75)]);
  });
  self.on("strokeColor_changed", function () {
    var color = self.get("strokeColor");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setStrokeColor', [self.getId(), common.HTMLColor2RGBA(color, 0.75)]);
  });
  self.on("strokeWidth_changed", function () {
    var width = self.get("strokeWidth");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setStrokeWidth', [self.getId(), width]);
  });
  self.on("clickable_changed", function () {
    var clickable = self.get("clickable");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setClickable', [self.getId(), clickable]);
  });
  self.on("radius_changed", function () {
    var radius = self.get("radius");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setRadius', [self.getId(), radius]);
  });
  self.on("zIndex_changed", function () {
    var zIndex = self.get("zIndex");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setZIndex', [self.getId(), zIndex]);
  });
  self.on("visible_changed", function () {
    var visible = self.get("visible");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setVisible', [self.getId(), visible]);
  });

};

utils.extend(Circle, Overlay);

Circle.prototype.getCenter = function () {
  return this.get('center');
};
Circle.prototype.getRadius = function () {
  return this.get('radius');
};
Circle.prototype.getStrokeColor = function () {
  return this.get('strokeColor');
};
Circle.prototype.getStrokeWidth = function () {
  return this.get('strokeWidth');
};
Circle.prototype.getZIndex = function () {
  return this.get('zIndex');
};
Circle.prototype.getVisible = function () {
  return this.get('visible');
};
Circle.prototype.getClickable = function () {
  return this.get('clickable');
};
Circle.prototype.setCenter = function (center) {
  center.lat = parseFloat(center.lat, 10);
  center.lng = parseFloat(center.lng, 10);
  this.set('center', center);
  return this;
};
Circle.prototype.setFillColor = function (color) {
  this.set('fillColor', color);
  return this;
};
Circle.prototype.setStrokeColor = function (color) {
  this.set('strokeColor', color);
  return this;
};
Circle.prototype.setStrokeWidth = function (width) {
  this.set('strokeWidth', width);
  return this;
};
Circle.prototype.setVisible = function (visible) {
  visible = common.parseBoolean(visible);
  this.set('visible', visible);
  return this;
};
Circle.prototype.setClickable = function (clickable) {
  clickable = common.parseBoolean(clickable);
  this.set('clickable', clickable);
  return this;
};
Circle.prototype.setZIndex = function (zIndex) {
  this.set('zIndex', zIndex);
  return this;
};
Circle.prototype.setRadius = function (radius) {
  this.set('radius', radius);
  return this;
};

Circle.prototype.remove = function (callback) {
  var self = this;
  if (self._isRemoved) {
    if (typeof callback === "function") {
      return;
    } else {
      return Promise.resolve();
    }
    return;
  }
  Object.defineProperty(self, "_isRemoved", {
    value: true,
    writable: false
  });
  self.trigger(self.id + "_remove");

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      function() {
        self.destroy();
        resolve.call(self);
      },
      reject.bind(self),
      self.getPluginName(), 'remove', [self.getId()], {
        remove: true
      });
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }

};

Circle.prototype.getBounds = function () {
  var d2r = Math.PI / 180; // degrees to radians
  var r2d = 180 / Math.PI; // radians to degrees
  var earthsradius = 3963.189; // 3963 is the radius of the earth in miles
  var radius = this.get("radius");
  var center = this.get("center");
  radius *= 0.000621371192;

  // find the raidus in lat/lon
  var rlat = (radius / earthsradius) * r2d;
  var rlng = rlat / Math.cos(center.lat * d2r);

  var bounds = new LatLngBounds();
  var ex, ey;
  for (var i = 0; i < 360; i += 90) {
    ey = center.lng + (rlng * Math.cos(i * d2r)); // center a + radius x * cos(theta)
    ex = center.lat + (rlat * Math.sin(i * d2r)); // center b + radius y * sin(theta)
    bounds.extend({
      lat: ex,
      lng: ey
    });
  }
  return bounds;
};

return  Circle;

});

},{"./Common":6,"./LatLngBounds":12,"./Overlay":17,"./argscheck":23,"./utils":32}],5:[function(require,module,exports){
 (function(root, factory){
  if (typeof define === 'function') {
  cordova.define("cordova-plugin-googlemaps.Cluster", function(require, exports, module) {
                 module.exports = factory(require);
                 });
  } else if (typeof exports === 'object') {
  module.exports = factory(require);
  } else {
  root.returnExports = factory();
  }
  })(this, function(require) {

var argscheck = require('./argscheck'),
    utils = require('./utils'),
    common = require('./Common'),
    Marker = require('./Marker'),
    geomodel = require('./geomodel'),
    BaseClass = require('./BaseClass'),
    LatLngBounds = require('./LatLngBounds');

/*****************************************************************************
 * Cluster Class
 *****************************************************************************/
var Cluster = function(id, geocell) {
  var obj = {};

  var self = this;
  Object.defineProperty(self, "id", {
    value: id,
    writable: false
  });
  Object.defineProperty(self, "geocell", {
    value: geocell,
    writable: false
  });

  Object.defineProperty(self, "type", {
    value: "Cluster",
    writable: false
  });
  Object.defineProperty(self, "_markerOptsArray", {
    value: [],
    writable: false
  });


  Object.defineProperty(self, "set", {
    value: function(key, value) {
      obj[key] = value;
    },
    writable: false
  });

  Object.defineProperty(self, "get", {
    value: function(key) {
      return obj[key];
    },
    writable: false
  });
};

Cluster.prototype.NO_CLUSTER_MODE = 1;
Cluster.prototype.CLUSTER_MODE = 2;

Cluster.prototype.getPluginName = function() {
  return this.map.getId() + "-cluster";
};
Cluster.prototype.getBounds = function() {
  return this.get("bounds");
};
/*
Cluster.prototype.getBounds = function() {
  var bounds = this.get("bounds");
  if (!bounds) {
    bounds = geomodel.computeBox(this.geocell);
    this.set("bounds", bounds);
  }
  return bounds;
};
*/
Cluster.prototype.getCenter = function() {
  return this.getBounds().getCenter();
};

Cluster.prototype.getMarkers = function() {
  return this._markerOptsArray;
};

Cluster.prototype.addMarkers = function(markerRefs) {
  var self = this;
  var bounds = this.get("bounds") || new LatLngBounds(markerRefs[0].position, markerRefs[0].position);

  markerRefs.forEach(function(markerOpts) {
    if (self._markerOptsArray.indexOf(markerOpts) === -1) {
      markerOpts._cluster.isAdded = true;
      self._markerOptsArray.push(markerOpts);
      bounds.extend(markerOpts.position);
    }
  });

  this.set("bounds", bounds);
};
Cluster.prototype.getId = function() {
  return this.id;
};
Cluster.prototype.setMode = function(mode) {
  this.set("mode", mode);
};
Cluster.prototype.getMode = function() {
  return this.get("mode");
};
Cluster.prototype.removeMarker = function(markerOpts) {

  var idx = this._markerOptsArray.indexOf(markerOpts);
  if (idx !== -1) {
    this._markerOptsArray.splice(idx, 1);
  }
};

Cluster.prototype.remove = function() {
  this.set("isRemoved", true);
  this._markerOptsArray.forEach(function(markerOpts) {
    markerOpts._cluster.isAdded = false;
  });
};
Cluster.prototype.getItemLength = function() {
  return this._markerOptsArray.length;
};

return  Cluster;

});

},{"./BaseClass":2,"./Common":6,"./LatLngBounds":12,"./Marker":15,"./argscheck":23,"./geomodel":27,"./utils":32}],6:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.Common", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

var BaseArrayClass = require('./BaseArrayClass');
var utils = require("./utils");

var resolvedPromise = typeof Promise == 'undefined' ? null : Promise.resolve();
var nextTick = resolvedPromise ? function(fn) { resolvedPromise.then(fn); } : function(fn) { setTimeout(fn); };

//---------------------------
// Convert HTML color to RGB
//---------------------------
function isHTMLColorString(inputValue) {
    if (!inputValue || typeof inputValue !== "string") {
        return false;
    }
    if (inputValue.match(/^#[0-9A-F]{3}$/i) ||
        inputValue.match(/^#[0-9A-F]{4}$/i) ||
        inputValue.match(/^#[0-9A-F]{6}$/i) ||
        inputValue.match(/^#[0-9A-F]{8}$/i) ||
        inputValue.match(/^rgba?\([\d,.\s]+\)$/) ||
        inputValue.match(/^hsla?\([\d%,.\s]+\)$/)) {
        return true;
    }

    inputValue = inputValue.toLowerCase();
    return inputValue in HTML_COLORS;
}

function HTMLColor2RGBA(colorValue, defaultOpacity) {
    defaultOpacity = !defaultOpacity ? 1.0 : defaultOpacity;
    if (colorValue instanceof Array) {
        return colorValue;
    }
    if (colorValue === "transparent" || !colorValue) {
        return [0, 0, 0, 0];
    }
    var alpha = Math.floor(255 * defaultOpacity),
        matches,
        result = {
            r: 0,
            g: 0,
            b: 0
        };
    var colorStr = colorValue.toLowerCase();
    if (colorStr in HTML_COLORS) {
        colorStr = HTML_COLORS[colorStr];
    }
    if (colorStr.match(/^#([0-9A-F]){3}$/i)) {
        matches = colorStr.match(/([0-9A-F])/ig);

        return [
            parseInt(matches[0], 16),
            parseInt(matches[1], 16),
            parseInt(matches[2], 16),
            alpha
        ];
    }

    if (colorStr.match(/^#[0-9A-F]{4}$/i)) {
        alpha = colorStr.substr(4, 1);
        alpha = parseInt(alpha + alpha, 16);

        matches = colorStr.match(/([0-9A-F])/ig);
        return [
            parseInt(matches[0], 16),
            parseInt(matches[1], 16),
            parseInt(matches[2], 16),
            alpha
        ];
    }

    if (colorStr.match(/^#[0-9A-F]{6}$/i)) {
        matches = colorStr.match(/([0-9A-F]{2})/ig);
        return [
            parseInt(matches[0], 16),
            parseInt(matches[1], 16),
            parseInt(matches[2], 16),
            alpha
        ];
    }
    if (colorStr.match(/^#[0-9A-F]{8}$/i)) {
        matches = colorStr.match(/([0-9A-F]{2})/ig);

        return [
            parseInt(matches[0], 16),
            parseInt(matches[1], 16),
            parseInt(matches[2], 16),
            parseInt(matches[3], 16)
        ];
    }
    // convert rgb(), rgba()
    if (colorStr.match(/^rgba?\([\d,.\s]+\)$/)) {
        matches = colorStr.match(/([\d.]+)/g);
        alpha = matches.length == 4 ? Math.floor(parseFloat(matches[3]) * 256) : alpha;
        return [
            parseInt(matches[0], 10),
            parseInt(matches[1], 10),
            parseInt(matches[2], 10),
            alpha
        ];
    }


    // convert hsl(), hsla()
    if (colorStr.match(/^hsla?\([\d%,.\s]+\)$/)) {
        matches = colorStr.match(/([\d%.]+)/g);
        alpha = matches.length == 4 ? Math.floor(parseFloat(matches[3]) * 256) : alpha;
        var rgb = HLStoRGB(matches[0], matches[1], matches[2]);
        rgb.push(alpha);
        return rgb;
    }

    console.log("Warning: '" + colorValue + "' is not available. The overlay is drew by black.");
    return [0, 0, 0, alpha];
}

/**
 * http://d.hatena.ne.jp/ja9/20100907/1283840213
 */
function HLStoRGB(h, l, s) {
    var r, g, b; // 0..255

    while (h < 0) {
        h += 360;
    }
    h = h % 360;

    // In case of saturation = 0
    if (s === 0) {
        // RGB are the same as V
        l = Math.round(l * 255);
        return [l, l, l];
    }

    var m2 = (l < 0.5) ? l * (1 + s) : l + s - l * s,
        m1 = l * 2 - m2,
        tmp;

    tmp = h + 120;
    if (tmp > 360) {
        tmp = tmp - 360;
    }

    if (tmp < 60) {
        r = (m1 + (m2 - m1) * tmp / 60);
    } else if (tmp < 180) {
        r = m2;
    } else if (tmp < 240) {
        r = m1 + (m2 - m1) * (240 - tmp) / 60;
    } else {
        r = m1;
    }

    tmp = h;
    if (tmp < 60) {
        g = m1 + (m2 - m1) * tmp / 60;
    } else if (tmp < 180) {
        g = m2;
    } else if (tmp < 240) {
        g = m1 + (m2 - m1) * (240 - tmp) / 60;
    } else {
        g = m1;
    }

    tmp = h - 120;
    if (tmp < 0) {
        tmp = tmp + 360;
    }
    if (tmp < 60) {
        b = m1 + (m2 - m1) * tmp / 60;
    } else if (tmp < 180) {
        b = m2;
    } else if (tmp < 240) {
        b = m1 + (m2 - m1) * (240 - tmp) / 60;
    } else {
        b = m1;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function parseBoolean(boolValue) {
    return typeof(boolValue) === "string" && boolValue.toLowerCase() === "true" ||
        boolValue === true ||
        boolValue === 1;
}

function isDom(element) {
    return element &&
        element.nodeType === Node.ELEMENT_NODE &&
        element instanceof SVGElement === false &&
        typeof element.getBoundingClientRect === "function";
}

function getDivRect(div) {
    if (!div) {
        return;
    }
    var rect;
    if (div === document.body) {
      rect = div.getBoundingClientRect();
      rect.left = Math.max(rect.left, window.pageOffsetX);
      rect.top = Math.max(rect.top, window.pageOffsetY);
      rect.width = Math.max(rect.width, window.innerWidth);
      rect.height = Math.max(rect.height, window.innerHeight);
      rect.right = rect.left + rect.width;
      rect.bottom = rect.top + rect.height;
    } else {
      rect = div.getBoundingClientRect();
      if ("right" in rect === false) {
        rect.right = rect.left + rect.width;
      }
      if ("bottom" in rect === false) {
        rect.bottom = rect.top + rect.height;
      }
    }
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom
    };
}

var ignoreTags = [
  "pre", "textarea", "p", "form", "input", "caption", "canvas", "svg"
];


function shouldWatchByNative(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE || !node.parentNode || node instanceof SVGElement) {
    if (node === document.body) {
      return true;
    }
    return false;
  }

  var tagName = node.tagName.toLowerCase();
  if (ignoreTags.indexOf(tagName) > -1) {
    return false;
  }

  var classNames = (node.className || "").split(" ");
  if (classNames.indexOf("_gmaps_cdv_") > -1) {
    return true;
  }

  var visibilityCSS = getStyle(node, 'visibility');
  var displayCSS = getStyle(node, 'display');

  // Do not check this at here.
  //var pointerEventsCSS = getStyle(node, 'pointer-events');

  //-----------------------------------------
  // no longer check the opacity property,
  // because the app might start changing the opacity later.
  //-----------------------------------------
  //var opacityCSS = getStyle(node, 'opacity');
  //opacityCSS = /^[\d.]+$/.test(opacityCSS + "") ? opacityCSS : 1;

  //-----------------------------------------
  // no longer check the clickable size,
  // because HTML still can display larger element inside one small element.
  //-----------------------------------------
  // var clickableSize = (
  //   node.offsetHeight > 0 && node.offsetWidth > 0 ||
  //   node.clientHeight > 0 && node.clientWidth > 0);
  return displayCSS !== "none" &&
    visibilityCSS !== "hidden";
}


// Get z-index order
// http://stackoverflow.com/a/24136505
var internalCache = {};
function _clearInternalCache() {
  internalCache = undefined;
  internalCache = {};
}
function _removeCacheById(elemId) {
  delete internalCache[elemId];
}
function getZIndex(dom) {
    if (dom === document.body) {
      internalCache = undefined;
      internalCache = {};
    }
    if (!dom) {
      return 0;
    }

    var z = 0;
    if (window.getComputedStyle) {
      z = document.defaultView.getComputedStyle(dom, null).getPropertyValue('z-index');
    }
    if (dom.currentStyle) {
        z = dom.currentStyle['z-index'];
    }
    var elemId = dom.getAttribute("__pluginDomId");
    var parentNode = dom.parentNode;
    var parentZIndex = 0;
    if (parentNode && parentNode.nodeType === Node.ELEMENT_NODE) {
      var parentElemId = parentNode.getAttribute("__pluginDomId");
      if (parentElemId in internalCache) {
        parentZIndex = internalCache[parentElemId];
      } else {
        parentZIndex = getZIndex(dom.parentNode);
        internalCache[parentElemId] = parentZIndex;
      }
    }

    var isInherit = false;
    if (z === "unset" || z === "initial") {
      z = 0;
    } else if (z === "auto" || z === "inherit") {
      z = 0;
      isInherit = true;
    } else {
      z = parseInt(z);
    }
    //dom.setAttribute("__ZIndex", z);
    internalCache[elemId] = z + parentZIndex;
    return {
      isInherit: isInherit,
      z: z
    };
}

// Get CSS value of an element
// http://stackoverflow.com/a/1388022
function getStyle(element, styleProperty)
{
    if (window.getComputedStyle) {
        return document.defaultView.getComputedStyle(element,null).getPropertyValue(styleProperty);
    } else if (element.currentStyle) {
      return element.currentStyle[styleProperty];
    }
    return;
}

function getDomInfo(dom, idx) {
    return {
        size: getDivRect(dom),
        depth: getDomDepth(dom, idx)
    };
}

var HTML_COLORS = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgrey": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkslategrey": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dimgrey": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "grey": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred ": "#cd5c5c",
    "indigo  ": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgray": "#d3d3d3",
    "lightgrey": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightslategrey": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370db",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#db7093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "rebeccapurple": "#663399",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "slategrey": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
};

function defaultTrueOption(value) {
    return value === undefined ? true : value === true;
}

function createMvcArray(array) {
    if (!array) {
      return new BaseArrayClass();
    }
    if (array.type === "BaseArrayClass") {
      return array;
    }

    var mvcArray;
    if (array.type === "LatLngBounds") {
      array = [
          array.southwest,
          {lat: array.northeast.lat, lng: array.southwest.lng},
          array.northeast,
          {lat: array.southwest.lat, lng: array.northeast.lng},
          array.southwest
        ];
      array = array.map(getLatLng);
    }

    if (array && typeof array.getArray === "function") {
        mvcArray = new BaseArrayClass(array.getArray());
        array.on('set_at', function(index) {
            var value = array.getAt(index);
            value = "position" in value ? value.getPosition() : value;
            mvcArray.setAt(index, value);
        });
        array.on('insert_at', function(index) {
            var value = array.getAt(index);
            value = "position" in value ? value.getPosition() : value;
            mvcArray.insertAt(index, value);
        });
        array.on('remove_at', function(index) {
            mvcArray.removeAt(index);
        });

    } else {
        mvcArray = new BaseArrayClass(!!array ? array.slice(0) : undefined);
    }
    return mvcArray;
}

function getLatLng(target) {
  return "getPosition" in target ? target.getPosition() : {
    "lat": parseFloat(target.lat, 10),
    "lng": parseFloat(target.lng, 10)
  };
}
function convertToPositionArray(array) {
  array = array || [];

  if (!utils.isArray(array)) {
    if (array.type === "LatLngBounds") {
      array = [
        array.southwest,
        {lat: array.northeast.lat, lng: array.southwest.lng},
        array.northeast,
        {lat: array.southwest.lat, lng: array.northeast.lng},
        array.southwest
      ];
    } else if (array && typeof array.getArray === "function") {
      array = array.getArray();
    } else {
      array = [array];
    }
  }

  array = array.map(getLatLng);

  return array;
}

function markerOptionsFilter(markerOptions) {
  markerOptions = markerOptions || {};

  markerOptions.animation = markerOptions.animation || undefined;
  markerOptions.position = markerOptions.position || {};
  markerOptions.position.lat = markerOptions.position.lat || 0.0;
  markerOptions.position.lng = markerOptions.position.lng || 0.0;
  markerOptions.draggable = markerOptions.draggable === true;
  markerOptions.icon = markerOptions.icon || undefined;
  markerOptions.zIndex = markerOptions.zIndex || 0;
  markerOptions.snippet = typeof(markerOptions.snippet) === "string" ? markerOptions.snippet : undefined;
  markerOptions.title = typeof(markerOptions.title) === "string" ? markerOptions.title : undefined;
  markerOptions.visible = defaultTrueOption(markerOptions.visible);
  markerOptions.flat = markerOptions.flat === true;
  markerOptions.rotation = markerOptions.rotation || 0;
  markerOptions.opacity = markerOptions.opacity === 0 ? 0 : (parseFloat("" + markerOptions.opacity, 10) || 1);
  markerOptions.disableAutoPan = markerOptions.disableAutoPan === true;
  markerOptions.noCache = markerOptions.noCache === true; //experimental
  if (typeof markerOptions.icon === "object") {
    if ("anchor" in markerOptions.icon &&
      !Array.isArray(markerOptions.icon.anchor) &&
      "x" in markerOptions.icon.anchor &&
      "y" in markerOptions.icon.anchor) {
      markerOptions.icon.anchor = [markerOptions.icon.anchor.x, markerOptions.icon.anchor.y];
    }
  }

  if ("infoWindowAnchor" in markerOptions &&
    !Array.isArray(markerOptions.infoWindowAnchor) &&
    "x" in markerOptions.infoWindowAnchor &&
    "y" in markerOptions.infoWindowAnchor) {
    markerOptions.infoWindowAnchor = [markerOptions.infoWindowAnchor.x, markerOptions.infoWindowAnchor.anchor.y];
  }

  if ("style" in markerOptions && !("styles" in markerOptions)) {
    markerOptions.styles = markerOptions.style;
    delete markerOptions.style;
  }
  if ("styles" in markerOptions) {
      markerOptions.styles = typeof markerOptions.styles === "object" ? markerOptions.styles : {};

      if ("color" in markerOptions.styles) {
          markerOptions.styles.color = HTMLColor2RGBA(markerOptions.styles.color || "#000000");
      }
  }
  if (markerOptions.icon && isHTMLColorString(markerOptions.icon)) {
      markerOptions.icon = HTMLColor2RGBA(markerOptions.icon);
  }
  if (markerOptions.icon && markerOptions.icon.label &&
    isHTMLColorString(markerOptions.icon.label.color)) {
      markerOptions.icon.label.color = HTMLColor2RGBA(markerOptions.icon.label.color);
  }
  return markerOptions;
}

function quickfilter(domPositions, mapElemIDs) {
  //console.log("before", JSON.parse(JSON.stringify(domPositions)));
  var keys = Object.keys(domPositions);

  var tree = {};
  mapElemIDs.forEach(function(mapElemId) {
    var size = domPositions[mapElemId].size;
    var mapRect = {
      left: size.left,
      top: size.top,
      right: size.left + size.width,
      bottom: size.top + size.height
    };

    tree[mapElemId] = domPositions[mapElemId];

    keys.forEach(function(elemId) {
      if (domPositions[elemId].ignore) {
        return;
      }
      var domSize = {
        left: domPositions[elemId].size.left,
        top: domPositions[elemId].size.top,
        right: domPositions[elemId].size.left + domPositions[elemId].size.width,
        bottom: domPositions[elemId].size.bottom + domPositions[elemId].size.height
      };
      if (
          (domSize.left >= mapRect.left && domSize.left <= mapRect.right) ||
          (domSize.right >= mapRect.left && domSize.right <= mapRect.right) ||
          (domSize.top >= mapRect.top && domSize.top <= mapRect.bottom) ||
          (domSize.bottom >= mapRect.top && domSize.bottom <= mapRect.bottom)
        ) {
        tree[elemId] = domPositions[elemId];
      }
    });
  });

  //console.log("after", JSON.parse(JSON.stringify(tree)));
  return tree;
}

function getPluginDomId(element) {
  // Generates a __pluginDomId
  if (!element || !shouldWatchByNative(element)) {
    return;
  }
  var elemId = element.getAttribute("__pluginDomId");
  if (!elemId) {
    if (element === document.body) {
      elemId = "root";
    } else {
      elemId = "pgm" + Math.floor(Math.random() * Date.now());
    }
    element.setAttribute("__pluginDomId", elemId);
  }
  return elemId;
}

// Add hashCode() method
// https://stackoverflow.com/a/7616484/697856
function hashCode(text) {
  var hash = 0, i, chr;
  if (text.length === 0) return hash;
  for (i = 0; i < text.length; i++) {
    chr   = text.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function createEvent(eventName, properties) {
  var evt;
  if (typeof CustomEvent === 'function') {
    evt = new CustomEvent(eventName, {
      bubbles: true,
      detail: properties || null
    });
  } else {
    evt = document.createEvent('Event');
    evt.initEvent(eventName, true, false);
    Object.keys(properties).forEach(function(key) {
      if (!(key in properties)) {
        evt[key] = properties[key];
      }
    });
  }
  return evt;
}

return  {
    _clearInternalCache: _clearInternalCache,
    _removeCacheById: _removeCacheById,
    getZIndex: getZIndex,
    getDivRect: getDivRect,
    getDomInfo: getDomInfo,
    isDom: isDom,
    parseBoolean: parseBoolean,
    HLStoRGB: HLStoRGB,
    HTMLColor2RGBA: HTMLColor2RGBA,
    isHTMLColorString: isHTMLColorString,
    defaultTrueOption: defaultTrueOption,
    createMvcArray: createMvcArray,
    getStyle: getStyle,
    convertToPositionArray: convertToPositionArray,
    getLatLng: getLatLng,
    shouldWatchByNative: shouldWatchByNative,
    markerOptionsFilter: markerOptionsFilter,
    quickfilter: quickfilter,
    nextTick: nextTick,
    getPluginDomId: getPluginDomId,
    hashCode: hashCode,
    createEvent: createEvent
};

//if (cordova && cordova.platformId === "browser") {
//  require('cordova/exec/proxy').add('common', module.exports);
//}

});

},{"./BaseArrayClass":1,"./utils":32}],7:[function(require,module,exports){
 (function(root, factory){
  if (typeof define === 'function') {
  cordova.define("cordova-plugin-googlemaps.GroundOverlay", function(require, exports, module) {
                 module.exports = factory(require);
                 });
  } else if (typeof exports === 'object') {
  module.exports = factory(require);
  } else {
  root.returnExports = factory();
  }
  })(this, function(require) {

var argscheck = require('./argscheck'),
  utils = require('./utils'),
  common = require('./Common'),
  Overlay = require('./Overlay');

/*****************************************************************************
 * GroundOverlay Class
 *****************************************************************************/
var GroundOverlay = function (map, groundOverlayOptions, _exec) {
  Overlay.call(this, map, groundOverlayOptions, 'GroundOverlay', _exec);

  var self = this;
  groundOverlayOptions.visible = groundOverlayOptions.visible === undefined ? true : groundOverlayOptions.visible;
  groundOverlayOptions.zIndex = groundOverlayOptions.zIndex || 1;
  groundOverlayOptions.opacity = groundOverlayOptions.opacity || 1;
  groundOverlayOptions.bounds = groundOverlayOptions.bounds || [];
  groundOverlayOptions.anchor = groundOverlayOptions.anchor || [0, 0];
  groundOverlayOptions.bearing = groundOverlayOptions.bearing || 0;

  //-----------------------------------------------
  // Sets event listeners
  //-----------------------------------------------
  self.on("visible_changed", function () {
    var visible = self.get("visible");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setVisible', [self.getId(), visible]);
  });
  self.on("image_changed", function () {
    var image = self.get("image");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setImage', [self.getId(), image]);
  });
  self.on("bounds_changed", function () {
    var bounds = self.get("bounds");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setBounds', [self.getId(), bounds]);
  });
  self.on("opacity_changed", function () {
    var opacity = self.get("opacity");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setOpacity', [self.getId(), opacity]);
  });
  self.on("clickable_changed", function () {
    var clickable = self.get("clickable");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setClickable', [self.getId(), clickable]);
  });
  self.on("bearing_changed", function () {
    var bearing = self.get("bearing");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setBearing', [self.getId(), bearing]);
  });
  self.on("zIndex_changed", function () {
    var zIndex = self.get("zIndex");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setZIndex', [self.getId(), zIndex]);
  });

};

utils.extend(GroundOverlay, Overlay);

GroundOverlay.prototype.setVisible = function (visible) {
  this.set('visible', visible);
};

GroundOverlay.prototype.getVisible = function () {
  return this.get('visible');
};

GroundOverlay.prototype.setImage = function (url) {
  this.set('image', url);
};

GroundOverlay.prototype.setBounds = function (points) {
  var i,
    bounds = [];
  for (i = 0; i < points.length; i++) {
    bounds.push({
      "lat": parseFloat(points[i].lat, 10),
      "lng": parseFloat(points[i].lng, 10)
    });
  }
  this.set('bounds', bounds);
};

GroundOverlay.prototype.getOpacity = function () {
  return this.get("opacity");
};

GroundOverlay.prototype.getBearing = function () {
  return this.get("bearing");
};

GroundOverlay.prototype.setOpacity = function (opacity) {
  if (!opacity && opacity !== 0) {
    console.log('opacity value must be int or double');
    return false;
  }
  this.set('opacity', opacity);
};
GroundOverlay.prototype.setBearing = function (bearing) {
  if (bearing > 360) {
    bearing = bearing - Math.floor(bearing / 360) * 360;
  }
  this.set('bearing', bearing);
};

GroundOverlay.prototype.getZIndex = function () {
  return this.get("zIndex");
};

GroundOverlay.prototype.setZIndex = function (zIndex) {
  this.set('zIndex', zIndex);
};
GroundOverlay.prototype.setClickable = function (clickable) {
  clickable = common.parseBoolean(clickable);
  this.set('clickable', clickable);
  return this;
};
GroundOverlay.prototype.getClickable = function () {
  return this.get('clickable');
};

GroundOverlay.prototype.remove = function (callback) {
  var self = this;
  if (self._isRemoved) {
    if (typeof callback === "function") {
      return;
    } else {
      return Promise.resolve();
    }
  }
  Object.defineProperty(self, "_isRemoved", {
    value: true,
    writable: false
  });
  self.trigger(self.id + "_remove");

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      function() {
        self.destroy();
        resolve.call(self);
      },
      reject.bind(self),
      self.getPluginName(), 'remove', [self.getId()], {
        remove: true
      });
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }

};

return GroundOverlay;

});

},{"./Common":6,"./Overlay":17,"./argscheck":23,"./utils":32}],8:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.HtmlInfoWindow", function(require, exports, module) {
            module.exports = factory(require);
            });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

 var utils = require('./utils'),
  event = require('./event'),
  common = require('./Common'),
  BaseClass = require('./BaseClass');

/*****************************************************************************
 * HTMLInfoWindow Class
 *****************************************************************************/
var HTMLInfoWindow = function () {
  var self = this;
  BaseClass.apply(self);
  var callbackTable = {};
  var listenerMgr = {
    one: function (target, eventName, callback) {
      callbackTable[target.hashCode] = callbackTable[target.hashCode] || {};
      callbackTable[target.hashCode][eventName] = callbackTable[target.hashCode][eventName] || [];
      callbackTable[target.hashCode][eventName].push(callback);
      target.one.call(target, eventName, callback);
    },
    on: function (target, eventName, callback) {
      callbackTable[target.hashCode] = callbackTable[target.hashCode] || {};
      callbackTable[target.hashCode][eventName] = callbackTable[target.hashCode][eventName] || [];
      callbackTable[target.hashCode][eventName].push(callback);
      target.on.call(target, eventName, callback);
    },
    bindTo: function (srcObj, srcField, dstObj, dstField, noNotify) {
      var eventName = srcField + "_changed";
      dstField = dstField || srcField;
      var callback = function (oldValue, newValue) {
        dstObj.set(dstField, newValue, noNotify);
      };
      callbackTable[dstObj.hashCode] = callbackTable[dstObj.hashCode] || {};
      callbackTable[dstObj.hashCode][eventName] = callbackTable[dstObj.hashCode][eventName] || [];
      callbackTable[dstObj.hashCode][eventName].push(callback);
      srcObj.on.call(srcObj, eventName, callback);
    },
    off: function (target, eventName) {
      if (!target || !eventName ||
        !(target.hashCode in callbackTable) ||
        !(eventName in callbackTable[target.hashCode])) {
        return;
      }
      callbackTable[target.hashCode][eventName].forEach(function (listener) {
        target.off.call(target, eventName, listener);
      });
      delete callbackTable[target.hashCode][eventName];
    }
  };

  Object.defineProperty(self, "_hook", {
    value: listenerMgr,
    writable: false
  });

  var frame = document.createElement("div");
  frame.style.overflow = "visible";
  frame.style.position = "absolute";
  frame.style.display = "inline-block";
  frame.classList.add('pgm-html-info-frame');
  self.set("frame", frame);

  var anchorDiv = document.createElement("div");
  anchorDiv.setAttribute("class", "pgm-anchor");
  anchorDiv.style.overflow = "visible";
  anchorDiv.style.position = "absolute";
  anchorDiv.style["z-index"] = 0;
  anchorDiv.style.width = "0 !important";
  anchorDiv.style.height = "0 !important";
  //anchorDiv.style.border = "1px solid green";
  //anchorDiv.style.backgroundColor = "rgba(125, 125, 255, 0.5)";

  anchorDiv.style.transition = "transform 0s ease";
  anchorDiv.style['will-change'] = "transform";

  anchorDiv.style['-webkit-backface-visibility'] = 'hidden';
  anchorDiv.style['-webkit-perspective'] = 1000;
  anchorDiv.style['-webkit-transition'] = "-webkit-transform 0s ease";

  anchorDiv.appendChild(frame);
  self.set("anchor", anchorDiv);

  var contentBox = document.createElement("div");
  contentBox.style.display = "inline-block";
  contentBox.style.padding = "5px";
  contentBox.classList.add('pgm-html-info-content-box');

  var contentFrame = document.createElement("div");
  contentFrame.style.display = "block";
  contentFrame.style.position = "relative";
  contentFrame.style.backgroundColor = "white";
  contentFrame.style.border = "1px solid rgb(204, 204, 204)";
  contentFrame.style.left = "0px";
  contentFrame.style.right = "0px";
  contentFrame.style.zIndex = "1"; // In order to set higher depth than the map div certainly
  contentFrame.classList.add('pgm-html-info-content-frame');
  frame.appendChild(contentFrame);
  contentFrame.appendChild(contentBox);

  var tailFrame = document.createElement("div");
  tailFrame.style.position = "relative";
  tailFrame.style.top = "-1px";
  tailFrame.style.zIndex = 100;
  tailFrame.classList.add('pgm-html-info-tail-frame');
  frame.appendChild(tailFrame);

  var tailLeft = document.createElement("div");
  /*
  tailLeft.style.position = "absolute";
  tailLeft.style.marginLeft = "-15px";
  tailLeft.style.left = "50%";
  tailLeft.style.top = "0px";
  tailLeft.style.height = "15px";
  tailLeft.style.width = "16px";
  tailLeft.style.overflow = "hidden";
  tailLeft.style.borderWidth = "0px";
  */
  tailLeft.classList.add('pgm-html-info-tail-left');

  tailLeft.style.position = "absolute";
  tailLeft.style.left = "50%";
  tailLeft.style.height = "0px";
  tailLeft.style.width = "0px";
  tailLeft.style.marginLeft = "-15px";
  tailLeft.style.borderWidth = "15px 15px 0px";
  tailLeft.style.borderColor = "rgb(204, 204, 204) transparent transparent";
  tailLeft.style.borderStyle = "solid";
  tailFrame.appendChild(tailLeft);

  /*
  var tailLeftCover = document.createElement("div");
  tailLeftCover.style.position = "absolute";
  tailLeftCover.style.backgroundColor = "white";
  tailLeftCover.style.transform = "skewX(45deg)";
  tailLeftCover.style.transformOrigin = "0px 0px 0px";
  tailLeftCover.style.left = "0px";
  tailLeftCover.style.height = "15px";
  tailLeftCover.style.width = "15px";
  tailLeftCover.style.top = "0px";
  tailLeftCover.style.zIndex = 1;
  tailLeftCover.style.borderLeft = "1px solid rgb(204, 204, 204)";
  tailLeft.classList.add('pgm-html-info-tail-left-cover');
  tailLeft.appendChild(tailLeftCover);
  */

  var tailRight = document.createElement("div");
  /*
  tailRight.style.position = "absolute";
  tailRight.style.left = "50%";
  tailRight.style.top = "0px";
  tailRight.style.height = "15px";
  tailRight.style.width = "16px";
  tailRight.style.overflow = "hidden";
  tailRight.style.borderWidth = "0px";
  */
  tailRight.style.position = "absolute";
  tailRight.style.left = "50%";
  tailRight.style.height = "0px";
  tailRight.style.width = "0px";
  tailRight.style.marginLeft = "-14px";
  tailRight.style.borderTopWidth = "14px";
  tailRight.style.borderLeftWidth = "14px";
  tailRight.style.borderRightWidth = "14px";
  tailRight.style.borderColor = "rgb(255, 255, 255) transparent transparent";
  tailRight.style.borderStyle = "solid";
  tailRight.classList.add('pgm-html-info-tail-right');
  tailFrame.appendChild(tailRight);
  /*
      var tailRightCover = document.createElement("div");
      tailRightCover.style.position = "absolute";
      tailRightCover.style.backgroundColor = "white";
      tailRightCover.style.transform = "skewX(-45deg)";
      tailRightCover.style.transformOrigin = "0px 0px 0px";
      tailRightCover.style.left = "0px";
      tailRightCover.style.height = "15px";
      tailRightCover.style.width = "15px";
      tailRightCover.style.top = "0px";
      tailRightCover.style.zIndex = 2;
      tailRightCover.style.borderRight = "1px solid rgb(204, 204, 204)";
      tailRightCover.classList.add('pgm-html-info-tail-right-cover');
      tailRight.appendChild(tailRightCover);
  */
  var eraseBorder = document.createElement("div");
  eraseBorder.style.position = "absolute";
  eraseBorder.style.zIndex = 3;
  eraseBorder.style.backgroundColor = "white";
  eraseBorder.style.width = "27px";
  eraseBorder.style.height = "2px";
  eraseBorder.style.top = "-1px";
  eraseBorder.style.left = "50%";
  eraseBorder.style.marginLeft = "-13px";
  eraseBorder.classList.add('pgm-html-info-tail-erase-border');
  tailFrame.appendChild(eraseBorder);

  var calculate = function (marker) {

    //var marker = self.get("marker");
    var map = marker.getMap();

    var div = map.getDiv();

    var frame = self.get("frame");
    var contentFrame = frame.firstChild;
    var contentBox = contentFrame.firstChild;
    contentBox.style.minHeight = "50px";
    contentBox.style.width = "auto";

    var content = self.get("content");
    if (typeof content === "string") {
      contentBox.style.whiteSpace = "pre-wrap";
      contentBox.innerHTML = content;
    } else {
      if (!content) {
        contentBox.innerText = "";
      } else if (content.nodeType === 1) {
        contentBox.innerHTML = "";
        contentBox.appendChild(content);
      } else {
        contentBox.innerText = content;
      }
    }

    var cssOptions = self.get("cssOptions");
    if (cssOptions && typeof cssOptions === "object") {
      var keys = Object.keys(cssOptions);
      keys.forEach(function (key) {
        contentBox.style.setProperty(key, cssOptions[key]);
      });
    }
    // Insert the contents to this HTMLInfoWindow
    if (!anchorDiv.parentNode) {
      map._layers.info.appendChild(anchorDiv);
    }

    // Adjust the HTMLInfoWindow size
    var contentsWidth = contentBox.offsetWidth + 10; // padding 5px x 2
    var contentsHeight = contentBox.offsetHeight;
    self.set("contentsHeight", contentsHeight);
    contentFrame.style.width = contentsWidth + "px";
    contentFrame.style.height = contentsHeight + "px";
    frame.style.width = contentsWidth + "px";
    frame.style.height = (contentsHeight + 15) + "px";

    if (contentBox.offsetWidth > div.offsetWidth * 0.9) {
      contentBox.style.width = (div.offsetWidth * 0.9) + "px";
    }
    self.set("contentsWidth", contentsWidth);

    var infoOffset = {
      x: 31,
      y: 31
    };
    var iconSize = {
      width: 62,
      height: 110
    };

    // If there is no specification with `anchor` property,
    // the values {x: 0.5, y: 1} are specified by native APIs.
    // For the case, anchor values are {x: 0} in JS.
    var anchor = {
      x: 15,
      y: 15
    };

    var icon = marker.get("icon");

    if (typeof icon === "object") {
      if (typeof icon.url === "string" && icon.url.indexOf("data:image/") === 0) {
        var img = document.createElement("img");
        img.src = icon.url;
        iconSize.width = img.width;
        iconSize.height = img.height;
      }
      if (typeof icon.size === "object") {
        iconSize.width = icon.size.width;
        iconSize.height = icon.size.height;
      }

      if (Array.isArray(icon.anchor)) {
        anchor.x = icon.anchor[0];
        anchor.y = icon.anchor[1];
      }
    }

    var infoWindowAnchor = marker.get("infoWindowAnchor");
    if (utils.isArray(infoWindowAnchor)) {
      infoOffset.x = infoWindowAnchor[0];
      infoOffset.y = infoWindowAnchor[1];
    }
    infoOffset.x = infoOffset.x / iconSize.width;
    infoOffset.x = infoOffset.x > 1 ? 1 : infoOffset.x;
    infoOffset.x = infoOffset.x < 0 ? 0 : infoOffset.x;
    infoOffset.y = infoOffset.y / iconSize.height;
    infoOffset.y = infoOffset.y > 1 ? 1 : infoOffset.y;
    infoOffset.y = infoOffset.y < 0 ? 0 : infoOffset.y;
    infoOffset.y *= iconSize.height;
    infoOffset.x *= iconSize.width;

    anchor.x = anchor.x / iconSize.width;
    anchor.x = anchor.x > 1 ? 1 : anchor.x;
    anchor.x = anchor.x < 0 ? 0 : anchor.x;
    anchor.y = anchor.y / iconSize.height;
    anchor.y = anchor.y > 1 ? 1 : anchor.y;
    anchor.y = anchor.y < 0 ? 0 : anchor.y;
    anchor.y *= iconSize.height;
    anchor.x *= iconSize.width;

    //console.log("contentsSize = " + contentsWidth + ", " + contentsHeight);
    //console.log("iconSize = " + iconSize.width + ", " + iconSize.height);
    //console.log("infoOffset = " + infoOffset.x + ", " + infoOffset.y);

    var frameBorder = parseInt(common.getStyle(contentFrame, "border-left-width").replace(/[^\d]/g, ""), 10);
    //var offsetX = (contentsWidth + frameBorder + anchor.x ) * 0.5 + (iconSize.width / 2  - infoOffset.x);
    //var offsetY = contentsHeight + anchor.y - (frameBorder * 2) - infoOffset.y + 15;
    var offsetX = -(iconSize.width / 2) - (cordova.platformId === "android" ? 1 : 0);
    var offsetY = -iconSize.height - (cordova.platformId === "android" ? 1 : 0);
    anchorDiv.style.width = iconSize.width + "px";
    anchorDiv.style.height = iconSize.height + "px";

    self.set("offsetX", offsetX);
    self.set("offsetY", offsetY);

    frame.style.bottom = (iconSize.height - infoOffset.y) + "px";
    frame.style.left = ((-contentsWidth) / 2 + infoOffset.x) + "px";

    //console.log("frameLeft = " + frame.style.left );
    var point = map.get("infoPosition");
    anchorDiv.style.visibility = "hidden";
    var x = point.x + self.get("offsetX");
    var y = point.y + self.get("offsetY");
    anchorDiv.style['-webkit-transform'] = "translate3d(" + x + "px, " + y + "px, 0px)";
    anchorDiv.style.transform = "translate3d(" + x + "px, " + y + "px, 0px)";
    anchorDiv.style.visibility = "visible";
    self.trigger("infoPosition_changed", "", point);
    self.trigger(event.INFO_OPEN);
  };

  self._hook.on(self, "infoPosition_changed", function (ignore, point) {
    if (!point) return;
    var x = point.x + self.get("offsetX");
    var y = point.y + self.get("offsetY");
    anchorDiv.style['-webkit-transform'] = "translate3d(" + x + "px, " + y + "px, 0px)";
    anchorDiv.style.transform = "translate3d(" + x + "px, " + y + "px, 0px)";
  });

  self._hook.on(self, "infoWindowAnchor_changed", calculate);

  self.set("isInfoWindowVisible", false);

};

utils.extend(HTMLInfoWindow, BaseClass);

HTMLInfoWindow.prototype.isInfoWindowShown = function () {
  return this.get("isInfoWindowVisible") === true;
};

HTMLInfoWindow.prototype.close = function () {
  var self = this;

  var marker = self.get("marker");
  if (marker) {
    self._hook.off(marker, "isInfoWindowVisible_changed");
  }
  if (!self.isInfoWindowShown() || !marker) {
    return;
  }
  self.set("isInfoWindowVisible", false);
  marker.set("isInfoWindowVisible", false);
  marker.set("infoWindow", undefined);
  this.set('marker', undefined);

  var map = marker.getMap();
  self._hook.off(marker.getMap(), "map_clear");
  self._hook.off(marker, "infoPosition_changed");
  self._hook.off(marker, "icon_changed");
  //self._hook.off(self, "infoWindowAnchor_changed");
  self._hook.off(marker, event.INFO_CLOSE); //This event listener is assigned in the open method. So detach it.
  self.trigger(event.INFO_CLOSE);
  map.set("active_marker", null);

  //var div = map.getDiv();
  var anchorDiv = self.get("anchor");
  if (anchorDiv && anchorDiv.parentNode) {
    anchorDiv.parentNode.removeChild(anchorDiv);

    // Remove the contents from this HTMLInfoWindow
    var contentFrame = anchorDiv.firstChild.firstChild;
    var contentBox = contentFrame.firstChild;
    contentBox.innerHTML = "";
  }
};

HTMLInfoWindow.prototype.setContent = function (content, cssOptions) {
  var self = this;
  var prevContent = self.get("content");
  self.set("content", content);
  self.set("cssOptions", cssOptions);
  var marker = self.get("marker");
  if (content !== prevContent && marker && marker.isInfoWindowShown()) {
    var anchorDiv = self.get("anchor");
    if (anchorDiv) {
      anchorDiv.style.width = "0 !important";
      anchorDiv.style.height = "0 !important";
      if (anchorDiv.parentNode) {
        anchorDiv.parentNode.removeChild(anchorDiv);

        // Remove the contents from this HTMLInfoWindow
        var contentFrame = anchorDiv.firstChild.firstChild;
        var contentBox = contentFrame.firstChild;
        contentBox.innerHTML = "";
      }
    }
    self.trigger("infoWindowAnchor_changed", marker);
  }
};

HTMLInfoWindow.prototype.open = function (marker) {
  if (!marker) {
    return;
  }
  if (marker._objectInstance) {
    // marker is an instance of the ionic-native wrapper plugin.
    marker = marker._objectInstance;
  }

  var map = marker.getMap();
  var self = this,
    markerId = marker.getId();

  marker.set("infoWindow", self);
  marker.set("isInfoWindowVisible", true);
  self._hook.on(marker, "icon_changed", function () {
    self.trigger.call(self, "infoWindowAnchor_changed", marker);
  });
  self.set("isInfoWindowVisible", true);
  self._hook.on(marker, "isInfoWindowVisible_changed", function (prevValue, newValue) {
    if (newValue === false) {
      self.close.call(self);
    }
  });

  map.fromLatLngToPoint(marker.getPosition(), function (point) {
    map.set("infoPosition", {
      x: point[0],
      y: point[1]
    });

    self._hook.bindTo(map, "infoPosition", self);
    self._hook.bindTo(marker, "infoWindowAnchor", self);
    self._hook.bindTo(marker, "icon", self);
    self._hook.one(marker.getMap(), "map_clear", self.close.bind(self));
    self._hook.one(marker, event.INFO_CLOSE, self.close.bind(self));
    self.set("marker", marker);
    map.set("active_marker", marker);
    self.trigger.call(self, "infoWindowAnchor_changed", marker);
  });
};

HTMLInfoWindow.prototype.setBackgroundColor = function (backgroundColor) {
  this.get("frame").children[0].style.backgroundColor = backgroundColor;
  this.get("frame").children[1].children[0].style.borderColor = backgroundColor + " rgba(0,0,0,0) rgba(0,0,0,0)";
  this.get("frame").children[1].children[1].style.borderColor = backgroundColor + " rgba(0,0,0,0) rgba(0,0,0,0)";
  this.get("frame").children[1].children[2].style.backgroundColor = backgroundColor;
};

return HTMLInfoWindow;

});

},{"./BaseClass":2,"./Common":6,"./event":25,"./utils":32}],9:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.KmlLoader", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

var argscheck = require('./argscheck'),
    utils = require('./utils'),
    common = require('./Common'),
    event = require('./event'),
    BaseClass = require('./BaseClass'),
    BaseArrayClass = require('./BaseArrayClass'),
    LatLngBounds = require('./LatLngBounds'),
    VisibleRegion = require('./VisibleRegion');

/*****************************************************************************
 * KmlLoader Class
 *****************************************************************************/
var KmlLoader = function(map, exec, options) {
  BaseClass.apply(this);

  var self = this;
  //self.set("visible", KmlLoaderOptions.visible === undefined ? true : KmlLoaderOptions.visible);
  //self.set("zIndex", KmlLoaderOptions.zIndex || 0);
  Object.defineProperty(self, "_overlays", {
      value: new BaseArrayClass(),
      writable: false
  });
  Object.defineProperty(self, "_isReady", {
      value: true,
      writable: false
  });
  Object.defineProperty(self, "type", {
      value: "KmlLoader",
      writable: false
  });
  Object.defineProperty(self, "map", {
      value: map,
      writable: false
  });
  Object.defineProperty(self, "exec", {
      value: exec,
      writable: false
  });
  Object.defineProperty(self, "options", {
      value: options,
      writable: false
  });
  Object.defineProperty(self, "kmlUrl", {
      value: options.url,
      writable: false
  });
  Object.defineProperty(self, "camera", {
      value: {
        target: []
      },
      writable: false
  });
};

utils.extend(KmlLoader, BaseClass);

KmlLoader.prototype.parseKmlFile = function(callback) {
  var self = this;

  self.exec.call(self.map, function(kmlData) {
    var rawKmlData = JSON.parse(JSON.stringify(kmlData));
    Object.defineProperty(self, "kmlStyles", {
      value: kmlData.styles,
      writable: false
    });
    Object.defineProperty(self, "kmlSchemas", {
      value: kmlData.schemas,
      writable: false
    });

    var placeMarks = new BaseArrayClass(kmlData.root.children);
    placeMarks.mapAsync(function(placeMark, cb) {
      self.kmlTagProcess.call(self, {
        child: placeMark,
        attrHolder: {},
        styles: {
          children: []
        }
      }, cb);
    }, function(placeMarkOverlays) {
      placeMarkOverlays = placeMarkOverlays.filter(function(overlay) {
        return !!overlay;
      });
      var result = placeMarkOverlays.shift();
      //result.set('kmlData', rawKmlData);
      callback.call(self, self.camera, result);
    });
  }, self.map.errorHandler, self.map.id, 'loadPlugin', ['KmlOverlay', {
    url: self.options.url
  }], {sync: true});
};

KmlLoader.prototype.kmlTagProcess = function(params, callback) {
  var self = this;

  if (params.child.styleIDs) {
    //---------------------------
    // Read styles if specified
    //---------------------------
    var styleIDs = new BaseArrayClass(params.child.styleIDs);
    styleIDs.mapAsync(function(styleId, cb) {
      self.getStyleById.call(self, styleId, cb);
    }, function(styleSets) {

      //-----------------------------------
      // Merge styles with parent styles,
      //-----------------------------------
      var merged = {};
      styleSets.unshift(params.styles);
      styleSets.forEach(function(styleSet) {
        styleSet.children.forEach(function(style) {
          merged[style.tagName] = merged[style.tagName] || {};
          style.children.forEach(function(styleEle) {
            merged[style.tagName][styleEle.tagName] = styleEle;
          });
        });
      });

      params.styles = {};
      var keys = Object.keys(merged);
      params.styles.children = keys.map(function(tagName) {
        var properties = Object.keys(merged[tagName]);
        var children = properties.map(function(propName) {
          return merged[tagName][propName];
        });
        return {
          tagName: tagName,
          children: children
        };
      });
      //------------------------
      // then process the tag.
      //------------------------
      self.parseKmlTag.call(self, params, callback);

    });
  } else {
    //-------------------------------------------------
    // No styleID is specified, just process the tag
    //-------------------------------------------------
    self.parseKmlTag.call(self, params, callback);
  }
};

KmlLoader.prototype.getObjectById = function(requestId, targetProp, callback) {
  var self = this;

  if (!requestId) {
    return callback.call(self, {children: []});
  }
  var results = {};
  var i, result, child;
  if (requestId.indexOf("http://") === 0 ||
    requestId.indexOf("https://") === 0 ||
    requestId.indexOf(".kml") !== -1) {

    if (requestId.indexOf("://") === -1) {
      requestId = self.kmlUrl.replace(/\/[^\/]+$/, "/") + requestId;
    }
    //---------------------------
    // Load additional kml file
    //---------------------------
    var requestUrl = requestId.replace(/\#.*$/, "");
    var requestIdentify = requestId.replace(/^.*?\#/, "");

    if (requestUrl in self[targetProp]) {
      self[targetProp][requestUrl] = self[targetProp][requestUrl] || {};
      results = self[targetProp][requestUrl][requestIdentify] || {
        children: []
      };
      for (i = 0; i < results.children.length; i++) {
        child = results.children[i];
        if (child.tagName === "pair" && child.key === "normal") {
          return self.getObjectById.call(self, child.styleIDs[0], targetProp, callback);
        }
      }
      callback.call(self, results);
      return;
    }

    var loader = new KmlLoader(self.map, self.exec, {
      url: requestUrl
    });
    loader.parseKmlFile(function(camera, anotherKmlData) {
      var extendProps = [
        {src: "styles", dst: "kmlStyles"},
        {src: "schemas", dst: "kmlSchemas"}
      ];
      extendProps.forEach(function(property) {
        var properties = anotherKmlData.get("kmlData")[property.src];
        self[property.dst][requestUrl] = {};

        var keys = Object.keys(properties);
        keys.forEach(function(key) {
          self[property.dst][requestUrl][key] = properties[key];
        });
      });

      self[targetProp][requestUrl] = self[targetProp][requestUrl] || {};
      results = self[targetProp][requestUrl][requestIdentify] || {
        children: []
      };
      for (i = 0; i < results.children.length; i++) {
        child = results.children[i];
        if (child.tagName === "pair" && child.key === "normal") {
          return self.getObjectById.call(self, child.styleIDs[0], targetProp, callback);
        }
      }
      return callback.call(self, results);
    });
    return;
  }

  requestId = requestId.replace("#", "");
  if (requestId in self[targetProp] === false) {
    callback.call(self, {children: []});
    return;
  }
  results = self[targetProp][requestId];

  results.children.filter(function(style) {
    if (style.tagName !== "pair") {
      return true;
    }
    for (var j = 0; j < style.children.length; j++) {
      if (style.children[j].tagName === "key" &&
        style.children[j].value === "highlight") {
        return false;
      }
    }
    return true;
  });

  var containPairTag = false;
  for (i = 0; i < results.children.length; i++) {
    if (results.children[i].tagName === "pair") {
      containPairTag = true;
      break;
    }
  }
  if (!containPairTag) {
    callback.call(self, results);
    return;
  }

  //---------------------------------------------------------
  // should contain 'tagName = "key", value="normal"' only
  //---------------------------------------------------------
  self.getObjectById.call(self, results.children[0].styleIDs[0], targetProp, function(resultSets) {
    if (resultSets.children) {
      results = resultSets;
    } else {
      results.children = resultSets;
    }
    callback.call(self, results);
  });

};

KmlLoader.prototype.getStyleById = function(requestId, callback) {
  this.getObjectById.call(this, requestId, "kmlStyles", callback);
};

KmlLoader.prototype.getSchemaById = function(requestId, callback) {
  this.getObjectById.call(this, requestId, "kmlSchemas", callback);
};

KmlLoader.prototype.parseKmlTag = function(params, callback) {
  var self = this;
  switch (params.child.tagName) {
    case "kml":
    case "folder":
    case "placemark":
    case "document":
    case "multigeometry":
      self.parseContainerTag.call(self, {
        placeMark: params.child,
        styles: params.styles,
        attrHolder: JSON.parse(JSON.stringify(params.attrHolder))
      }, callback);
      break;

    case "photooverlay":
    case "point":
      self.parsePointTag.call(self, {
        child: params.child,
        placeMark: params.placeMark,
        styles: params.styles,
        attrHolder: params.attrHolder
      }, callback);
      break;
    case "polygon":
      self.parsePolygonTag.call(self, {
        child: params.child,
        placeMark: params.placeMark,
        styles: params.styles,
        attrHolder: params.attrHolder
      }, callback);
      break;
    case "linestring":
      self.parseLineStringTag.call(self, {
        child: params.child,
        placeMark: params.placeMark,
        styles: params.styles,
        attrHolder: params.attrHolder
      }, callback);
      break;

    case "groundoverlay":
      self.parseGroundOverlayTag.call(self, {
        child: params.child,
        placeMark: params.placeMark,
        styles: params.styles,
        attrHolder: params.attrHolder
      }, callback);
      break;
    case "networklink":
      self.parseNetworkLinkTag.call(self, {
        child: params.child,
        placeMark: params.placeMark,
        styles: params.styles,
        attrHolder: params.attrHolder
      }, callback);
      break;

    case "lookat":
      self.parseLookAtTag.call(self, {
        child: params.child,
      }, callback);
      break;

    case "extendeddata":
      self.parseExtendedDataTag.call(self, {
        child: params.child,
        placeMark: params.placeMark,
        styles: params.styles,
        attrHolder: params.attrHolder
      }, callback);
      break;
    default:
      params.attrHolder[params.child.tagName] = params.child;
      callback();
  }
};

KmlLoader.prototype.parseExtendedDataTag = function(params, callback) {
  var self = this;
  params.attrHolder.extendeddata = {};
  params.child.children.forEach(function(child) {
    switch(child.tagName) {
      case "data":
        child.children.forEach(function(data) {
          var dataName = child.name.toLowerCase();
          switch(data.tagName) {
            case "displayname":
              params.attrHolder.extendeddata[dataName + "/displayname"] = data.value;
              break;
            case "value":
              params.attrHolder.extendeddata[dataName] = data.value;
              break;
            default:
              break;
          }
        });
        break;
      case "schemadata":
        self.getSchemaById(child.schemaUrl, function(schemas) {
          var schemaUrl = schemas.name;
          schemas.children.forEach(function(simplefield) {
            if (simplefield.tagName !== "simplefield") {
              return;
            }
            if ("children" in simplefield) {
              simplefield.children.forEach(function(valueTag) {
                var schemaPath = schemaUrl + "/" + simplefield.name + "/" + valueTag.tagName;
                schemaPath = schemaPath.toLowerCase();
                params.attrHolder.extendeddata[schemaPath] = valueTag.value;
              });
            } else {
              var schemaPath = schemaUrl + "/" + simplefield.name;
              schemaPath = schemaPath.toLowerCase();
              params.attrHolder.extendeddata[schemaPath] = simplefield.value;
            }
          });
          child.children.forEach(function(simpledata) {
            var schemaPath = schemaUrl + "/" + simpledata.name;
            schemaPath = schemaPath.toLowerCase();
            params.attrHolder.extendeddata[schemaPath] = simpledata.value;
          });
        });
        break;

      default:

        child.children.forEach(function(data) {
          params.attrHolder.extendeddata[child.tagName] = child;
        });
        break;
    }
  });
  callback();
};

KmlLoader.prototype.parseContainerTag = function(params, callback) {
  var self = this;

  var keys = Object.keys(params.placeMark);
  keys = keys.filter(function(key) {
    return key !== "children";
  });

  //--------------------------------------------------------
  // Generate overlays or load another files...etc
  //--------------------------------------------------------
  var children = new BaseArrayClass(params.placeMark.children);
  children.mapAsync(function(child, cb) {

    //-------------------------
    // Copy parent information
    //-------------------------
    keys.forEach(function(key) {
      if (key in child === false) {
        child[key] = params.placeMark[key];
      }
    });
    //-------------------------
    // read a child element
    //-------------------------
    self.kmlTagProcess.call(self, {
      child: child,
      placeMark: params.placeMark,
      styles: params.styles,
      attrHolder: params.attrHolder
    }, cb);
  }, function(overlays) {
    overlays = overlays.filter(function(overlay) {
      return !!overlay;
    });
    var attrNames = Object.keys(params.attrHolder);
    if (overlays.length === 0) {
      overlays.push(new BaseClass());
    }

    if (params.placeMark.tagName === "placemark") {
      // attrNames.forEach(function(name) {
      //   switch(name) {
      //     case "extendeddata":
      //       overlays[0].set(name, params.attrHolder[name]);
      //       break;
      //     case "snippet":
      //       overlays[0].set("_snippet", params.attrHolder[name].value);
      //       break;
      //     default:
      //       overlays[0].set(name, params.attrHolder[name].value);
      //       break;
      //   }
      // });

      callback.call(self, overlays[0]);
    } else {
      var container = new BaseArrayClass(overlays);
      Object.defineProperty(container, "tagName", {
          value: params.placeMark.tagName,
          writable: false
      });
      attrNames.forEach(function(name) {
        switch(name) {
          case "extendeddata":
            container.set(name, params.attrHolder[name]);
            break;
          default:
            container.set(name, params.attrHolder[name].value);
            break;
        }
      });
      callback.call(self, container);
    }
  });
};

KmlLoader.prototype.parsePointTag = function(params, callback) {
  var self = this;
//console.log("parsePointTag", params);

  //--------------
  // add a marker
  //--------------
  var markerOptions = {};
  params.styles.children.forEach(function(child) {
    switch (child.tagName) {
      case "balloonstyle":
        child.children.forEach(function(style) {
          switch (style.tagName) {
            case "text":
              markerOptions.description = {
                value: style.value
              };
              break;
          }
        });
        break;
      case "iconstyle":
        child.children.forEach(function(style) {
          switch (style.tagName) {
            case "hotspot":
              markerOptions.icon = markerOptions.icon || {};
              markerOptions.icon.hotspot = style;
              break;
            case "heading":
              markerOptions.icon = markerOptions.icon || {};
              markerOptions.icon.rotation = style;
              break;
            case "icon":
              markerOptions.icon = markerOptions.icon || {};
              markerOptions.icon.url = style.children[0].value;
              break;
          }
        });
        break;
      default:

    }
  });

  if (params.child.children) {
    var options = new BaseClass();
    params.child.children.forEach(function(child) {
      options.set(child.tagName, child);
    });
    params.child.children.forEach(function(child) {
      switch (child.tagName) {
        case "point":
          var coordinates = findTag(child.children, "coordinates", "coordinates");
          if (coordinates) {
            markerOptions.position = coordinates[0];
          }
          break;
        case "coordinates":
          markerOptions.position = child.coordinates[0];
          break;
        // case "description":
        //   if (markerOptions.description) {
        //     markerOptions.description = templateRenderer(markerOptions.description, options);
        //   }
        //   markerOptions.description = templateRenderer(markerOptions.description, options);
        //   break;
        // case "snippet":
        //   if (markerOptions.snippet) {
        //     markerOptions.snippet = templateRenderer(markerOptions.snippet, options);
        //   }
        //   markerOptions.snippet = templateRenderer(markerOptions.snippet, options);
        //   break;
        default:

      }
    });
  }
  markerOptions.position = markerOptions.position || {
    lat: 0,
    lng: 0
  };

  self.camera.target.push(markerOptions.position);

  var ignoreProperties = ["coordinates", "styleIDs", "children"];
  (Object.keys(params.attrHolder)).forEach(function(pName) {
    if (ignoreProperties.indexOf(pName) === -1 &&
      pName in markerOptions === false) {
      markerOptions[pName] = params.attrHolder[pName];
    }
  });

//console.log(markerOptions);
  self.map.addMarker(markerOptions, callback);
};

function findTag(children, tagName, fieldName) {
  for (var i = 0; i < children.length; i++) {
    if (children[i].tagName === tagName) {
      return children[i][fieldName];
    }
  }
}
KmlLoader.prototype.parsePolygonTag = function(params, callback) {
  var self = this;

//  console.log('polygonPlacemark', params);
  //--------------
  // add a polygon
  //--------------
  var polygonOptions = {
    fill: true,
    outline: true,
    holes: [],
    strokeWidth: 1,
    clickable: true
  };
  params.child.children.forEach(function(element) {
    var coordinates;
    switch (element.tagName) {
      case "outerboundaryis":
        if (element.children.length === 1) {
          switch(element.children[0].tagName) {
            case "linearring":
              coordinates = element.children[0].children[0].coordinates;
              break;
            case "coordinates":
              coordinates = findTag(element.children, "coordinates", "coordinates");
              break;
          }
          coordinates.forEach(function(latLng) {
            self.camera.target.push(latLng);
          });
          polygonOptions.points = coordinates;
        }
        break;
      case "innerboundaryis":
        switch(element.children[0].tagName) {
          case "linearring":
            coordinates = element.children[0].children[0].coordinates;
            break;
          case "coordinates":
            coordinates = element.children[0].coordinates;
            break;
        }
        polygonOptions.holes.push(coordinates);
        break;
    }
  });

  params.styles.children.forEach(function(style) {
    var keys;
    switch (style.tagName) {
      case "polystyle":
        style.children.forEach(function(node) {
          switch(node.tagName) {
            case "color":
              polygonOptions.fillColor = kmlColorToRGBA(node.value);
              break;
            case "fill":
              polygonOptions.fill = node.value === "1";
              break;
            case "outline":
              polygonOptions.outline = node.value === "1";
              break;
          }
        });
        break;


      case "linestyle":
        style.children.forEach(function(node) {
          switch(node.tagName) {
            case "color":
              polygonOptions.strokeColor = kmlColorToRGBA(node.value);
              break;
            case "width":
              polygonOptions.strokeWidth = parseFloat(node.value);
              break;
          }
        });
        break;
    }
  });

  if (polygonOptions.fill === false) {
    polygonOptions.fillColor = [0, 0, 0, 0];
  } else {
    polygonOptions.fillColor = polygonOptions.fillColor || [255, 255, 255, 255];
  }
  if (polygonOptions.outline === false) {
    delete polygonOptions.strokeColor;
    polygonOptions.strokeWidth = 0;
  } else {
    polygonOptions.strokeColor = polygonOptions.strokeColor || [255, 255, 255, 255];
  }


  var ignoreProperties = ["coordinates", "styleIDs", "children"];
  (Object.keys(params.attrHolder)).forEach(function(pName) {
    if (ignoreProperties.indexOf(pName) === -1 &&
      pName in polygonOptions === false) {
      polygonOptions[pName] = params.attrHolder[pName];
    }
  });

//  console.log('polygonOptions', polygonOptions);
  self.map.addPolygon(polygonOptions, callback);

};

KmlLoader.prototype.parseLineStringTag = function(params, callback) {
  //console.log(JSON.parse(JSON.stringify(params)));
  var self = this;
  //--------------
  // add a polyline
  //--------------
  var polylineOptions = {
    points: [],
    clickable: true
  };
  if (params.child.children) {
    params.child.children.forEach(function(child) {
      if (child.tagName === "coordinates") {
        child.coordinates.forEach(function(latLng) {
          self.camera.target.push(latLng);
          polylineOptions.points.push(latLng);
        });
      }
    });
  }

  params.styles.children.forEach(function(style) {
    switch (style.tagName) {
      case "linestyle":
      case "polystyle":
        style.children.forEach(function(node) {
          switch(node.tagName) {
            case "color":
              polylineOptions.color = kmlColorToRGBA(node.value);
              break;
            case "width":
              polylineOptions.width = parseFloat(node.value);
              break;
          }
        });
        break;
      default:

    }
  });

  var ignoreProperties = ["coordinates", "styleIDs", "children"];
  (Object.keys(params.attrHolder)).forEach(function(pName) {
    if (ignoreProperties.indexOf(pName) === -1 &&
      pName in polylineOptions === false) {
      polylineOptions[pName] = params.attrHolder[pName];
    }
  });


  //console.log('polylinePlacemark', polylineOptions);

  self.map.addPolyline(polylineOptions, callback);

};

KmlLoader.prototype.parseGroundOverlayTag = function(params, callback) {
  var self = this;
//  console.log('parseGroundOverlayTag', params);

  //--------------
  // add a ground overlay
  //--------------
  var groundoveralyOptions = {
    url: null,
    bounds: [],
    clickable: true
  };

  params.child.children.forEach(function(child) {
    switch (child.tagName) {
      case "color":
        groundoveralyOptions.opacity = ((kmlColorToRGBA(child.value)).pop() / 256);
        break;
      case "icon":
        child.children.forEach(function(iconAttrNode) {
          switch (iconAttrNode.tagName) {
            case "href":
              groundoveralyOptions.url = iconAttrNode.value;
              if (groundoveralyOptions.url && groundoveralyOptions.url.indexOf("://") === -1) {
                var requestUrl = self.kmlUrl.replace(/\?.*$/, "");
                requestUrl = requestUrl.replace(/\#.*$/, "");
                requestUrl = requestUrl.replace(/[^\/]*$/, "");
                groundoveralyOptions.url = requestUrl + groundoveralyOptions.url;
              }
              break;
          }
        });
        break;
      case "latlonbox":
        var box = {};
        child.children.forEach(function(latlonboxAttrNode) {
          box[latlonboxAttrNode.tagName] = parseFloat(latlonboxAttrNode.value);
        });
        if (box.rotation) {
          groundoveralyOptions.bearing = box.rotation;
        }
        var ne = {lat: box.north, lng: box.east};
        var sw = {lat: box.south, lng: box.west};
        groundoveralyOptions.bounds.push(ne);
        groundoveralyOptions.bounds.push(sw);
        self.camera.target.push(ne);
        self.camera.target.push(sw);
        break;
      // case "gx:latlonquad":
      //   groundoveralyOptions.bounds = child.children[0].coordinates;
      //   Array.prototype.push.apply(self.camera.target, child.children[0].coordinates);
      //   break;
      default:
    }
  });
  //delete params.child.children;
//  console.log("groundoveralyOptions", groundoveralyOptions);

  var ignoreProperties = ["coordinates", "styleIDs", "children"];
  (Object.keys(params.attrHolder)).forEach(function(pName) {
    if (ignoreProperties.indexOf(pName) === -1 &&
      pName in groundoveralyOptions === false) {
      groundoveralyOptions[pName] = params.attrHolder[pName];
    }
  });

  self.map.addGroundOverlay(groundoveralyOptions, callback);
};

KmlLoader.prototype.parseNetworkLinkTag = function(params, callback) {
  var self = this;
  var networkLinkOptions = {};
  //console.log('parseNetworkLinkTag', params);

  var attrNames = Object.keys(params.attrHolder);
  attrNames.forEach(function(attrName) {
    switch(attrName.toLowerCase()) {
      case "region":
        networkLinkOptions.region = networkLinkOptions.region || {};
        params.attrHolder[attrName].children.forEach(function(gChild) {
          switch(gChild.tagName) {
            case "latlonaltbox":
              var box = {};
              gChild.children.forEach(function(latlonboxAttrNode) {
                box[latlonboxAttrNode.tagName] = parseFloat(latlonboxAttrNode.value);
              });
              networkLinkOptions.region.bounds = {
                se: {lat: box.south, lng: box.east},
                sw: {lat: box.south, lng: box.west},
                ne: {lat: box.north, lng: box.east},
                nw: {lat: box.north, lng: box.west}
              };
              break;
            case "lod":
              networkLinkOptions.region.lod = networkLinkOptions.region.lod || {};
              networkLinkOptions.region.lod.minlodpixels = networkLinkOptions.region.lod.minlodpixels || -1;
              networkLinkOptions.region.lod.maxlodpixels = networkLinkOptions.region.lod.maxlodpixels || -1;
              gChild.children.forEach(function(lodEle) {
                networkLinkOptions.region.lod[lodEle.tagName] = parseInt(lodEle.value);
              });
              break;
          }
        });
        break;

      default:
        networkLinkOptions[attrName] = params.attrHolder[attrName];
    }
  });

  params.child.children.forEach(function(child) {
    switch(child.tagName) {
      case "visibility":
        networkLinkOptions.visibility = child.value === "1";
        break;
      case "link":
        networkLinkOptions.link = networkLinkOptions.link || {};
        child.children.forEach(function(gChild) {
          networkLinkOptions.link[gChild.tagName] = gChild.value;
        });
        break;
      case "region":
        networkLinkOptions.region = networkLinkOptions.region || {};
        child.children.forEach(function(gChild) {
          switch(gChild.tagName) {
            case "latlonaltbox":
              var box = {};
              gChild.children.forEach(function(latlonboxAttrNode) {
                box[latlonboxAttrNode.tagName] = parseFloat(latlonboxAttrNode.value);
              });
              networkLinkOptions.region.bounds = {
                se: {lat: box.south, lng: box.east},
                sw: {lat: box.south, lng: box.west},
                ne: {lat: box.north, lng: box.east},
                nw: {lat: box.north, lng: box.west}
              };
              break;
            case "lod":
              networkLinkOptions.region.lod = networkLinkOptions.region.lod || {};
              networkLinkOptions.region.lod.minlodpixels = networkLinkOptions.region.lod.minlodpixels || -1;
              networkLinkOptions.region.lod.maxlodpixels = networkLinkOptions.region.lod.maxlodpixels || -1;
              gChild.children.forEach(function(lodEle) {
                networkLinkOptions.region.lod[lodEle.tagName] = parseInt(lodEle.value);
              });
              break;
          }
        });

    }
  });

  //console.log(networkLinkOptions);

  if (!networkLinkOptions.link) {
    // <networklink> tag must contain <link> tag.
    // If not contained, simply ignore the tag.
    return callback.call(self, child);
  }


  if (networkLinkOptions.link.href.indexOf("://") === -1 && networkLinkOptions.link.href.substr(0, 1) !== "/") {
    var a = document.createElement("a");
    a.href = self.kmlUrl;
    networkLinkOptions.link.href = a.protocol + "//" + a.host + ":" + a.port + a.pathname.replace(/\/[^\/]+$/, "") + "/" + networkLinkOptions.link.href;
    a = null;
  }

  var networkOverlay = new BaseClass();
  networkOverlay.set("_loaded", false);
  networkOverlay.set("_visible", false);
  networkOverlay.on("_visible_changed", function(oldValue, newValue) {
    var overlay = networkOverlay.get("overlay");
    if (newValue === true) {
      if (overlay) {
        overlay.setVisible(true);
      } else {
        self.map.addKmlOverlay({
          url: networkLinkOptions.link.href,
          clickable: self.options.clickable,
          suppressInfoWindows: self.options.suppressInfoWindows
        }, function(overlay) {
          networkOverlay.set("overlay", overlay);
        });
      }
    } else {
      if (overlay) {
        overlay.setVisible(false);
      }
    }
  });
  self._overlays.push(networkOverlay);

  if (networkLinkOptions.region && networkLinkOptions.region.bounds) {
    self.camera.target.push(networkLinkOptions.region.bounds.se);
    self.camera.target.push(networkLinkOptions.region.bounds.sw);
    self.camera.target.push(networkLinkOptions.region.bounds.ne);
    self.camera.target.push(networkLinkOptions.region.bounds.nw);
  }
  // self.map.addPolygon({
  //   'points': [
  //     networkLinkOptions.region.bounds.se,
  //     networkLinkOptions.region.bounds.sw,
  //     networkLinkOptions.region.bounds.nw,
  //     networkLinkOptions.region.bounds.ne
  //   ],
  //   'strokeColor' : '#FFFFFF77',
  //   'strokeWidth': 1,
  //   'fillColor' : '#00000000'
  // }, function(groundoverlay) {

  if (networkLinkOptions.region && networkLinkOptions.link.viewrefreshmode === "onRegion") {
    self.map.on(event.CAMERA_MOVE_END, function() {
      var vRegion = self.map.getVisibleRegion();
      var nRegion = new VisibleRegion(networkLinkOptions.region.bounds.sw, networkLinkOptions.region.bounds.ne);

      if (vRegion.contains(networkLinkOptions.region.bounds.sw) ||
          vRegion.contains(networkLinkOptions.region.bounds.se) ||
          vRegion.contains(networkLinkOptions.region.bounds.nw) ||
          vRegion.contains(networkLinkOptions.region.bounds.ne) ||
          nRegion.contains(vRegion.farLeft) ||
          nRegion.contains(vRegion.farRight) ||
          nRegion.contains(vRegion.nearLeft) ||
          nRegion.contains(vRegion.nearRight)) {

        (new BaseArrayClass([
          networkLinkOptions.region.bounds.sw,
          networkLinkOptions.region.bounds.ne
        ]).mapAsync(function(latLng, next) {
          self.map.fromLatLngToPoint(latLng, next);
        }, function(points) {
          var width = Math.abs(points[0][0] - points[1][0]);
          var height = Math.abs(points[0][1] - points[1][1]);

          var maxCondition = (networkLinkOptions.region.lod.maxlodpixels === -1 ||
                              width <= networkLinkOptions.region.lod.maxlodpixels &&
                              height <= networkLinkOptions.region.lod.maxlodpixels);
          var minCondition = (networkLinkOptions.region.lod.minlodpixels === -1 ||
                              width >= networkLinkOptions.region.lod.minlodpixels &&
                              height >= networkLinkOptions.region.lod.minlodpixels);

          if (maxCondition && minCondition) {
            // groundoverlay.setVisible(true);
            networkOverlay.set("_visible", true);
          } else {
            // groundoverlay.setVisible(false);
            networkOverlay.set("_visible", false);
          }
        }));
      } else {
        // groundoverlay.setVisible(false);
        networkOverlay.set("_visible", false);
      }
    });
  } else {
    //-------------------------------
    // Simply load another kml file
    //-------------------------------
    // groundoverlay.setVisible(true);
    networkOverlay.set("_visible", networkLinkOptions.visibility);
  }

  callback.call(networkOverlay);
  //});

};

KmlLoader.prototype.parseLookAtTag = function(params, callback) {
  var self = this;

  if ("latitude" in params.child && "longitude" in params.child) {
    self.camera.target = {
      lat: parseFloat(params.child.latitude),
      lng: parseFloat(params.child.longitude)
    };
  }
  if ("heading" in params.child) {
    self.camera.bearing = parseInt(params.child.heading);
  }
  if ("tilt" in params.child) {
    self.camera.tilt = parseInt(params.child.tilt);
  }

  callback.call(self);
};


//-------------------------------
// KML color (AABBGGRR) to RGBA
//-------------------------------
function kmlColorToRGBA(colorStr) {
  var rgba = [];
  colorStr = colorStr.replace("#", "");
  for (var i = 6; i >= 0; i -= 2) {
    rgba.push(parseInt(colorStr.substring(i, i + 2), 16));
  }
  return rgba;
}
//-------------------------------
// KML color (AABBGGRR) to rgba(RR, GG, BB, AA)
//-------------------------------
function kmlColorToCSS(colorStr) {
  var rgba = [];
  colorStr = colorStr.replace("#", "");
  for (var i = 6; i >= 0; i -= 2) {
    rgba.push(parseInt(colorStr.substring(i, i + 2), 16));
  }
  return "rgba(" + rgba.join(",") + ")";
}

//-------------------------------
// Template engine
//-------------------------------
function templateRenderer(html, marker) {
  if (!html) {
    return html;
  }
  var extendedData = marker.get("extendeddata");

  return html.replace(/\$[\{\[](.+?)[\}\]]/gi, function(match, name) {
    var textProp = marker.get(name);
    var text = "";
    if (textProp) {
      text = textProp.value;
      if (extendedData) {
        text = text.replace(/\$[\{\[](.+?)[\}\]]/gi, function(match1, name1) {
          var extProp = extendedData[name1.toLowerCase()];
          var extValue = "${" + name1 + "}";
          if (extProp) {
            extValue = extProp.value;
          }
          return extValue;
        });
      }
    }
    return text;
  });
}


return KmlLoader;

});

},{"./BaseArrayClass":1,"./BaseClass":2,"./Common":6,"./LatLngBounds":12,"./VisibleRegion":22,"./argscheck":23,"./event":25,"./utils":32}],10:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.KmlOverlay", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

var argscheck = require('./argscheck'),
    utils = require('./utils'),
    common = require('./Common'),
    BaseClass = require('./BaseClass'),
    event = require('./event'),
    BaseArrayClass = require('./BaseArrayClass'),
    HtmlInfoWindow = require('./HtmlInfoWindow');

/*****************************************************************************
 * KmlOverlay Class
 *****************************************************************************/
var exec;
var KmlOverlay = function(map, kmlId, camera, kmlData, kmlOverlayOptions) {
    BaseClass.apply(this);

    var self = this;
    //self.set("visible", kmlOverlayOptions.visible === undefined ? true : kmlOverlayOptions.visible);
    //self.set("zIndex", kmlOverlayOptions.zIndex || 0);
    Object.defineProperty(self, "_isReady", {
        value: true,
        writable: false
    });
    Object.defineProperty(self, "type", {
        value: "KmlOverlay",
        writable: false
    });
    Object.defineProperty(self, "id", {
        value: kmlId,
        writable: false
    });
    Object.defineProperty(self, "map", {
        value: map,
        writable: false
    });
    Object.defineProperty(self, "camera", {
        value: camera,
        writable: false
    });
    Object.defineProperty(self, "kmlData", {
        value: kmlData,
        writable: false
    });

    function templateRenderer(html, marker) {
      var extendedData = marker.get("extendeddata");

      return html.replace(/\$[\{\[](.+?)[\}\]]/gi, function(match, name) {
        var text = "";
        if (marker.get(name)) {
          text = marker.get(name).value || "";
        }
        if (extendedData && text) {
          text = text.replace(/\$[\{\[](.+?)[\}\]]/gi, function(match1, name1) {
            return extendedData[name1.toLowerCase()] || "";
          });
        }
        return text;
      });
    }
    function parseBalloonStyle(balloonStyle) {
      var css = {};
      var hasBgColor = false;
      var keys = Object.keys(balloonStyle);
      keys.forEach(function(key) {
        switch(key.toLowerCase()) {
          case "bgcolor":
            hasBgColor = true;
            ballon.setBackgroundColor(common.kmlColorToCSS(balloonStyle[key]));
            break;
          case "textcolor":
            css.color = common.kmlColorToCSS(balloonStyle[key]);
            break;
        }
      });
      if (!hasBgColor) {
        ballon.setBackgroundColor("white");
      }
      return css;
    }

    self.set("clickable", kmlOverlayOptions.clickable);

    var ballon = new HtmlInfoWindow();
    var onOverlayClick = function(position, overlay) {
      if (!self.get("clickable")) {
        return;
      }
      self.trigger(event.KML_CLICK, overlay, position);

      if (kmlOverlayOptions.suppressInfoWindows) {
        return;
      }

      var description = overlay.get("description");
      if (!description && overlay.get("extendeddata")) {
        var extendeddata = overlay.get("extendeddata");
        var keys = Object.keys(extendeddata);
        var table = [];
        keys.forEach(function(key) {
          if (extendeddata[key] !== "" && extendeddata[key] !== null && extendeddata[key] !== undefined) {
            table.push("<tr><th>" + key + "</th><td>" + extendeddata[key] + "</td></tr>");
          }
        });
        if (table.length > 0) {
          table.unshift("<table border='1'>");
          table.push("</table>");
          description = {
            value: table.join("")
          };
          overlay.set("description", description);
        }
      }



      var html = [];
      var result;
      var descriptionTxt = "";
      if (description && description.value) {
        descriptionTxt = description.value;
      }
      if (description && (descriptionTxt.indexOf("<html>") > -1 || descriptionTxt.indexOf("script") > -1)) {
        var text = templateRenderer(descriptionTxt, overlay);
        // create a sandbox
        if (text.indexOf("<html") === -1) {
          text = "<html><body>" + text + "</body></html>";
        }
        result = document.createElement("div");
        if (overlay.get('name')) {
          var name = document.createElement("div");
          name.style.fontWeight = 500;
          name.style.fontSize = "medium";
          name.style.marginBottom = 0;
          name.innerText = overlay.get('name') || "";
          result.appendChild(name);
        }
        if (overlay.get('snippet')) {
          var snippet = document.createElement("div");
          snippet.style.fontWeight = 300;
          snippet.style.fontSize = "small";
          snippet.style.whiteSpace = "normal";
          snippet.style.fontFamily = "Roboto,Arial,sans-serif";
          snippet.innerText = overlay.get('snippet').value || "";
          result.appendChild(snippet);
        }

        var iframe = document.createElement('iframe');
        iframe.sandbox = "allow-scripts allow-same-origin";
        iframe.frameBorder = "no";
        iframe.scrolling = "yes";
        iframe.style.overflow = "hidden";
        iframe.addEventListener('load', function() {
          iframe.contentWindow.document.open();
          iframe.contentWindow.document.write(text);
          iframe.contentWindow.document.close();
        }, {
          once: true
        });
        result.appendChild(iframe);

      } else {
        if (overlay.get("name")) {
          html.push("<div style='font-weight: 500; font-size: medium; margin-bottom: 0em'>${name}</div>");
        }
        if (overlay.get("_snippet")) {
          html.push("<div style='font-weight: 300; font-size: small; font-family: Roboto,Arial,sans-serif;'>${_snippet}</div>");
        }
        if (overlay.get("description")) {
          html.push("<div style='font-weight: 300; font-size: small; font-family: Roboto,Arial,sans-serif;white-space:normal'>${description}</div>");
        }
        var prevMatchedCnt = 0;
        result = html.join("");
        var matches = result.match(/\$[\{\[].+?[\}\]]/gi);
        while(matches && matches.length !== prevMatchedCnt) {
          prevMatchedCnt = matches.length;
          result = templateRenderer(result, overlay);
          matches = result.match(/\$[\{\[].+?[\}\]]/gi);
        }
      }
      var styles = null;
      if (overlay.get("balloonstyle")) {
        styles = parseBalloonStyle(overlay.get("balloonstyle"));
      }
      styles = styles || {};
      styles.overflow = "scroll";
      styles["max-width"] = (map.getDiv().offsetWidth * 0.8) + "px";
      styles["max-height"] = (map.getDiv().offsetHeight * 0.6) + "px";

      ballon.setContent(result, styles);
      var marker = map.get("invisible_dot");
      if (overlay.type === "Marker") {
        marker.setVisible(false);
        ballon.open(overlay);
      } else {
        marker.setPosition(position);
        marker.setVisible(true);
        marker.off(event.MARKER_CLICK);
        map.animateCamera({
          target: position,
          duration: 300
        }, function() {
          marker.setAnimation(plugin.google.maps.Animation.DROP, function() {
            marker.on(event.MARKER_CLICK, function() {
              ballon.open(marker);
            });
            marker.trigger(event.MARKER_CLICK);
          });
        });

      }
    };

    var eventNames = {
      "Marker": event.MARKER_CLICK,
      "Polyline": event.POLYLINE_CLICK,
      "Polygon": event.POLYGON_CLICK,
      "GroundOverlay": event.GROUND_OVERLAY_CLICK
    };
    var seekOverlays = function(overlay) {
      if (overlay instanceof BaseArrayClass) {
        overlay.forEach(seekOverlays);
      } else if (Array.isArray(overlay)) {
        (new BaseArrayClass(overlay)).forEach(seekOverlays);
      } else if (overlay instanceof BaseClass && overlay.type in eventNames) {
        overlay.on(eventNames[overlay.type], onOverlayClick);
      }
    };

    kmlData.forEach(seekOverlays);

/*
    var ignores = ["map", "id", "hashCode", "type"];
    for (var key in kmlOverlayOptions) {
        if (ignores.indexOf(key) === -1) {
            self.set(key, kmlOverlayOptions[key]);
        }
    }
*/
};

utils.extend(KmlOverlay, BaseClass);

KmlOverlay.prototype.getPluginName = function() {
    return this.map.getId() + "-kmloverlay";
};

KmlOverlay.prototype.getHashCode = function() {
    return this.hashCode;
};

KmlOverlay.prototype.getDefaultViewport = function() {
    return this.camera;
};
KmlOverlay.prototype.getKmlData = function() {
    return this.kmlData;
};
KmlOverlay.prototype.getMap = function() {
    return this.map;
};
KmlOverlay.prototype.getId = function() {
    return this.id;
};

KmlOverlay.prototype.setClickable = function(clickable) {
  clickable = common.parseBoolean(clickable);
  this.set('clickable', clickable);
  return this;
};

KmlOverlay.prototype.getClickable = function() {
  return this.get('clickable');
};

KmlOverlay.prototype.getVisible = function() {
  return this.get('visible');
};

KmlOverlay.prototype.setVisible = function(visible) {
  var self = this;
  if (self._isRemoved) {
    return;
  }

  visible = common.parseBoolean(visible);
  this.set('visible', visible);

  var applyChildren = function(children) {
    children.forEach(function(child) {
      if ('setVisible' in child &&
        typeof child.setVisible === 'function') {
        child.setVisible(visible);
        return;
      }
      if (child instanceof BaseArrayClass) {
        applyChildren(child);
        return;
      }
    });
  };

  applyChildren(self.kmlData);
};

KmlOverlay.prototype.remove = function(callback) {
  var self = this;
  if (self._isRemoved) {
    if (typeof callback === "function") {
      return;
    } else {
      return Promise.resolve();
    }
  }
  Object.defineProperty(self, "_isRemoved", {
      value: true,
      writable: false
  });


  var removeChildren = function(children, cb) {
    children.forEach(function(child, next) {
      if ('remove' in child &&
        typeof child.remove === 'function') {
        child.remove(next);
        return;
      }
      if (child instanceof BaseArrayClass) {
        removeChildren(child, next);
        return;
      }
      next();
    }, cb);
  };

  var resolver = function(resolve, reject) {
    removeChildren(self.kmlData, function() {
      self.destroy();
      resolve.call(self);
    });
  };

  if (typeof callback === "function") {
    resolver.call(self, callback, null);
    return;
  } else {
    return Promise.resolve();
  }
};


return KmlOverlay;

});

},{"./BaseArrayClass":1,"./BaseClass":2,"./Common":6,"./HtmlInfoWindow":8,"./argscheck":23,"./event":25,"./utils":32}],11:[function(require,module,exports){
 (function(root, factory){
  if (typeof define === 'function') {
  cordova.define("cordova-plugin-googlemaps.LatLng", function(require, exports, module) {
                 module.exports = factory(require);
                 });
  } else if (typeof exports === 'object') {
  module.exports = factory(require);
  } else {
  root.returnExports = factory();
  }
  })(this, function(require) {

/*******************************************************************************
 * @name LatLng
 * @class This class represents new camera position
 * @param {Number} latitude
 * @param {Number} longitude
 ******************************************************************************/
function LatLng(latitude, longitude) {
  var self = this;
  /**
   * @property {Number} latitude
   */
  self.lat = parseFloat(latitude || 0, 10);

  /**
   * @property {Number} longitude
   */
  self.lng = parseFloat(longitude || 0, 10);
}

LatLng.prototype = {
  /**
   * Comparison function.
   * @method
   * @return {Boolean}
   */
  equals: function(other) {
    other = other || {};
    return other.lat === this.lat &&
        other.lng === this.lng;
  },

  /**
   * @method
   * @return {String} latitude,lontitude
   */
  toString: function() {
    return '{"lat": ' + this.lat + ', "lng": ' + this.lng + '}';
  },

  /**
   * @method
   * @param {Number}
   * @return {String} latitude,lontitude
   */
  toUrlValue: function(precision) {
    precision = precision || 6;
    return '{"lat": ' + this.lat.toFixed(precision) + ', "lng": ' + this.lng.toFixed(precision) + '}';
  }
};

return LatLng;

});

},{}],12:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.LatLngBounds", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

var LatLng = require('./LatLng');

/*****************************************************************************
 * LatLngBounds Class
 *****************************************************************************/
var LatLngBounds = function() {
    Object.defineProperty(this, "type", {
        value: "LatLngBounds",
        writable: false
    });

    var args = [];
    if (arguments.length === 1 &&
        typeof arguments[0] === "object" &&
        "push" in arguments[0]) {
        args = arguments[0];
    } else {
        args = Array.prototype.slice.call(arguments, 0);
    }

    for (var i = 0; i < args.length; i++) {
        if (args[i] && "lat" in args[i] && "lng" in args[i]) {
            this.extend(args[i]);
        }
    }
};

LatLngBounds.prototype.northeast = null;
LatLngBounds.prototype.southwest = null;

LatLngBounds.prototype.toString = function() {
    return '{"southwest":' + this.southwest.toString() + ', "northeast":' + this.northeast.toString() + '}';
};
LatLngBounds.prototype.toUrlValue = function(precision) {
    precision = precision || 6;
    return "[" + this.southwest.toUrlValue(precision) + "," + this.northeast.toUrlValue(precision) + "]";
};

LatLngBounds.prototype.extend = function(latLng, debug) {
    if (latLng && "lat" in latLng && "lng" in latLng) {
        if (!this.southwest && !this.northeast) {
            this.southwest = latLng;
            this.northeast = latLng;
        } else {
            var south = Math.min(latLng.lat, this.southwest.lat);
            var north = Math.max(latLng.lat, this.northeast.lat);

            var west = this.southwest.lng,
                east = this.northeast.lng;

            if (west > 0 && east < 0) {
              if (latLng.lng > 0) {
                west = Math.min(latLng.lng, west);
              } else {
                east = Math.max(latLng.lng, east);
              }
            } else {

              west = Math.min(latLng.lng, this.southwest.lng);
              east = Math.max(latLng.lng, this.northeast.lng);
            }

            delete this.southwest;
            delete this.northeast;
            this.southwest = new LatLng(south, west);
            this.northeast = new LatLng(north, east);
        }
    }
};

LatLngBounds.prototype.getCenter = function() {
    var centerLat = (this.southwest.lat + this.northeast.lat) / 2;

    var swLng = this.southwest.lng;
    var neLng = this.northeast.lng;
    var sumLng = swLng + neLng;
    var centerLng = sumLng / 2;

    if ((swLng > 0 && neLng < 0 && sumLng < 180)) {
        centerLng += sumLng > 0 ? -180 : 180;
    }
    return new LatLng(centerLat, centerLng);
};
LatLngBounds.prototype.contains = function(latLng) {
    if (!latLng || !("lat" in latLng) || !("lng" in latLng)) {
        return false;
    }
    var y = latLng.lat,
      x = latLng.lng;

    var y90 = y + 90;
    var south = this.southwest.lat,
      north = this.northeast.lat,
      west = this.southwest.lng,
      east = this.northeast.lng;
    var south90 = south + 90,
      north90 = north + 90;

    var containX = false,
      containY = false;

    if (west <= 0 && east <= 0 && west <= east) {
      if (x > 0) {
        containX = false;
      } else {
        containX = (west <= x && x <= east);
      }
    } else if (east <= 0 && west > 0 && east <= west) {
      if (x > 0) {
        containX = (x >= west && x <= 180);
      } else {
        containX = (-180 <= x && x <= west);
      }
    } else if (west <= 0 && east > 0 && west <= east) {
      if (x < 0) {
        containX = (west <= x && x <= 0);
      } else {
        containX = (x >= 0 && x <= east);
      }
    } else {
      containX = (west <= x && x <= east);
    }

    containY = (south90 <= y90 && y90 <= north90) ||  //#a
              (south >= 0 && north <= 0 && ((south <= y && y <= 90) || (y >= -90 && y<= north))); // #d

    return containX && containY;
};

return LatLngBounds;

});

},{"./LatLng":11}],13:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.Map", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

var utils = require('./utils'),
  cordova_exec = require('./exec'),
  common = require('./Common'),
  Overlay = require('./Overlay'),
  BaseClass = require('./BaseClass'),
  BaseArrayClass = require('./BaseArrayClass'),
  LatLng = require('./LatLng'),
  LatLngBounds = require('./LatLngBounds'),
  MapTypeId = require('./MapTypeId'),
  event = require('./event'),
  VisibleRegion = require('./VisibleRegion'),
  Marker = require('./Marker'),
  Circle = require('./Circle'),
  Polyline = require('./Polyline'),
  Polygon = require('./Polygon'),
  TileOverlay = require('./TileOverlay'),
  GroundOverlay = require('./GroundOverlay'),
  KmlOverlay = require('./KmlOverlay'),
  KmlLoader = require('./KmlLoader'),
  CameraPosition = require('./CameraPosition'),
  MarkerCluster = require('./MarkerCluster');

/**
 * Google Maps model.
 */
var exec;
var Map = function(id, _exec) {
  var self = this;
  exec = _exec;
  Overlay.call(self, self, {}, 'Map', _exec, {
    id: id
  });
  delete self.map;


  self.set("myLocation", false);
  self.set("myLocationButton", false);

  self.MARKERS = {};
  self.OVERLAYS = {};

  var infoWindowLayer = document.createElement("div");
  infoWindowLayer.style.position = "absolute";
  infoWindowLayer.style.left = 0;
  infoWindowLayer.style.top = 0;
  infoWindowLayer.style.width = 0;
  infoWindowLayer.style.height = 0;
  infoWindowLayer.style.overflow = "visible";
  infoWindowLayer.style["z-index"] = 1;

  Object.defineProperty(self, "_layers", {
    value: {
      info: infoWindowLayer
    },
    enumerable: false,
    writable: false
  });

  self.on(event.MAP_CLICK, function() {
    self.set("active_marker", undefined);
  });

  self.on("active_marker_changed", function(prevMarker, newMarker) {
    var newMarkerId = newMarker ? newMarker.getId() : null;
    if (prevMarker) {
      prevMarker.hideInfoWindow.call(prevMarker);
    }
    self.exec.call(self, null, null, self.id, 'setActiveMarkerId', [newMarkerId]);
  });
};

utils.extend(Map, Overlay);

/**
 * @desc Recalculate the position of HTML elements
 */
Map.prototype.refreshLayout = function(event) {
  this.exec.call(this, null, null, this.id, 'resizeMap', []);
};

Map.prototype.getMap = function(meta, div, options) {
  var self = this,
    args = [meta];
  options = options || {};

  self.set("clickable", options.clickable === false ? false : true);
  self.set("visible", options.visible === false ? false : true);

  if (options.controls) {
    this.set("myLocation", options.controls.myLocation === true);
    this.set("myLocationButton", options.controls.myLocationButton === true);
  }

  if (!common.isDom(div)) {
    self.set("visible", false);
    options = div;
    options = options || {};
    if (options.camera) {
      if (options.camera.latLng) {
        options.camera.target = options.camera.latLng;
        delete options.camera.latLng;
      }
      this.set('camera', options.camera);
      if (options.camera.target) {
        this.set('camera_target', options.camera.target);
      }
      if (options.camera.bearing) {
        this.set('camera_bearing', options.camera.bearing);
      }
      if (options.camera.zoom) {
        this.set('camera_zoom', options.camera.zoom);
      }
      if (options.camera.tilt) {
        this.set('camera_tilt', options.camera.tilt);
      }
    }
    args.push(options);
  } else {

    var positionCSS = common.getStyle(div, "position");
    if (!positionCSS || positionCSS === "static") {
      // important for HtmlInfoWindow
      div.style.position = "relative";
    }
    options = options || {};
    if (options.camera) {
      if (options.camera.latLng) {
        options.camera.target = options.camera.latLng;
        delete options.camera.latLng;
      }
      this.set('camera', options.camera);
      if (options.camera.target) {
        this.set('camera_target', options.camera.target);
      }
      if (options.camera.bearing) {
        this.set('camera_bearing', options.camera.bearing);
      }
      if (options.camera.zoom) {
        this.set('camera_zoom', options.camera.zoom);
      }
      if (options.camera.tilt) {
        this.set('camera_tilt', options.camera.tilt);
      }
    }
    if (utils.isArray(options.styles)) {
      options.styles = JSON.stringify(options.styles);
    }
    args.push(options);

    div.style.overflow = "hidden";
    self.set("div", div);

    if (div.offsetWidth < 100 || div.offsetHeight < 100) {
      // If the map Div is too small, wait a little.
      var callee = arguments.callee;
      setTimeout(function() {
        callee.call(self, meta, div, options);
      }, 250 + Math.random() * 100);
      return;
    }
    var elements = [];
    var elemId, clickable, size;


    // Gets the map div size.
    // The plugin needs to consider the viewport zoom ratio
    // for the case window.innerHTML > body.offsetWidth.
    elemId = common.getPluginDomId(div);
    args.push(elemId);

  }

  exec.call({
    _isReady: true
  }, function() {
            
    //------------------------------------------------------------------------
    // Clear background colors of map div parents after the map is created
    //------------------------------------------------------------------------
    var div = self.get("div");
    if (common.isDom(div)) {

//      // Insert the infoWindow layer
//      if (self._layers.info.parentNode) {
//        try {
//          self._layers.info.parentNode.removeChild(self._layers.info.parentNode);
//        } catch (e) {
//          // ignore
//        }
//      }
//      var positionCSS;
//      for (var i = 0; i < div.children.length; i++) {
//        positionCSS = common.getStyle(div.children[i], "position");
//        if (positionCSS === "static") {
//          div.children[i].style.position = "relative";
//        }
//      }
//      div.insertBefore(self._layers.info, div.firstChild);


      while (div.parentNode) {
        div.style.backgroundColor = 'rgba(0,0,0,0) !important';

        // prevent multiple readding the class
        if (div.classList && !div.classList.contains('_gmaps_cdv_')) {
          div.classList.add('_gmaps_cdv_');
        } else if (div.className && div.className.indexOf('_gmaps_cdv_') === -1) {
          div.className = div.className + ' _gmaps_cdv_';
        }

        div = div.parentNode;
      }
    }

    
    common.nextTick(function(){
        var event = common.createEvent("plugin_touch",  {
                                force: true
                                });
        document.dispatchEvent(event);
                    });
    
    // self.invalidate({
    //   force:true
    // });

    //------------------------------------------------------------------------
    // In order to work map.getVisibleRegion() correctly, wait a little.
    //------------------------------------------------------------------------
//    var waitCnt = 0;
//    var waitCameraSync = function() {
//      if (!self.getVisibleRegion() && (waitCnt++ < 10)) {
//        setTimeout(function() {
//          common.nextTick(waitCameraSync);
//        }, 100);
//        return;
//      }
//
//
//      self._privateInitialize();
//      delete self._privateInitialize;
//      self.refreshLayout();
//      self.trigger(event.MAP_READY, self);
//    };
//    setTimeout(function() {
//      common.nextTick(waitCameraSync);
//    }, 100);
  }, self.errorHandler, 'CordovaGoogleMaps', 'getMap', args, {
    sync: true
  });
};

Map.prototype.setOptions = function(options) {
  options = options || {};

  if (options.controls) {
    var myLocation = this.get("myLocation");
    if ("myLocation" in options.controls) {
      myLocation = options.controls.myLocation === true;
    }
    var myLocationButton = this.get("myLocationButton");
    if ("myLocationButton" in options.controls) {
      myLocationButton = options.controls.myLocationButton === true;
    }
    this.set("myLocation", myLocation);
    this.set("myLocationButton", myLocationButton);
    options.controls.myLocation = myLocation;
    options.controls.myLocationButton = myLocationButton;
  }
  if (options.camera) {
    if (options.camera.latLng) {
      options.camera.target = options.camera.latLng;
      delete options.camera.latLng;
    }
    this.set('camera', options.camera);
    if (options.camera.target) {
      this.set('camera_target', options.camera.target);
    }
    if (options.camera.bearing) {
      this.set('camera_bearing', options.camera.bearing);
    }
    if (options.camera.zoom) {
      this.set('camera_zoom', options.camera.zoom);
    }
    if (options.camera.tilt) {
      this.set('camera_tilt', options.camera.tilt);
    }
  }
  if (utils.isArray(options.styles)) {
    options.styles = JSON.stringify(options.styles);
  }
  this.exec.call(this, null, this.errorHandler, this.id, 'setOptions', [options]);
  return this;
};

Map.prototype.getMyLocation = function(params, success_callback, error_callback) {
  return plugin.google.maps.LocationService.getMyLocation.call(this, params, success_callback, error_callback);
};

Map.prototype.setCameraTarget = function(latLng) {
  this.set('camera_target', latLng);
  this.exec.call(this, null, this.errorHandler, this.id, 'setCameraTarget', [latLng.lat, latLng.lng]);
  return this;
};

Map.prototype.setCameraZoom = function(zoom) {
  this.set('camera_zoom', zoom);
  this.exec.call(this, null, this.errorHandler, this.id, 'setCameraZoom', [zoom], {
    sync: true
  });
  return this;
};
Map.prototype.panBy = function(x, y) {
  x = parseInt(x, 10);
  y = parseInt(y, 10);
  this.exec.call(this, null, this.errorHandler, this.id, 'panBy', [x, y], {
    sync: true
  });
  return this;
};

/**
 * Clears all markup that has been added to the map,
 * including markers, polylines and ground overlays.
 */
Map.prototype.clear = function(callback) {
  var self = this;
  if (self._isRemoved) {
    // Simply ignore because this map is already removed.
    return Promise.resolve();
  }

  // Close the active infoWindow
  var active_marker = self.get("active_marker");
  if (active_marker) {
    active_marker.trigger(event.INFO_CLOSE);
  }

  var clearObj = function(obj) {
    var ids = Object.keys(obj);
    var id, instance;
    for (var i = 0; i < ids.length; i++) {
      id = ids[i];
      instance = obj[id];
      if (instance) {
        if (typeof instance.remove === "function") {
          instance.remove();
        }
        instance.off();
        delete obj[id];
      }
    }
    obj = {};
  };

  clearObj(self.OVERLAYS);
  clearObj(self.MARKERS);
  self.trigger("map_clear");

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      resolve.bind(self),
      reject.bind(self),
      self.id, 'clear', [], {
        sync: true
      });
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }

};

/**
 * @desc Change the map type
 * @param {String} mapTypeId   Specifies the one of the follow strings:
 *                               MAP_TYPE_HYBRID
 *                               MAP_TYPE_SATELLITE
 *                               MAP_TYPE_TERRAIN
 *                               MAP_TYPE_NORMAL
 *                               MAP_TYPE_NONE
 */
Map.prototype.setMapTypeId = function(mapTypeId) {
  if (mapTypeId !== MapTypeId[mapTypeId.replace("MAP_TYPE_", '')]) {
    return this.errorHandler("Invalid MapTypeId was specified.");
  }
  this.set('mapTypeId', mapTypeId);
  this.exec.call(this, null, this.errorHandler, this.id, 'setMapTypeId', [mapTypeId]);
  return this;
};

/**
 * @desc Change the map view angle
 * @param {Number} tilt  The angle
 */
Map.prototype.setCameraTilt = function(tilt) {
  this.set('camera_tilt', tilt);
  this.exec.call(this, null, this.errorHandler, this.id, 'setCameraTilt', [tilt], {
    sync: true
  });
  return this;
};

/**
 * @desc Change the map view bearing
 * @param {Number} bearing  The bearing
 */
Map.prototype.setCameraBearing = function(bearing) {
  this.set('camera_bearing', bearing);
  this.exec.call(this, null, this.errorHandler, this.id, 'setCameraBearing', [bearing], {
    sync: true
  });
  return this;
};

Map.prototype.moveCameraZoomIn = function(callback) {
  var self = this;
  var cameraPosition = self.get("camera");
  cameraPosition.zoom++;
  cameraPosition.zoom = cameraPosition.zoom < 0 ? 0 : cameraPosition.zoom;

  return self.moveCamera(cameraPosition, callback);

};
Map.prototype.moveCameraZoomOut = function(callback) {
  var self = this;
  var cameraPosition = self.get("camera");
  cameraPosition.zoom--;
  cameraPosition.zoom = cameraPosition.zoom < 0 ? 0 : cameraPosition.zoom;

  return self.moveCamera(cameraPosition, callback);
};
Map.prototype.animateCameraZoomIn = function(callback) {
  var self = this;
  var cameraPosition = self.get("camera");
  cameraPosition.zoom++;
  cameraPosition.zoom = cameraPosition.zoom < 0 ? 0 : cameraPosition.zoom;
  cameraPosition.duration = 500;
  return self.animateCamera(cameraPosition, callback);
};
Map.prototype.animateCameraZoomOut = function(callback) {
  var self = this;
  var cameraPosition = self.get("camera");
  cameraPosition.zoom--;
  cameraPosition.zoom = cameraPosition.zoom < 0 ? 0 : cameraPosition.zoom;
  cameraPosition.duration = 500;
  return self.animateCamera(cameraPosition, callback);
};
/**
 * @desc   Move the map camera with animation
 * @params {CameraPosition} cameraPosition New camera position
 * @params {Function} [callback] This callback is involved when the animation is completed.
 */
Map.prototype.animateCamera = function(cameraPosition, callback) {
  var self = this;

  var target = cameraPosition.target;
  if (!target && "position" in cameraPosition) {
    target = cameraPosition.position;
  }
  if (!target) {
    return Promise.reject("No target field is specified.");
  }
  // if (!("padding" in cameraPosition)) {
  //   cameraPosition.padding = 10;
  // }

  if (utils.isArray(target) || target.type === "LatLngBounds") {
    target = common.convertToPositionArray(target);
    if (target.length === 0) {
      // skip if no point is specified
      if (typeof callback === "function") {
        callback.call(self);
        return;
      } else {
        return Promise.reject("No point is specified.");
      }
    }
  }
  cameraPosition.target = target;

  var resolver = function(resolve, reject) {

    self.exec.call(self,
      resolve.bind(self),
      reject.bind(self),
      self.id, 'animateCamera', [cameraPosition], {
        sync: true
      });
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }
};
/**
 * @desc   Move the map camera without animation
 * @params {CameraPosition} cameraPosition New camera position
 * @params {Function} [callback] This callback is involved when the animation is completed.
 */
Map.prototype.moveCamera = function(cameraPosition, callback) {
  var self = this;
  var target = cameraPosition.target;
  if (!target && "position" in cameraPosition) {
    target = cameraPosition.position;
  }
  if (!target) {
    return Promise.reject("No target field is specified.");
  }

  // if (!("padding" in cameraPosition)) {
  //   cameraPosition.padding = 10;
  // }
  if (utils.isArray(target) || target.type === "LatLngBounds") {
    target = common.convertToPositionArray(target);
    if (target.length === 0) {
      // skip if no point is specified
      if (typeof callback === "function") {
        callback.call(self);
        return;
      } else {
        return Promise.reject("No point is specified.");
      }
    }
  }
  cameraPosition.target = target;

  var resolver = function(resolve, reject) {

    self.exec.call(self,
      resolve.bind(self),
      reject.bind(self),
      self.id, 'moveCamera', [cameraPosition], {
        sync: true
      });
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }
};

Map.prototype.setMyLocationButtonEnabled = function(enabled) {
  var self = this;
  enabled = common.parseBoolean(enabled);
  this.set("myLocationButton", enabled);
  self.exec.call(self, null, this.errorHandler, this.id, 'setMyLocationEnabled', [{
    myLocationButton: enabled,
    myLocation: self.get("myLocation") === true
  }], {
    sync: true
  });
  return this;
};

Map.prototype.setMyLocationEnabled = function(enabled) {
  var self = this;
  enabled = common.parseBoolean(enabled);
  this.set("myLocation", enabled);
  self.exec.call(self, null, this.errorHandler, this.id, 'setMyLocationEnabled', [{
    myLocationButton: self.get("myLocationButton") === true,
    myLocation: enabled
  }], {
    sync: true
  });
  return this;
};

Map.prototype.setIndoorEnabled = function(enabled) {
  enabled = common.parseBoolean(enabled);
  this.exec.call(this, null, this.errorHandler, this.id, 'setIndoorEnabled', [enabled]);
  return this;
};
Map.prototype.setTrafficEnabled = function(enabled) {
  enabled = common.parseBoolean(enabled);
  this.exec.call(this, null, this.errorHandler, this.id, 'setTrafficEnabled', [enabled]);
  return this;
};
Map.prototype.setCompassEnabled = function(enabled) {
  var self = this;
  enabled = common.parseBoolean(enabled);
  self.exec.call(self, null, self.errorHandler, this.id, 'setCompassEnabled', [enabled]);
  return this;
};
Map.prototype.getFocusedBuilding = function(callback) {
  var self = this;
  var resolver = function(resolve, reject) {
    self.exec.call(self,
      resolve.bind(self),
      reject.bind(self),
      self.id, 'getFocusedBuilding', []);
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }
};
Map.prototype.getVisible = function() {
  return this.get("visible");
};
Map.prototype.setVisible = function(isVisible) {
  cordova.fireDocumentEvent('plugin_touch');
  var self = this;
  isVisible = common.parseBoolean(isVisible);
  self.set("visible", isVisible);
  self.exec.call(self, null, self.errorHandler, this.id, 'setVisible', [isVisible]);
  return this;
};

Map.prototype.setClickable = function(isClickable) {
  cordova.fireDocumentEvent('plugin_touch');
  var self = this;
  isClickable = common.parseBoolean(isClickable);
  self.set("clickable", isClickable);
  self.exec.call(self, null, self.errorHandler, this.id, 'setClickable', [isClickable]);
  return this;
};
Map.prototype.getClickable = function() {
  return this.get("clickable");
};


/**
 * Sets the preference for whether all gestures should be enabled or disabled.
 */
Map.prototype.setAllGesturesEnabled = function(enabled) {
  var self = this;
  enabled = common.parseBoolean(enabled);
  self.exec.call(self, null, self.errorHandler, this.id, 'setAllGesturesEnabled', [enabled]);
  return this;
};

/**
 * Return the current position of the camera
 * @return {CameraPosition}
 */
Map.prototype.getCameraPosition = function() {
  return this.get("camera");
};

/**
 * Remove the map completely.
 */
Map.prototype.remove = function(callback) {
  var self = this;
  if (self._isRemoved) {
    return;
  }
  Object.defineProperty(self, "_isRemoved", {
    value: true,
    writable: false
  });

  self.trigger("remove");
// var div = self.get('div');
// if (div) {
//   while (div) {
//     if (div.style) {
//       div.style.backgroundColor = '';
//     }
//     if (div.classList) {
//       div.classList.remove('_gmaps_cdv_');
//     } else if (div.className) {
//       div.className = div.className.replace(/_gmaps_cdv_/g, "");
//       div.className = div.className.replace(/\s+/g, " ");
//     }
//     div = div.parentNode;
//   }
// }
// self.set('div', undefined);


  // Close the active infoWindow
  var active_marker = self.get("active_marker");
  if (active_marker) {
    active_marker.trigger(event.INFO_CLOSE);
  }

  var clearObj = function(obj) {
    var ids = Object.keys(obj);
    var id, instance;
    for (var i = 0; i < ids.length; i++) {
      id = ids[i];
      instance = obj[id];
      if (instance) {
        if (typeof instance.remove === "function") {
          instance.remove();
        }
        instance.off();
        delete obj[id];
      }
    }
    obj = {};
  };

  clearObj(self.OVERLAYS);
  clearObj(self.MARKERS);


  var resolver = function(resolve, reject) {
    self.exec.call(self,
      resolve.bind(self),
      reject.bind(self),
      'CordovaGoogleMaps', 'removeMap', [self.id],
      {
        sync: true,
        remove: true
      });
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }
};


Map.prototype.toDataURL = function(params, callback) {
  var args = [params || {}, callback];
  if (typeof args[0] === "function") {
    args.unshift({});
  }

  params = args[0];
  callback = args[1];

  params.uncompress = params.uncompress === true;
  var self = this;

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      resolve.bind(self),
      reject.bind(self),
      self.id, 'toDataURL', [params]);
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }
};

/**
 * Show the map into the specified div.
 */
Map.prototype.getDiv = function() {
  return this.get("div");
};

/**
 * Show the map into the specified div.
 */
Map.prototype.setDiv = function(div) {
  var self = this,
    args = [];

  if (!common.isDom(div)) {
    div = self.get("div");
    if (common.isDom(div)) {
      div.removeAttribute("__pluginMapId");
    }
    self.set("div", null);
  } else {
    div.setAttribute("__pluginMapId", self.id);

    // Insert the infoWindow layer
    if (self._layers.info.parentNode) {
      try {
        self._layers.info.parentNode.removeChild(self._layers.info.parentNode);
      } catch(e) {
        //ignore
      }
    }
    var positionCSS;
    for (var i = 0; i < div.children.length; i++) {
      positionCSS = common.getStyle(div.children[i], "position");
      if (positionCSS === "static") {
        div.children[i].style.position = "relative";
      }
    }
    div.insertBefore(self._layers.info, div.firstChild);

    // Webkit redraw mandatory
    // http://stackoverflow.com/a/3485654/697856
    div.style.display = 'none';
    div.offsetHeight;
    div.style.display = '';

    self.set("div", div);

    if (cordova.platform === "browser") {
      return;
    }


    positionCSS = common.getStyle(div, "position");
    if (!positionCSS || positionCSS === "static") {
      div.style.position = "relative";
    }
    elemId = common.getPluginDomId(div);
    args.push(elemId);
    while (div.parentNode) {
      div.style.backgroundColor = 'rgba(0,0,0,0)';

      // prevent multiple readding the class
      if (div.classList && !div.classList.contains('_gmaps_cdv_')) {
        div.classList.add('_gmaps_cdv_');
      } else if (div.className && div.className.indexOf('_gmaps_cdv_') === -1) {
        div.className = div.className + ' _gmaps_cdv_';
      }

      div = div.parentNode;
    }
  }
  self.exec.call(self, function() {
    cordova.fireDocumentEvent('plugin_touch', {
      force: true,
      action: "setDiv"
    });
    self.refreshLayout();
  }, self.errorHandler, self.id, 'setDiv', args, {
    sync: true
  });
  return self;
};

/**
 * Return the visible region of the map.
 */
Map.prototype.getVisibleRegion = function(callback) {
  var self = this;
  var cameraPosition = self.get("camera");
  if (!cameraPosition || !cameraPosition.southwest || !cameraPosition.northeast) {
    return null;
  }

  var latLngBounds = new VisibleRegion(
    cameraPosition.southwest,
    cameraPosition.northeast,
    cameraPosition.farLeft,
    cameraPosition.farRight,
    cameraPosition.nearLeft,
    cameraPosition.nearRight
  );

  if (typeof callback === "function") {
    console.log("[deprecated] getVisibleRegion() is changed. Please check out the https://goo.gl/yHstHQ");
    callback.call(self, latLngBounds);
  }
  return latLngBounds;
};

/**
 * Maps an Earth coordinate to a point coordinate in the map's view.
 */
Map.prototype.fromLatLngToPoint = function(latLng, callback) {
  var self = this;

  if ("lat" in latLng && "lng" in latLng) {

    var resolver = function(resolve, reject) {
      self.exec.call(self,
        resolve.bind(self),
        reject.bind(self),
        self.id, 'fromLatLngToPoint', [latLng.lat, latLng.lng]);
    };

    if (typeof callback === "function") {
      resolver(callback, self.errorHandler);
    } else {
      return new Promise(resolver);
    }
  } else {
    var rejector = function(resolve, reject) {
      reject("The latLng is invalid");
    };

    if (typeof callback === "function") {
      rejector(callback, self.errorHandler);
    } else {
      return new Promise(rejector);
    }
  }

};
/**
 * Maps a point coordinate in the map's view to an Earth coordinate.
 */
Map.prototype.fromPointToLatLng = function(pixel, callback) {
  var self = this;
  if (typeof pixel === "object" && "x" in pixel && "y" in pixel) {
    pixel = [pixel.x, pixel.y];
  }
  if (pixel.length == 2 && utils.isArray(pixel)) {

    var resolver = function(resolve, reject) {
      self.exec.call(self,
        function(result) {
          var latLng = new LatLng(result[0] || 0, result[1] || 0);
          resolve.call(self, latLng);
        },
        reject.bind(self),
        self.id, 'fromPointToLatLng', [pixel[0], pixel[1]]);
    };

    if (typeof callback === "function") {
      resolver(callback, self.errorHandler);
    } else {
      return new Promise(resolver);
    }
  } else {
    var rejector = function(resolve, reject) {
      reject("The pixel[] argument is invalid");
    };

    if (typeof callback === "function") {
      rejector(callback, self.errorHandler);
    } else {
      return new Promise(rejector);
    }
  }

};

Map.prototype.setPadding = function(p1, p2, p3, p4) {
  if (arguments.length === 0 || arguments.length > 4) {
    return this;
  }
  var padding = {};
  padding.top = parseInt(p1, 10);
  switch (arguments.length) {
    case 4:
      // top right bottom left
      padding.right = parseInt(p2, 10);
      padding.bottom = parseInt(p3, 10);
      padding.left = parseInt(p4, 10);
      break;

    case 3:
      // top right&left bottom
      padding.right = parseInt(p2, 10);
      padding.left = padding.right;
      padding.bottom = parseInt(p3, 10);
      break;

    case 2:
      // top & bottom right&left
      padding.bottom = parseInt(p1, 10);
      padding.right = parseInt(p2, 10);
      padding.left = padding.right;
      break;

    case 1:
      // top & bottom right & left
      padding.bottom = padding.top;
      padding.right = padding.top;
      padding.left = padding.top;
      break;
  }
  this.exec.call(this, function(result) {
    if (typeof callback === "function") {
      var latLng = new LatLng(result[0] || 0, result[1] || 0);
      callback.call(self, result);
    }
  }, self.errorHandler, this.id, 'setPadding', [padding]);
  return this;
};


Map.prototype.addKmlOverlay = function(kmlOverlayOptions, callback) {
  var self = this;
  kmlOverlayOptions = kmlOverlayOptions || {};
  kmlOverlayOptions.url = kmlOverlayOptions.url || null;
  kmlOverlayOptions.clickable = common.defaultTrueOption(kmlOverlayOptions.clickable);
  kmlOverlayOptions.suppressInfoWindows = kmlOverlayOptions.suppressInfoWindows === true;

  if (kmlOverlayOptions.url) {

    var link = document.createElement("a");
    link.href = kmlOverlayOptions.url;
    kmlOverlayOptions.url = link.protocol+"//"+link.host+link.pathname;

    var invisible_dot = self.get("invisible_dot");
    if (!invisible_dot || invisible_dot._isRemoved) {
      // Create an invisible marker for kmlOverlay
      self.set("invisible_dot", self.addMarker({
        position: {
          lat: 0,
          lng: 0
        },
        icon: "skyblue",
        visible: false
      }));
    }
    if ('icon' in kmlOverlayOptions) {
      self.get('invisible_dot').setIcon(kmlOverlayOptions.icon);
    }

    var resolver = function(resolve, reject) {

      var loader = new KmlLoader(self, self.exec, kmlOverlayOptions);
      loader.parseKmlFile(function(camera, kmlData) {
        if (kmlData instanceof BaseClass) {
          kmlData = new BaseArrayClass([kmlData]);
        }
        var kmlId = "kmloverlay_" + Math.floor(Math.random() * Date.now());
        var kmlOverlay = new KmlOverlay(self, kmlId, camera, kmlData, kmlOverlayOptions);
        self.OVERLAYS[kmlId] = kmlOverlay;
        resolve.call(self, kmlOverlay);
      });

    };

    if (typeof callback === "function") {
      resolver(callback, self.errorHandler);
    } else {
      return new Promise(resolver);
    }
  } else {

    if (typeof callback === "function") {
      throw new Error('KML file url is required.');
    } else {
      return Promise.reject('KML file url is required.');
    }
  }
};

//-------------
// Ground overlay
//-------------
Map.prototype.addGroundOverlay = function(groundOverlayOptions, callback) {
  var self = this;
  groundOverlayOptions = groundOverlayOptions || {};
  groundOverlayOptions.url = groundOverlayOptions.url || null;
  groundOverlayOptions.clickable = groundOverlayOptions.clickable === true;
  groundOverlayOptions.visible = common.defaultTrueOption(groundOverlayOptions.visible);
  groundOverlayOptions.zIndex = groundOverlayOptions.zIndex || 0;
  groundOverlayOptions.bounds = common.convertToPositionArray(groundOverlayOptions.bounds);
  groundOverlayOptions.noCaching = true;

  var groundOverlay = new GroundOverlay(self, groundOverlayOptions, exec);
  var groundOverlayId = groundOverlay.getId();
  self.OVERLAYS[groundOverlayId] = groundOverlay;
  groundOverlay.one(groundOverlayId + "_remove", function() {
    groundOverlay.off();
    delete self.OVERLAYS[groundOverlayId];
    groundOverlay = undefined;
  });

  self.exec.call(self, function(result) {
    groundOverlay._privateInitialize();
    delete groundOverlay._privateInitialize;
    if (typeof callback === "function") {
      callback.call(self, groundOverlay);
    }
  }, self.errorHandler, self.id, 'loadPlugin', ['GroundOverlay', groundOverlayOptions, groundOverlay.hashCode]);

  return groundOverlay;
};

//-------------
// Tile overlay
//-------------
Map.prototype.addTileOverlay = function(tilelayerOptions, callback) {
  var self = this;
  tilelayerOptions = tilelayerOptions || {};
  tilelayerOptions.tileUrlFormat = tilelayerOptions.tileUrlFormat || null;
  if (typeof tilelayerOptions.tileUrlFormat === "string") {
    console.log("[deprecated] the tileUrlFormat property is now deprecated. Use the getTile property.");
    tilelayerOptions.getTile = function(x, y, zoom) {
      return tilelayerOptions.tileUrlFormat.replace(/<x>/gi, x)
        .replace(/<y>/gi, y)
        .replace(/<zoom>/gi, zoom);
    };
  }
  if (typeof tilelayerOptions.getTile !== "function") {
    throw new Error("[error] the getTile property is required.");
  }
  tilelayerOptions.visible = common.defaultTrueOption(tilelayerOptions.visible);
  tilelayerOptions.zIndex = tilelayerOptions.zIndex || 0;
  tilelayerOptions.tileSize = tilelayerOptions.tileSize || 512;
  tilelayerOptions.opacity = (tilelayerOptions.opacity === null || tilelayerOptions.opacity === undefined) ? 1 : tilelayerOptions.opacity;
  tilelayerOptions.debug = tilelayerOptions.debug === true;
  tilelayerOptions.userAgent = tilelayerOptions.userAgent || navigator.userAgent;


  var tileOverlay = new TileOverlay(self, tilelayerOptions, exec);
  var tileOverlayId = tileOverlay.getId();
  self.OVERLAYS[tileOverlayId] = tileOverlay;
  var hashCode = tileOverlay.hashCode;

  tileOverlay.one(tileOverlayId + "_remove", function() {
    document.removeEventListener(tileOverlayId + "-" + hashCode + "-tileoverlay", onNativeCallback);
    tileOverlay.off();
    delete self.OVERLAYS[tileOverlayId];
    tileOverlay = undefined;
  });

  var options = {
    visible: tilelayerOptions.visible,
    zIndex: tilelayerOptions.zIndex,
    tileSize: tilelayerOptions.tileSize,
    opacity: tilelayerOptions.opacity,
    userAgent: tilelayerOptions.userAgent,
    debug: tilelayerOptions.debug
  };

  var onNativeCallback = function(params) {
    var url = tilelayerOptions.getTile(params.x, params.y, params.zoom);
    if (!url || url === "(null)" || url === "undefined" || url === "null") {
      url = "(null)";
    }
    cordova_exec(null, self.errorHandler, self.id + "-tileoverlay", 'onGetTileUrlFromJS', [hashCode, params.key, url]);
  };
  document.addEventListener(self.id + "-" + hashCode + "-tileoverlay", onNativeCallback);

  self.exec.call(self, function(result) {
    tileOverlay._privateInitialize();
    delete tileOverlay._privateInitialize;

    if (typeof callback === "function") {
      callback.call(self, tileOverlay);
    }
  }, self.errorHandler, self.id, 'loadPlugin', ['TileOverlay', options, hashCode]);

  return tileOverlay;
};

//-------------
// Polygon
//-------------
Map.prototype.addPolygon = function(polygonOptions, callback) {
  var self = this;
  polygonOptions.points = polygonOptions.points || [];
  var _orgs = polygonOptions.points;
  polygonOptions.points = common.convertToPositionArray(polygonOptions.points);
  polygonOptions.holes = polygonOptions.holes || [];
  if (polygonOptions.holes.length > 0 && !Array.isArray(polygonOptions.holes[0])) {
    polygonOptions.holes = [polygonOptions.holes];
  }
  polygonOptions.holes = polygonOptions.holes.map(function(hole) {
    if (!utils.isArray(hole)) {
      return [];
    }
    return hole.map(function(position) {
      return {
        "lat": position.lat,
        "lng": position.lng
      };
    });
  });
  polygonOptions.strokeColor = common.HTMLColor2RGBA(polygonOptions.strokeColor || "#FF000080", 0.75);
  if (polygonOptions.fillColor) {
    polygonOptions.fillColor = common.HTMLColor2RGBA(polygonOptions.fillColor || "#FF000080", 0.75);
  } else {
    polygonOptions.fillColor = common.HTMLColor2RGBA("#FF000080", 0.75);
  }
  polygonOptions.strokeWidth = "strokeWidth" in polygonOptions ? polygonOptions.strokeWidth : 10;
  polygonOptions.visible = common.defaultTrueOption(polygonOptions.visible);
  polygonOptions.clickable = polygonOptions.clickable === true;
  polygonOptions.zIndex = polygonOptions.zIndex || 0;
  polygonOptions.geodesic = polygonOptions.geodesic === true;

  var opts = JSON.parse(JSON.stringify(polygonOptions));
  polygonOptions.points = _orgs;
  var polygon = new Polygon(self, polygonOptions, exec);
  var polygonId = polygon.getId();
  self.OVERLAYS[polygonId] = polygon;
  polygon.one(polygonId + "_remove", function() {
    polygon.off();
    delete self.OVERLAYS[polygonId];
    polygon = undefined;
  });

  self.exec.call(self, function(result) {
    polygon._privateInitialize();
    delete polygon._privateInitialize;

    if (typeof callback === "function") {
      callback.call(self, polygon);
    }
  }, self.errorHandler, self.id, 'loadPlugin', ["Polygon", opts, polygon.hashCode]);

  return polygon;
};

//-------------
// Polyline
//-------------
Map.prototype.addPolyline = function(polylineOptions, callback) {
  var self = this;
  polylineOptions.points = polylineOptions.points || [];
  var _orgs = polylineOptions.points;
  polylineOptions.points = common.convertToPositionArray(polylineOptions.points);
  polylineOptions.color = common.HTMLColor2RGBA(polylineOptions.color || "#FF000080", 0.75);
  polylineOptions.width = "width" in polylineOptions ? polylineOptions.width : 10;
  polylineOptions.visible = common.defaultTrueOption(polylineOptions.visible);
  polylineOptions.clickable = polylineOptions.clickable === true;
  polylineOptions.zIndex = polylineOptions.zIndex || 0;
  polylineOptions.geodesic = polylineOptions.geodesic === true;

  var opts = JSON.parse(JSON.stringify(polylineOptions));
  polylineOptions.points = _orgs;
  var polyline = new Polyline(self, polylineOptions, exec);
  var polylineId = polyline.getId();
  self.OVERLAYS[polylineId] = polyline;

  polyline.one(polylineId + "_remove", function() {
    polyline.off();
    delete self.OVERLAYS[polylineId];
    polyline = undefined;
  });

  self.exec.call(self, function(result) {
    polyline._privateInitialize();
    delete polyline._privateInitialize;

    if (typeof callback === "function") {
      callback.call(self, polyline);
    }
  }, self.errorHandler, self.id, 'loadPlugin', ['Polyline', opts, polyline.hashCode]);

  return polyline;
};

//-------------
// Circle
//-------------
Map.prototype.addCircle = function(circleOptions, callback) {
  var self = this;
  circleOptions.center = circleOptions.center || {};
  circleOptions.center.lat = circleOptions.center.lat || 0.0;
  circleOptions.center.lng = circleOptions.center.lng || 0.0;
  circleOptions.strokeColor = common.HTMLColor2RGBA(circleOptions.strokeColor || "#FF0000", 0.75);
  circleOptions.fillColor = common.HTMLColor2RGBA(circleOptions.fillColor || "#000000", 0.75);
  circleOptions.strokeWidth = "strokeWidth" in circleOptions ? circleOptions.strokeWidth : 10;
  circleOptions.visible = common.defaultTrueOption(circleOptions.visible);
  circleOptions.zIndex = circleOptions.zIndex || 0;
  circleOptions.radius = "radius" in circleOptions ? circleOptions.radius : 1;

  var circle = new Circle(self, circleOptions, exec);
  var circleId = circle.getId();
  self.OVERLAYS[circleId] = circle;
  circle.one(circleId + "_remove", function() {
    circle.off();
    delete self.OVERLAYS[circleId];
    circle = undefined;
  });

  self.exec.call(self, function(result) {
    circle._privateInitialize();
    delete circle._privateInitialize;

    if (typeof callback === "function") {
      callback.call(self, circle);
    }
  }, self.errorHandler, self.id, 'loadPlugin', ['Circle', circleOptions, circle.hashCode]);

  return circle;
};

//-------------
// Marker
//-------------

Map.prototype.addMarker = function(markerOptions, callback) {
  var self = this;
  markerOptions = common.markerOptionsFilter(markerOptions);

  //------------------------------------
  // Generate a makrer instance at once.
  //------------------------------------
  markerOptions.icon = markerOptions.icon || {};
  if (typeof markerOptions.icon === 'string' || Array.isArray(markerOptions.icon)) {
    markerOptions.icon = {
      url: markerOptions.icon
    };
  }

  var marker = new Marker(self, markerOptions, exec);
  var markerId = marker.getId();

  self.MARKERS[markerId] = marker;
  self.OVERLAYS[markerId] = marker;
  marker.one(markerId + "_remove", function() {
    delete self.MARKERS[markerId];
    delete self.OVERLAYS[markerId];
    marker.destroy();
    marker = undefined;
  });

  self.exec.call(self, function(result) {

    markerOptions.icon.size = markerOptions.icon.size || {};
    markerOptions.icon.size.width = markerOptions.icon.size.width || result.width;
    markerOptions.icon.size.height = markerOptions.icon.size.height || result.height;
    markerOptions.icon.anchor = markerOptions.icon.anchor || [markerOptions.icon.size.width / 2, markerOptions.icon.size.height];

    if (!markerOptions.infoWindowAnchor) {
      markerOptions.infoWindowAnchor = [markerOptions.icon.size.width / 2, 0];
    }
    marker._privateInitialize(markerOptions);
    delete marker._privateInitialize;

    if (typeof callback === "function") {
      callback.call(self, marker);
    }
  }, self.errorHandler, self.id, 'loadPlugin', ['Marker', markerOptions, marker.hashCode]);

  return marker;
};


//------------------
// Marker cluster
//------------------
Map.prototype.addMarkerCluster = function(markerClusterOptions, callback) {
  var self = this;
  if (typeof markerClusterOptions === "function") {
    callback = markerClusterOptions;
    markerClusterOptions = null;
  }
  markerClusterOptions = markerClusterOptions || {};
  var positionList = markerClusterOptions.markers.map(function(marker) {
    return marker.position;
  });

  var markerCluster = new MarkerCluster(self, {
    "icons": markerClusterOptions.icons,
    //"markerMap": markerMap,
    "idxCount": positionList.length + 1,
    "maxZoomLevel": Math.min(markerClusterOptions.maxZoomLevel || 15, 18),
    "debug": markerClusterOptions.debug === true,
    "boundsDraw": common.defaultTrueOption(markerClusterOptions.boundsDraw)
  }, exec);
  var markerClusterId = markerCluster.getId();
  self.OVERLAYS[markerClusterId] = markerCluster;

  self.exec.call(self, function(result) {

    var markerMap = {};
    result.geocellList.forEach(function(geocell, idx) {
      var markerOptions = markerClusterOptions.markers[idx];
      markerOptions = common.markerOptionsFilter(markerOptions);

      var markerId = markerOptions.id || "marker_" + idx;
      //markerId = result.id + "-" + markerId;
      markerOptions.__pgmId = markerId;
      markerOptions._cluster = {
        isRemoved: false,
        isAdded: false,
        geocell: geocell,
        _marker: null
      };
      /*
            var marker = new Marker(self, markerId, markerOptions, "MarkerCluster", exec);
            marker.set("isAdded", false, true);
            marker.set("geocell", geocell, true);
            marker.set("position", markerOptions.position, true);
            marker.getId = function() {
              return result.id + "-" + markerId;
            };
      */
      markerMap[markerId] = markerOptions;

      //self.MARKERS[marker.getId()] = marker;
      //self.OVERLAYS[marker.getId()] = marker;
    });

    Object.defineProperty(markerCluster, "_markerMap", {
      value: markerMap,
      writable: false
    });

    markerCluster.one("remove", function() {
      delete self.OVERLAYS[result.id];
      /*
            result.geocellList.forEach(function(geocell, idx) {
              var markerOptions = markerClusterOptions.markers[idx];
              var markerId = result.id + "-" + (markerOptions.id || "marker_" + idx);
              var marker = self.MARKERS[markerId];
              if (marker) {
                marker.off();
              }
              //delete self.MARKERS[markerId];
              delete self.OVERLAYS[markerId];
            });
      */
      markerCluster.destroy();
    });

    markerCluster._privateInitialize();
    delete markerCluster._privateInitialize;

    markerCluster.redraw.call(markerCluster, {
      force: true
    });

    if (typeof callback === "function") {
      callback.call(self, markerCluster);
    }
  }, self.errorHandler, self.id, 'loadPlugin', ['MarkerCluster', {
    "positionList": positionList,
    "debug": markerClusterOptions.debug === true
  }, markerCluster.hashCode]);

  return markerCluster;
};

/*****************************************************************************
 * Callbacks from the native side
 *****************************************************************************/

Map.prototype._onSyncInfoWndPosition = function(eventName, points) {
  this.set("infoPosition", points);
};

Map.prototype._onMapEvent = function(eventName) {
  if (!this._isReady) {
    return;
  }
  var args = [eventName];
  for (var i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  this.trigger.apply(this, args);
};

Map.prototype._onMarkerEvent = function(eventName, markerId, position) {
  var self = this;
  var marker = self.MARKERS[markerId] || null;

  if (marker) {
    marker.set('position', position);
    if (eventName === event.INFO_OPEN) {
      marker.set("isInfoWindowVisible", true);
    }
    if (eventName === event.INFO_CLOSE) {
      marker.set("isInfoWindowVisible", false);
    }
    marker.trigger(eventName, position, marker);
  }
};

Map.prototype._onClusterEvent = function(eventName, markerClusterId, clusterId, position) {
  var self = this;
  var markerCluster = self.OVERLAYS[markerClusterId] || null;
  if (markerCluster) {
    if (/^marker_/i.test(clusterId)) {
      // regular marker
      var marker = markerCluster.getMarkerById(clusterId);
      if (eventName === event.MARKER_CLICK) {
        markerCluster.trigger(eventName, position, marker);
      } else {
        if (eventName === event.INFO_OPEN) {
          marker.set("isInfoWindowVisible", true);
        }
        if (eventName === event.INFO_CLOSE) {
          marker.set("isInfoWindowVisible", false);
        }
      }
      marker.trigger(eventName, position, marker);
    } else {
      // cluster marker
      var cluster = markerCluster.getClusterByClusterId(clusterId);
      if (cluster) {
        markerCluster.trigger(eventName, cluster);
      } else {
        console.log("-----> This is remained cluster icon : " + clusterId);
      }
    }
  }
};

Map.prototype._onOverlayEvent = function(eventName, overlayId) {
  var self = this;
  var overlay = self.OVERLAYS[overlayId] || null;
  if (overlay) {
    var args = [eventName];
    for (var i = 2; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(overlay); // for ionic
    overlay.trigger.apply(overlay, args);
  }
};

Map.prototype.getCameraTarget = function() {
  return this.get("camera_target");
};

Map.prototype.getCameraZoom = function() {
  return this.get("camera_zoom");
};
Map.prototype.getCameraTilt = function() {
  return this.get("camera_tilt");
};
Map.prototype.getCameraBearing = function() {
  return this.get("camera_bearing");
};

Map.prototype._onCameraEvent = function(eventName, cameraPosition) {
  this.set('camera', cameraPosition);
  this.set('camera_target', cameraPosition.target);
  this.set('camera_zoom', cameraPosition.zoom);
  this.set('camera_bearing', cameraPosition.bearing);
  this.set('camera_tilt', cameraPosition.viewAngle || cameraPosition.tilt);
  this.set('camera_northeast', cameraPosition.northeast);
  this.set('camera_southwest', cameraPosition.southwest);
  this.set('camera_nearLeft', cameraPosition.nearLeft);
  this.set('camera_nearRight', cameraPosition.nearRight);
  this.set('camera_farLeft', cameraPosition.farLeft);
  this.set('camera_farRight', cameraPosition.farRight);
  if (this._isReady) {
    this.trigger(eventName, cameraPosition, this);
  }
};

return Map;

});

},{"./BaseArrayClass":1,"./BaseClass":2,"./CameraPosition":3,"./Circle":4,"./Common":6,"./GroundOverlay":7,"./KmlLoader":9,"./KmlOverlay":10,"./LatLng":11,"./LatLngBounds":12,"./MapTypeId":14,"./Marker":15,"./MarkerCluster":16,"./Overlay":17,"./Polygon":18,"./Polyline":19,"./TileOverlay":21,"./VisibleRegion":22,"./event":25,"./exec":26,"./utils":32}],14:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.MapTypeId", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

return {
    'NORMAL': 'MAP_TYPE_NORMAL',
    'ROADMAP': 'MAP_TYPE_NORMAL',
    'SATELLITE': 'MAP_TYPE_SATELLITE',
    'HYBRID': 'MAP_TYPE_HYBRID',
    'TERRAIN': 'MAP_TYPE_TERRAIN',
    'NONE': 'MAP_TYPE_NONE'
};

});

},{}],15:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.Marker", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

var argscheck = require('./argscheck'),
  utils = require('./utils'),
  common = require('./Common'),
  LatLng = require('./LatLng'),
  event = require('./event'),
  Overlay = require('./Overlay');

/*****************************************************************************
 * Marker Class
 *****************************************************************************/
var Marker = function(map, markerOptions, _exec, extras) {
  extras = extras || {};
  Overlay.call(this, map, markerOptions, extras.className || 'Marker', _exec, extras);

  var self = this;

  if (markerOptions && markerOptions.position) {
    markerOptions.position.lat = parseFloat(markerOptions.position.lat);
    markerOptions.position.lng = parseFloat(markerOptions.position.lng);
    self.set('position', markerOptions.position);
  }

  //-----------------------------------------------
  // Sets event listeners
  //-----------------------------------------------
  self.on(event.MARKER_CLICK, function() {
    self.showInfoWindow.apply(self);
  });

  self.on("position_changed", function() {
    var position = self.get("position");
    position.lat = parseFloat(position.lat, 10);
    position.lng = parseFloat(position.lng, 10);
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setPosition', [self.getId(), position.lat, position.lng]);
  });
  self.on("rotation_changed", function() {
    var rotation = self.get("rotation");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setRotation', [self.getId(), rotation]);
  });
  self.on("snippet_changed", function() {
    var snippet = self.get("snippet");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setSnippet', [self.getId(), snippet]);
  });
  self.on("visible_changed", function() {
    var visible = self.get("visible");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setVisible', [self.getId(), visible]);
  });
  self.on("title_changed", function() {
    var title = self.get("title");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setTitle', [self.getId(), title]);
  });
  self.on("icon_changed", function() {
    var icon = self.get("icon");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setIcon', [self.getId(), icon]);
  });
  self.on("flat_changed", function() {
    var flat = self.get("flat");
    flat = flat === true;
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setFlat', [self.getId(), flat]);
  });
  self.on("draggable_changed", function() {
    var draggable = self.get("draggable");
    draggable = draggable === true;
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setDraggable', [self.getId(), draggable]);
  });
  self.on("anchor_changed", function() {
    var anchor = self.get("anchor");
    if (!anchor) {
      return;
    }
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setIconAnchor', [self.getId(), anchor[0], anchor[1]]);
  });
  self.on("infoWindowAnchor_changed", function() {
    var anchor = self.get("infoWindowAnchor");
    if (!anchor) {
      return;
    }
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setInfoWindowAnchor', [self.getId(), anchor[0], anchor[1]]);
  });
  self.on("zIndex_changed", function() {
    var zIndex = self.get("zIndex");
    if (zIndex === null || zIndex === undefined) {
      return;
    }
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setZIndex', [self.getId(), zIndex]);
  });
  self.on("opacity_changed", function() {
    var opacity = self.get("opacity");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setOpacity', [self.getId(), opacity]);
  });
  self.on("disableAutoPan_changed", function() {
    var disableAutoPan = self.get("disableAutoPan");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setDisableAutoPan', [self.getId(), disableAutoPan]);
  });

};

utils.extend(Marker, Overlay);

Marker.prototype.remove = function(callback) {
  var self = this;
  if (self._isRemoved) {
    if (typeof callback === "function") {
      return;
    } else {
      return Promise.resolve();
    }
  }
  Object.defineProperty(self, "_isRemoved", {
    value: true,
    writable: false
  });
  self.trigger(event.INFO_CLOSE); // close open infowindow, otherwise it will stay
  self.trigger(self.id + "_remove");

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      function() {
        self.destroy();
        resolve.call(self);
      },
      reject.bind(self),
      self.getPluginName(), 'remove', [self.getId()], {
        remove: true
      });
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }


};

Marker.prototype.getOptions = function() {
  var self = this;
  return {
    "id": self.getId(),
    "position": self.getPosition(),
    "disableAutoPan": self.get("disableAutoPan"),
    "opacity": self.get("opacity"),
    "icon": self.get("icon"),
    "zIndex": self.get("zIndex"),
    "anchor": self.get("anchor"),
    "infoWindowAnchor": self.get("infoWindowAnchor"),
    "draggable": self.get("draggable"),
    "title": self.getTitle(),
    "snippet": self.getSnippet(),
    "visible": self.get("visible"),
    "rotation": self.getRotation()
  };
};
Marker.prototype.getPosition = function() {
  var position = this.get('position');
  if (!(position instanceof LatLng)) {
    return new LatLng(position.lat, position.lng);
  }
  return position;
};

Marker.prototype.setAnimation = function(animation, callback) {
  var self = this;

  animation = animation || null;
  if (!animation) {
    // just ignore
    if (typeof callback === "function") {
      return self;
    } else {
      return Promise.resolve();
    }
  }
  self.set("animation", animation);

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      resolve.bind(self),
      reject.bind(self),
      self.getPluginName(), 'setAnimation', [self.getId(), animation]);
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
    return self;
  } else {
    return new Promise(resolver);
  }

};

Marker.prototype.setDisableAutoPan = function(disableAutoPan) {
  disableAutoPan = common.parseBoolean(disableAutoPan);
  this.set('disableAutoPan', disableAutoPan);
  return this;
};
Marker.prototype.setOpacity = function(opacity) {
  if (!opacity && opacity !== 0) {
    console.log('opacity value must be int or double');
    return false;
  }
  this.set('opacity', opacity);
  return this;
};
Marker.prototype.setZIndex = function(zIndex) {
  if (typeof zIndex === 'undefined') {
    return false;
  }
  this.set('zIndex', zIndex);
  return this;
};
Marker.prototype.getOpacity = function() {
  return this.get('opacity');
};
Marker.prototype.setIconAnchor = function(anchorX, anchorY) {
  this.set('anchor', [anchorX, anchorY]);
  return this;
};
Marker.prototype.setInfoWindowAnchor = function(anchorX, anchorY) {
  this.set('infoWindowAnchor', [anchorX, anchorY]);
  return this;
};
Marker.prototype.setDraggable = function(draggable) {
  draggable = common.parseBoolean(draggable);
  this.set('draggable', draggable);
  return this;
};
Marker.prototype.isDraggable = function() {
  return this.get('draggable');
};
Marker.prototype.setFlat = function(flat) {
  flat = common.parseBoolean(flat);
  this.set('flat', flat);
  return this;
};
Marker.prototype.setIcon = function(url) {
  if (url && common.isHTMLColorString(url)) {
    url = common.HTMLColor2RGBA(url);
  }
  this.set('icon', url);
  return this;
};
Marker.prototype.setTitle = function(title) {
  if (!title) {
    console.log('missing value for title');
    return this;
  }
  title = "" + title; // Convert to strings mandatory
  this.set('title', title);
  return this;
};
Marker.prototype.setVisible = function(visible) {
  visible = common.parseBoolean(visible);
  this.set('visible', visible);
  if (!visible && this.map.get("active_marker_id") === this.id) {
    this.map.set("active_marker_id", undefined);
  }
  return this;
};
Marker.prototype.getTitle = function() {
  return this.get('title');
};
Marker.prototype.setSnippet = function(snippet) {
  this.set('snippet', snippet);
  return this;
};
Marker.prototype.getSnippet = function() {
  return this.get('snippet');
};
Marker.prototype.setRotation = function(rotation) {
  if (typeof rotation !== "number") {
    console.log('missing value for rotation');
    return false;
  }
  this.set('rotation', rotation);
  return this;
};
Marker.prototype.getRotation = function() {
  return this.get('rotation');
};
Marker.prototype.showInfoWindow = function() {
  var self = this;
  //if (!self.get("title") && !self.get("snippet") ||
  //    self.get("isInfoWindowVisible")) {
  if (!self.get("title") && !self.get("snippet")) {
    return;
  }
  self.set("isInfoWindowVisible", true);
  self.map.set("active_marker_id", self.id);
  self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'showInfoWindow', [self.getId()], {
    sync: true
  });
  return self;
};
Marker.prototype.hideInfoWindow = function() {
  var self = this;
  if (self.map.get("active_marker_id") === self.id) {
    self.map.set("active_marker_id", null);
  }
  if (self.get("isInfoWindowVisible")) {
    self.set("isInfoWindowVisible", false);
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'hideInfoWindow', [self.getId()], {
      sync: true
    });
  }
  return self;
};
Marker.prototype.isInfoWindowShown = function() {
  return this.get("isInfoWindowVisible") === true;
};
Marker.prototype.isVisible = function() {
  return this.get("visible") === true;
};

Marker.prototype.setPosition = function(position) {
  if (!position) {
    console.log('missing value for position');
    return false;
  }
  this.set('position', {
    'lat': position.lat,
    'lng': position.lng
  });
  return this;
};

return Marker;

});

},{"./Common":6,"./LatLng":11,"./Overlay":17,"./argscheck":23,"./event":25,"./utils":32}],16:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.MarkerCluster", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

var argscheck = require('./argscheck'),
  utils = require('./utils'),
  common = require('./Common'),
  event = require('./event'),
  geomodel = require('./geomodel'),
  LatLng = require('./LatLng'),
  LatLngBounds = require('./LatLngBounds'),
  Marker = require('./Marker'),
  Cluster = require('./Cluster'),
  spherical = require('./spherical'),
  Overlay = require('./Overlay'),
  BaseArrayClass = require('./BaseArrayClass');

/*****************************************************************************
 * MarkerCluster Class
 *****************************************************************************/
var exec;
var MarkerCluster = function(map, markerClusterOptions, _exec) {
  exec = _exec;
  Overlay.call(this, map, markerClusterOptions, 'MarkerCluster', _exec);

  var idxCount = markerClusterOptions.idxCount;

  var self = this;
  Object.defineProperty(self, "maxZoomLevel", {
    value: markerClusterOptions.maxZoomLevel,
    writable: false
  });
  Object.defineProperty(self, "_clusterBounds", {
    value: new BaseArrayClass(),
    writable: false
  });
  Object.defineProperty(self, "_geocellBounds", {
    value: {},
    writable: false
  });
  Object.defineProperty(self, "_clusters", {
    value: {},
    writable: false
  });
  Object.defineProperty(self, "debug", {
    value: markerClusterOptions.debug === true,
    writable: false
  });
  Object.defineProperty(self, "MAX_RESOLUTION", {
    value: 11,
    writable: false
  });
  Object.defineProperty(self, "OUT_OF_RESOLUTION", {
    value: 999,
    writable: false
  });
  Object.defineProperty(self, "boundsDraw", {
    value: markerClusterOptions.boundsDraw === true,
    writable: false
  });

  if (self.boundsDraw) {
    self.map.addPolygon({
      visible: false,
      points: [
        {lat: 0, lng: 0},
        {lat: 0, lng: 0},
        {lat: 0, lng: 0},
        {lat: 0, lng: 0}
      ],
      strokeWidth: 1
    }, function(polygon) {
      self.set("polygon", polygon);
    });
  }
  self.taskQueue = [];
  self._stopRequest = false;
  self._isWorking = false;

  var icons = markerClusterOptions.icons;
  if (icons.length > 0 && !icons[0].min) {
    icons[0].min = 2;
  }

  for (var i = 0; i < icons.length; i++) {
    if (!icons[i]) {
      continue;
    }
    if (icons[i].anchor &&
      typeof icons[i].anchor === "object" &&
      "x" in icons[i].anchor &&
      "y" in icons[i].anchor) {
      icons[i].anchor = [icons[i].anchor.x, icons[i].anchor.y];
    }
    if (icons[i].infoWindowAnchor &&
      typeof icons[i].infoWindowAnchor === "object" &&
      "x" in icons[i].infoWindowAnchor &&
      "y" in icons[i].infoWindowAnchor) {
      icons[i].infoWindowAnchor = [icons[i].infoWindowAnchor.x, icons[i].infoWindowAnchor.anchor.y];
    }
    if (icons[i].label &&
      common.isHTMLColorString(icons[i].label.color)) {
        icons[i].label.color = common.HTMLColor2RGBA(icons[i].label.color);
    }
  }

  Object.defineProperty(self, "icons", {
      value: icons,
      writable: false
  });

  self.addMarker = function(markerOptions, skipRedraw) {
    idxCount++;
    var resolution = self.get("resolution");

    markerOptions = common.markerOptionsFilter(markerOptions);
    var geocell = geomodel.getGeocell(markerOptions.position.lat, markerOptions.position.lng, self.MAX_RESOLUTION + 1);

    var markerId = (markerOptions.__pgmId || "marker_" + idxCount);
    markerOptions.__pgmId = markerId;
    markerOptions._cluster = {
      isRemoved: false,
      isAdded: false,
      geocell: geocell,
      _marker: null
    };

    //var marker = new Marker(self, markerId, markerOptions, "markercluster");
    //marker._cluster.isAdded = false;
    //marker.set("geocell", geocell, true);
    //marker.set("position", markerOptions.position, true);
    self._markerMap[markerId] = markerOptions;
    if (skipRedraw || !self._isReady) {
      return;
    }
    self.redraw({
      force: true
    });
  };
  self.addMarkers = function(markers) {
    if (utils.isArray(markers) || Array.isArray(markers)) {
      for (var i = 0; i < markers.length; i++) {
        self.addMarker(markers[i], true);
      }
      if (!self._isReady) {
        return;
      }
      self.redraw({
        force: true
      });
    }
  };

  map.on(event.CAMERA_MOVE_END, self._onCameraMoved.bind(self));
  window.addEventListener("orientationchange", self._onCameraMoved.bind(self));

  self.on("cluster_click", self.onClusterClicked);
  self.on("nextTask", function(){
    self._isWorking = false;
    if (self._stopRequest || self._isRemoved ||
        self.taskQueue.length === 0 || !self._isReady) {
      return;
    }
    self.redraw.call(self);
  });

  // self.redraw.call(self, {
  //   force: true
  // });

  if (self.debug) {
    self.debugTimer = setInterval(function() {
      console.log("self.taskQueue.push = " + self.taskQueue.length);
    }, 5000);
  }

  return self;
};

utils.extend(MarkerCluster, Overlay);

MarkerCluster.prototype.onClusterClicked = function(cluster) {
  if (this._isRemoved) {
    return null;
  }
  var self = this;
  var polygon = self.get("polygon");
  var bounds = cluster.getBounds();
  if (self.boundsDraw) {
    polygon.setPoints([
      bounds.southwest,
      {lat: bounds.northeast.lat, lng: bounds.southwest.lng},
      bounds.northeast,
      {lat: bounds.southwest.lat, lng: bounds.northeast.lng}
    ]);
    polygon.setVisible(true);
  }
  this.map.animateCamera({
    target: cluster.getBounds(),
    duration: 500
  }, function() {
    if (self.boundsDraw) {
      setTimeout(function() {
        polygon.setVisible(false);
      }, 500);
    }
  });
};

MarkerCluster.prototype._onCameraMoved = function() {
  var self = this;

  if (self._isRemoved || self._stopRequest || !self._isReady) {
    return null;
  }

  self.redraw({
    force: false
  });

};

MarkerCluster.prototype.remove = function(callback) {
  var self = this;
  self._stopRequest = self.hashCode;
  if (self._isRemoved) {
    if (typeof callback === "function") {
      return;
    } else {
      return Promise.resolve();
    }
  }
  if (self.debug) {
    clearInterval(self.debugTimer);
    self.self.debugTimer = undefined;
  }
  self._redraw = function(){};

  if (self._isWorking) {
    setTimeout(arguments.callee.bind(self), 20);
    return;
  }

  var keys;
  var resolution = self.get("resolution"),
    activeMarker = self.map.get("active_marker"),
    deleteClusters = [];

  self.taskQueue = [];
  Object.defineProperty(self, "_isRemoved", {
      value: true,
      writable: false
  });
  self.trigger("remove");

  var activeMarkerId = activeMarker ? activeMarker.getId() : null;
  if (resolution === self.OUT_OF_RESOLUTION) {
    while (self._clusters[resolution].length > 0) {
      markerOpts = self._clusters[resolution].shift();
      deleteClusters.push(markerOpts.__pgmId);
      if (markerOpts.__pgmId === activeMarkerId) {
        var marker = markerOpts._cluster.marker;
        if (!marker) {
          marker = self._createMarker(markerOpts);
          markerOpts._cluster.marker = marker;
        }
        marker.trigger(event.INFO_CLOSE);
        marker.hideInfoWindow();
      }
    }
  } else if (self._clusters[resolution]) {
    keys = Object.keys(self._clusters[resolution]);
    keys.forEach(function(geocell) {
      var cluster = self._clusters[resolution][geocell];
      var noClusterMode = cluster.getMode() === cluster.NO_CLUSTER_MODE;
      if (noClusterMode) {
        cluster.getMarkers().forEach(function(markerOpts, idx) {
          if (markerOpts.__pgmId === activeMarkerId) {
            var marker = markerOpts._cluster.marker;
            if (!marker) {
              marker = self._createMarker(markerOpts);
              markerOpts._cluster.marker = marker;
            }
            marker.trigger(event.INFO_CLOSE);
            marker.hideInfoWindow();
          }
          deleteClusters.push(markerOpts.__pgmId);
        });
      }
      if (!noClusterMode) {
        deleteClusters.push(geocell);
      }
      cluster.remove();
    });
  }


  var resolver = function(resolve, reject) {
    self.exec.call(self,
      resolve.bind(self),
      reject.bind(self),
      self.getPluginName(), 'remove', [self.getId()],
      {sync: true, remove: true});
  };

  var answer;
  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    result = new Promise(resolver);
  }

  keys = Object.keys(self._markerMap);
  keys.forEach(function(markerId) {
    delete self._markerMap[markerId]._cluster;
  });
  if (self.boundsDraw && self.get("polygon")) {
    self.get("polygon").remove();
  }
  self.off();

  return answer;
};
MarkerCluster.prototype.removeMarkerById = function(markerId) {
  var self = this;
  if (self._isRemoved) {
    return null;
  }
  //if (markerId.indexOf(self.id + "-") === -1) {
  //  markerId = self.id + "-" + markerId;
  //}
  var markerOpts = self._markerMap[markerId];
  if (!markerOpts) {
    return;
  }
  markerOpts._cluster.isRemoved = true;
  var marker = markerOpts._cluster.marker;

  var resolutionList = Object.keys(self._clusters);
  var resolution, geocellKey, cluster;
  for (var i = 0; i < resolutionList.length; i++) {
    resolution = parseInt(resolutionList[i], 10);
    geocellKey = markerOpts._cluster.geocell.substr(0, resolution + 1);
    if (geocellKey in self._clusters[resolution]) {
      cluster = self._clusters[resolution][geocellKey];
      if (cluster) {
        cluster.removeMarker(markerOpts);
      }
    }
  }

  var isAdded = markerOpts._cluster.isAdded;
  if (markerOpts._cluster.marker) {
    marker.remove();
    marker.destroy();
  }
  markerOpts._cluster.isRemoved = true;
  markerOpts._cluster.marker = undefined;
  //delete self._markerMap[markerId];
  if (isAdded) {
    self.exec.call(self, null, null, self.getPluginName(), 'redrawClusters', [self.getId(), {
      "delete": [markerId]
    }], {sync: true});
  }
};
MarkerCluster.prototype.getMarkerById = function(markerId) {
  var self = this;
  if (self._isRemoved) {
    return null;
  }
  //if (markerId.indexOf(self.id + "-") === -1) {
  //  markerId = self.id + "-" + markerId;
  //}
  var markerOpts = self._markerMap[markerId];
  if (!markerOpts) {
    return null;
  }
  var marker = markerOpts._cluster.marker;
  if (!marker) {
    marker = self._createMarker(markerOpts);
    markerOpts._cluster.marker = marker;
  }
  return marker;
};

MarkerCluster.prototype.getClusterByClusterId = function(clusterId) {
  var self = this;

  if (self._isRemoved) {
    return null;
  }
  var resolution = self.get("resolution");

  if (!self._clusters[resolution]) {
    return null;
  }

  var cluster = self._clusters[resolution][clusterId];
  return cluster;
};


MarkerCluster.prototype.redraw = function(params) {
  var self = this;
  if (self._isRemoved || self._stopRequest || !self._isReady) {
    return null;
  }

  self.taskQueue.push(params);
  if (self.debug) {
    console.log("self.taskQueue.push = " + self.taskQueue.length);
  }
  if (self._isRemoved || self._stopRequest || self.taskQueue.length > 1) {
    return;
  }
  if (self.debug) {
    self._clusterBounds.forEach(function(polyline, cb) {
      polyline.remove();
      cb();
    }, function() {
      self._clusterBounds.empty();
      var taskParams = self.taskQueue.pop();
      self.taskQueue.length = 0;
      var visibleRegion = self.map.getVisibleRegion();
      self._redraw.call(self, {
        visibleRegion: visibleRegion,
        force: taskParams.force
      });
    });
  } else {
    var taskParams = self.taskQueue.pop();
    self.taskQueue.length = 0;

    var visibleRegion = self.map.getVisibleRegion();
    self._redraw.call(self, {
      visibleRegion: visibleRegion,
      force: taskParams.force
    });
  }
};
MarkerCluster.prototype._redraw = function(params) {
  var self = this;

  if (self._isRemoved || self._stopRequest || self._isWorking || !self._isReady) {
    return null;
  }
  self._isWorking = true;
  var map = self.map,
    currentZoomLevel = self.map.getCameraZoom(),
    prevResolution = self.get("resolution");

  currentZoomLevel = currentZoomLevel < 0 ? 0 : currentZoomLevel;
  self.set("zoom", currentZoomLevel);

  var resolution = 1;
  resolution = self.maxZoomLevel > 3 && currentZoomLevel > 3 ? 2 : resolution;
  resolution = self.maxZoomLevel > 5 && currentZoomLevel > 5 ? 3 : resolution;
  resolution = self.maxZoomLevel > 7 && currentZoomLevel > 7 ? 4 : resolution;
  resolution = self.maxZoomLevel > 9 && currentZoomLevel > 9 ? 5 : resolution;
  resolution = self.maxZoomLevel > 11 && currentZoomLevel > 11 ? 6 : resolution;
  resolution = self.maxZoomLevel > 13 && currentZoomLevel > 13 ? 7 : resolution;
  resolution = self.maxZoomLevel > 15 && currentZoomLevel > 15 ? 8 : resolution;
  resolution = self.maxZoomLevel > 17 && currentZoomLevel > 17 ? 9 : resolution;
  resolution = self.maxZoomLevel > 19 && currentZoomLevel > 19 ? 10 : resolution;
  resolution = self.maxZoomLevel > 21 && currentZoomLevel > 21 ? 11 : resolution;

  //------------------------------------------------------------------------
  // If the current viewport contains the previous viewport,
  // and also the same resolution,
  // skip this task except the params.force = true (such as addMarker)
  //------------------------------------------------------------------------

  var cellLen = resolution + 1;
  var prevSWcell = self.get("prevSWcell");
  var prevNEcell = self.get("prevNEcell");

  var distanceA = spherical.computeDistanceBetween(params.visibleRegion.farRight, params.visibleRegion.farLeft);
  var distanceB = spherical.computeDistanceBetween(params.visibleRegion.farRight, params.visibleRegion.nearRight);
  params.clusterDistance = Math.min(distanceA, distanceB) / 4;
  var expandedRegion = params.visibleRegion;

  var swCell = geomodel.getGeocell(expandedRegion.southwest.lat, expandedRegion.southwest.lng, cellLen);
  var neCell = geomodel.getGeocell(expandedRegion.northeast.lat, expandedRegion.northeast.lng, cellLen);

  if (!params.force &&
    prevSWcell === swCell &&
    prevNEcell === neCell) {
    self.trigger("nextTask");
    return;
  }
  var nwCell = geomodel.getGeocell(expandedRegion.northeast.lat, expandedRegion.southwest.lng, cellLen);
  var seCell = geomodel.getGeocell(expandedRegion.southwest.lat, expandedRegion.northeast.lng, cellLen);

  if (currentZoomLevel > self.maxZoomLevel || resolution === 0) {
    resolution = self.OUT_OF_RESOLUTION;
  }
  self.set("resolution", resolution);
  //console.log("--->prevResolution = " + prevResolution + ", resolution = " + resolution);

  var targetMarkers = [];

  if (self._isRemoved || self._stopRequest) {
    self._isWorking = false;
    return;
  }
  //----------------------------------------------------------------
  // Remove the clusters that is in outside of the visible region
  //----------------------------------------------------------------
  if (resolution !== self.OUT_OF_RESOLUTION) {
    self._clusters[resolution] = self._clusters[resolution] || {};
  } else {
    self._clusters[resolution] = self._clusters[resolution] || [];
  }
  var deleteClusters = {};
  var keys, i, j;
  var ignoreGeocells = [];
  var allowGeocells = [swCell, neCell, nwCell, seCell];

  var pos, prevCell = "", cell;
  var coners = [
    expandedRegion.northeast,
    {lat: expandedRegion.northeast.lat, lng: expandedRegion.southwest.lng},
    expandedRegion.southwest,
    {lat: expandedRegion.southwest.lat, lng: expandedRegion.northeast.lng},
    expandedRegion.northeast
  ];
  for (j = 0; j < 4; j++) {
    for (i = 0.25; i < 1; i+= 0.25) {
      pos = plugin.google.maps.geometry.spherical.interpolate(coners[j], coners[j + 1], i);

      cell = geomodel.getGeocell(pos.lat, pos.lng, cellLen);
      if (allowGeocells.indexOf(cell) === -1) {
        allowGeocells.push(cell);
      }
    }
  }

  //console.log("---->548");
  var activeMarker = self.map.get("active_marker");
  var activeMarkerId = activeMarker ? activeMarker.getId() : null;
  if (prevResolution === self.OUT_OF_RESOLUTION) {
    if (resolution === self.OUT_OF_RESOLUTION) {
      //--------------------------------------
      // Just camera move, no zoom changed
      //--------------------------------------
      keys = Object.keys(self._markerMap);
      keys.forEach(function(markerId) {
        var markerOpts = self._markerMap[markerId];
        if (self._isRemoved ||
            self._stopRequest ||
            markerOpts._cluster.isRemoved ||
            markerOpts._cluster.isAdded) {
          return;
        }

        var geocell = markerOpts._cluster.geocell.substr(0, cellLen);
        if (ignoreGeocells.indexOf(geocell) > -1) {
          return;
        }

        if (allowGeocells.indexOf(geocell) > -1) {
          targetMarkers.push(markerOpts);
          return;
        }

        if (expandedRegion.contains(markerOpts.position)) {
          allowGeocells.push(geocell);
          targetMarkers.push(markerOpts);
        } else {
          ignoreGeocells.push(geocell);
        }
      });
    } else {
      //--------------
      // zoom out
      //--------------
      while(self._clusters[self.OUT_OF_RESOLUTION].length > 0) {
        markerOpts = self._clusters[self.OUT_OF_RESOLUTION].shift();
        self._markerMap[markerOpts.__pgmId]._cluster.isAdded = false;
        deleteClusters[markerOpts.__pgmId] = 1;

        if (self._markerMap[markerOpts.__pgmId].__pgmId === activeMarkerId) {
          var marker = self._markerMap[markerOpts.__pgmId]._cluster.marker;
          if (marker) {
            marker.trigger(event.INFO_CLOSE);
            marker.hideInfoWindow();
          }
        }
        if (self.debug) {
          console.log("---> (js:489)delete:" + markerOpts.__pgmId);
        }
      }
      keys = Object.keys(self._markerMap);
      keys.forEach(function(markerId) {
        var markerOpts = self._markerMap[markerId];
        if (self._isRemoved ||
            self._stopRequest ||
            markerOpts._cluster.isRemoved) {
          return;
        }

        var geocell = markerOpts._cluster.geocell.substr(0, cellLen);
        if (ignoreGeocells.indexOf(geocell) > -1) {
          return;
        }

        if (allowGeocells.indexOf(geocell) > -1) {
          targetMarkers.push(markerOpts);
          return;
        }

        if (expandedRegion.contains(markerOpts.position)) {
          allowGeocells.push(geocell);
          targetMarkers.push(markerOpts);
        } else {
          ignoreGeocells.push(geocell);
        }
      });
    }

  } else if (resolution === prevResolution) {
    //console.log("--->prevResolution(" + prevResolution + ") == resolution(" + resolution + ")");
    //--------------------------------------
    // Just camera move, no zoom changed
    //--------------------------------------

    keys = Object.keys(self._clusters[prevResolution]);
    keys.forEach(function(geocell) {
      if (self._isRemoved || self._stopRequest) {
        return;
      }
      var cluster = self._clusters[prevResolution][geocell];
      var bounds = cluster.getBounds();


      if (!self._isRemoved &&
        !expandedRegion.contains(bounds.northeast) &&
        !expandedRegion.contains(bounds.southwest)) {
          ignoreGeocells.push(geocell);

          if (cluster.getMode() === cluster.NO_CLUSTER_MODE) {
            cluster.getMarkers().forEach(function(markerOpts, idx) {
              deleteClusters[markerOpts.__pgmId] = 1;
              self._markerMap[markerOpts.__pgmId]._cluster.isAdded = false;
              if (self.debug) {
                console.log("---> (js:534)delete:" + markerOpts.__pgmId);
              }
              if (markerOpts.__pgmId === activeMarkerId) {
                var marker = markerOpts._cluster.marker;
                if (!marker) {
                  marker = self._createMarker(markerOpts);
                  markerOpts._cluster.marker = marker;
                }
                marker.trigger(event.INFO_CLOSE);
                marker.hideInfoWindow();
              }
            });
          } else {
            deleteClusters[geocell] = 1;
            if (self.debug) {
              console.log("---> (js:549)delete:" + geocell);
            }
          }
          cluster.remove();
          delete self._clusters[resolution][geocell];
      }
    });
    keys = Object.keys(self._markerMap);
    keys.forEach(function(markerId) {
      var markerOpts = self._markerMap[markerId];
      var geocell = markerOpts._cluster.geocell.substr(0, cellLen);
      if (self._isRemoved ||
          self._stopRequest ||
          markerOpts._cluster.isRemoved ||
          ignoreGeocells.indexOf(geocell) > -1 ||
          markerOpts._cluster.isAdded) {
        return;
      }

      if (allowGeocells.indexOf(geocell) > -1) {
        targetMarkers.push(markerOpts);
        return;
      }

      if (expandedRegion.contains(markerOpts.position)) {
        targetMarkers.push(markerOpts);
        allowGeocells.push(geocell);
      } else {
        ignoreGeocells.push(geocell);
        self._markerMap[markerOpts.__pgmId]._cluster.isAdded = false;
      }
    });

  } else if (prevResolution in self._clusters) {
    //console.log("--->prevResolution(" + prevResolution + ") != resolution(" + resolution + ")");

    if (prevResolution < resolution) {
      //--------------
      // zooming in
      //--------------
      keys = Object.keys(self._clusters[prevResolution]);
      keys.forEach(function(geocell) {
        if (self._isRemoved) {
          return;
        }
        var cluster = self._clusters[prevResolution][geocell];
        var noClusterMode = cluster.getMode() === cluster.NO_CLUSTER_MODE;
        cluster.getMarkers().forEach(function(markerOpts, idx) {
          if (self._isRemoved ||
              self._stopRequest) {
            return;
          }
          self._markerMap[markerOpts.__pgmId]._cluster.isAdded = false;
          //targetMarkers.push(markerOpts);
          if (noClusterMode) {
            if (self.debug) {
              console.log("---> (js:581)delete:" + markerOpts.__pgmId);
            }
            if (markerOpts.__pgmId === activeMarkerId) {
              var marker = markerOpts._cluster.marker;
              if (!marker) {
                marker = self._createMarker(markerOpts);
                markerOpts._cluster.marker = marker;
              }
              marker.trigger(event.INFO_CLOSE);
              marker.hideInfoWindow();
            }
            deleteClusters[markerOpts.__pgmId] = 1;
          }
        });
        if (!noClusterMode) {
          if (self.debug) {
            console.log("---> (js:597)delete:" + geocell);
          }
          deleteClusters[geocell] = 1;
        }
        cluster.remove();
      });
    } else {
      //--------------
      // zooming out
      //--------------
      keys = Object.keys(self._clusters[prevResolution]);
      keys.forEach(function(geocell) {
        if (self._stopRequest ||
            self._isRemoved) {
          return;
        }
        var cluster = self._clusters[prevResolution][geocell];
        var noClusterMode = cluster.getMode() === cluster.NO_CLUSTER_MODE;
        cluster.getMarkers().forEach(function(markerOpts, idx) {
          self._markerMap[markerOpts.__pgmId]._cluster.isAdded = false;
          if (noClusterMode) {
            if (self.debug) {
              console.log("---> (js:614)delete:" + markerOpts.__pgmId);
            }
            if (markerOpts.__pgmId === activeMarkerId) {
              var marker = markerOpts._cluster.marker;
              if (!marker) {
                marker = self._createMarker(markerOpts);
                self._markerMap[markerOpts.__pgmId]._cluster.marker = marker;
              }
              marker.trigger(event.INFO_CLOSE);
              marker.hideInfoWindow();
            }
            deleteClusters[markerOpts.__pgmId] = 1;
          }
          self._markerMap[markerOpts.__pgmId] = markerOpts;
        });
        if (!noClusterMode) {
          deleteClusters[geocell] = 1;
          if (self.debug) {
            console.log("---> (js:632)delete:" + geocell);
          }
        }
        cluster.remove();

        geocell = geocell.substr(0, cellLen);
      });
    }
    keys = Object.keys(self._markerMap);
    keys.forEach(function(markerId) {
      if (self._stopRequest ||
          self._isRemoved) {
        return;
      }
      var markerOpts = self._markerMap[markerId];
      var geocell = markerOpts._cluster.geocell.substr(0, cellLen);
      if (markerOpts._cluster.isRemoved ||
          ignoreGeocells.indexOf(geocell) > -1) {
        self._markerMap[markerOpts.__pgmId]._cluster.isAdded = false;
        return;
      }
      if (markerOpts._cluster.isAdded) {
        return;
      }

      if (allowGeocells.indexOf(geocell) > -1) {
        targetMarkers.push(markerOpts);
        return;
      }

      if (expandedRegion.contains(markerOpts.position)) {
        targetMarkers.push(markerOpts);
        allowGeocells.push(geocell);
      } else {
        ignoreGeocells.push(geocell);
        self._markerMap[markerOpts.__pgmId]._cluster.isAdded = false;
      }
    });
    delete self._clusters[prevResolution];
  } else {
    //console.log("-----> initialize");
    keys = Object.keys(self._markerMap);
    keys.forEach(function(markerId) {
      if (self._stopRequest ||
          self._isRemoved) {
        return;
      }
      var markerOpts = self._markerMap[markerId];
      var geocell = markerOpts._cluster.geocell.substr(0, cellLen);
      if (markerOpts._cluster.isRemoved ||
        ignoreGeocells.indexOf(geocell) > -1) {
        return;
      }

      if (allowGeocells.indexOf(geocell) > -1) {
        targetMarkers.push(markerOpts);
        return;
      }
      if (expandedRegion.contains(markerOpts.position)) {
        targetMarkers.push(markerOpts);
        allowGeocells.push(geocell);
      } else {
        ignoreGeocells.push(geocell);
      }
    });
  }

  if (self._stopRequest ||
      self._isRemoved) {
    self._isWorking = false;
    return;
  }
  if (self.debug) {
    console.log("targetMarkers = " + targetMarkers.length);
  }

  //--------------------------------
  // Pick up markers are containted in the current viewport.
  //--------------------------------
  var new_or_update_clusters = [];

  if (params.force ||
    resolution == self.OUT_OF_RESOLUTION ||
    resolution !== prevResolution ||
    prevSWcell !== swCell ||
    prevNEcell !== neCell) {

    self.set("prevSWcell", swCell);
    self.set("prevNEcell", neCell);

    if (resolution !== self.OUT_OF_RESOLUTION) {

      //------------------
      // Create clusters
      //------------------
      var prepareClusters = {};
      targetMarkers.forEach(function(markerOpts) {
        if (markerOpts._cluster.isAdded) {
          if (self.debug) {
            console.log("isAdded", markerOpts);
          }
          return;
        }
        var geocell = markerOpts._cluster.geocell.substr(0, resolution + 1);
        prepareClusters[geocell] = prepareClusters[geocell] || [];
        prepareClusters[geocell].push(markerOpts);

        var marker = markerOpts._cluster.marker;
        if (marker && marker.id === activeMarkerId) {
          marker.trigger(event.INFO_CLOSE);
          marker.hideInfoWindow();
        }
      });

      if (self.debug) {
        console.log("prepareClusters = ", prepareClusters, targetMarkers);
      }

      //------------------------------------------
      // Create/update clusters
      //------------------------------------------
      keys = Object.keys(prepareClusters);

      var sortedClusters = [];
      keys.forEach(function(geocell) {
        var cluster = self.getClusterByGeocellAndResolution(geocell, resolution);
        cluster.addMarkers(prepareClusters[geocell]);

        cluster._markerCenter = cluster.getBounds().getCenter();
        //cluster._distanceFrom0 = spherical.computeDistanceBetween({lat: 0, lng: 0}, cluster._markerCenter);
        sortedClusters.push(cluster);
      });

      sortedClusters = sortedClusters.sort(function(a, b) {
        return a.geocell.localeCompare(b.geocell);
      });

      //-------------------------
      // Union close clusters
      //-------------------------
      var cluster, anotherCluster, distance;
      var unionedMarkers = [];
      i = 0;
      var tmp, hit = false;
      while (i < sortedClusters.length) {
        cluster = sortedClusters[i];
        hit = false;
        for (j = i + 1; j < sortedClusters.length; j++) {
          anotherCluster = sortedClusters[j];
          distance = spherical.computeDistanceBetween(cluster._markerCenter, anotherCluster._markerCenter);
          if (distance < params.clusterDistance) {
            if (self.debug) {
              console.log("---> (js:763)delete:" + anotherCluster.geocell);
            }
            cluster.addMarkers(anotherCluster.getMarkers());
            deleteClusters[anotherCluster.getId()] = 1;
            delete self._clusters[resolution][anotherCluster.geocell];
            self._clusters[resolution][cluster.geocell] = cluster;
            i = j;
          } else {
            hit = true;
            break;
          }
        }
        i++;
        cluster._markerCnt= cluster.getItemLength();
        unionedMarkers.push(cluster);
      }

      unionedMarkers.forEach(function(cluster) {

        var icon = self.getClusterIcon(cluster),
            clusterOpts = {
              "count": cluster.getItemLength(),
              "position": cluster.getBounds().getCenter(),
              "__pgmId": cluster.getId()
            };

            if (self.debug) {
              clusterOpts.geocell = cluster.geocell;
            }

        if (icon) {
          clusterOpts.icon = icon;
          clusterOpts.isClusterIcon = true;
          if (cluster.getMode() === cluster.NO_CLUSTER_MODE) {
            cluster.getMarkers().forEach(function(markerOpts, idx) {
              deleteClusters[markerOpts.__pgmId] = 1;
              if (self.debug) {
                console.log("---> (js:800)delete:" + markerOpts.__pgmId);
              }
            });
          }
          if (self.debug) {
            console.log("---> (js:805)add:" + clusterOpts.__pgmId, icon);
            var geocell = clusterOpts.geocell.substr(0, cellLen);
            var bounds = self._geocellBounds[geocell] || geomodel.computeBox(geocell);
            self._geocellBounds[geocell] = bounds;
            self.map.addPolyline({
              color: "blue",
              points: [
                bounds.southwest,
                {lat: bounds.southwest.lat, lng: bounds.northeast.lng},
                bounds.northeast,
                {lat: bounds.northeast.lat, lng: bounds.southwest.lng},
                bounds.southwest
              ]
            }, function(polyline) {
              self._clusterBounds.push(polyline);
            });
          }
          cluster.setMode(cluster.CLUSTER_MODE);
          new_or_update_clusters.push(clusterOpts);
          return;
        }

        cluster.getMarkers().forEach(function(markerOpts, idx) {
          if (!markerOpts._cluster.isAdded) {
            return;
          }
          delete deleteClusters[markerOpts.__pgmId];
          markerOpts.isClusterIcon = false;
          if (self.debug) {
            console.log("---> (js:831)add:" + markerOpts.__pgmId + ", isAdded = " + markerOpts._cluster.isAdded);
            markerOpts.title= markerOpts.__pgmId;
          }
          new_or_update_clusters.push(markerOpts);
        });
        cluster.setMode(cluster.NO_CLUSTER_MODE);
      });
    } else {
      cellLen = swCell.length;
      var allowGeocell = [];
      var ignoreGeocell = [];
      targetMarkers.forEach(function(markerOpts) {
        if (markerOpts._cluster.isAdded) {
          return;
        }
        markerOpts.isClusterIcon = false;
        if (self.debug) {
          console.log("---> (js:859)add:" + markerOpts.__pgmId);
          markerOpts.title= markerOpts.__pgmId;
        }
        delete deleteClusters[markerOpts.__pgmId];
        self._markerMap[markerOpts.__pgmId]._cluster.isAdded = true;
        new_or_update_clusters.push(markerOpts);
        self._clusters[self.OUT_OF_RESOLUTION].push(markerOpts);
      });
    }
  }
  var delete_clusters = Object.keys(deleteClusters);

  if (self._stopRequest ||
      new_or_update_clusters.length === 0 && delete_clusters.length === 0) {
    self.trigger("nextTask");
    return;
  }

  if (self._stopRequest ||
      self._isRemoved) {
    self._isWorking = false;
    return;
  }

  self.exec.call(self, function(allResults) {
    var markerIDs = Object.keys(allResults);
    markerIDs.forEach(function(markerId) {
      if (!self._markerMap[markerId]) {
        return;
      }
      var size = allResults[markerId];
      if (typeof self._markerMap[markerId].icon === 'string') {
        self._markerMap[markerId].icon = {
          'url': self._markerMap[markerId].icon,
          'size': size,
          'anchor': [size.width / 2, size.height]
        };
      } else {
        self._markerMap[markerId].icon = self._markerMap[markerId].icon || {};
        self._markerMap[markerId].icon.size = self._markerMap[markerId].icon.size || size;
        self._markerMap[markerId].icon.anchor = self._markerMap[markerId].icon.anchor || [size.width / 2, size.height];
      }
      self._markerMap[markerId].infoWindowAnchor = self._markerMap[markerId].infoWindowAnchor || [self._markerMap[markerId].icon.size.width / 2, 0];
    });
    self.trigger("nextTask");
  }, self.errorHandler, self.getPluginName(), 'redrawClusters', [self.getId(), {
    "resolution": resolution,
    "new_or_update": new_or_update_clusters,
    "delete": delete_clusters
  }], {sync: true});
/*
    console.log({
                    "resolution": resolution,
                    "new_or_update": new_or_update_clusters,
                    "delete": delete_clusters
                  });
*/
};

MarkerCluster.prototype.getClusterIcon = function(cluster) {
  var self = this,
      hit,
      clusterCnt = cluster.getItemLength();

  for (var i = 0; i < self.icons.length; i++) {
    hit = false;
    if ("min" in self.icons[i]) {
      if (clusterCnt >= self.icons[i].min) {
        if ("max" in self.icons[i]) {
          hit = (clusterCnt <= self.icons[i].max);
        } else {
          hit = true;
        }
      }
    } else {
      if ("max" in self.icons[i]) {
        hit = (clusterCnt <= self.icons[i].max);
      }
    }
    if (hit) {
      return self.icons[i];
    }
  }
  return null;
};

MarkerCluster.prototype._createMarker = function(markerOpts) {
  var markerId = markerOpts.__pgmId;
  var self = this;
  var marker = new Marker(self.getMap(), markerOpts, exec, {
    className: "MarkerCluster",
    id: self.id + "-" + markerId
  });
  marker._privateInitialize(markerOpts);
  delete marker._privateInitialize;

  function updateProperty(prevValue, newValue, key) {
    self._markerMap[markerId][key] = newValue;
  }
  marker.on("title_changed", updateProperty);
  marker.on("snippet_changed", updateProperty);
  marker.on("animation_changed", updateProperty);
  marker.on("infoWindowAnchor_changed", updateProperty);
  marker.on("opacity_changed", updateProperty);
  marker.on("zIndex_changed", updateProperty);
  marker.on("visible_changed", updateProperty);
  marker.on("draggable_changed", updateProperty);
  marker.on("position_changed", updateProperty);
  marker.on("rotation_changed", updateProperty);
  marker.on("flat_changed", updateProperty);
  marker.on("icon_changed", updateProperty);
  marker.one(marker.getId() + "_remove", function() {
    self.removeMarkerById(markerId);
  });
  return marker;
};

MarkerCluster.prototype.getClusterByGeocellAndResolution = function(geocell, resolution) {
  var self = this;
  geocell = geocell.substr(0, resolution + 1);

  var cluster = self._clusters[resolution][geocell];
  if (!cluster) {
    cluster = new Cluster(geocell, geocell);
    self._clusters[resolution][geocell] = cluster;
  }
  return cluster;
};

return MarkerCluster;

});

},{"./BaseArrayClass":1,"./Cluster":5,"./Common":6,"./LatLng":11,"./LatLngBounds":12,"./Marker":15,"./Overlay":17,"./argscheck":23,"./event":25,"./geomodel":27,"./spherical":31,"./utils":32}],17:[function(require,module,exports){
 (function(root, factory){
  if (typeof define === 'function') {
  cordova.define("cordova-plugin-googlemaps.Overlay", function(require, exports, module) {
                 module.exports = factory(require);
                 });
  } else if (typeof exports === 'object') {
  module.exports = factory(require);
  } else {
  root.returnExports = factory();
  }
  })(this, function(require) {

var BaseClass = require('./BaseClass'),
    utils = require('./utils'),
    BaseArrayClass = require('./BaseArrayClass');


/*****************************************************************************
 * Overlay Class
 *****************************************************************************/
var Overlay = function(map, options, className, _exec, extras) {
  extras = extras || {};
  BaseClass.apply(this);

  var self = this;

  //-----------------------------------------------
  // Sets the initialize option to each property
  //-----------------------------------------------
  var ignores = ["map", "id", "hashCode", "type"];
  if (extras.ignores) {
    ignores = ignores.concat(extras.ignores);
  }
  for (var key in options) {
      if (ignores.indexOf(key) === -1) {
          self.set(key, options[key]);
      }
  }

  //-------------------------------------------------------------------------------
  // If app code wants to execute some method before `_isReady = true`,
  // just stack in to the internal queue.
  // If this overlay is ready, execute it.
  //-------------------------------------------------------------------------------
  var cmdQueue = new BaseArrayClass();
  cmdQueue.on('insert_at', function() {
    if (!self._isReady) {
      return;
    }
    var cmd;
    while(cmdQueue.getLength() > 0) {
      cmd = cmdQueue.removeAt(0, true);
      if (cmd && cmd.target && cmd.args && cmd.args[0] !== "nop") {
        _exec.apply(cmd.target, cmd.args);
      }
    }
  });


  Object.defineProperty(self, "_cmdQueue", {
    enumerable: false,
    value: cmdQueue,
    writable: false
  });

  Object.defineProperty(self, "_isReady", {
    value: false,
    writable: true
  });
  Object.defineProperty(self, "map", {
    value: map,
    writable: false
  });
  Object.defineProperty(self, "id", {
    value: extras.id || (className.toLowerCase()) + "_" + this.hashCode,
    writable: false
  });
  Object.defineProperty(self, "type", {
    value: className,
    writable: false
  });

  Object.defineProperty(self, "getPluginName", {
    writable: false,
    value: function() {
      return this.map.getId() + "-" + className.toLowerCase();
    }
  });
};

utils.extend(Overlay, BaseClass);

Overlay.prototype._privateInitialize = function(options) {
  var self = this;
  //-----------------------------------------------
  // Sets the initialize option to each property
  //-----------------------------------------------
  if (options) {
    var ignores = ["map", "id", "hashCode", "type"];
    for (var key in options) {
      if (ignores.indexOf(key) === -1) {
        self.set(key, options[key], true);
      }
    }
  }

  //-----------------------------------------------
  // Trigger internal command queue
  //-----------------------------------------------
  Object.defineProperty(self, "_isReady", {
    value: true,
    writable: false
  });
  self.exec("nop");
};


Overlay.prototype.exec = function() {
  this._cmdQueue.push.call(this._cmdQueue, {
    target: this,
    args: Array.prototype.slice.call(arguments, 0)
  });
};
Overlay.prototype.getId = function() {
  return this.id;
};
Overlay.prototype.getMap = function() {
  return this.map;
};
Overlay.prototype.getHashCode = function() {
  return this.hashCode;
};

return Overlay;

});

},{"./BaseArrayClass":1,"./BaseClass":2,"./utils":32}],18:[function(require,module,exports){
 (function(root, factory){
  if (typeof define === 'function') {
  cordova.define("cordova-plugin-googlemaps.Polygon", function(require, exports, module) {
                 module.exports = factory(require);
                 });
  } else if (typeof exports === 'object') {
  module.exports = factory(require);
  } else {
  root.returnExports = factory();
  }
  })(this, function(require) {

var argscheck = require('./argscheck'),
  utils = require('./utils'),
  common = require('./Common'),
  Overlay = require('./Overlay'),
  BaseArrayClass = require('./BaseArrayClass');

/*****************************************************************************
 * Polygon Class
 *****************************************************************************/
var Polygon = function (map, polygonOptions, _exec) {
  Overlay.call(this, map, polygonOptions, 'Polygon', _exec);

  var self = this;
  var polygonId = this.getId();

  //--------------------------
  // points property
  //--------------------------
  var pointsProperty = common.createMvcArray(polygonOptions.points);
  pointsProperty.on('set_at', function (index) {
    var value = common.getLatLng(pointsProperty.getAt(index));
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setPointAt', [polygonId, index, value]);
  });
  pointsProperty.on('insert_at', function (index) {
    var value = common.getLatLng(pointsProperty.getAt(index));
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'insertPointAt', [polygonId, index, value]);
  });
  pointsProperty.on('remove_at', function (index) {
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'removePointAt', [polygonId, index]);
  });

  Object.defineProperty(self, "points", {
    value: pointsProperty,
    writable: false
  });
  //--------------------------
  // holes property
  //--------------------------
  var holesProperty = common.createMvcArray(polygonOptions.holes);
  var _holes = common.createMvcArray(holesProperty.getArray());

  holesProperty.on('set_at', function (index) {
    var value = common.getLatLng(holesProperty.getAt(index));
    _holes.setAt(index, value);
  });
  holesProperty.on('remove_at', function (index) {
    _holes.removeAt(index);
  });
  holesProperty.on('insert_at', function (index) {
    var array = holesProperty.getAt(index);
    if (array && (array instanceof Array || Array.isArray(array))) {
      array = common.createMvcArray(array);
    }
    array.on('insert_at', function (idx) {
      var value = common.getLatLng(array.getAt(idx));
      self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'insertPointOfHoleAt', [polygonId, index, idx, value]);
    });
    array.on('set_at', function (idx) {
      var value = common.getLatLng(array.getAt(idx));
      self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setPointOfHoleAt', [polygonId, index, idx, value]);
    });
    array.on('remove_at', function (idx) {
      self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'removePointOfHoleAt', [polygonId, index, idx]);
    });

    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'insertHoleAt', [polygonId, index, array.getArray()]);
  });

  Object.defineProperty(self, "holes", {
    value: holesProperty,
    writable: false
  });

  //--------------------------
  // other properties
  //--------------------------.
  // var ignores = ["map", "id", "hashCode", "type", "points", "holes"];
  // for (var key in polygonOptions) {
  //   if (ignores.indexOf(key) === -1) {
  //     self.set(key, polygonOptions[key]);
  //   }
  // }
  //-----------------------------------------------
  // Sets event listeners
  //-----------------------------------------------
  self.on("clickable_changed", function () {
    var clickable = self.get("clickable");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setClickable', [self.getId(), clickable]);
  });
  self.on("geodesic_changed", function () {
    var geodesic = self.get("geodesic");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setGeodesic', [self.getId(), geodesic]);
  });
  self.on("zIndex_changed", function () {
    var zIndex = self.get("zIndex");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setZIndex', [self.getId(), zIndex]);
  });
  self.on("visible_changed", function () {
    var visible = self.get("visible");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setVisible', [self.getId(), visible]);
  });
  self.on("strokeWidth_changed", function () {
    var width = self.get("strokeWidth");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setStrokeWidth', [self.getId(), width]);
  });
  self.on("strokeColor_changed", function () {
    var color = self.get("strokeColor");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setStrokeColor', [self.getId(), common.HTMLColor2RGBA(color, 0.75)]);
  });
  self.on("fillColor_changed", function () {
    var color = self.get("fillColor");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setFillColor', [self.getId(), common.HTMLColor2RGBA(color, 0.75)]);
  });

};

utils.extend(Polygon, Overlay);

Polygon.prototype.remove = function (callback) {
  var self = this;
  if (self._isRemoved) {
    if (typeof callback === "function") {
      return;
    } else {
      return Promise.resolve();
    }
  }
  Object.defineProperty(self, "_isRemoved", {
    value: true,
    writable: false
  });
  self.trigger(this.id + "_remove");

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      function() {
        self.destroy();
        resolve.call(self);
      },
      reject.bind(self),
      self.getPluginName(), 'remove', [self.getId()], {
        remove: true
      });
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }

};

Polygon.prototype.setPoints = function (points) {
  var self = this;
  var mvcArray = self.points;
  mvcArray.empty(true);

  var i,
    path = [];

  for (i = 0; i < points.length; i++) {
    mvcArray.push(common.getLatLng(points[i]), true);
  }
  self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setPoints', [self.id, mvcArray.getArray()]);
  return self;
};
Polygon.prototype.getPoints = function () {
  return this.points;
};
Polygon.prototype.setHoles = function (holes) {
  var self = this;
  var mvcArray = this.holes;
  mvcArray.empty(true);

  holes = holes || [];
  if (holes.length > 0 && !utils.isArray(holes[0])) {
    holes = [holes];
  }
  holes.forEach(function (hole) {
    if (!utils.isArray(hole)) {
      hole = [hole];
      mvcArray.push(hole, true);
    } else {
      var newHole = [];
      for (var i = 0; i < hole.length; i++) {
        newHole.push(common.getLatLng(hole[i]));
      }
      mvcArray.push(newHole, true);
    }
  });
  self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setHoles', [self.id, mvcArray.getArray()]);
  return this;
};
Polygon.prototype.getHoles = function () {
  return this.holes;
};
Polygon.prototype.setFillColor = function (color) {
  this.set('fillColor', color);
  return this;
};
Polygon.prototype.getFillColor = function () {
  return this.get('fillColor');
};
Polygon.prototype.setStrokeColor = function (color) {
  this.set('strokeColor', color);
  return this;
};
Polygon.prototype.getStrokeColor = function () {
  return this.get('strokeColor');
};
Polygon.prototype.setStrokeWidth = function (width) {
  this.set('strokeWidth', width);
  return this;
};
Polygon.prototype.getStrokeWidth = function () {
  return this.get('strokeWidth');
};
Polygon.prototype.setVisible = function (visible) {
  visible = common.parseBoolean(visible);
  this.set('visible', visible);
  return this;
};
Polygon.prototype.getVisible = function () {
  return this.get('visible');
};
Polygon.prototype.setClickable = function (clickable) {
  clickable = common.parseBoolean(clickable);
  this.set('clickable', clickable);
  return this;
};
Polygon.prototype.getClickable = function () {
  return this.get('clickable');
};
Polygon.prototype.setGeodesic = function (geodesic) {
  geodesic = common.parseBoolean(geodesic);
  this.set('geodesic', geodesic);
  return this;
};
Polygon.prototype.getGeodesic = function () {
  return this.get('geodesic');
};
Polygon.prototype.setZIndex = function (zIndex) {
  this.set('zIndex', zIndex);
  return this;
};
Polygon.prototype.getZIndex = function () {
  return this.get('zIndex');
};

return Polygon;

});

},{"./BaseArrayClass":1,"./Common":6,"./Overlay":17,"./argscheck":23,"./utils":32}],19:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.Polyline", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

var argscheck = require('./argscheck'),
  utils = require('./utils'),
  common = require('./Common'),
  Overlay = require('./Overlay'),
  BaseArrayClass = require('./BaseArrayClass');

/*****************************************************************************
 * Polyline Class
 *****************************************************************************/
var Polyline = function (map, polylineOptions, _exec) {
  Overlay.call(this, map, polylineOptions, 'Polyline', _exec, {
    "ignores": ["points"]
  });

  var self = this;
  var polylineId = this.getId();

  var pointsProperty = common.createMvcArray(polylineOptions.points);
  pointsProperty.on('set_at', function (index) {
    if (self._isRemoved) return;
    var value = common.getLatLng(pointsProperty.getAt(index));
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setPointAt', [polylineId, index, value]);
  });
  pointsProperty.on('insert_at', function (index) {
    if (self._isRemoved) return;
    var value = common.getLatLng(pointsProperty.getAt(index));
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'insertPointAt', [polylineId, index, value]);
  });
  pointsProperty.on('remove_at', function (index) {
    if (self._isRemoved) return;
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'removePointAt', [polylineId, index]);
  });

  Object.defineProperty(self, "points", {
    value: pointsProperty,
    writable: false
  });
  //-----------------------------------------------
  // Sets the initialize option to each property
  //-----------------------------------------------
  // var ignores = ["map", "id", "hashCode", "type", "points"];
  // for (var key in polylineOptions) {
  //   if (ignores.indexOf(key) === -1) {
  //     self.set(key, polylineOptions[key]);
  //   }
  // }

  //-----------------------------------------------
  // Sets event listeners
  //-----------------------------------------------
  self.on("geodesic_changed", function () {
    if (self._isRemoved) return;
    var geodesic = self.get("geodesic");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setGeodesic', [self.getId(), geodesic]);
  });
  self.on("zIndex_changed", function () {
    if (self._isRemoved) return;
    var zIndex = self.get("zIndex");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setZIndex', [self.getId(), zIndex]);
  });
  self.on("clickable_changed", function () {
    if (self._isRemoved) return;
    var clickable = self.get("clickable");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setClickable', [self.getId(), clickable]);
  });
  self.on("visible_changed", function () {
    if (self._isRemoved) return;
    var visible = self.get("visible");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setVisible', [self.getId(), visible]);
  });
  self.on("strokeWidth_changed", function () {
    if (self._isRemoved) return;
    var strokeWidth = self.get("strokeWidth");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setStrokeWidth', [self.getId(), strokeWidth]);
  });
  self.on("strokeColor_changed", function () {
    if (self._isRemoved) return;
    var color = self.get("strokeColor");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setStrokeColor', [self.getId(), common.HTMLColor2RGBA(color, 0.75)]);
  });

};

utils.extend(Polyline, Overlay);

Polyline.prototype.setPoints = function (points) {
  var self = this;
  var mvcArray = self.points;
  mvcArray.empty(true);

  var i,
    path = [];

  for (i = 0; i < points.length; i++) {
    mvcArray.push({
      "lat": points[i].lat,
      "lng": points[i].lng
    }, true);
  }
  self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setPoints', [self.id, mvcArray.getArray()]);
  return self;
};
Polyline.prototype.getPoints = function () {
  return this.points;
};
Polyline.prototype.setStrokeColor = function (color) {
  this.set('strokeColor', color);
  return this;
};
Polyline.prototype.getStrokeColor = function () {
  return this.get('strokeColor');
};
Polyline.prototype.setStrokeWidth = function (width) {
  this.set('strokeWidth', width);
  return this;
};
Polyline.prototype.getStrokeWidth = function () {
  return this.get('strokeWidth');
};
Polyline.prototype.setVisible = function (visible) {
  visible = common.parseBoolean(visible);
  this.set('visible', visible);
  return this;
};
Polyline.prototype.getVisible = function () {
  return this.get('visible');
};
Polyline.prototype.setClickable = function (clickable) {
  clickable = common.parseBoolean(clickable);
  this.set('clickable', clickable);
  return this;
};
Polyline.prototype.getClickable = function () {
  return this.get('clickable');
};
Polyline.prototype.setGeodesic = function (geodesic) {
  geodesic = common.parseBoolean(geodesic);
  this.set('geodesic', geodesic);
  return this;
};
Polyline.prototype.getGeodesic = function () {
  return this.get('geodesic');
};
Polyline.prototype.setZIndex = function (zIndex) {
  this.set('zIndex', zIndex);
  return this;
};
Polyline.prototype.getZIndex = function () {
  return this.get('zIndex');
};

Polyline.prototype.remove = function () {
  var self = this;
  if (self._isRemoved) {
    if (typeof callback === "function") {
      return;
    } else {
      return Promise.resolve();
    }
  }
  Object.defineProperty(self, "_isRemoved", {
    value: true,
    writable: false
  });

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      function() {
        self.destroy();
        resolve.call(self);
      },
      reject.bind(self),
      self.getPluginName(), 'remove', [self.getId()], {
        remove: true
      });
  };

  var result;
  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    result = new Promise(resolver);
  }

  if (self.points) {
    self.points.empty();
  }
  self.trigger(self.id + "_remove");

  return result;
};
return Polyline;

});

},{"./BaseArrayClass":1,"./Common":6,"./Overlay":17,"./argscheck":23,"./utils":32}],20:[function(require,module,exports){
(function (global){
cordova.define("cordova-plugin-googlemaps.Promise", function(require, exports, module) {
// Copyright (c) 2013 Forbes Lindesay
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
!function n(t,e,r){function o(u,f){if(!e[u]){if(!t[u]){var c="function"==typeof require&&require;if(!f&&c)return c(u,!0);if(i)return i(u,!0);var s=new Error("Cannot find module '"+u+"'");throw s.code="MODULE_NOT_FOUND",s}var l=e[u]={exports:{}};t[u][0].call(l.exports,function(n){var e=t[u][1][n];return o(e?e:n)},l,l.exports,n,t,e,r)}return e[u].exports}for(var i="function"==typeof require&&require,u=0;u<r.length;u++)o(r[u]);return o}({1:[function(n,t,e){"use strict";function r(){}function o(n){try{return n.then}catch(t){return d=t,w}}function i(n,t){try{return n(t)}catch(e){return d=e,w}}function u(n,t,e){try{n(t,e)}catch(r){return d=r,w}}function f(n){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof n)throw new TypeError("not a function");this._37=0,this._12=null,this._59=[],n!==r&&v(n,this)}function c(n,t,e){return new n.constructor(function(o,i){var u=new f(r);u.then(o,i),s(n,new p(t,e,u))})}function s(n,t){for(;3===n._37;)n=n._12;return 0===n._37?void n._59.push(t):void y(function(){var e=1===n._37?t.onFulfilled:t.onRejected;if(null===e)return void(1===n._37?l(t.promise,n._12):a(t.promise,n._12));var r=i(e,n._12);r===w?a(t.promise,d):l(t.promise,r)})}function l(n,t){if(t===n)return a(n,new TypeError("A promise cannot be resolved with itself."));if(t&&("object"==typeof t||"function"==typeof t)){var e=o(t);if(e===w)return a(n,d);if(e===n.then&&t instanceof f)return n._37=3,n._12=t,void h(n);if("function"==typeof e)return void v(e.bind(t),n)}n._37=1,n._12=t,h(n)}function a(n,t){n._37=2,n._12=t,h(n)}function h(n){for(var t=0;t<n._59.length;t++)s(n,n._59[t]);n._59=null}function p(n,t,e){this.onFulfilled="function"==typeof n?n:null,this.onRejected="function"==typeof t?t:null,this.promise=e}function v(n,t){var e=!1,r=u(n,function(n){e||(e=!0,l(t,n))},function(n){e||(e=!0,a(t,n))});e||r!==w||(e=!0,a(t,d))}var y=n("asap/raw"),d=null,w={};t.exports=f,f._99=r,f.prototype.then=function(n,t){if(this.constructor!==f)return c(this,n,t);var e=new f(r);return s(this,new p(n,t,e)),e}},{"asap/raw":4}],2:[function(n,t,e){"use strict";function r(n){var t=new o(o._99);return t._37=1,t._12=n,t}var o=n("./core.js");t.exports=o;var i=r(!0),u=r(!1),f=r(null),c=r(void 0),s=r(0),l=r("");o.resolve=function(n){if(n instanceof o)return n;if(null===n)return f;if(void 0===n)return c;if(n===!0)return i;if(n===!1)return u;if(0===n)return s;if(""===n)return l;if("object"==typeof n||"function"==typeof n)try{var t=n.then;if("function"==typeof t)return new o(t.bind(n))}catch(e){return new o(function(n,t){t(e)})}return r(n)},o.all=function(n){var t=Array.prototype.slice.call(n);return new o(function(n,e){function r(u,f){if(f&&("object"==typeof f||"function"==typeof f)){if(f instanceof o&&f.then===o.prototype.then){for(;3===f._37;)f=f._12;return 1===f._37?r(u,f._12):(2===f._37&&e(f._12),void f.then(function(n){r(u,n)},e))}var c=f.then;if("function"==typeof c){var s=new o(c.bind(f));return void s.then(function(n){r(u,n)},e)}}t[u]=f,0===--i&&n(t)}if(0===t.length)return n([]);for(var i=t.length,u=0;u<t.length;u++)r(u,t[u])})},o.reject=function(n){return new o(function(t,e){e(n)})},o.race=function(n){return new o(function(t,e){n.forEach(function(n){o.resolve(n).then(t,e)})})},o.prototype["catch"]=function(n){return this.then(null,n)}},{"./core.js":1}],3:[function(n,t,e){"use strict";function r(){if(c.length)throw c.shift()}function o(n){var t;t=f.length?f.pop():new i,t.task=n,u(t)}function i(){this.task=null}var u=n("./raw"),f=[],c=[],s=u.makeRequestCallFromTimer(r);t.exports=o,i.prototype.call=function(){try{this.task.call()}catch(n){o.onerror?o.onerror(n):(c.push(n),s())}finally{this.task=null,f[f.length]=this}}},{"./raw":4}],4:[function(n,t,e){(function(n){"use strict";function e(n){f.length||(u(),c=!0),f[f.length]=n}function r(){for(;s<f.length;){var n=s;if(s+=1,f[n].call(),s>l){for(var t=0,e=f.length-s;e>t;t++)f[t]=f[t+s];f.length-=s,s=0}}f.length=0,s=0,c=!1}function o(n){var t=1,e=new a(n),r=document.createTextNode("");return e.observe(r,{characterData:!0}),function(){t=-t,r.data=t}}function i(n){return function(){function t(){clearTimeout(e),clearInterval(r),n()}var e=setTimeout(t,0),r=setInterval(t,50)}}t.exports=e;var u,f=[],c=!1,s=0,l=1024,a=n.MutationObserver||n.WebKitMutationObserver;u="function"==typeof a?o(r):i(r),e.requestFlush=u,e.makeRequestCallFromTimer=i}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],5:[function(n,t,e){"function"!=typeof Promise.prototype.done&&(Promise.prototype.done=function(n,t){var e=arguments.length?this.then.apply(this,arguments):this;e.then(null,function(n){setTimeout(function(){throw n},0)})})},{}],6:[function(n,t,e){n("asap");"undefined"==typeof Promise&&(Promise=n("./lib/core.js"),n("./lib/es6-extensions.js")),n("./polyfill-done.js")},{"./lib/core.js":1,"./lib/es6-extensions.js":2,"./polyfill-done.js":5,asap:3}]},{},[6]);


});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],21:[function(require,module,exports){
 (function(root, factory){
  if (typeof define === 'function') {
  cordova.define("cordova-plugin-googlemaps.TileOverlay", function(require, exports, module) {
                 module.exports = factory(require);
                 });
  } else if (typeof exports === 'object') {
  module.exports = factory(require);
  } else {
  root.returnExports = factory();
  }
  })(this, function(require) {

var argscheck = require('./argscheck'),
  utils = require('./utils'),
  common = require('./Common'),
  Overlay = require('./Overlay');

/*****************************************************************************
 * TileOverlay Class
 *****************************************************************************/
var TileOverlay = function (map, tileOverlayOptions, _exec) {
  Overlay.call(this, map, tileOverlayOptions, 'TileOverlay', _exec);

  var self = this;

  //-----------------------------------------------
  // Sets event listeners
  //-----------------------------------------------
  self.on("fadeIn_changed", function () {
    var fadeIn = self.get("fadeIn");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setFadeIn', [self.getId(), fadeIn]);
  });
  self.on("opacity_changed", function () {
    var opacity = self.get("opacity");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setOpacity', [self.getId(), opacity]);
  });
  self.on("zIndex_changed", function () {
    var zIndex = self.get("zIndex");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setZIndex', [self.getId(), zIndex]);
  });
  self.on("visible_changed", function () {
    var visible = self.get("visible");
    self.exec.call(self, null, self.errorHandler, self.getPluginName(), 'setVisible', [self.getId(), visible]);
  });
};

utils.extend(TileOverlay, Overlay);

TileOverlay.prototype.getPluginName = function () {
  return this.map.getId() + "-tileoverlay";
};

TileOverlay.prototype.getHashCode = function () {
  return this.hashCode;
};

TileOverlay.prototype.getMap = function () {
  return this.map;
};
TileOverlay.prototype.getId = function () {
  return this.id;
};
TileOverlay.prototype.getTileSize = function () {
  return this.get("tileSize");
};
TileOverlay.prototype.getZIndex = function () {
  return this.get("zIndex");
};
TileOverlay.prototype.setZIndex = function (zIndex) {
  this.set('zIndex', zIndex);
};
TileOverlay.prototype.setFadeIn = function (fadeIn) {
  fadeIn = common.parseBoolean(fadeIn);
  this.set('fadeIn', fadeIn);
};
TileOverlay.prototype.getFadeIn = function () {
  return this.get('fadeIn');
};
TileOverlay.prototype.setVisible = function (visible) {
  visible = common.parseBoolean(visible);
  this.set('visible', visible);
};
TileOverlay.prototype.getOpacity = function () {
  return this.get('opacity');
};
TileOverlay.prototype.setOpacity = function (opacity) {
  if (!opacity && opacity !== 0) {
    console.log('opacity value must be int or double');
    return false;
  }
  this.set('opacity', opacity);
};
TileOverlay.prototype.getVisible = function () {
  return this.get('visible');
};

TileOverlay.prototype.remove = function (callback) {
  var self = this;
  if (self._isRemoved) {
    if (typeof callback === "function") {
      return;
    } else {
      return Promise.resolve();
    }
  }
  Object.defineProperty(self, "_isRemoved", {
    value: true,
    writable: false
  });
  self.trigger(self.id + "_remove");

  var resolver = function(resolve, reject) {
    self.exec.call(self,
      function() {
        self.destroy();
        resolve.call(self);
      },
      reject.bind(self),
      self.getPluginName(), 'remove', [self.getId()], {
        remove: true
      });
  };

  if (typeof callback === "function") {
    resolver(callback, self.errorHandler);
  } else {
    return new Promise(resolver);
  }

};

return TileOverlay;

});

},{"./Common":6,"./Overlay":17,"./argscheck":23,"./utils":32}],22:[function(require,module,exports){
(function(root, factory){
 if (typeof define === 'function') {
 cordova.define("cordova-plugin-googlemaps.VisibleRegion", function(require, exports, module) {
                module.exports = factory(require);
                });
 } else if (typeof exports === 'object') {
 module.exports = factory(require);
 } else {
 root.returnExports = factory();
 }
 })(this, function(require) {

var utils = require('./utils'),
    LatLngBounds = require('./LatLngBounds'),
    LatLng = require('./LatLng');

/*****************************************************************************
 * VisibleRegion Class
 *****************************************************************************/
var VisibleRegion = function(southwest, northeast, farLeft, farRight, nearLeft, nearRight) {
  Object.defineProperty(this, "type", {
      value: "VisibleRegion",
      writable: false
  });
  this.southwest = southwest;
  this.northeast = northeast;
  this.farLeft = farLeft;
  this.farRight = farRight;
  this.nearLeft = nearLeft;
  this.nearRight = nearRight;
};

utils.extend(VisibleRegion, LatLngBounds);

delete VisibleRegion.prototype.extend;
delete VisibleRegion.prototype.getCenter;

VisibleRegion.prototype.contains = function(latLng) {
    if (!latLng || !("lat" in latLng) || !("lng" in latLng)) {
        return false;
    }
    var y = latLng.lat,
      x = latLng.lng;

    var y90 = y + 90;
    var south = this.southwest.lat,
      north = this.northeast.lat,
      west = this.southwest.lng,
      east = this.northeast.lng;
    var south90 = south + 90,
      north90 = north + 90;

    var containX = false,
      containY = false;

    if (east >= 0 && west >= east) {
      if (x <= 0 && x >= -180) {
        containX = true;
      } else {
        containX = (west <= x && x <= east);
      }
    } else if (west <= 0 && east <= west) {
      containX = (west <= x && x <= east);
      if (x >= 0 && x <= 180) {
        containX = true;
      } else {
        containX = (x <= 0 && x <= west || x <= east && x>= -180);
      }
    } else {
      return LatLngBounds.prototype.contains.call(this, latLng);
    }

    containY = (south90 <= y90 && y90 <= north90) ||  //#a
              (south >= 0 && north <= 0 && ((south <= y && y <= 90) || (y >= -90 && y<= north))); // #d

    return containX && containY;
};

return  VisibleRegion;

});

},{"./LatLng":11,"./LatLngBounds":12,"./utils":32}],23:[function(require,module,exports){
// file: src/common/argscheck.js
(function(root, factory){
 if (typeof define === 'function') {
 cordova.define("cordova-plugin-googlemaps.argscheck", function(require, exports, module) {
                module.exports = factory(require);
                });
 } else if (typeof exports === 'object') {
 module.exports = factory(require);
 } else {
 root.returnExports = factory();
 }
 })(this, function(require) {
   
   var utils = require('./utils');
   
//   var moduleExports = module.exports;
   
   var typeMap = {
   'A': 'Array',
   'D': 'Date',
   'N': 'Number',
   'S': 'String',
   'F': 'Function',
   'O': 'Object'
   };
   
   function extractParamName (callee, argIndex) {
   return (/.*?\((.*?)\)/).exec(callee)[1].split(', ')[argIndex];
   }
   
   function checkArgs (spec, functionName, args, opt_callee) {
   if (!moduleExports.enableChecks) {
   return;
   }
   var errMsg = null;
   var typeName;
   for (var i = 0; i < spec.length; ++i) {
   var c = spec.charAt(i);
   var cUpper = c.toUpperCase();
   var arg = args[i];
   // Asterix means allow anything.
   if (c === '*') {
   continue;
   }
   typeName = utils.typeName(arg);
   if ((arg === null || arg === undefined) && c === cUpper) {
   continue;
   }
   if (typeName !== typeMap[cUpper]) {
   errMsg = 'Expected ' + typeMap[cUpper];
   break;
   }
   }
   if (errMsg) {
   errMsg += ', but got ' + typeName + '.';
   errMsg = 'Wrong type for parameter "' + extractParamName(opt_callee || args.callee, i) + '" of ' + functionName + ': ' + errMsg;
   // Don't log when running unit tests.
   if (typeof jasmine === 'undefined') {
   console.error(errMsg);
   }
   throw TypeError(errMsg);
   }
   }
   
   function getValue (value, defaultValue) {
   return value === undefined ? defaultValue : value;
   }
   
//   moduleExports.checkArgs = checkArgs;
//   moduleExports.getValue = getValue;
//   moduleExports.enableChecks = true;
   return {
   checkArgs:checkArgs,
   getValue:getValue,
   enableChecks:true
   };
   
});


},{"./utils":32}],24:[function(require,module,exports){
(function(root, factory){
 if (typeof define === 'function') {
 cordova.define("cordova-plugin-googlemaps.commandQueueExecutor", function(require, exports, module) {
                module.exports = factory(require);
                });
 } else if (typeof exports === 'object') {
 module.exports = factory(require);
 } else {
 root.returnExports = factory();
 }
 })(this, function(require) {
    
/*****************************************************************************
 * Command queue mechanism
 * (Save the number of method executing at the same time)
 *****************************************************************************/
var cordova_exec = require('./exec'),
  common = require('./Common');

var commandQueue = [];
var _isWaitMethod = null;
var _isExecuting = false;
var _executingCnt = 0;
var MAX_EXECUTE_CNT = 10;
var _lastGetMapExecuted = 0;
var _isResizeMapExecuting = false;

// This flag becomes true when the page will be unloaded.
var _stopRequested = false;


function execCmd(success, error, pluginName, methodName, args, execOptions) {
  execOptions = execOptions || {};

  // The JavaScript special keyword 'this' indicates `who call this function`.
  // This execCmd function is executed from overlay instances such as marker.
  // So `this` means `overlay` instance.
  var overlay = this;

  // If the overlay has been already removed from map,
  // do not execute any methods on it.
  if (overlay._isRemoved && !execOptions.remove) {
    console.error("[ignore]" + pluginName + "." + methodName + ", because removed.");
    return true;
  }

  // If the overlay is not ready in native side,
  // do not execute any methods except remove on it.
  // This code works for map class especially.
  if (!this._isReady && methodName !== "remove") {
    console.error("[ignore]" + pluginName + "." + methodName + ", because it's not ready.");
    return true;
  }

  // Push the method into the commandQueue(FIFO) at once.
  commandQueue.push({
    "execOptions": execOptions,
    "args": [
      function() {
        //-------------------------------
        // success callback
        //-------------------------------

        if (methodName === "resizeMap") {
          _isResizeMapExecuting = false;
        }

        // Even if the method was successful,
        // but the _stopRequested flag is true,
        // do not execute further code.
        if (!_stopRequested && success) {
          var results = Array.prototype.slice.call(arguments, 0);
          common.nextTick(function() {
            success.apply(overlay,results);
          });
        }

        // Insert small delays only for `map.getMap()`,
        // because if you execute three or four `map.getMap()` at the same time,
        // Android OS itself crashes.
        // In order to prevent this error, insert small delays.
        var delay = 0;
        if (methodName === _isWaitMethod) {
          if (_isWaitMethod === "getMap" && Date.now() - _lastGetMapExecuted < 1500) {
            delay = 1500;
          }
          _lastGetMapExecuted = Date.now();
          _isWaitMethod = null;
        }
        setTimeout(function() {
          _executingCnt--;
          common.nextTick(_exec);
        }, delay);
      },
      function() {
        //-------------------------------
        // error callback
        //-------------------------------
        if (methodName === "resizeMap") {
          _isResizeMapExecuting = false;
        }
        if (!_stopRequested && error) {
          var results = Array.prototype.slice.call(arguments, 0);
          common.nextTick(function() {
            error.apply(overlay,results);
          });
        }

        if (methodName === _isWaitMethod) {
          _isWaitMethod = null;
        }
        _executingCnt--;
        common.nextTick(_exec);
      },
      pluginName, methodName, args]
  });

  // In order to execute all methods in safe,
  // the maps plugin limits the number of execution in a moment to 10.
  //
  // Note that Cordova-Android drops has also another internal queue,
  // and the internal queue drops our statement if the app send too much.
  //
  // Also executing too much statements at the same time,
  // it would cause many errors in native side, such as out-of-memory.
  //
  // In order to prevent these troubles, the maps plugin limits the number of execution is 10.
  if (_isExecuting || _executingCnt >= MAX_EXECUTE_CNT || _isWaitMethod || commandQueue.length === 0) {
    return;
  }
  common.nextTick(_exec);
}
function _exec() {

  // You probably wonder why there is this code because it's already simular code at the end of the execCmd function.
  //
  // Because the commandQueue might change after the last code of the execCmd.
  // (And yes, it was occurred.)
  // In order to block surely, block the execution again.
  if (_isExecuting || _executingCnt >= MAX_EXECUTE_CNT || _isWaitMethod || commandQueue.length === 0) {
    return;
  }
  _isExecuting = true;

  // Execute some execution requests (up to 10) from the commandQueue.
  var methodName;
  while (commandQueue.length > 0 && _executingCnt < MAX_EXECUTE_CNT) {
    if (!_stopRequested) {
      _executingCnt++;
    }

    // Pick up the head one.
    var commandParams = commandQueue.shift();
    methodName = commandParams.args[3];

    // If the request is `map.refreshLayout()` and another `map.refreshLayout()` is executing,
    // skip it.
    // This prevents to execute multiple `map.refreshLayout()` at the same time.
    if (methodName === "resizeMap") {
      if (_isResizeMapExecuting) {
        _executingCnt--;
        continue;
      }
      _isResizeMapExecuting = true;
    }

    // If the `_stopRequested` flag is true,
    // do not execute any statements except `remove()` or `clear()` methods.
    if (_stopRequested && (!commandParams.execOptions.remove || methodName !== "clear")) {
      _executingCnt--;
      continue;
    }

    // Some methods have to block other execution requests, such as `map.clear()`
    if (commandParams.execOptions.sync) {
      _isWaitMethod = methodName;
      cordova_exec.apply(this, commandParams.args);
      break;
    }
    cordova_exec.apply(this, commandParams.args);
  }

  _isExecuting = false;

}


//----------------------------------------------------
// Stop all executions if the page will be closed.
//----------------------------------------------------
function stopExecution() {
  // Request stop all tasks.
  _stopRequested = true;
}
window.addEventListener("unload", stopExecution);

return execCmd;

});

},{"./Common":6,"./exec":26}],25:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.event", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

return {
    MAP_READY: 'map_ready',
    MAP_CLICK: 'map_click',
    MAP_LONG_CLICK: 'map_long_click',
    POI_CLICK: 'poi_click',
    MY_LOCATION_CLICK: 'my_location_click',
    MY_LOCATION_BUTTON_CLICK: 'my_location_button_click',
    INDOOR_BUILDING_FOCUSED: 'indoor_building_focused',
    INDOOR_LEVEL_ACTIVATED: 'indoor_level_activated',
    CAMERA_MOVE_START: 'camera_move_start',
    CAMERA_MOVE: 'camera_move',
    CAMERA_MOVE_END: 'camera_move_end',
    OVERLAY_CLICK: 'overlay_click',
    POLYGON_CLICK: 'polygon_click',
    POLYLINE_CLICK: 'polyline_click',
    CIRCLE_CLICK: 'circle_click',
    GROUND_OVERLAY_CLICK: 'groundoverlay_click',
    INFO_CLICK: 'info_click',
    INFO_LONG_CLICK: 'info_long_click',
    INFO_CLOSE: 'info_close',
    INFO_OPEN: 'info_open',
    MARKER_CLICK: 'marker_click',
    MARKER_DRAG: 'marker_drag',
    MARKER_DRAG_START: 'marker_drag_start',
    MARKER_DRAG_END: 'marker_drag_end',
    MAP_DRAG: 'map_drag',
    MAP_DRAG_START: 'map_drag_start',
    MAP_DRAG_END: 'map_drag_end',
    KML_CLICK: 'kml_click',
    PANORAMA_READY: 'panorama_ready',
    PANORAMA_CAMERA_CHANGE: 'panorama_camera_change',
    PANORAMA_LOCATION_CHANGE: 'panorama_location_change',
    PANORAMA_CLICK: 'panorama_click'
};

});

},{}],26:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.exec", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

    // var cordova_exec_origin = require('cordova/exec');
    function cordova_exec(success, failed, className, method, args) {
           // cordova_exec_origin(success, failed, className, method, args);
      window.OpenApplusJSBridge.nativeComponentCall(success, failed, className, method, args);
    };
    return cordova_exec;
});

},{}],27:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.geomodel", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

/**
#
# Copyright 2010 Alexandre Gellibert
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
 */

var LatLng = require('./LatLng');
var LatLngBounds = require('./LatLngBounds');
var common = require('./Common');

var GEOCELL_GRID_SIZE = 4;
var GEOCELL_ALPHABET = "0123456789abcdef";

function computeBox(geocell) {
  var subcell_lng_span, subcell_lat_span;
  var xy, x, y, i;
  var bbox = _createBoundingBox(90.0, 180.0, -90.0, -180.0);
  while(geocell.length > 0) {
    //geoChar = geocell.charAt(i);
    //pos = GEOCELL_ALPHABET.indexOf(geoChar);

    subcell_lng_span = (bbox.getEast() - bbox.getWest()) / GEOCELL_GRID_SIZE;
    subcell_lat_span = (bbox.getNorth() - bbox.getSouth()) / GEOCELL_GRID_SIZE;

    xy = _subdiv_xy(geocell.charAt(0));
    x = xy[0];
    y = xy[1];

    bbox = _createBoundingBox(bbox.getSouth() + subcell_lat_span * (y + 1),
              bbox.getWest()  + subcell_lng_span * (x + 1),
              bbox.getSouth() + subcell_lat_span * y,
              bbox.getWest()  + subcell_lng_span * x);

    geocell = geocell.substring(1);
  }
  var sw = new LatLng(bbox.getSouth(), bbox.getWest());
  var ne = new LatLng(bbox.getNorth(), bbox.getEast());
  var bounds = new LatLngBounds(sw, ne);
  return bounds;
}

function _createBoundingBox(north, east, south, west) {
  var north_,south_;

  if(south > north) {
    south_ = north;
    north_ = south;
  } else {
    south_ = south;
    north_ = north;
  }
  return {
    northEast: {lat: north_, lng: east},
    southWest: {lat: south_, lng: west},
    getNorth: function() {
      return this.northEast.lat;
    },
    getSouth: function() {
      return this.southWest.lat;
    },
    getWest: function() {
      return this.southWest.lng;
    },
    getEast: function() {
      return this.northEast.lng;
    }
  };
}


/**
 * https://code.google.com/p/geomodel/source/browse/trunk/geo/geocell.py#370
 * @param latLng
 * @param resolution
 * @return
 */
function getGeocell(lat, lng, resolution) {
  var cell = "";
  var north = 90.0;
  var south = -90.0;
  var east = 180.0;
  var west = -180.0;

  var subcell_lng_span, subcell_lat_span;
  var x, y;
  while(cell.length < resolution + 1) {
    subcell_lng_span = (east - west) / GEOCELL_GRID_SIZE;
    subcell_lat_span = (north - south) / GEOCELL_GRID_SIZE;

    x = Math.min(Math.floor(GEOCELL_GRID_SIZE * (lng - west) / (east - west)), GEOCELL_GRID_SIZE - 1);
    y = Math.min(Math.floor(GEOCELL_GRID_SIZE * (lat - south) / (north - south)),GEOCELL_GRID_SIZE - 1);
    cell += _subdiv_char(x, y);


    south += subcell_lat_span * y;
    north = south + subcell_lat_span;

    west += subcell_lng_span * x;
    east = west + subcell_lng_span;
  }
  return cell;
}


/*
 * Returns the (x, y) of the geocell character in the 4x4 alphabet grid.
 */
function _subdiv_xy(char) {
  // NOTE: This only works for grid size 4.
  var charI = GEOCELL_ALPHABET.indexOf(char);
  return [(charI & 4) >> 1 | (charI & 1) >> 0,
            (charI & 8) >> 2 | (charI & 2) >> 1];
}

/**
 * Returns the geocell character in the 4x4 alphabet grid at pos. (x, y).
 * @return
 */
function _subdiv_char(posX, posY) {
  // NOTE: This only works for grid size 4.
  return GEOCELL_ALPHABET.charAt(
      (posY & 2) << 2 |
      (posX & 2) << 1 |
      (posY & 1) << 1 |
      (posX & 1) << 0);
}

return {
    computeBox: computeBox,
    getGeocell: getGeocell
};

});

},{"./Common":6,"./LatLng":11,"./LatLngBounds":12}],28:[function(require,module,exports){
// Platform: ios
// 9e8e1b716252c4a08abcd31a13013b868d6f4141
/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */
;(function() {
  if (!window.Promise) {
    window.Promise = require('./Promise');
  }
  
/* eslint-disable no-undef */
  var cordova = {
  define: function(){},
  require: function(){},
  }
  window.plugin = window.plugin || {};
  window.plugin.google = window.plugin.google || {};
  window.plugin.google.maps = window.plugin.google.maps || {};
  
  window.cordova = cordova;
  var common = require('./Common');
  // The pluginInit.js must execute before loading HTML is completed.
  require("./pluginInit")();
  
  var execCmd = require("./commandQueueExecutor");
  var componentManager = new (require('./js_CordovaGoogleMaps-for-android_ios'))(execCmd);
  var Map = require('./Map');
  componentManager.registerComponent("Map", Map);
  window.componentManager = componentManager;
  (new Promise(function(resolve) {
    var wait = function() {
      if (document.body) {
        wait = undefined;
        componentManager.trigger('start');
        resolve();
      } else {
        setTimeout(wait, 50);
      }
    };
    wait();

  })).then(function() {
    common.nextTick(function() {
      // If the developer needs to recalculate the DOM tree graph,
      // use `cordova.fireDocumentEvent('plugin_touch')`
      document.addEventListener("plugin_touch", componentManager.invalidate.bind(componentManager));

      // Repositioning 30 times when the device orientaion is changed.
      window.addEventListener("orientationchange", componentManager.followMaps.bind(componentManager, {
        target: document.body
      }));

      // If <body> is not ready yet, wait 25ms, then execute this function again.
      // if (!document.body || !document.body.firstChild) {
      //   common.nextTick(arguments.callee, 25);
      //   return;
      // }


      document.addEventListener("transitionstart", componentManager.followMaps.bind(componentManager), {capture: true});
      document.body.parentNode.addEventListener("transitionend", componentManager.onTransitionEnd.bind(componentManager), {capture: true});
      document.body.parentNode.addEventListener("scroll", componentManager.followMaps.bind(componentManager), true);
    
      window.addEventListener("resize", function() {
        componentManager.transforming = true;
        componentManager.onTransitionFinish.call(componentManager);
      }, true);

    });
  });
  
})();


},{"./Common":6,"./Map":13,"./Promise":20,"./commandQueueExecutor":24,"./js_CordovaGoogleMaps-for-android_ios":29,"./pluginInit":30}],29:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.js_CordovaGoogleMaps", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {


if (!window.Promise) {
  window.Promise = require('./Promise');
}
var utils = require('./utils'),
  common = require('./Common'),
  cordova_exec = require('./exec'),
  BaseClass = require('./BaseClass');

// StreetViewPanorama = require('./StreetViewPanorama');

function OANativeComponent(execCmd) {
  var self = this;
  BaseClass.apply(this);

  // Ignore checking for thse tags.
  self.doNotTraceTags = [
    "svg", "p", "pre", "script", "style"
  ];
       self.components = {};
  self.execCmd = execCmd;
       

  // random unique number
  self.saltHash = Math.floor(Math.random() * Date.now());

  // Hold map instances.
  self.MAPS = {};
  self.MAP_CNT = 0;

  // Hold the DOM hierarchy graph.
  self.domPositions = {};

  // True while the putHtmlElements is working.
  self.isChecking = false;
  self.transforming = false;

  // True if the code requests to execute the putHtmlElements while working it.
  self.checkRequested = false;

  // True if some elements are changed, such as added an element.
  self.isThereAnyChange = false;

  // Indicate the native timer is stopped or not.
  self.set("isSuspended", false);

  // Cache for updateMapPositionOnly
  self.prevMapRects = {};

  // Control variables for followMaps() function
  self.scrollEndTimer = null;
  self.transitionEndTimer = null;
  self.transformTargets = {};
  self.transitionCnt = 0;

  //------------------------------------------------------------------------------
  // Using MutationObserver, observe only added/removed or style changed elements
  //------------------------------------------------------------------------------
  var observer = new MutationObserver(function(mutations) {
    common.nextTick(function() {
      // Since Android 4.4 passes mutations as "Object", not "Array",
      // use "for" statement instead of "forEach" method.

      var i, mutation, node, j, elemId, doTraceTree = true;
      for (j = 0; j < mutations.length; j++) {
        mutation = mutations[j];
        targetCnt = 0;
        if (mutation.type === "childList") {
          // If some elements are added, check them.
          if (mutation.addedNodes) {
            for (i = 0; i < mutation.addedNodes.length; i++) {
              node = mutation.addedNodes[i];
              if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
              }
              self.setDomId.call(self, node);
            }
          }

          // If some elements are removed from the DOM tree, remove their information.
          if (mutation.removedNodes) {
            for (i = 0; i < mutation.removedNodes.length; i++) {
              node = mutation.removedNodes[i];
              if (node.nodeType !== Node.ELEMENT_NODE || !node.hasAttribute("__pluginDomId")) {
                continue;
              }
              node._isRemoved = true;
              self.removeDomTree.call(self, node);
            }
          }
        } else {
          // Some attributes are changed.
          // If the element has __pluginDomId, check it.
          if (mutation.target.nodeType !== Node.ELEMENT_NODE) {
            continue;
          }
          if (mutation.target.hasAttribute("__pluginDomId")) {
            elemId = mutation.target.getAttribute("__pluginDomId");
            var transformCSS = common.getStyle(mutation.target, "transform") ||
                  common.getStyle(mutation.target, "-webkit-transform") ||
                  common.getStyle(mutation.target, "transition") ||
                  common.getStyle(mutation.target, "-webkit-transition");
            if (transformCSS !== "none") {
              mutation.target.dispatchEvent(common.createEvent("transitionstart"));

              // Omit executing the putHtmlElements() at this time,
              // because it is executed at `transitionend`.
              doTraceTree = false;
            }
          }
        }

      }
      // if (doTraceTree) {
      //   self.isThereAnyChange = true;
      //   common.nextTick(self.putHtmlElements.bind(self));
      // }
    });
  });
  var attachObserver = function() {
    observer.observe(document.body.parentElement, {
      attributes : true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class']
    });
  };
  self.one("start", attachObserver);

  self.on("isSuspended_changed", function(oldValue, newValue) {
    if (newValue) {
      cordova_exec(null, null, 'CordovaGoogleMaps', 'pause', []);
    } else {
      cordova_exec(null, null, 'CordovaGoogleMaps', 'resume', []);
    }
  });
}

utils.extend(OANativeComponent, BaseClass);

OANativeComponent.prototype.traceDomTree = function(element, elemId, isMapChild) {
  //------------------------------------------
  // Create the DOM hierarchy graph
  //------------------------------------------
  var self = this;

  // If the root DOM element should be ignored,
  // remove it from the tree graph.
  if (self.doNotTraceTags.indexOf(element.tagName.toLowerCase()) > -1 ||
    !common.shouldWatchByNative(element)) {
    self.removeDomTree.call(self, element);
    return;
  }

  // Get the z-index CSS
  var zIndexProp = common.getZIndex(element);

  // Stores dom information
  var isCached = elemId in self.domPositions;
  
  self.domPositions[elemId] = {

    // If `pointer-events:none`, continue the hitTest process
    pointerEvents: common.getStyle(element, 'pointer-events'),

    // Only true if element is mapDiv
    isMap: element.hasAttribute("__pluginMapId"),

    // Calculate dom clickable region
    size: common.getDivRect(element),

    // Calculate actual z-index value
    zIndex: zIndexProp,

    // If `overflow: hidden or scroll`, the native side needs to recalculate actual size
    overflowX: common.getStyle(element, "overflow-x"),
    overflowY: common.getStyle(element, "overflow-y"),

    // Hold the elementId of child elements
    children: [],

    // Hold the list of map id.
    containMapIDs: (isCached ? self.domPositions[elemId].containMapIDs : {})
  };

  // Should this process continue to child elements?
  //   - condition 1:
  //      If the child element contains map, should continue.
  //
  //   - condition 2:
  //      If the element is one of the children of map div,
  //      check all elements, especially for HtmlInfoWindow.
  //
  //   - condition 3:
  //      If the pointer-css is "none", continue the proces,
  //      because the element might be a container of the map.
  //
  //   - condition 4:
  //      If the z-index is "inherit", there might be some elements.
  var containMapCnt = (Object.keys(self.domPositions[elemId].containMapIDs)).length;
  isMapChild = isMapChild || self.domPositions[elemId].isMap;
  if ((containMapCnt > 0 || isMapChild || self.domPositions[elemId].pointerEvents === "none" || zIndexProp.isInherit) && element.children.length > 0) {
    var child;
    for (var i = 0; i < element.children.length; i++) {
      child = element.children[i];
      if (self.doNotTraceTags.indexOf(child.tagName.toLowerCase()) > -1 ||
        !common.shouldWatchByNative(child)) {
        self.removeDomTree.call(self, child);
        continue;
      }

      var childId = common.getPluginDomId(child);
      self.domPositions[elemId].children.push(childId);
      self.traceDomTree.call(self, child, childId, isMapChild);
    }
  }
};

OANativeComponent.prototype.setDomId = function(element) {
  //----------------------------------------------------------------------
  // This procedure generates unique ID
  // for all elements under the element, and the element itself.
  //----------------------------------------------------------------------
  common.getPluginDomId(element);
  if (element.children) {
    for (var i = 0; i < element.children.length; i++) {
      common.getPluginDomId(element.children[i]);
    }
  }
};
       
OANativeComponent.prototype.registerComponent = function(name, component) {
    this.components[name] = component;
}

OANativeComponent.prototype.unregisterComponent = function(name) {
    delete this.components[name];
}
       

OANativeComponent.prototype.putHtmlElements = function() {
  //----------------------------------------------------------------------
  // This procedure generates a DOM hierarchy tree graph from <BODY>.
  //----------------------------------------------------------------------
  var self = this;

  // If this process is working, just checkRequested = true.
  // The putHtmlElements will execute itself if the flag is true.
  if (self.isChecking || self.transforming) {
    self.checkRequested = true;
    return;
  }
  self.checkRequested = false;

  // If no elements are changed after the last checking,
  // stop the native timer in order to save the battery usage.
  if (!self.isThereAnyChange) {
    self.pause();
    return;
  }


  self.isChecking = true;

  // If there is no visible or clickable map,
  // stop checking
  var mapIDs = Object.keys(self.MAPS);
  var touchableMapList = mapIDs.filter(function(mapId) {
    var map = self.MAPS[mapId];
    var isTouchable = false;
    if (map) {
      var mapDiv = map.getDiv();
      isTouchable = (
        map.getVisible() &&
        // map.getClickable() && <-- don't consider this.
        mapDiv &&
        common.shouldWatchByNative(mapDiv));
      if (isTouchable) {
        var elemId = common.getPluginDomId(mapDiv);
        var domInfo = self.domPositions[elemId];
        if (domInfo) {
          self.domPositions[elemId].size = common.getDivRect(mapDiv);
          isTouchable = domInfo.size.width * domInfo.size.height > 0;
        } else {
          isTouchable = false;
        }
      }
      map.set("__isAttached", isTouchable);
    }
    return isTouchable;
  });
  if (touchableMapList.length === 0) {
    self.pause();
    return;
  }

  // If there is another check request,
  // DOM tree might be changed.
  // So let's start again.
  if (self.checkRequested || self.transforming) {
    setTimeout(function() {
      self.isChecking = false;
      common.nextTick(self.putHtmlElements.bind(self));
    }, 50);
    return;
  }

  // Since the native side needs to know the "latest" DOM information,
  // clear the DOM cache.
  common._clearInternalCache();

  // Generate the DOM hierarchy tree from <body> tag.
  common.getPluginDomId(document.body);
  self.traceDomTree.call(self, document.body, "root", false);

  // If the map div is not displayed (such as display='none'),
  // ignore the map temporally.
  var stopFlag = false;
  var mapElemIDs = mapIDs.map(function(mapId) {
    var div = self.MAPS[mapId].getDiv();
    if (!div || stopFlag) {
      return;
    }

    // Does this dom is really existed?
    var elemId = div.getAttribute("__pluginDomId");
    if (!elemId) {
      // The map div is removed
      if (mapId in self.MAPS) {
        self.MAPS[mapId].remove();
      }
      stopFlag = true;
      return;
    }

    if (!(elemId in self.domPositions)) {
      // Is the map div removed?
      var ele = document.querySelector("[__pluginMapId='" + mapId + "']");
      if (!ele) {
        // If no div element, remove the map.
        if (mapId in self.MAPS) {
          self.MAPS[mapId].remove();
        }
        stopFlag = true;
      }
      return;
    } else {
      return elemId;
    }

  });

  if (stopFlag || self.transforming) {
    // There is no map information (maybe timining?),
    // or the another check request is waiting,
    // start again.
    self.isThereAnyChange = true;
    setTimeout(function() {
      self.isChecking = false;
      common.nextTick(self.putHtmlElements.bind(self));
    }, 50);
    return;
  }

  //-----------------------------------------------------------------
  // Pass the DOM hierarchy tree graph to native side
  //-----------------------------------------------------------------
  self.resume();

  //console.log("--->putHtmlElements to native (start)", JSON.parse(JSON.stringify(self.domPositions)));
  cordova_exec(function() {
    //console.log("--->putHtmlElements to native (done)");

    // If there is another checking request, try again.
    if (self.checkRequested) {
      setTimeout(function() {
        self.isChecking = false;
        common.nextTick(self.putHtmlElements.bind(self));
      }, 50);
      return;
    }
    setTimeout(function() {
      if (!self.isChecking && !self.transforming) {
        common.nextTick(self.followMapDivPositionOnly.bind(self));
      }
    }, 50);
    self.isChecking = false;
    self.pause();
  }, null, 'CordovaGoogleMaps', 'putHtmlElements', [self.domPositions]);
};


OANativeComponent.prototype.pause = function() {
  var self = this;

  self.set("isSuspended", true);
  self.isThereAnyChange = false;
  self.isChecking = false;
};

OANativeComponent.prototype.resume = function() {
  var self = this;
  self.set("isSuspended", false);
};


// If the `transitionend` event is ocurred on the observed element,
// adjust the position and size of the map view

OANativeComponent.prototype.followMaps = function(evt) {
  var self = this;
  if (self.MAP_CNT === 0) {
    return;
  }
  self.transitionCnt++;
  self.transforming = true;
  var changes = self.followMapDivPositionOnly.call(self);
  if (self.scrollEndTimer) {
    clearTimeout(self.scrollEndTimer);
    self.scrollEndTimer = null;
  }
  if (changes) {
    self.scrollEndTimer = setTimeout(self.followMaps.bind(self, evt), 100);
  } else {
    setTimeout(self.onTransitionEnd.bind(self, evt), 100);
  }
};

// CSS event `transitionend` is fired even the target dom element is still moving.
// In order to detect "correct demention after the transform", wait until stable.
OANativeComponent.prototype.onTransitionEnd = function(evt) {
  var self = this;
  if (self.MAP_CNT === 0 || !evt) {
    return;
  }
  var target = evt.target;
  if (!target) {
    target = document.body;
  }
  target = target.getAttribute === "function" ? target : document.body;
  var elemId = target.getAttribute("__pluginDomId");
  self.transformTargets[elemId] = {left: -1, top: -1, right: -1, bottom: -1, finish: false, target: target};
  if (!self.transitionEndTimer) {
    self.transitionEndTimer = setTimeout(self.detectTransitionFinish.bind(self), 100);
  }
};

OANativeComponent.prototype.detectTransitionFinish = function() {
  var self = this;
  var keys = Object.keys(self.transformTargets);
  var onFilter = function(elemId) {
    if (self.transformTargets[elemId].finish) {
      return false;
    }

    var target = self.transformTargets[elemId].target;
    var divRect = common.getDivRect(target);
    var prevRect = self.transformTargets[elemId];
    if (divRect.left === prevRect.left &&
        divRect.top === prevRect.top &&
        divRect.right === prevRect.right &&
        divRect.bottom === prevRect.bottom) {
      self.transformTargets[elemId].finish = true;
    }
    self.transformTargets[elemId].left = divRect.left;
    self.transformTargets[elemId].top = divRect.top;
    self.transformTargets[elemId].right = divRect.right;
    self.transformTargets[elemId].bottom = divRect.bottom;
    return !self.transformTargets[elemId].finish;
  };
  var notYetTargets = keys.filter(onFilter);
  onFilter = null;

  if (self.transitionEndTimer) {
    clearTimeout(self.transitionEndTimer);
  }
  self.transitionCnt -= notYetTargets.length > 1 ? 1 : 0;
  if (notYetTargets.length > 0 && self.transitionCnt == 0) {
    self.transitionEndTimer = setTimeout(self.detectTransitionFinish.bind(self), 100);
  } else {
    clearTimeout(self.transitionEndTimer);
    self.transitionEndTimer = null;
    setTimeout(self.onTransitionFinish.bind(self), 100);
  }
};

OANativeComponent.prototype.onTransitionFinish = function() {
  var self = this;
  if (self.MAP_CNT === 0) {
    self.transforming = false;
    return;
  }
  // Don't block by transform flag
  // because some ionic CSS technique can not trigger `transitionstart` event.
  // if (!self.transforming) {
  //   return;
  // }
  self.transforming = false;
  var changes = self.followMapDivPositionOnly.call(self);
  if (changes) {
    self.scrollEndTimer = setTimeout(self.onTransitionFinish.bind(self), 100);
  } else {
    self.transformTargets = undefined;
    self.transformTargets = {};
    self.isThereAnyChange = true;
    self.checkRequested = false;
    self.putHtmlElements.call(self);
    //self.pause();
    self.scrollEndTimer = null;
  }
};


OANativeComponent.prototype.removeDomTree = function(node) {
  //----------------------------------------------------------------------------
  // This procedure removes the DOM tree graph from the specified element(node)
  //----------------------------------------------------------------------------
  var self = this;

  if (!node || !node.querySelectorAll) {
    return;
  }

  // Remove the information of children
  // which have the `__pluginDomId` attribute.
  var nodeList = node.querySelectorAll('[__pluginDomId]');
  var children = [];
  for (var i = 0; i < nodeList.length; i++) {
    children.push(nodeList[i]);
  }
  children.push(node);

  var isRemoved = node._isRemoved;
  children.forEach(function(child) {
    var elemId = child.getAttribute('__pluginDomId');

    // If the DOM is removed from the DOM tree,
    // remove the attribute.
    // (Note that the `_isRemoved` flag is set in MutationObserver.)
    if (isRemoved) {
      child.removeAttribute('__pluginDomId');

      // If map div, remove the map also.
      if (child.hasAttribute('__pluginMapId')) {
        mapId = child.getAttribute('__pluginMapId');
        if (mapId in self.MAPS) {
          self.MAPS[mapId].remove();
        }
      }
      delete self.domPositions[elemId];
    }
    common._removeCacheById(elemId);
  });

};

OANativeComponent.prototype.invalidate = function(opts) {
  //-------------------------------
  // Recheck the DOM positions
  //-------------------------------
  var self = this;

  opts = opts || {};
  if (opts.force) {
    self.isThereAnyChange = true;
  }
  self.followMapDivPositionOnly.call(self, opts);

  common.nextTick(function() {
    self.resume.call(self);
    self.putHtmlElements.call(self);
  });
};

OANativeComponent.prototype.followMapDivPositionOnly = function(opts) {
  //----------------------------------------------------------------------------
  // Follow the map div position and size only without the DOM check.
  // This is designed for scrolling.
  //----------------------------------------------------------------------------
  var self = this;

  opts = opts || {};
  var mapRects = {};
  var mapIDs = Object.keys(self.MAPS);
  var changed = false;
  mapIDs.forEach(function(mapId) {
    var map = self.MAPS[mapId];

    if (map &&
        map.getVisible() &&
        map.getDiv() &&
        common.shouldWatchByNative(map.getDiv())) {

      // Obtain only minimum information
      var mapDiv = map.getDiv();
      var divId = mapDiv.getAttribute("__pluginDomId");
      mapRects[divId] = {
        size: common.getDivRect(mapDiv),
        zIndex: common.getZIndex(mapDiv)
      };

      // Is the map moved?
      if (!changed && self.prevMapRects && divId in self.prevMapRects) {
        if (self.prevMapRects[divId].size.left !== mapRects[divId].size.left) {
          //console.log("changed(left)", divId, self.prevMapRects[divId].size.left, mapRects[divId].size.left);
          changed = true;
        }
        if (!changed && self.prevMapRects[divId].size.top !== mapRects[divId].size.top) {
          //console.log("changed(top)", divId, self.prevMapRects[divId].size.top, mapRects[divId].size.top);
          changed = true;
        }
        if (!changed && self.prevMapRects[divId].size.width !== mapRects[divId].size.width) {
          //console.log("changed(width)", divId, self.prevMapRects[divId].size.width, mapRects[divId].size.width);
          changed = true;
        }
        if (!changed && self.prevMapRects[divId].size.height !== mapRects[divId].size.height) {
          //console.log("changed(height)", divId, self.prevMapRects[divId].size.height, mapRects[divId].size.height);
          changed = true;
        }
        if (!changed && self.prevMapRects[divId].zIndex.z !== mapRects[divId].zIndex.z) {
          //console.log("changed(zIndex.z)", divId, self.prevMapRects[divId].zIndex.z, mapRects[divId].zIndex.z);
          changed = true;
        }
      }
    }

  });
  self.prevMapRects = mapRects;

  // If changed, move the map views.
  if (changed || opts.force) {
    cordova_exec(null, null, 'CordovaGoogleMaps', 'updateMapPositionOnly', [mapRects]);
    return changed;
  }
  return false;
};

OANativeComponent.prototype.invalidateN = function(cnt) {
  var self = this;
  if (self.cnt > 0) {
    return;
  }
  self.cnt = cnt;
  var timer = setInterval(function() {
    common.nextTick(function() {
      self.followMapDivPositionOnly.call(self);
      self.cnt--;
      if (self.cnt === 0) {
        clearInterval(timer);
        self.invalidate.call(self, {force: true});
      }
    });
  }, 50);
};
               
OANativeComponent.prototype.getMap = function(div, mapOptions) {
   return this.getComponent("Map", div, mapOptions);
};
               
OANativeComponent.prototype.getComponent = function(className, div, mapOptions) {
  var self = this;
  var args = Array.prototype.slice.call(arguments, 0);

  //----------------------------------------------------------------------------
  // This procedure return a map instance.
  //   - usage 1
  //       plugin.google.maps.Map.getMap(options?) returns a map instance.
  //
  //   - usage 2
  //       plugin.google.maps.Map.getMap(mapDiv, options?) returns a map instance.
  //       The generated map follows the mapDiv position and size automatically.
  //
  //   - usage 3 (not good way)
  //       In order to keep the backward compatibility for v1,
  //       if the mapDiv has already a map, returns the map instance for the map div.
  //----------------------------------------------------------------------------
  var mapId, elem, elemId;

  if (common.isDom(div)) {
    mapId = div.getAttribute("__pluginMapId");

    // Wow, the app specifies the map div that has already another map,
    // but the app try to create new map.
    // In this case, remove the old map instance automatically.
    if (mapId && self.MAPS[mapId].getDiv() !== div) {
      elem = self.MAPS[mapId].getDiv();
      while(elem && elem.nodeType === Node.ELEMENT_NODE) {
        elemId = elem.getAttribute("__pluginDomId");
        if (elemId && elemId in self.domPositions) {
          self.domPositions[elemId].containMapIDs = self.domPositions[elemId].containMapIDs || {};
          delete self.domPositions[elemId].containMapIDs[mapId];
          if ((Object.keys(self.domPositions[elemId].containMapIDs).length) < 1) {
            delete self.domPositions[elemId];
          }
        }
        elem = elem.parentNode;
      }
      self.MAPS[mapId].remove();
      mapId = undefined;
    }

    if (mapId && mapId in self.MAPS) {
      // Usage 3
      //    If the map div has already a map,
      //    return the map instance.
      return self.MAPS[mapId];
    }

  }
  if (!mapId) {
    mapId = "component_" + className.toLowerCase() +  self.MAP_CNT + "_" + self.saltHash;
  }
  // Create a map instance.
  var map = new self.components[className](mapId, self.execCmd);
  map.set('__isAttached', common.isDom(div));

  // Catch all events for this map instance, then pass to the instance.
  // (Don't execute this native callback from your code)
  plugin.google.maps[mapId] = nativeCallback.bind(map);

  map.on('__isAttached_changed', function(oldValue, newValue) {
    if (newValue) {
      map.exec(null, null, map.id, 'attachToWebView', []);
    } else {
      map.exec(null, null, map.id, 'detachFromWebView', []);
    }
  });

  // If the mapDiv is changed, clean up the information for old map div,
  // then add new information for new map div.
  map.on('div_changed', function(oldDiv, newDiv) {
    var elemId, ele;

    if (common.isDom(oldDiv)) {
      oldDiv.removeAttribute('__pluginMapId');
      ele = oldDiv;
      while(ele && ele != document.body.parentNode) {
        elemId = ele.getAttribute('__pluginDomId');
        if (elemId) {
          self.domPositions[elemId].containMapIDs = self.domPositions[elemId].containMapIDs || {};
          delete self.domPositions[elemId].containMapIDs[mapId];
          if ((Object.keys(self.domPositions[elemId].containMapIDs)).length < 1) {
            delete self.domPositions[elemId];
          }
        }
        ele.removeAttribute('__pluginDomId');
        if (ele.classList) {
          ele.classList.remove('_gmaps_cdv_');
        } else if (ele.className) {
          ele.className = ele.className.replace(/_gmaps_cdv_/g, "");
          ele.className = ele.className.replace(/\s+/g, " ");
        }
        ele = ele.parentNode;
      }
    }

    if (common.isDom(newDiv)) {

      elemId = common.getPluginDomId(newDiv);

      elem = newDiv;
      var isCached;
      while(elem && elem.nodeType === Node.ELEMENT_NODE) {
        elemId = common.getPluginDomId(elem);
        if (common.shouldWatchByNative(elem)) {
          if (elem.shadowRoot) {
            elem.shadowRoot.addEventListener("transitionend", self.onTransitionEnd.bind(self), {capture: true});
            elem.shadowRoot.addEventListener("scroll", self.followMaps.bind(self), {capture: true});
          }
          isCached = elemId in self.domPositions;
          self.domPositions[elemId] = {
            pointerEvents: common.getStyle(elem, 'pointer-events'),
            isMap: false,
            size: common.getDivRect(elem),
            zIndex: common.getZIndex(elem),
            children: (elemId in self.domPositions ? self.domPositions[elemId].children : []),
            overflowX: common.getStyle(elem, "overflow-x"),
            overflowY: common.getStyle(elem, "overflow-y"),
            containMapIDs: (isCached ? self.domPositions[elemId].containMapIDs : {})
          };
          self.domPositions[elemId].containMapIDs[mapId] = 1;
        } else {
          self.removeDomTree.call(self, elem);
        }
        elem = elem.parentNode;
      }

      elemId = common.getPluginDomId(newDiv);
      self.domPositions[elemId].isMap = true;
    }
  });

  // If the map is removed, clean up the information.
  map.one('remove', self._remove.bind(self, mapId));
  self.MAP_CNT++;
  self.isThereAnyChange = true;

  if (div instanceof Promise) {
    // This hack code for @ionic-native/google-maps
    div.then(function(params) {
      self.MAPS[mapId] = map;
      params = params || [];
      params.unshift(map);
      postMapInit.apply(self, params);
    });
  } else {
    // Normal code flow
    self.MAPS[mapId] = map;
    postMapInit.call(self, map, div, mapOptions);
  }

  return map;
};

//OANativeComponent.prototype.getPanorama = function(div, streetViewOptions) {
//  var self = this;
//  var mapId = "streetview_" + self.MAP_CNT + "_" + self.saltHash;
//
//  // Create a panorama instance.
//  var panorama = new StreetViewPanorama(mapId, self.execCmd);
//
//  // Catch all events for this map instance, then pass to the instance.
//  // (Don't execute this native callback from your code)
//  plugin.google.maps[mapId] = nativeCallback.bind(panorama);
//
//  self.MAP_CNT++;
//
//  panorama.one('remove', self._remove.bind(self, mapId));
//
//  if (div instanceof Promise) {
//    // This hack code for @ionic-native/google-maps
//    div.then(function(params) {
//      self.MAPS[mapId] = panorama;
//      params = params || [];
//      params.unshift(panorama);
//      postPanoramaInit.apply(self, params);
//    });
//  } else {
//    // Normal code flow
//    self.MAPS[mapId] = panorama;
//    postPanoramaInit.call(self, panorama, div, streetViewOptions);
//  }
//
//  return panorama;
//};

OANativeComponent.prototype._remove = function(mapId) {
  var self = this;
  delete plugin.google.maps[mapId];
  var map = self.MAPS[mapId];

  var div = map.getDiv();
  if (!div) {
    div = document.querySelector("[__pluginMapId='" + mapId + "']");
  }
  if (div) {
    div.removeAttribute('__pluginMapId');
  }

  var keys = Object.keys(self.domPositions);
  keys.forEach(function(elemId) {
    self.domPositions[elemId].containMapIDs = self.domPositions[elemId].containMapIDs || {};
    delete self.domPositions[elemId].containMapIDs[mapId];
    if ((Object.keys(self.domPositions[elemId].containMapIDs)).length < 1) {
      delete self.domPositions[elemId];
    }
  });

  self.MAPS[mapId].destroy();
  delete self.MAPS[mapId];
  map = undefined;

  // If the app have no map, stop the native timer.
  if ((Object.keys(self.MAPS)).length === 0) {
    common._clearInternalCache();
    self.pause();
  }
};

function nativeCallback(params) {
  var args = params.args || [];
  args.unshift(params.evtName);
  this[params.callback].apply(this, args);
}
//function postPanoramaInit(panorama, div, options) {
//  var self = this;
//  var mapId = panorama.getId();
//  self.isThereAnyChange = true;
//
//
//  if (!common.isDom(div)) {
//    console.error('[GoogleMaps] You need to specify a dom element(such as <div>) for this method', div);
//    return;
//  }
//  // If the given div is not fully ready, wait a little
//  if (!common.shouldWatchByNative(div)) {
//    setTimeout(function() {
//      common.nextTick(postPanoramaInit.bind(self, map, div, options));
//    }, 50);
//    return;
//  }
//  if (div.offsetWidth < 100 || div.offsetHeight < 100) {
//    console.error('[GoogleMaps] Minimum container dimention is 100x100 in pixels.', div);
//    return;
//  }
//
//  // If the mapDiv is specified,
//  // the native side needs to know the map div position
//  // before creating the map view.
//  div.setAttribute("__pluginMapId", mapId);
//  elemId = common.getPluginDomId(div);
//
//  elem = div;
//  var isCached, zIndexList = [];
//  while(elem && elem.nodeType === Node.ELEMENT_NODE) {
//    elemId = common.getPluginDomId(elem);
//    if (common.shouldWatchByNative(elem)) {
//      isCached = elemId in self.domPositions;
//      self.domPositions[elemId] = {
//        pointerEvents: common.getStyle(elem, 'pointer-events'),
//        isMap: false,
//        size: common.getDivRect(elem),
//        zIndex: common.getZIndex(elem),
//        children: [],
//        overflowX: common.getStyle(elem, "overflow-x"),
//        overflowY: common.getStyle(elem, "overflow-y"),
//        containMapIDs: (isCached ? self.domPositions[elemId].containMapIDs : {})
//      };
//      zIndexList.unshift(self.domPositions[elemId].zIndex);
//      self.domPositions[elemId].containMapIDs[mapId] = 1;
//    } else {
//      self.removeDomTree.call(self, elem);
//    }
//    elem = elem.parentNode;
//  }
//
//  // Calculate the native view z-index
//  var depth = 0;
//  zIndexList.forEach(function(info, idx) {
//    if (!info.isInherit && info.z === 0) {
//      depth *= 10;
//    }
//    depth += (info.z + 1) / (1 << idx) + 0.01;
//  });
//  depth = Math.floor(depth * 10000);
//
//  elemId = common.getPluginDomId(div);
//  self.domPositions[elemId].isMap = true;
//
//  var args = Array.prototype.slice.call(arguments, 0);
//  args.unshift({
//    id: mapId,
//    depth: depth
//  });
//
//  cordova_exec(function() {
//    panorama.getPanorama.apply(panorama, args);
//  }, null, 'CordovaGoogleMaps', 'putHtmlElements', [self.domPositions]);
//
//
//}

function postMapInit(map, div, options) {
  var self = this;
  var mapId = map.getId();
  var args = [];

  if (common.isDom(div)) {
    // If the given div is not fully ready, wait a little
    if (!common.shouldWatchByNative(div)) {
      setTimeout(function() {
        common.nextTick(postMapInit.bind(self, map, div, options));
      }, 50);
      return;
    }
    if (div.offsetWidth < 100 || div.offsetHeight < 100) {
      console.error('[GoogleMaps] Minimum container dimention is 100x100 in pixels.', div);
      return;
    }
    // If the mapDiv is specified,
    // the native side needs to know the map div position
    // before creating the map view.
    div.setAttribute("__pluginMapId", mapId);
    var elemId = common.getPluginDomId(div);

    var elem = div;
    var isCached;
    var zIndexList = [];
    while(elem && elem.nodeType === Node.ELEMENT_NODE) {
      elemId = common.getPluginDomId(elem);
      if (common.shouldWatchByNative(elem)) {
        isCached = elemId in self.domPositions;
        self.domPositions[elemId] = {
          pointerEvents: common.getStyle(elem, 'pointer-events'),
          isMap: false,
          size: common.getDivRect(elem),
          zIndex: common.getZIndex(elem),
          children: [],
          overflowX: common.getStyle(elem, "overflow-x"),
          overflowY: common.getStyle(elem, "overflow-y"),
          containMapIDs: (isCached ? self.domPositions[elemId].containMapIDs : {})
        };
        zIndexList.unshift(self.domPositions[elemId].zIndex);
        self.domPositions[elemId].containMapIDs[mapId] = 1;
      } else {
        self.removeDomTree.call(self, elem);
      }
      elem = elem.parentNode;
    }

    // Calculate the native view z-index
    var depth = 0;
    zIndexList.forEach(function(info, idx) {
      if (!info.isInherit && info.z === 0) {
        depth *= 10;
      }
      depth += (info.z + 1) / (1 << idx) + 0.01;
    });
    depth = Math.floor(depth * 10000);
    args.push({
      id: mapId,
      depth: depth
    });
    args.push(div);
    if (options) {
      args.push(options);
    }

    elemId = common.getPluginDomId(div);
    self.domPositions[elemId].isMap = true;

    cordova_exec(function() {
      map.getMap.apply(map, args);
    }, null, 'CordovaGoogleMaps', 'putHtmlElements', [self.domPositions]);
  } else {
    args.push({
      id: mapId,
      depth: 0
    });
    args.push(null);
    if (options) {
      args.push(options);
    }
    map.getMap.apply(map, args);
  }
}

return OANativeComponent;

});

},{"./BaseClass":2,"./Common":6,"./Promise":20,"./exec":26,"./utils":32}],30:[function(require,module,exports){
(function(root, factory){
 if (typeof define === 'function') {
 cordova.define("cordova-plugin-googlemaps.pluginInit", function(require, exports, module) {
                module.exports = factory(require);
                });
 } else if (typeof exports === 'object') {
 module.exports = factory(require);
 } else {
 root.returnExports = factory();
 }
 })(this, function(require) {

var cordova_exec = require('./exec');
function pluginInit() {
  //-------------------------------------------------------------
  // In some older browsers do not implement these methods.
  // For example, Android 4.4 does not have Array.map()
  //
  // But this plugin needs them.
  // That's why if the browser does not have it, implement it.
  //-------------------------------------------------------------
  if (typeof Array.prototype.forEach !== "function") {
    (function() {
      Array.prototype.forEach = function(fn, thisArg) {
        thisArg = thisArg || this;
        for (var i = 0; i < this.length; i++) {
          fn.call(thisArg, this[i], i, this);
        }
      };
    })();
  }
  if (typeof Array.prototype.filter !== "function") {
    (function() {
      Array.prototype.filter = function(fn, thisArg) {
        thisArg = thisArg || this;
        var results = [];
        for (var i = 0; i < this.length; i++) {
          if (fn.call(thisArg, this[i], i, this) === true) {
            results.push(this[i]);
          }
        }
        return results;
      };
    })();
  }
  if (typeof Array.prototype.map !== "function") {
    (function() {
      Array.prototype.map = function(fn, thisArg) {
        thisArg = thisArg || this;
        var results = [];
        for (var i = 0; i < this.length; i++) {
          results.push(fn.call(thisArg, this[i], i, this));
        }
        return results;
      };
    })();
  }
  /*****************************************************************************
   * To prevent strange things happen,
   * disable the changing of viewport zoom level by double clicking.
   * This code has to run before the device ready event.
   *****************************************************************************/
//  var viewportTag = null;
//  var metaTags = document.getElementsByTagName('meta');
//  for (var i = 0; i < metaTags.length; i++) {
//      if (metaTags[i].getAttribute('name') === "viewport") {
//          viewportTag = metaTags[i];
//          break;
//      }
//  }
//  if (!viewportTag) {
//      viewportTag = document.createElement("meta");
//      viewportTag.setAttribute('name', 'viewport');
//  }
//
//  var viewportTagContent = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no';
//
//  // Detect if iOS device
//  if (/(iPhone|iPod|iPad)/i.test(window.navigator.userAgent)) {
//    // Get iOS major version
//    var iosVersion = parseInt((window.navigator.userAgent).match(/OS (\d+)_(\d+)_?(\d+)? like Mac OS X/i)[1]);
//    // Detect if device is running >iOS 11
//    // iOS 11's UIWebView and WKWebView changes the viewport behaviour to render viewport without the status bar. Need to override with "viewport-fit: cover" to include the status bar.
//    if (iosVersion >= 11) {
//      viewportTagContent += ', viewport-fit=cover';
//    }
//  }
//
//  // Update viewport tag attribute
//  viewportTag.setAttribute('content', viewportTagContent);


  /*****************************************************************************
   * Prevent background, background-color, background-image properties
   *****************************************************************************/
  var cssAdjuster = document.createElement("style");
  cssAdjuster.setAttribute("type", "text/css");
  cssAdjuster.innerText = [
    "html, body, ._gmaps_cdv_ {",
    "   background-image: url() !important;",
    "   background: rgba(0,0,0,0) url() !important;",
    "   background-color: rgba(0,0,0,0) !important;",
    "}",
    "._gmaps_cdv_ .nav-decor {",
    "   background-color: rgba(0,0,0,0) !important;",
    "   background: rgba(0,0,0,0) !important;",
    "   display:none !important;",
    "}",
    ".framework7-root .page-previous {",
    "   display:none !important;",
    "}"
  ].join("");
  document.head.appendChild(cssAdjuster);


  // I guess no longer necessary this code at 2018/March
  // //----------------------------------------------
  // // Set transparent mandatory for older browser
  // // http://stackoverflow.com/a/3485654/697856
  // //----------------------------------------------
  // if(document.body){
  //   document.body.style.backgroundColor = "rgba(0,0,0,0)";
  //   //document.body.style.display='none';
  //   document.body.offsetHeight;
  //   //document.body.style.display='';
  // }



  //--------------------------------------------
  // Hook the backbutton of Android action
  //--------------------------------------------
  var anotherBackbuttonHandler = null;
  function onBackButton(e) {

    // Check DOM tree for new page
    cordova.fireDocumentEvent("plugin_touch", {
      force: true
    });

    if (anotherBackbuttonHandler) {
      // anotherBackbuttonHandler must handle the page moving transaction.
      // The plugin does not take care anymore if another callback is registered.
      anotherBackbuttonHandler(e);
    } else {
      cordova_exec(null, null, 'CordovaGoogleMaps', 'backHistory', []);
    }
  }

  document.addEventListener("backbutton", onBackButton);

  var _org_addEventListener = document.addEventListener;
  var _org_removeEventListener = document.removeEventListener;
  document.addEventListener = function(eventName, callback) {
    var args = Array.prototype.slice.call(arguments, 0);
    if (eventName.toLowerCase() !== "backbutton") {
      _org_addEventListener.apply(this, args);
      return;
    }
    if (!anotherBackbuttonHandler) {
      anotherBackbuttonHandler = callback;
    }
  };
  document.removeEventListener = function(eventName, callback) {
    var args = Array.prototype.slice.call(arguments, 0);
    if (eventName.toLowerCase() !== "backbutton") {
      _org_removeEventListener.apply(this, args);
      return;
    }
    if (anotherBackbuttonHandler === callback) {
      anotherBackbuttonHandler = null;
    }
  };

}

return pluginInit;

});

},{"./exec":26}],31:[function(require,module,exports){
(function(root, factory){
if (typeof define === 'function') {
cordova.define("cordova-plugin-googlemaps.spherical", function(require, exports, module) {
             module.exports = factory(require);
             });
} else if (typeof exports === 'object') {
module.exports = factory(require);
} else {
root.returnExports = factory();
}
})(this, function(require) {

var LatLng = require('./LatLng');
var common = require('./Common');
var EARTH_RADIUS = 6371009;

/**
 * Port from android-maps-utils
 * https://github.com/googlemaps/android-maps-utils/blob/master/library/src/com/google/maps/android/SphericalUtil.java
 */

/**
 * Returns the non-negative remainder of x / m.
 * @param x The operand.
 * @param m The modulus.
 */
function mod(x, m) {
    return ((x % m) + m) % m;
}
/**
 * Wraps the given value into the inclusive-exclusive interval between min and max.
 * @param n   The value to wrap.
 * @param min The minimum.
 * @param max The maximum.
 */
function wrap(n, min, max) {
    return (n >= min && n < max) ? n : (mod(n - min, max - min) + min);
}

/**
 * Returns haversine(angle-in-radians).
 * hav(x) == (1 - cos(x)) / 2 == sin(x / 2)^2.
 */
function hav(x) {
    var sinHalf = Math.sin(x * 0.5);
    return sinHalf * sinHalf;
}

/**
 * Computes inverse haversine. Has good numerical stability around 0.
 * arcHav(x) == acos(1 - 2 * x) == 2 * asin(sqrt(x)).
 * The argument must be in [0, 1], and the result is positive.
 */
function arcHav(x) {
    return 2 * Math.asin(Math.sqrt(x));
}

/**
 * Returns hav() of distance from (lat1, lng1) to (lat2, lng2) on the unit sphere.
 */
function havDistance(lat1, lat2, dLng) {
    return hav(lat1 - lat2) + hav(dLng) * Math.cos(lat1) * Math.cos(lat2);
}

/**
 * Returns distance on the unit sphere; the arguments are in radians.
 */
function distanceRadians(lat1, lng1, lat2, lng2) {
    return arcHav(havDistance(lat1, lat2, lng1 - lng2));
}

/**
 * Returns the angle between two LatLngs, in radians. This is the same as the distance
 * on the unit sphere.
 */
function computeAngleBetween(from, to) {
    return distanceRadians(toRadians(from.lat), toRadians(from.lng),
                           toRadians(to.lat), toRadians(to.lng));
}

/**
 * Returns the distance between two LatLngs, in meters.
 */
function computeDistanceBetween(from, to) {
    return computeAngleBetween(from, to) * EARTH_RADIUS;
}

/**
 * Returns the distance between two LatLngs, in meters.
 */
function computeOffset(from, distance, heading) {
    distance /= EARTH_RADIUS;
    heading = toRadians(heading);

    // http://williams.best.vwh.net/avform.htm#LL
    var fromLat = toRadians(from.lat);
    var fromLng = toRadians(from.lng);
    var cosDistance = Math.cos(distance);
    var sinDistance = Math.sin(distance);
    var sinFromLat = Math.sin(fromLat);
    var cosFromLat = Math.cos(fromLat);
    var sinLat = cosDistance * sinFromLat + sinDistance * cosFromLat * Math.cos(heading);
    var dLng = Math.atan2(
                sinDistance * cosFromLat * Math.sin(heading),
                cosDistance - sinFromLat * sinLat);
    return new LatLng(toDegrees(Math.asin(sinLat)), toDegrees(fromLng + dLng));
}


function toRadians(d) {
    return d * Math.PI / 180;
}

function toDegrees(r) {
    return r * 180 / Math.PI;
}

/*
 * Returns the signed area of a closed path on a sphere of given radius.
 */
function computeSignedArea(path) {
    radius = EARTH_RADIUS;
    path = common.convertToPositionArray(path);

    var size = path.length;
    if (size < 3) {
        return 0;
    }
    var total = 0;

    var prev = path[size - 1];
    var prevTanLat = Math.tan((Math.PI / 2 - toRadians(prev.lat)) / 2);
    var prevLng = toRadians(prev.lng);

    // For each edge, accumulate the signed area of the triangle formed by the North Pole
    // and that edge ("polar triangle").
    path.forEach(function(position) {
        var tanLat = Math.tan((Math.PI / 2 - toRadians(position.lat)) / 2);
        var lng = toRadians(position.lng);
        total += polarTriangleArea(tanLat, lng, prevTanLat, prevLng);
        prevTanLat = tanLat;
        prevLng = lng;
    });
    return total * (radius * radius);
}

/*
 * Returns the signed area of a triangle which has North Pole as a vertex.
 * Formula derived from "Area of a spherical triangle given two edges and the included angle"
 * as per "Spherical Trigonometry" by Todhunter, page 71, section 103, point 2.
 * See http://books.google.com/books?id=3uBHAAAAIAAJ&pg=PA71
 * The arguments named "tan" are tan((pi/2 - latitude)/2).
 */
function polarTriangleArea(tan1, lng1, tan2, lng2) {

    var deltaLng = lng1 - lng2;
    var t = tan1 * tan2;
    return 2 * Math.atan2(t * Math.sin(deltaLng), 1 + t * Math.cos(deltaLng));
}
function computeArea(path) {
    return Math.abs(computeSignedArea(path));
}

/**
 * Returns the heading from one LatLng to another LatLng. Headings are
 * expressed in degrees clockwise from North within the range [-180,180).
 * @return The heading in degrees clockwise from north.
 */
function computeHeading(from, to) {
    // http://williams.best.vwh.net/avform.htm#Crs
    var fromLat = toRadians(from.lat);
    var fromLng = toRadians(from.lng);
    var toLat = toRadians(to.lat);
    var toLng = toRadians(to.lng);
    var dLng = toLng - fromLng;
    var heading = Math.atan2(
            Math.sin(dLng) * Math.cos(toLat),
            Math.cos(fromLat) * Math.sin(toLat) - Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng));
    return wrap(toDegrees(heading), -180, 180);
}

/**
 * Returns the location of origin when provided with a LatLng destination,
 * meters travelled and original heading. Headings are expressed in degrees
 * clockwise from North. This function returns null when no solution is
 * available.
 * @param to       The destination LatLng.
 * @param distance The distance travelled, in meters.
 * @param heading  The heading in degrees clockwise from north.
 */
function computeOffsetOrigin(to, distance, heading) {
    heading = toRadians(heading);
    distance /= EARTH_RADIUS;
    // http://lists.maptools.org/pipermail/proj/2008-October/003939.html
    var n1 = Math.cos(distance);
    var n2 = Math.sin(distance) * Math.cos(heading);
    var n3 = Math.sin(distance) * Math.sin(heading);
    var n4 = Math.sin(toRadians(to.lat));
    // There are two solutions for b. b = n2 * n4 +/- sqrt(), one solution results
    // in the latitude outside the [-90, 90] range. We first try one solution and
    // back off to the other if we are outside that range.
    var n12 = n1 * n1;
    var discriminant = n2 * n2 * n12 + n12 * n12 - n12 * n4 * n4;
    if (discriminant < 0) {
        // No real solution which would make sense in LatLng-space.
        return null;
    }
    var b = n2 * n4 + Math.sqrt(discriminant);
    b /= n1 * n1 + n2 * n2;
    var a = (n4 - n2 * b) / n1;
    var fromLatRadians = Math.atan2(a, b);
    if (fromLatRadians < - Math.PI / 2 || fromLatRadians > Math.PI / 2) {
        b = n2 * n4 - Math.sqrt(discriminant);
        b /= n1 * n1 + n2 * n2;
        fromLatRadians = Math.atan2(a, b);
    }
    if (fromLatRadians < - Math.PI / 2 || fromLatRadians > Math.PI / 2) {
        // No solution which would make sense in LatLng-space.
        return null;
    }
    var fromLngRadians = toRadians(to.lng) -
            Math.atan2(n3, n1 * Math.cos(fromLatRadians) - n2 * Math.sin(fromLatRadians));
    return new LatLng(toDegrees(fromLatRadians), toDegrees(fromLngRadians));
}


/**
 * Returns the LatLng which lies the given fraction of the way between the
 * origin LatLng and the destination LatLng.
 * @param from     The LatLng from which to start.
 * @param to       The LatLng toward which to travel.
 * @param fraction A fraction of the distance to travel.
 * @return The interpolated LatLng.
 */
function interpolate(from, to, fraction) {
    // http://en.wikipedia.org/wiki/Slerp
    var fromLat = toRadians(from.lat);
    var fromLng = toRadians(from.lng);
    var toLat = toRadians(to.lat);
    var toLng = toRadians(to.lng);
    var cosFromLat = Math.cos(fromLat);
    var cosToLat = Math.cos(toLat);

    // Computes Spherical interpolation coefficients.
    var angle = computeAngleBetween(from, to);
    var sinAngle = Math.sin(angle);
    if (sinAngle < 1E-6) {
        return from;
    }
    var a = Math.sin((1 - fraction) * angle) / sinAngle;
    var b = Math.sin(fraction * angle) / sinAngle;

    // Converts from polar to vector and interpolate.
    var x = a * cosFromLat * Math.cos(fromLng) + b * cosToLat * Math.cos(toLng);
    var y = a * cosFromLat * Math.sin(fromLng) + b * cosToLat * Math.sin(toLng);
    var z = a * Math.sin(fromLat) + b * Math.sin(toLat);

    // Converts interpolated vector back to polar.
    var lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    var lng = Math.atan2(y, x);
    return new LatLng(toDegrees(lat), toDegrees(lng));
}

/**
 * Returns the length of the given path, in meters, on Earth.
 */
function computeLength(path) {
    path = common.convertToPositionArray(path);
    if (path.length < 2) {
        return 0;
    }
    var length = 0;
    var prev = path[0];
    var prevLat = toRadians(prev.lat);
    var prevLng = toRadians(prev.lng);
    path.forEach(function(point) {
        var lat = toRadians(point.lat);
        var lng = toRadians(point.lng);
        length += distanceRadians(prevLat, prevLng, lat, lng);
        prevLat = lat;
        prevLng = lng;
    });
    return length * EARTH_RADIUS;
}
return  {
    computeDistanceBetween: computeDistanceBetween,
    computeOffset: computeOffset,
    computeOffsetOrigin: computeOffsetOrigin,
    computeArea: computeArea,
    computeSignedArea: computeSignedArea,
    computeHeading: computeHeading,
    interpolate: interpolate,
    computeLength: computeLength
};

});

},{"./Common":6,"./LatLng":11}],32:[function(require,module,exports){
(function(root, factory){
 if (typeof define === 'function') {
 cordova.define("cordova-plugin-googlemaps.utils", function(require, exports, module) {
                module.exports = factory(require, exports);
                });
 } else if (typeof exports === 'object') {
 module.exports = factory(require,exports);
 } else {
 root.returnExports = factory();
 }
 })(this, function(require, exports) {


var utils = exports;

/**
 * Defines a property getter / setter for obj[key].
 */
utils.defineGetterSetter = function (obj, key, getFunc, opt_setFunc) {
    if (Object.defineProperty) {
        var desc = {
            get: getFunc,
            configurable: true
        };
        if (opt_setFunc) {
            desc.set = opt_setFunc;
        }
        Object.defineProperty(obj, key, desc);
    } else {
        obj.__defineGetter__(key, getFunc);
        if (opt_setFunc) {
            obj.__defineSetter__(key, opt_setFunc);
        }
    }
};

/**
 * Defines a property getter for obj[key].
 */
utils.defineGetter = utils.defineGetterSetter;

utils.arrayIndexOf = function (a, item) {
    if (a.indexOf) {
        return a.indexOf(item);
    }
    var len = a.length;
    for (var i = 0; i < len; ++i) {
        if (a[i] === item) {
            return i;
        }
    }
    return -1;
};

/**
 * Returns whether the item was found in the array.
 */
utils.arrayRemove = function (a, item) {
    var index = utils.arrayIndexOf(a, item);
    if (index !== -1) {
        a.splice(index, 1);
    }
    return index !== -1;
};

utils.typeName = function (val) {
    return Object.prototype.toString.call(val).slice(8, -1);
};

/**
 * Returns an indication of whether the argument is an array or not
 */
utils.isArray = Array.isArray ||
                function (a) { return utils.typeName(a) === 'Array'; };

/**
 * Returns an indication of whether the argument is a Date or not
 */
utils.isDate = function (d) {
    return (d instanceof Date);
};

/**
 * Does a deep clone of the object.
 */
utils.clone = function (obj) {
    if (!obj || typeof obj === 'function' || utils.isDate(obj) || typeof obj !== 'object') {
        return obj;
    }

    var retVal, i;

    if (utils.isArray(obj)) {
        retVal = [];
        for (i = 0; i < obj.length; ++i) {
            retVal.push(utils.clone(obj[i]));
        }
        return retVal;
    }

    retVal = {};
    for (i in obj) {
        // https://issues.apache.org/jira/browse/CB-11522 'unknown' type may be returned in
        // custom protocol activation case on Windows Phone 8.1 causing "No such interface supported" exception
        // on cloning.
        if ((!(i in retVal) || retVal[i] !== obj[i]) && typeof obj[i] !== 'undefined' && typeof obj[i] !== 'unknown') { // eslint-disable-line valid-typeof
            retVal[i] = utils.clone(obj[i]);
        }
    }
    return retVal;
};

/**
 * Returns a wrapped version of the function
 */
utils.close = function (context, func, params) {
    return function () {
        var args = params || arguments;
        return func.apply(context, args);
    };
};

// ------------------------------------------------------------------------------
function UUIDcreatePart (length) {
    var uuidpart = '';
    for (var i = 0; i < length; i++) {
        var uuidchar = parseInt((Math.random() * 256), 10).toString(16);
        if (uuidchar.length === 1) {
            uuidchar = '0' + uuidchar;
        }
        uuidpart += uuidchar;
    }
    return uuidpart;
}

/**
 * Create a UUID
 */
utils.createUUID = function () {
    return UUIDcreatePart(4) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(6);
};

/**
 * Extends a child object from a parent object using classical inheritance
 * pattern.
 */
utils.extend = (function () {
    // proxy used to establish prototype chain
    var F = function () {};
    // extend Child from Parent
    return function (Child, Parent) {

        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.__super__ = Parent.prototype;
        Child.prototype.constructor = Child;
    };
}());

/**
 * Alerts a message in any available way: alert or console.log.
 */
utils.alert = function (msg) {
    if (window.alert) {
        window.alert(msg);
    } else if (console && console.log) {
        console.log(msg);
    }
};
       return  utils;
});

},{}]},{},[28]);
