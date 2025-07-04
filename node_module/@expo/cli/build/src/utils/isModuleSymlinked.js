"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "isModuleSymlinked", {
    enumerable: true,
    get: function() {
        return isModuleSymlinked;
    }
});
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Return true if the parent folder for a given file path is named "node_modules".
 *
 * @example
 * isModuleRootPathInNodeModulesFolder('./foo/expo') -> false
 * isModuleRootPathInNodeModulesFolder('./node_modules/expo') -> true
 */ function isModuleRootPathInNodeModulesFolder(moduleRootPath) {
    const parentFolderName = _path().default.basename(_path().default.dirname(moduleRootPath));
    return parentFolderName === 'node_modules';
}
function isModuleSymlinked(projectRoot, { moduleId, isSilent }) {
    try {
        const moduleRootPath = _path().default.dirname((0, _resolvefrom().default)(projectRoot, `${moduleId}/package.json`));
        return !isModuleRootPathInNodeModulesFolder(moduleRootPath);
    } catch (error) {
        if (!isSilent) {
            throw error;
        }
        // Failed to resolve the package.json relative to the project, not sure what to do here.
        // This is probably not possible due to node module resolution.
        return false;
    }
}

//# sourceMappingURL=isModuleSymlinked.js.map