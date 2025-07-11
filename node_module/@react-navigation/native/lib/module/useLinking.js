"use strict";

import { findFocusedRoute, getActionFromState as getActionFromStateDefault, getPathFromState as getPathFromStateDefault, getStateFromPath as getStateFromPathDefault, useNavigationIndependentTree } from '@react-navigation/core';
import isEqual from 'fast-deep-equal';
import * as React from 'react';
import { createMemoryHistory } from "./createMemoryHistory.js";
import { ServerContext } from "./ServerContext.js";
/**
 * Find the matching navigation state that changed between 2 navigation states
 * e.g.: a -> b -> c -> d and a -> b -> c -> e -> f, if history in b changed, b is the matching state
 */
const findMatchingState = (a, b) => {
  if (a === undefined || b === undefined || a.key !== b.key) {
    return [undefined, undefined];
  }

  // Tab and drawer will have `history` property, but stack will have history in `routes`
  const aHistoryLength = a.history ? a.history.length : a.routes.length;
  const bHistoryLength = b.history ? b.history.length : b.routes.length;
  const aRoute = a.routes[a.index];
  const bRoute = b.routes[b.index];
  const aChildState = aRoute.state;
  const bChildState = bRoute.state;

  // Stop here if this is the state object that changed:
  // - history length is different
  // - focused routes are different
  // - one of them doesn't have child state
  // - child state keys are different
  if (aHistoryLength !== bHistoryLength || aRoute.key !== bRoute.key || aChildState === undefined || bChildState === undefined || aChildState.key !== bChildState.key) {
    return [a, b];
  }
  return findMatchingState(aChildState, bChildState);
};

/**
 * Run async function in series as it's called.
 */
