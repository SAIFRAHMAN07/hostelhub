"use strict";

import { BaseNavigationContainer, getActionFromState, getPathFromState, getStateFromPath, ThemeProvider, validatePathConfig } from '@react-navigation/core';
import * as React from 'react';
import { I18nManager } from 'react-native';
import useLatestCallback from 'use-latest-callback';
import { LinkingContext } from "./LinkingContext.js";
import { LocaleDirContext } from "./LocaleDirContext.js";
import { DefaultTheme } from "./theming/DefaultTheme.js";
import { UnhandledLinkingContext } from "./UnhandledLinkingContext.js";
import { useBackButton } from './useBackButton';
import { useDocumentTitle } from './useDocumentTitle';
import { useLinking } from './useLinking';
import { useThenable } from "./useThenable.js";
import { jsx as _jsx } from "react/jsx-runtime";
globalThis.REACT_NAVIGATION_DEVTOOLS = new WeakMap();
/**
 * Container component which holds the navigation state designed for React Native apps.
 * This should be rendered at the root wrapping the whole app.
 *
 * @param props.initialState Initial state object for the navigation tree. When deep link handling is enabled, this will override deep links when specified. Make sure that you don't specify an `initialState` when there's a deep link (`Linking.getInitialURL()`).
 * @param props.onReady Callback which is called after the navigation tree mounts.
 * @param props.onStateChange Callback which is called with the latest navigation state when it changes.
 * @param props.onUnhandledAction Callback which is called when an action is not handled.
 * @param props.direction Text direction of the components. Defaults to `'ltr'`.
 * @param props.theme Theme object for the UI elements.
 * @param props.linking Options for deep linking. Deep link handling is enabled when this prop is provided, unless `linking.enabled` is `false`.
 * @param props.fallback Fallback component to render until we have finished getting initial state when linking is enabled. Defaults to `null`.
 * @param props.documentTitle Options to configure the document title on Web. Updating document title is handled by default unless `documentTitle.enabled` is `false`.
 * @param props.children Child elements to render the content.
 * @param props.ref Ref object which refers to the navigation object containing helper methods.
 */
function NavigationContainerInner({
  direction = I18nManager.getConstants().isRTL ? 'rtl' : 'ltr',
  theme = DefaultTheme,
  linking,
  fallback = null,
  documentTitle,
  onReady,
  onStateChange,
  ...rest
}, ref) {
  const isLinkingEnabled = linking ? linking.enabled !== false : false;
  if (linking?.config) {
    validatePathConfig(linking.config);
  }
  const refContainer = React.useRef(null);
  useBackButton(refContainer);
  useDocumentTitle(refContainer, documentTitle);
  const [lastUnhandledLink, setLastUnhandledLink] = React.useState();
  const {
    getInitialState
  } = useLinking(refContainer, {
    enabled: isLinkingEnabled,
    prefixes: [],
    ...linking
  }, setLastUnhandledLink);
  const linkingContext = React.useMemo(() => ({
    options: linking
  }), [linking]);
  const unhandledLinkingContext = React.useMemo(() => ({
    lastUnhandledLink,
    setLastUnhandledLink
  }), [lastUnhandledLink, setLastUnhandledLink]);
  const onReadyForLinkingHandling = useLatestCallback(() => {
    // If the screen path matches lastUnhandledLink, we do not track it
    const path = refContainer.current?.getCurrentRoute()?.path;
    setLastUnhandledLink(previousLastUnhandledLink => {
      if (previousLastUnhandledLink === path) {
        return undefined;
      }
      return previousLastUnhandledLink;
    });
    onReady?.();
  });
  const onStateChangeForLinkingHandling = useLatestCallback(state => {
    // If the screen path matches lastUnhandledLink, we do not track it
    const path = refContainer.current?.getCurrentRoute()?.path;
    setLastUnhandledLink(previousLastUnhandledLink => {
      if (previousLastUnhandledLink === path) {
        return undefined;
      }
      return previousLastUnhandledLink;
    });
    onStateChange?.(state);
  });
  // Add additional linking related info to the ref
  // This will be used by the devtools
  React.useEffect(() => {
    if (refContainer.current) {
      REACT_NAVIGATION_DEVTOOLS.set(refContainer.current, {
        get linking() {
          return {
            ...linking,
            enabled: isLinkingEnabled,
            prefixes: linking?.prefixes ?? [],
            getStateFromPath: linking?.getStateFromPath ?? getStateFromPath,
            getPathFromState: linking?.getPathFromState ?? getPathFromState,
            getActionFromState: linking?.getActionFromState ?? getActionFromState
          };
        }
      });
    }
  });
  const [isResolved, initialState] = useThenable(getInitialState);

  // FIXME
  // @ts-expect-error not sure why this is not working
  React.useImperativeHandle(ref, () => refContainer.current);
  const isLinkingReady = rest.initialState != null || !isLinkingEnabled || isResolved;
  if (!isLinkingReady) {
    return /*#__PURE__*/_jsx(LocaleDirContext.Provider, {
      value: direction,
      children: /*#__PURE__*/_jsx(ThemeProvider, {
        value: theme,
        children: fallback
      })
    });
  }
  return /*#__PURE__*/_jsx(LocaleDirContext.Provider, {
    value: direction,
    children: /*#__PURE__*/_jsx(UnhandledLinkingContext.Provider, {
      value: unhandledLinkingContext,
      children: /*#__PURE__*/_jsx(LinkingContext.Provider, {
        value: linkingContext,
        children: /*#__PURE__*/_jsx(BaseNavigationContainer, {
          ...rest,
          theme: theme,
          onReady: onReadyForLinkingHandling,
          onStateChange: onStateChangeForLinkingHandling,
          initialState: rest.initialState == null ? initialState : rest.initialState,
          ref: refContainer
        })
      })
    })
  });
}
export const NavigationContainer = /*#__PURE__*/React.forwardRef(NavigationContainerInner);
//# sourceMappingURL=NavigationContainer.js.map