"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appDelegateSwiftOpenUrlInsertionPointAfter = exports.multiline_appDelegateOpenUrlInsertionPointAfter = exports.appDelegateOpenUrlInsertionPointAfter = exports.withIosCaptchaOpenUrlFix = void 0;
exports.shouldApplyIosOpenUrlFix = shouldApplyIosOpenUrlFix;
exports.withOpenUrlFixForAppDelegate = withOpenUrlFixForAppDelegate;
exports.modifyAppDelegate = modifyAppDelegate;
exports.modifyObjcAppDelegate = modifyObjcAppDelegate;
exports.modifySwiftAppDelegate = modifySwiftAppDelegate;
exports.isFirebaseSwizzlingDisabled = isFirebaseSwizzlingDisabled;
exports.ensureFirebaseSwizzlingIsEnabled = ensureFirebaseSwizzlingIsEnabled;
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const withIosCaptchaOpenUrlFix = (config, props) => {
    // check configuration
    if (!shouldApplyIosOpenUrlFix({ config, props })) {
        return config;
    }
    // check that swizzling is enabled; otherwise patch must be customized and applied manually
    (0, config_plugins_1.withInfoPlist)(config, config => {
        ensureFirebaseSwizzlingIsEnabled(config);
        return config;
    });
    // apply patch
    return (0, config_plugins_1.withAppDelegate)(config, config => {
        return withOpenUrlFixForAppDelegate({ config, props });
    });
};
exports.withIosCaptchaOpenUrlFix = withIosCaptchaOpenUrlFix;
// Interpret the plugin config to determine whether this fix should be applied
function shouldApplyIosOpenUrlFix({ config, props, }) {
    const flag = props?.ios?.captchaOpenUrlFix;
    if (flag === undefined || flag === 'default') {
        // by default, apply the fix whenever 'expo-router' is detected in the same project
        return isPluginEnabled(config, 'expo-router');
    }
    else if (flag === true || flag === false) {
        const isEnabled = flag;
        return isEnabled;
    }
    else {
        throw new Error(`Unexpected value for 'captchaOpenUrlFix' config option`);
    }
}
function withOpenUrlFixForAppDelegate({ config, props, }) {
    const { language, contents } = config.modResults;
    const configValue = props?.ios?.captchaOpenUrlFix || 'default';
    const newContents = modifyAppDelegate(contents, language);
    if (newContents === null) {
        if (configValue === true) {
            throw new Error("Failed to apply iOS openURL fix because no 'openURL' method was found");
        }
        else {
            config_plugins_1.WarningAggregator.addWarningIOS('@react-native-firebase/auth', "Skipping iOS openURL fix because no 'openURL' method was found");
            return config;
        }
    }
    else {
        if (configValue === 'default') {
            config_plugins_1.WarningAggregator.addWarningIOS('@react-native-firebase/auth', 'modifying iOS AppDelegate openURL method to ignore firebaseauth reCAPTCHA redirect URLs');
        }
        return {
            ...config,
            modResults: {
                ...config.modResults,
                contents: newContents,
            },
        };
    }
}
function modifyAppDelegate(contents, language) {
    if (language === 'objc' || language === 'objcpp') {
        return modifyObjcAppDelegate(contents);
    }
    else if (language === 'swift') {
        return modifySwiftAppDelegate(contents);
    }
    else {
        throw new Error(`Don't know how to apply openUrlFix to AppDelegate of language "${language}"`);
    }
}
const skipOpenUrlForFirebaseAuthBlock = `\
  if (url.host && [url.host caseInsensitiveCompare:@"firebaseauth"] == NSOrderedSame) {
    // invocations for Firebase Auth are handled elsewhere and should not be forwarded to Expo Router
    return NO;
  }\
`;
// NOTE: `mergeContents()` requires that this pattern not match newlines
exports.appDelegateOpenUrlInsertionPointAfter = /-\s*\(\s*BOOL\s*\)\s*application\s*:\s*\(\s*UIApplication\s*\*\s*\)\s*application\s+openURL\s*:\s*\(\s*NSURL\s*\*\s*\)\s*url\s+options\s*:\s*\(\s*NSDictionary\s*<\s*UIApplicationOpenURLOptionsKey\s*,\s*id\s*>\s*\*\s*\)\s*options\s*/; // 🙈
exports.multiline_appDelegateOpenUrlInsertionPointAfter = new RegExp(exports.appDelegateOpenUrlInsertionPointAfter.source + '\\s*{\\s*\\n');
// Returns contents of new AppDelegate with modification applied, or returns null if this patch is not applicable because the AppDelegate doesn't have an 'openURL' method to handle deep links.
function modifyObjcAppDelegate(contents) {
    const pattern = exports.appDelegateOpenUrlInsertionPointAfter;
    const multilinePattern = exports.multiline_appDelegateOpenUrlInsertionPointAfter;
    const fullMatch = contents.match(multilinePattern);
    if (!fullMatch) {
        if (contents.match(pattern)) {
            throw new Error("Failed to find insertion point; expected newline after '{'");
        }
        else if (contents.match(/openURL\s*:/)) {
            throw new Error([
                "Failed to apply 'captchaOpenUrlFix' but detected 'openURL' method.",
                "Please manually apply the fix to your AppDelegate's openURL method,",
                "then update your app.config.json by configuring the '@react-native-firebase/auth' plugin",
                'to set `captchaOpenUrlFix: false`.',
            ].join(' '));
        }
        else {
            // openURL method was not found in AppDelegate
            return null;
        }
    }
    const fullMatchNumLines = fullMatch[0].split('\n').length;
    const offset = fullMatchNumLines - 1;
    if (offset < 0) {
        throw new Error(`Failed to find insertion point; fullMatchNumLines=${fullMatchNumLines}`);
    }
    return (0, generateCode_1.mergeContents)({
        tag: '@react-native-firebase/auth-openURL',
        src: contents,
        newSrc: skipOpenUrlForFirebaseAuthBlock,
        anchor: exports.appDelegateOpenUrlInsertionPointAfter,
        offset,
        comment: '//',
    }).contents;
}
// NOTE: `mergeContents()` doesn't support newlines for the `anchor` regex, so we have to replace it manually
const skipOpenUrlForFirebaseAuthBlockSwift = `\
// @generated begin @react-native-firebase/auth-openURL - expo prebuild (DO NOT MODIFY)
    if url.host?.lowercased() == "firebaseauth" {
      // invocations for Firebase Auth are handled elsewhere and should not be forwarded to Expo Router
      return false
    }
// @generated end @react-native-firebase/auth-openURL\
`;
exports.appDelegateSwiftOpenUrlInsertionPointAfter = /public\s*override\s*func\s*application\s*\(\n\s*_\s*app\s*:\s*UIApplication,\n\s*open\s*url\s*:\s*URL,\n\s*options\s*:\s*\[UIApplication\.OpenURLOptionsKey\s*:\s*Any\]\s*=\s*\[:\]\n\s*\)\s*->\s*Bool\s*{\n/;
function modifySwiftAppDelegate(contents) {
    const pattern = exports.appDelegateSwiftOpenUrlInsertionPointAfter;
    const fullMatch = contents.match(pattern);
    if (!fullMatch) {
        if (contents.match(/open url\s*:/)) {
            throw new Error([
                "Failed to apply 'captchaOpenUrlFix' but detected 'openURL' method.",
                "Please manually apply the fix to your AppDelegate's openURL method,",
                "then update your app.config.json by configuring the '@react-native-firebase/auth' plugin",
                'to set `captchaOpenUrlFix: false`.',
            ].join(' '));
        }
        else {
            // openURL method was not found in AppDelegate
            return null;
        }
    }
    return contents.replace(pattern, `${fullMatch[0]}${skipOpenUrlForFirebaseAuthBlockSwift}\n`);
}
// Search the ExpoConfig plugins array to see if `pluginName` is present
function isPluginEnabled(config, pluginName) {
    if (config.plugins === undefined) {
        return false;
    }
    return config.plugins.some((plugin) => {
        if (plugin === pluginName) {
            return true;
        }
        else if (Array.isArray(plugin) && plugin.length >= 1 && plugin[0] === pluginName) {
            return true;
        }
        else {
            return false;
        }
    });
}
function isFirebaseSwizzlingDisabled(config) {
    return config.ios?.infoPlist?.['FirebaseAppDelegateProxyEnabled'] === false;
}
function ensureFirebaseSwizzlingIsEnabled(config) {
    if (isFirebaseSwizzlingDisabled(config)) {
        throw new Error([
            'Your app has disabled swizzling by setting FirebaseAppDelegateProxyEnabled=false in its Info.plist.',
            "Please update your app.config.json to configure the '@react-native-firebase/auth' plugin to set `captchaOpenUrlFix: false`",
            'and see https://firebase.google.com/docs/auth/ios/phone-auth#appendix:-using-phone-sign-in-without-swizzling for instructions.',
        ].join(' '));
    }
    else {
        return true;
    }
}