export const series = cb => {
  let queue = Promise.resolve();
  const callback = () => {
    // eslint-disable-next-line promise/no-callback-in-promise
    queue = queue.then(cb);
  };
  return callback;
};
const linkingHandlers = [];
export function useLinking(ref, {
  enabled = true,
  config,
  getStateFromPath = getStateFromPathDefault,
  getPathFromState = getPathFromStateDefault,
  getActionFromState = getActionFromStateDefault
}, onUnhandledLinking) {
  const independent = useNavigationIndependentTree();
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return undefined;
    }
    if (independent) {
      return undefined;
    }
    if (enabled !== false && linkingHandlers.length) {
      console.error(['Looks like you have configured linking in multiple places. This is likely an error since deep links should only be handled in one place to avoid conflicts. Make sure that:', "- You don't have multiple NavigationContainers in the app each with 'linking' enabled", '- Only a single instance of the root component is rendered'].join('\n').trim());
    }
    const handler = Symbol();
    if (enabled !== false) {
      linkingHandlers.push(handler);
    }
    return () => {
      const index = linkingHandlers.indexOf(handler);
      if (index > -1) {
        linkingHandlers.splice(index, 1);
      }
    };
  }, [enabled, independent]);
  const [history] = React.useState(createMemoryHistory);

  // We store these options in ref to avoid re-creating getInitialState and re-subscribing listeners
  // This lets user avoid wrapping the items in `React.useCallback` or `React.useMemo`
  // Not re-creating `getInitialState` is important coz it makes it easier for the user to use in an effect
  const enabledRef = React.useRef(enabled);
  const configRef = React.useRef(config);
  const getStateFromPathRef = React.useRef(getStateFromPath);
  const getPathFromStateRef = React.useRef(getPathFromState);
  const getActionFromStateRef = React.useRef(getActionFromState);
  React.useEffect(() => {
    enabledRef.current = enabled;
    configRef.current = config;
    getStateFromPathRef.current = getStateFromPath;
    getPathFromStateRef.current = getPathFromState;
    getActionFromStateRef.current = getActionFromState;
  });
  const validateRoutesNotExistInRootState = React.useCallback(state => {
    const navigation = ref.current;
    const rootState = navigation?.getRootState();
    // Make sure that the routes in the state exist in the root navigator
    // Otherwise there's an error in the linking configuration
    return state?.routes.some(r => !rootState?.routeNames.includes(r.name));
  }, [ref]);
  const server = React.useContext(ServerContext);
  const getInitialState = React.useCallback(() => {
    let value;
    if (enabledRef.current) {
      const location = server?.location ?? (typeof window !== 'undefined' ? window.location : undefined);
      const path = location ? location.pathname + location.search : undefined;
      if (path) {
        value = getStateFromPathRef.current(path, configRef.current);
      }

      // If the link were handled, it gets cleared in NavigationContainer
      onUnhandledLinking(path);
    }
    const thenable = {
      then(onfulfilled) {
        return Promise.resolve(onfulfilled ? onfulfilled(value) : value);
      },
      catch() {
        return thenable;
      }
    };
    return thenable;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const previousIndexRef = React.useRef(undefined);
  const previousStateRef = React.useRef(undefined);
  const pendingPopStatePathRef = React.useRef(undefined);
  React.useEffect(() => {
    previousIndexRef.current = history.index;
    return history.listen(() => {
      const navigation = ref.current;
      if (!navigation || !enabled) {
        return;
      }
      const {
        location
      } = window;
      const path = location.pathname + location.search;
      const index = history.index;
      const previousIndex = previousIndexRef.current ?? 0;
      previousIndexRef.current = index;
      pendingPopStatePathRef.current = path;

      // When browser back/forward is clicked, we first need to check if state object for this index exists
      // If it does we'll reset to that state object
      // Otherwise, we'll handle it like a regular deep link
      const record = history.get(index);
      if (record?.path === path && record?.state) {
        navigation.resetRoot(record.state);
        return;
      }
      const state = getStateFromPathRef.current(path, configRef.current);

      // We should only dispatch an action when going forward
      // Otherwise the action will likely add items to history, which would mess things up
      if (state) {
        // If the link were handled, it gets cleared in NavigationContainer
        onUnhandledLinking(path);
        // Make sure that the routes in the state exist in the root navigator
        // Otherwise there's an error in the linking configuration
        if (validateRoutesNotExistInRootState(state)) {
          return;
        }
        if (index > previousIndex) {
          const action = getActionFromStateRef.current(state, configRef.current);
          if (action !== undefined) {
            try {
              navigation.dispatch(action);
            } catch (e) {
              // Ignore any errors from deep linking.
              // This could happen in case of malformed links, navigation object not being initialized etc.
              console.warn(`An error occurred when trying to handle the link '${path}': ${typeof e === 'object' && e != null && 'message' in e ? e.message : e}`);
            }
          } else {
            navigation.resetRoot(state);
          }
        } else {
          navigation.resetRoot(state);
        }
      } else {
        // if current path didn't return any state, we should revert to initial state
        navigation.resetRoot(state);
      }
    });
  }, [enabled, history, onUnhandledLinking, ref, validateRoutesNotExistInRootState]);
  React.useEffect(() => {
    if (!enabled) {
      return;
    }
    const getPathForRoute = (route, state) => {
      let path;

      // If the `route` object contains a `path`, use that path as long as `route.name` and `params` still match
      // This makes sure that we preserve the original URL for wildcard routes
      if (route?.path) {
        const stateForPath = getStateFromPathRef.current(route.path, configRef.current);
        if (stateForPath) {
          const focusedRoute = findFocusedRoute(stateForPath);
          if (focusedRoute && focusedRoute.name === route.name && isEqual(focusedRoute.params, route.params)) {
            path = route.path;
          }
        }
      }
      if (path == null) {
        path = getPathFromStateRef.current(state, configRef.current);
      }
      const previousRoute = previousStateRef.current ? findFocusedRoute(previousStateRef.current) : undefined;

      // Preserve the hash if the route didn't change
      if (previousRoute && route && 'key' in previousRoute && 'key' in route && previousRoute.key === route.key) {
        path = path + location.hash;
      }
      return path;
    };
    if (ref.current) {
      // We need to record the current metadata on the first render if they aren't set
      // This will allow the initial state to be in the history entry
      const state = ref.current.getRootState();
      if (state) {
        const route = findFocusedRoute(state);
        const path = getPathForRoute(route, state);
        if (previousStateRef.current === undefined) {
          previousStateRef.current = state;
        }
        history.replace({
          path,
          state
        });
      }
    }
    const onStateChange = async () => {
      const navigation = ref.current;
      if (!navigation || !enabled) {
        return;
      }
      const previousState = previousStateRef.current;
      const state = navigation.getRootState();

      // root state may not available, for example when root navigators switch inside the container
      if (!state) {
        return;
      }
      const pendingPath = pendingPopStatePathRef.current;
      const route = findFocusedRoute(state);
      const path = getPathForRoute(route, state);
      previousStateRef.current = state;
      pendingPopStatePathRef.current = undefined;

      // To detect the kind of state change, we need to:
      // - Find the common focused navigation state in previous and current state
      // - If only the route keys changed, compare history/routes.length to check if we go back/forward/replace
      // - If no common focused navigation state found, it's a replace
      const [previousFocusedState, focusedState] = findMatchingState(previousState, state);
      if (previousFocusedState && focusedState &&
      // We should only handle push/pop if path changed from what was in last `popstate`
      // Otherwise it's likely a change triggered by `popstate`
      path !== pendingPath) {
        const historyDelta = (focusedState.history ? focusedState.history.length : focusedState.routes.length) - (previousFocusedState.history ? previousFocusedState.history.length : previousFocusedState.routes.length);
        if (historyDelta > 0) {
          // If history length is increased, we should pushState
          // Note that path might not actually change here, for example, drawer open should pushState
          history.push({
            path,
            state
          });
        } else if (historyDelta < 0) {
          // If history length is decreased, i.e. entries were removed, we want to go back

          const nextIndex = history.backIndex({
            path
          });
          const currentIndex = history.index;
          try {
            if (nextIndex !== -1 && nextIndex < currentIndex &&
            // We should only go back if the entry exists and it's less than current index
            history.get(nextIndex)) {
              // An existing entry for this path exists and it's less than current index, go back to that
              await history.go(nextIndex - currentIndex);
            } else {
              // We couldn't find an existing entry to go back to, so we'll go back by the delta
              // This won't be correct if multiple routes were pushed in one go before
              // Usually this shouldn't happen and this is a fallback for that
              await history.go(historyDelta);
            }

            // Store the updated state as well as fix the path if incorrect
            history.replace({
              path,
              state
            });
          } catch (e) {
            // The navigation was interrupted
          }
        } else {
          // If history length is unchanged, we want to replaceState
          history.replace({
            path,
            state
          });
        }
      } else {
        // If no common navigation state was found, assume it's a replace
        // This would happen if the user did a reset/conditionally changed navigators
        history.replace({
          path,
          state
        });
      }
    };

    // We debounce onStateChange coz we don't want multiple state changes to be handled at one time
    // This could happen since `history.go(n)` is asynchronous
    // If `pushState` or `replaceState` were called before `history.go(n)` completes, it'll mess stuff up
    return ref.current?.addListener('state', series(onStateChange));
  }, [enabled, history, ref]);
  return {
    getInitialState
  };
}
//# sourceMappingURL=useLinking.js.map