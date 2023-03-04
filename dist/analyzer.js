/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 524);
/******/ })
/************************************************************************/
/******/ ({

/***/ 524:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(525);


/***/ }),

/***/ 525:
/***/ (function(module, exports) {

self.addEventListener('message', function (e) {
  var config = e.data.config;
  var imagePixels = e.data.data;
  var width = e.data.width;
  var height = e.data.height;
  var squiggleData = [];
  var startx = 0.0;
  var starty = 0.0;
  var r = 5;
  var a = 0.0;
  var b = void 0;
  var z = void 0;
  var coords = [];
  var currentVerticalPixelIndex = 0;
  var currentHorizontalPixelIndex = 0;
  var contrastFactor = 259 * (config.CONTRAST_ADJUSTMENT + 255) / (255 * (259 - config.CONTRAST_ADJUSTMENT));
  for (var y = 0; y < height; y += Math.floor(height / config.LINE_COUNT)) {
    a = 0.0;
    coords = [];
    currentVerticalPixelIndex = y * width;
    startx = 0;
    if (config.CONTRAST_ADJUSTMENT !== 0) {
      b = parseInt(0.2125 * (contrastFactor * (imagePixels.data[4 * currentVerticalPixelIndex] - 128) + 128 + config.BRIGHTNESS_ADJUSTMENT) + 0.7154 * (contrastFactor * (imagePixels.data[4 * (currentVerticalPixelIndex + 1)] - 128) + 128 + config.BRIGHTNESS_ADJUSTMENT) + 0.0721 * (contrastFactor * (imagePixels.data[4 * (currentVerticalPixelIndex + 2)] - 128) + 128 + config.BRIGHTNESS_ADJUSTMENT), 10);
    } else {
      b = parseInt(0.2125 * (imagePixels.data[4 * currentVerticalPixelIndex] + config.BRIGHTNESS_ADJUSTMENT) + 0.7154 * (imagePixels.data[4 * (currentVerticalPixelIndex + 1)] + config.BRIGHTNESS_ADJUSTMENT) + 0.0721 * (imagePixels.data[4 * (currentVerticalPixelIndex + 2)] + config.BRIGHTNESS_ADJUSTMENT), 10);
    }

    z = 255 - b;
    starty = y + Math.sin(a) * r;
    coords.push([startx, starty]);

    for (var x = 1; x < width; x += config.SPACING) {
      currentHorizontalPixelIndex = x + y * width;
      if (config.CONTRAST_ADJUSTMENT !== 0) {
        b = parseInt(0.2125 * (contrastFactor * (imagePixels.data[4 * currentHorizontalPixelIndex] - 128) + 128 + config.BRIGHTNESS_ADJUSTMENT) + 0.7154 * (contrastFactor * (imagePixels.data[4 * (currentHorizontalPixelIndex + 1)] - 128) + 128 + config.BRIGHTNESS_ADJUSTMENT) + 0.0721 * (contrastFactor * (imagePixels.data[4 * (currentHorizontalPixelIndex + 2)] - 128) + 128 + config.BRIGHTNESS_ADJUSTMENT), 10);
      } else {
        b = parseInt(0.2125 * (imagePixels.data[4 * currentHorizontalPixelIndex] + config.BRIGHTNESS_ADJUSTMENT) + 0.7154 * (imagePixels.data[4 * (currentHorizontalPixelIndex + 1)] + config.BRIGHTNESS_ADJUSTMENT) + 0.0721 * (imagePixels.data[4 * (currentHorizontalPixelIndex + 2)] + config.BRIGHTNESS_ADJUSTMENT), 10);
      }

      b = Math.max(config.MIN_BRIGHTNESS, b);
      z = Math.max(config.MAX_BRIGHTNESS - b, 0);
      r = z / config.LINE_COUNT * config.AMPLITUDE;
      a += z / config.FREQUENCY;
      coords.push([x, y + Math.sin(a) * r]);
    }
    squiggleData.push(coords);
  }
  self.postMessage(squiggleData);
}, false);

/***/ })

/******/ });