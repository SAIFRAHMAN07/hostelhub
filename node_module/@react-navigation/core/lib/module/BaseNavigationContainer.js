"use strict";

import { CommonActions } from '@react-navigation/routers';
import * as React from 'react';
import useLatestCallback from 'use-latest-callback';
import { checkDuplicateRouteNames } from "./checkDuplicateRouteNames.js";
import { checkSerializable } from "./checkSerializable.js";
import { NOT_INITIALIZED_ERROR } from "./createNavigationContainerRef.js";
import { DeprecatedNavigationInChildContext } from "./DeprecatedNavigationInChildContext.js";
import { EnsureSingleNavigator } from "./EnsureSingleNavigator.js";
import { findFocusedRoute } from "./findFocusedRoute.js";
import { NavigationBuilderContext } from "./NavigationBuilderContext.js";
import { NavigationContainerRefContext } from "./NavigationContainerRefContext.js";
import { NavigationIndependentTreeContext } from "./NavigationIndependentTreeContext.js";
import { NavigationStateContext } from "./NavigationStateContext.js";
import { ThemeProvider } from "./theming/ThemeProvider.js";
import { UnhandledActionContext } from "./UnhandledActionContext.js";
import { useChildListeners } from "./useChildListeners.js";
import { useEventEmitter } from "./useEventEmitter.js";
import { useKeyedChildListeners } from "./useKeyedChildListeners.js";
import { useNavigationIndependentTree } from "./useNavigationIndependentTree.js";
import { useOptionsGetters } from "./useOptionsGetters.js";
import { useSyncState } from "./useSyncState.js";
import { jsx as _jsx } from "react/jsx-runtime";
const serializableWarnings = [];
const duplicateNameWarnings = [];

/**
 * Remove `key` and `routeNames` from the state objects recursively to get partial state.
 *
 * @param state Initial state object.
 */
const getPartialState = state => {
  if (state === undefined) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    key,
    routeNames,
    ...partialState
  } = state;
  return {
    ...partialState,
    stale: true,
    routes: state.routes.map(route => {
      if (route.state === undefined) {
        return route;
      }
      return {
        ...route,
        state: getPartialState(route.state)
      };
    })
  };
};

/**
 * Container component which holds the navigation state.
 * This should be rendered at the root wrapping the whole app.
 *
 * @param props.initialState Initial state object for the navigation tree.
 * @param props.onReady Callback which is called after the navigation tree mounts.
 * @param props.onStateChange Callback which is called with the latest navigation state when it changes.
 * @param props.onUnhandledAction Callback which is called when an action is not handled.
 * @param props.theme Theme object for the UI elements.
 * @param props.children Child elements to render the content.
 * @param props.ref Ref object which refers to the navigation object containing helper methods.
 */
