export declare const isSearchBarAvailableForCurrentPlatform: boolean;
export declare function executeNativeBackPress(): boolean;
/**
 * Exposes information useful for downstream navigation library implementers,
 * so they can keep reasonable backward compatibility, if desired.
 *
 * We don't mean for this object to only grow in number of fields, however at the same time
 * we won't be very hasty to reduce it. Expect gradual changes.
 */
export declare const compatibilityFlags: {
    /**
     * Because of a bug introduced in https://github.com/software-mansion/react-native-screens/pull/1646
     * react-native-screens v3.21 changed how header's backTitle handles whitespace strings in https://github.com/software-mansion/react-native-screens/pull/1726
     * To allow for backwards compatibility in @react-navigation/native-stack we need a way to check if this version or newer is used.
     * See https://github.com/react-navigation/react-navigation/pull/11423 for more context.
     */
    isNewBackTitleImplementation: boolean;
    /**
     * With version 4.0.0 the header implementation has been changed. To allow for backward compat
     * with native-stack@v6 we want to expose a way to check whether the new implementation
     * is in use or not.
     *
     * See:
     * * https://github.com/software-mansion/react-native-screens/pull/2325
     * * https://github.com/react-navigation/react-navigation/pull/12125
     */
    usesHeaderFlexboxImplementation: boolean;
};
//# sourceMappingURL=utils.d.ts.map