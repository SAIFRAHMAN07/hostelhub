/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

'use strict';

const _require = require('../Utils'),
  getEnumName = _require.getEnumName,
  toSafeCppString = _require.toSafeCppString;
function toIntEnumValueName(propName, value) {
  return `${toSafeCppString(propName)}${value}`;
}
function getCppTypeForAnnotation(type) {
  switch (type) {
    case 'BooleanTypeAnnotation':
      return 'bool';
    case 'StringTypeAnnotation':
      return 'std::string';
    case 'Int32TypeAnnotation':
      return 'int';
    case 'DoubleTypeAnnotation':
      return 'double';
    case 'FloatTypeAnnotation':
      return 'Float';
    case 'MixedTypeAnnotation':
      return 'folly::dynamic';
    default:
      type;
      throw new Error(`Received invalid typeAnnotation ${type}`);
  }
}
function getCppArrayTypeForAnnotation(typeElement, structParts) {
  switch (typeElement.type) {
    case 'BooleanTypeAnnotation':
    case 'StringTypeAnnotation':
    case 'DoubleTypeAnnotation':
    case 'FloatTypeAnnotation':
    case 'Int32TypeAnnotation':
    case 'MixedTypeAnnotation':
      return `std::vector<${getCppTypeForAnnotation(typeElement.type)}>`;
    case 'StringLiteralUnionTypeAnnotation':
    case 'ObjectTypeAnnotation':
      if (!structParts) {
        throw new Error(
          `Trying to generate the event emitter for an Array of ${typeElement.type} without informations to generate the generic type`,
        );
      }
      return `std::vector<${generateEventStructName(structParts)}>`;
    case 'ArrayTypeAnnotation':
      return `std::vector<${getCppArrayTypeForAnnotation(
        typeElement.elementType,
        structParts,
      )}>`;
    default:
      throw new Error(
        `Can't determine array type with typeElement: ${JSON.stringify(
          typeElement,
          null,
          2,
        )}`,
      );
  }
}
function getImports(properties) {
  const imports = new Set();
  function addImportsForNativeName(name) {
    switch (name) {
      case 'ColorPrimitive':
        return;
      case 'PointPrimitive':
        return;
      case 'EdgeInsetsPrimitive':
        return;
      case 'ImageRequestPrimitive':
        return;
      case 'ImageSourcePrimitive':
        imports.add('#include <react/renderer/components/image/conversions.h>');
        return;
      case 'DimensionPrimitive':
        imports.add('#include <react/renderer/components/view/conversions.h>');
        return;
      default:
        name;
        throw new Error(`Invalid name, got ${name}`);
    }
  }
  properties.forEach(prop => {
    const typeAnnotation = prop.typeAnnotation;
    if (typeAnnotation.type === 'ReservedPropTypeAnnotation') {
      addImportsForNativeName(typeAnnotation.name);
    }
    if (
      typeAnnotation.type === 'ArrayTypeAnnotation' &&
      typeAnnotation.elementType.type === 'ReservedPropTypeAnnotation'
    ) {
      addImportsForNativeName(typeAnnotation.elementType.name);
    }
    if (typeAnnotation.type === 'MixedTypeAnnotation') {
      imports.add('#include <folly/dynamic.h>');
    }
    if (typeAnnotation.type === 'ObjectTypeAnnotation') {
      const objectImports = getImports(typeAnnotation.properties);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      objectImports.forEach(imports.add, imports);
    }
  });
  return imports;
}
function generateEventStructName(parts = []) {
  return parts.map(toSafeCppString).join('');
}
function generateStructName(componentName, parts = []) {
  const additional = parts.map(toSafeCppString).join('');
  return `${componentName}${additional}Struct`;
}
function getEnumMaskName(enumName) {
  return `${enumName}Mask`;
}
function getDefaultInitializerString(componentName, prop) {
  const defaultValue = convertDefaultTypeToString(componentName, prop);
  return `{${defaultValue}}`;
}
function convertDefaultTypeToString(componentName, prop, fromBuilder = false) {
  const typeAnnotation = prop.typeAnnotation;
  switch (typeAnnotation.type) {
    case 'BooleanTypeAnnotation':
      if (typeAnnotation.default == null) {
        return '';
      }
      return String(typeAnnotation.default);
    case 'StringTypeAnnotation':
      if (typeAnnotation.default == null) {
        return '';
      }
      return `"${typeAnnotation.default}"`;
    case 'Int32TypeAnnotation':
      return String(typeAnnotation.default);
    case 'DoubleTypeAnnotation':
      const defaultDoubleVal = typeAnnotation.default;
      return parseInt(defaultDoubleVal, 10) === defaultDoubleVal
        ? typeAnnotation.default.toFixed(1)
        : String(typeAnnotation.default);
    case 'FloatTypeAnnotation':
      const defaultFloatVal = typeAnnotation.default;
      if (defaultFloatVal == null) {
        return '';
      }
      return parseInt(defaultFloatVal, 10) === defaultFloatVal
        ? defaultFloatVal.toFixed(1)
        : String(typeAnnotation.default);
    case 'ReservedPropTypeAnnotation':
      switch (typeAnnotation.name) {
        case 'ColorPrimitive':
          return '';
        case 'ImageSourcePrimitive':
          return '';
        case 'ImageRequestPrimitive':
          return '';
        case 'PointPrimitive':
          return '';
        case 'EdgeInsetsPrimitive':
          return '';
        case 'DimensionPrimitive':
          return '';
        default:
          typeAnnotation.name;
          throw new Error(
            `Unsupported type annotation: ${typeAnnotation.name}`,
          );
      }
    case 'ArrayTypeAnnotation': {
      const elementType = typeAnnotation.elementType;
      switch (elementType.type) {
        case 'StringEnumTypeAnnotation':
          if (elementType.default == null) {
            throw new Error(
              'A default is required for array StringEnumTypeAnnotation',
            );
          }
          const enumName = getEnumName(componentName, prop.name);
          const enumMaskName = getEnumMaskName(enumName);
          const defaultValue = `${enumName}::${toSafeCppString(
            elementType.default,
          )}`;
          if (fromBuilder) {
            return `${enumMaskName}Wrapped{ .value = static_cast<${enumMaskName}>(${defaultValue})}`;
          }
          return `static_cast<${enumMaskName}>(${defaultValue})`;
        default:
          return '';
      }
    }
    case 'ObjectTypeAnnotation': {
      return '';
    }
    case 'StringEnumTypeAnnotation':
      return `${getEnumName(componentName, prop.name)}::${toSafeCppString(
        typeAnnotation.default,
      )}`;
    case 'Int32EnumTypeAnnotation':
      return `${getEnumName(componentName, prop.name)}::${toIntEnumValueName(
        prop.name,
        typeAnnotation.default,
      )}`;
    case 'MixedTypeAnnotation':
      return '';
    default:
      typeAnnotation;
      throw new Error(`Unsupported type annotation: ${typeAnnotation.type}`);
  }
}
function getSourceProp(componentName, prop) {
  const typeAnnotation = prop.typeAnnotation;
  switch (typeAnnotation.type) {
    case 'ArrayTypeAnnotation':
      const elementType = typeAnnotation.elementType;
      switch (elementType.type) {
        case 'StringEnumTypeAnnotation':
          const enumName = getEnumName(componentName, prop.name);
          const enumMaskName = getEnumMaskName(enumName);
          return `${enumMaskName}Wrapped{ .value = sourceProps.${prop.name} }`;
      }
  }
  return `sourceProps.${prop.name}`;
}
function isWrappedPropType(prop) {
  const typeAnnotation = prop.typeAnnotation;
  switch (typeAnnotation.type) {
    case 'ArrayTypeAnnotation':
      const elementType = typeAnnotation.elementType;
      switch (elementType.type) {
        case 'StringEnumTypeAnnotation':
          return true;
      }
  }
  return false;
}
const IncludeTemplate = ({headerPrefix, file}) => {
  if (headerPrefix === '') {
    return `#include "${file}"`;
  }
  return `#include <${headerPrefix}${file}>`;
};
module.exports = {
  getDefaultInitializerString,
  convertDefaultTypeToString,
  getCppArrayTypeForAnnotation,
  getCppTypeForAnnotation,
  getEnumMaskName,
  getImports,
  toIntEnumValueName,
  generateStructName,
  generateEventStructName,
  IncludeTemplate,
  getSourceProp,
  isWrappedPropType,
};