export const BaseNavigationContainer = /*#__PURE__*/React.forwardRef(function BaseNavigationContainer({
  initialState,
  onStateChange,
  onReady,
  onUnhandledAction,
  navigationInChildEnabled = false,
  theme,
  children
}, ref) {
  const parent = React.useContext(NavigationStateContext);
  const independent = useNavigationIndependentTree();
  if (!parent.isDefault && !independent) {
    throw new Error("Looks like you have nested a 'NavigationContainer' inside another. Normally you need only one container at the root of the app, so this was probably an error. If this was intentional, wrap the container in 'NavigationIndependentTree' explicitly. Note that this will make the child navigators disconnected from the parent and you won't be able to navigate between them.");
  }
  const {
    state,
    getState,
    setState,
    scheduleUpdate,
    flushUpdates
  } = useSyncState(() => getPartialState(initialState == null ? undefined : initialState));
  const isFirstMountRef = React.useRef(true);
  const navigatorKeyRef = React.useRef(undefined);
  const getKey = React.useCallback(() => navigatorKeyRef.current, []);
  const setKey = React.useCallback(key => {
    navigatorKeyRef.current = key;
  }, []);
  const {
    listeners,
    addListener
  } = useChildListeners();
  const {
    keyedListeners,
    addKeyedListener
  } = useKeyedChildListeners();
  const dispatch = useLatestCallback(action => {
    if (listeners.focus[0] == null) {
      console.error(NOT_INITIALIZED_ERROR);
    } else {
      listeners.focus[0](navigation => navigation.dispatch(action));
    }
  });
  const canGoBack = useLatestCallback(() => {
    if (listeners.focus[0] == null) {
      return false;
    }
    const {
      result,
      handled
    } = listeners.focus[0](navigation => navigation.canGoBack());
    if (handled) {
      return result;
    } else {
      return false;
    }
  });
  const resetRoot = useLatestCallback(state => {
    const target = state?.key ?? keyedListeners.getState.root?.().key;
    if (target == null) {
      console.error(NOT_INITIALIZED_ERROR);
    } else {
      listeners.focus[0](navigation => navigation.dispatch({
        ...CommonActions.reset(state),
        target
      }));
    }
  });
  const getRootState = useLatestCallback(() => {
    return keyedListeners.getState.root?.();
  });
  const getCurrentRoute = useLatestCallback(() => {
    const state = getRootState();
    if (state == null) {
      return undefined;
    }
    const route = findFocusedRoute(state);
    return route;
  });
  const isReady = useLatestCallback(() => listeners.focus[0] != null);
  const emitter = useEventEmitter();
  const {
    addOptionsGetter,
    getCurrentOptions
  } = useOptionsGetters({});
  const navigation = React.useMemo(() => ({
    ...Object.keys(CommonActions).reduce((acc, name) => {
      acc[name] = (...args) =>
      // @ts-expect-error: this is ok
      dispatch(CommonActions[name](...args));
      return acc;
    }, {}),
    ...emitter.create('root'),
    dispatch,
    resetRoot,
    isFocused: () => true,
    canGoBack,
    getParent: () => undefined,
    getState,
    getRootState,
    getCurrentRoute,
    getCurrentOptions,
    isReady,
    setOptions: () => {
      throw new Error('Cannot call setOptions outside a screen');
    }
  }), [canGoBack, dispatch, emitter, getCurrentOptions, getCurrentRoute, getRootState, getState, isReady, resetRoot]);
  React.useImperativeHandle(ref, () => navigation, [navigation]);
  const onDispatchAction = useLatestCallback((action, noop) => {
    emitter.emit({
      type: '__unsafe_action__',
      data: {
        action,
        noop,
        stack: stackRef.current
      }
    });
  });
  const lastEmittedOptionsRef = React.useRef(undefined);
  const onOptionsChange = useLatestCallback(options => {
    if (lastEmittedOptionsRef.current === options) {
      return;
    }
    lastEmittedOptionsRef.current = options;
    emitter.emit({
      type: 'options',
      data: {
        options
      }
    });
  });
  const stackRef = React.useRef(undefined);
  const builderContext = React.useMemo(() => ({
    addListener,
    addKeyedListener,
    onDispatchAction,
    onOptionsChange,
    scheduleUpdate,
    flushUpdates,
    stackRef
  }), [addListener, addKeyedListener, onDispatchAction, onOptionsChange, scheduleUpdate, flushUpdates]);
  const isInitialRef = React.useRef(true);
  const getIsInitial = React.useCallback(() => isInitialRef.current, []);
  const context = React.useMemo(() => ({
    state,
    getState,
    setState,
    getKey,
    setKey,
    getIsInitial,
    addOptionsGetter
  }), [state, getState, setState, getKey, setKey, getIsInitial, addOptionsGetter]);
  const onReadyRef = React.useRef(onReady);
  const onStateChangeRef = React.useRef(onStateChange);
  React.useEffect(() => {
    isInitialRef.current = false;
    onStateChangeRef.current = onStateChange;
    onReadyRef.current = onReady;
  });
  const onReadyCalledRef = React.useRef(false);
  React.useEffect(() => {
    if (!onReadyCalledRef.current && isReady()) {
      onReadyCalledRef.current = true;
      onReadyRef.current?.();
      emitter.emit({
        type: 'ready'
      });
    }
  }, [state, isReady, emitter]);
  React.useEffect(() => {
    const hydratedState = getRootState();
    if (process.env.NODE_ENV !== 'production') {
      if (hydratedState !== undefined) {
        const serializableResult = checkSerializable(hydratedState);
        if (!serializableResult.serializable) {
          const {
            location,
            reason
          } = serializableResult;
          let path = '';
          let pointer = hydratedState;
          let params = false;
          for (let i = 0; i < location.length; i++) {
            const curr = location[i];
            const prev = location[i - 1];
            pointer = pointer[curr];
            if (!params && curr === 'state') {
              continue;
            } else if (!params && curr === 'routes') {
              if (path) {
                path += ' > ';
              }
            } else if (!params && typeof curr === 'number' && prev === 'routes') {
              path += pointer?.name;
            } else if (!params) {
              path += ` > ${curr}`;
              params = true;
            } else {
              if (typeof curr === 'number' || /^[0-9]+$/.test(curr)) {
                path += `[${curr}]`;
              } else if (/^[a-z$_]+$/i.test(curr)) {
                path += `.${curr}`;
              } else {
                path += `[${JSON.stringify(curr)}]`;
              }
            }
          }
          const message = `Non-serializable values were found in the navigation state. Check:\n\n${path} (${reason})\n\nThis can break usage such as persisting and restoring state. This might happen if you passed non-serializable values such as function, class instances etc. in params. If you need to use components with callbacks in your options, you can use 'navigation.setOptions' instead. See https://reactnavigation.org/docs/troubleshooting#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state for more details.`;
          if (!serializableWarnings.includes(message)) {
            serializableWarnings.push(message);
            console.warn(message);
          }
        }
        const duplicateRouteNamesResult = checkDuplicateRouteNames(hydratedState);
        if (duplicateRouteNamesResult.length) {
          const message = `Found screens with the same name nested inside one another. Check:\n${duplicateRouteNamesResult.map(locations => `\n${locations.join(', ')}`)}\n\nThis can cause confusing behavior during navigation. Consider using unique names for each screen instead.`;
          if (!duplicateNameWarnings.includes(message)) {
            duplicateNameWarnings.push(message);
            console.warn(message);
          }
        }
      }
    }
    emitter.emit({
      type: 'state',
      data: {
        state
      }
    });
    if (!isFirstMountRef.current && onStateChangeRef.current) {
      onStateChangeRef.current(hydratedState);
    }
    isFirstMountRef.current = false;
  }, [getRootState, emitter, state]);
  const defaultOnUnhandledAction = useLatestCallback(action => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    const payload = action.payload;
    let message = `The action '${action.type}'${payload ? ` with payload ${JSON.stringify(action.payload)}` : ''} was not handled by any navigator.`;
    switch (action.type) {
      case 'PRELOAD':
      case 'NAVIGATE':
      case 'PUSH':
      case 'REPLACE':
      case 'POP_TO':
      case 'JUMP_TO':
        if (payload?.name) {
          message += `\n\nDo you have a screen named '${payload.name}'?\n\nIf you're trying to navigate to a screen in a nested navigator, see https://reactnavigation.org/docs/nesting-navigators#navigating-to-a-screen-in-a-nested-navigator.\n\nIf you're using conditional rendering, navigation will happen automatically and you shouldn't navigate manually, see.`;
        } else {
          message += `\n\nYou need to pass the name of the screen to navigate to.\n\nSee https://reactnavigation.org/docs/navigation-actions for usage.`;
        }
        break;
      case 'GO_BACK':
      case 'POP':
      case 'POP_TO_TOP':
        message += `\n\nIs there any screen to go back to?`;
        break;
      case 'OPEN_DRAWER':
      case 'CLOSE_DRAWER':
      case 'TOGGLE_DRAWER':
        message += `\n\nIs your screen inside a Drawer navigator?`;
        break;
    }
    message += `\n\nThis is a development-only warning and won't be shown in production.`;
    console.error(message);
  });
  return /*#__PURE__*/_jsx(NavigationIndependentTreeContext.Provider, {
    value: false,
    children: /*#__PURE__*/_jsx(NavigationContainerRefContext.Provider, {
      value: navigation,
      children: /*#__PURE__*/_jsx(NavigationBuilderContext.Provider, {
        value: builderContext,
        children: /*#__PURE__*/_jsx(NavigationStateContext.Provider, {
          value: context,
          children: /*#__PURE__*/_jsx(UnhandledActionContext.Provider, {
            value: onUnhandledAction ?? defaultOnUnhandledAction,
            children: /*#__PURE__*/_jsx(DeprecatedNavigationInChildContext.Provider, {
              value: navigationInChildEnabled,
              children: /*#__PURE__*/_jsx(EnsureSingleNavigator, {
                children: /*#__PURE__*/_jsx(ThemeProvider, {
                  value: theme,
                  children: children
                })
              })
            })
          })
        })
      })
    })
  });
});
//# sourceMappingURL=BaseNavigationContainer.js.map