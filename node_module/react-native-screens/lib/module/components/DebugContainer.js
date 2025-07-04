import * as React from 'react';
import { Platform } from 'react-native';
// @ts-expect-error importing private component

import AppContainer from 'react-native/Libraries/ReactNative/AppContainer';
import ScreenContentWrapper from './ScreenContentWrapper';
/**
 * This view must *not* be flattened.
 * See https://github.com/software-mansion/react-native-screens/pull/1825
 * for detailed explanation.
 */
let DebugContainer = props => {
  return /*#__PURE__*/React.createElement(ScreenContentWrapper, props);
};
if (process.env.NODE_ENV !== 'production') {
  DebugContainer = props => {
    const {
      stackPresentation,
      ...rest
    } = props;
    if (Platform.OS === 'ios' && stackPresentation !== 'push' && stackPresentation !== 'formSheet') {
      // This is necessary for LogBox
      return /*#__PURE__*/React.createElement(AppContainer, null, /*#__PURE__*/React.createElement(ScreenContentWrapper, rest));
    }
    return /*#__PURE__*/React.createElement(ScreenContentWrapper, rest);
  };
  DebugContainer.displayName = 'DebugContainer';
}
export default DebugContainer;
//# sourceMappingURL=DebugContainer.js.map