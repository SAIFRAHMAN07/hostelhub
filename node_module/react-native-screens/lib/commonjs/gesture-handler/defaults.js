"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultScreenDimensions = exports.DefaultEvent = exports.AnimationForGesture = void 0;
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _reactNativeReanimated = require("react-native-reanimated");
const DefaultEvent = exports.DefaultEvent = {
  absoluteX: 0,
  absoluteY: 0,
  handlerTag: 0,
  numberOfPointers: 0,
  state: 0,
  translationX: 0,
  translationY: 0,
  velocityX: 0,
  velocityY: 0,
  x: 0,
  y: 0,
  // These two were added in recent versions of gesture handler
  // and they are required to specify. This should be backward
  // compatible unless they strictly parse the objects, which seems
  // not likely. PointerType is present since 2.16.0, StylusData since 2.20.0
  pointerType: _reactNativeGestureHandler.PointerType.TOUCH
};
const DefaultScreenDimensions = exports.DefaultScreenDimensions = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  pageX: 0,
  pageY: 0
};
const AnimationForGesture = exports.AnimationForGesture = {
  swipeRight: _reactNativeReanimated.ScreenTransition.SwipeRight,
  swipeLeft: _reactNativeReanimated.ScreenTransition.SwipeLeft,
  swipeDown: _reactNativeReanimated.ScreenTransition.SwipeDown,
  swipeUp: _reactNativeReanimated.ScreenTransition.SwipeUp,
  horizontalSwipe: _reactNativeReanimated.ScreenTransition.Horizontal,
  verticalSwipe: _reactNativeReanimated.ScreenTransition.Vertical,
  twoDimensionalSwipe: _reactNativeReanimated.ScreenTransition.TwoDimensional
};
//# sourceMappingURL=defaults.js.map