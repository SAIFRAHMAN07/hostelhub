"use strict";

import { useTheme } from '@react-navigation/native';
import * as React from 'react';
import { Animated, Easing, Platform, Pressable } from 'react-native';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const ANDROID_VERSION_LOLLIPOP = 21;
const ANDROID_SUPPORTS_RIPPLE = Platform.OS === 'android' && Platform.Version >= ANDROID_VERSION_LOLLIPOP;
const useNativeDriver = Platform.OS !== 'web';

/**
 * PlatformPressable provides an abstraction on top of Pressable to handle platform differences.
 */
function PlatformPressableInternal({
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  android_ripple,
  pressColor,
  pressOpacity = 0.3,
  hoverEffect,
  style,
  children,
  ...rest
}, ref) {
  const {
    dark
  } = useTheme();
  const [opacity] = React.useState(() => new Animated.Value(1));
  const animateTo = (toValue, duration) => {
    if (ANDROID_SUPPORTS_RIPPLE) {
      return;
    }
    Animated.timing(opacity, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver
    }).start();
  };
  const handlePress = e => {
    if (Platform.OS === 'web' && rest.href !== null) {
      // ignore clicks with modifier keys
      const hasModifierKey = 'metaKey' in e && e.metaKey || 'altKey' in e && e.altKey || 'ctrlKey' in e && e.ctrlKey || 'shiftKey' in e && e.shiftKey;

      // only handle left clicks
      const isLeftClick = 'button' in e ? e.button == null || e.button === 0 : true;

      // let browser handle "target=_blank" etc.
      const isSelfTarget = e.currentTarget && 'target' in e.currentTarget ? [undefined, null, '', 'self'].includes(e.currentTarget.target) : true;
      if (!hasModifierKey && isLeftClick && isSelfTarget) {
        e.preventDefault();
        // call `onPress` only when browser default is prevented
        // this prevents app from handling the click when a link is being opened
        onPress?.(e);
      }
    } else {
      onPress?.(e);
    }
  };
  const handlePressIn = e => {
    animateTo(pressOpacity, 0);
    onPressIn?.(e);
  };
  const handlePressOut = e => {
    animateTo(1, 200);
    onPressOut?.(e);
  };
  return /*#__PURE__*/_jsxs(AnimatedPressable, {
    ref: ref,
    accessible: true,
    role: Platform.OS === 'web' && rest.href != null ? 'link' : 'button',
    onPress: disabled ? undefined : handlePress,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    android_ripple: ANDROID_SUPPORTS_RIPPLE ? {
      color: pressColor !== undefined ? pressColor : dark ? 'rgba(255, 255, 255, .32)' : 'rgba(0, 0, 0, .32)',
      ...android_ripple
    } : undefined,
    style: [{
      cursor: Platform.OS === 'web' || Platform.OS === 'ios' ?
      // Pointer cursor on web
      // Hover effect on iPad and visionOS
      'pointer' : 'auto',
      opacity: !ANDROID_SUPPORTS_RIPPLE ? opacity : 1
    }, style],
    ...rest,
    children: [/*#__PURE__*/_jsx(HoverEffect, {
      ...hoverEffect
    }), children]
  });
}
export const PlatformPressable = /*#__PURE__*/React.forwardRef(PlatformPressableInternal);
PlatformPressable.displayName = 'PlatformPressable';
const css = String.raw;
const CLASS_NAME = `__react-navigation_elements_Pressable_hover`;
const CSS_TEXT = css`
  .${CLASS_NAME} {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    background-color: var(--overlay-color);
    opacity: 0;
    transition: opacity 0.15s;
  }

  a:hover > .${CLASS_NAME}, button:hover > .${CLASS_NAME} {
    opacity: var(--overlay-hover-opacity);
  }

  a:active > .${CLASS_NAME}, button:active > .${CLASS_NAME} {
    opacity: var(--overlay-active-opacity);
  }
`;
const HoverEffect = ({
  color,
  hoverOpacity = 0.08,
  activeOpacity = 0.16
}) => {
  if (Platform.OS !== 'web' || color == null) {
    return null;
  }
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("style", {
      href: CLASS_NAME,
      precedence: "elements",
      children: CSS_TEXT
    }), /*#__PURE__*/_jsx("div", {
      className: CLASS_NAME,
      style: {
        // @ts-expect-error: CSS variables are not typed
        '--overlay-color': color,
        '--overlay-hover-opacity': hoverOpacity,
        '--overlay-active-opacity': activeOpacity
      }
    })]
  });
};
//# sourceMappingURL=PlatformPressable.js.map