const {
  isArray,
  isDefined,
  isFunction,
  isNil,
  isObject,
  some
} = require('min-dash');

const {
  is,
  isAny
} = require('bpmnlint-utils');

const { getPath } = require('@bpmn-io/moddle-utils');

const { ERROR_TYPES } = require('./error-types');

module.exports.ERROR_TYPES = ERROR_TYPES;

function getEventDefinition(node) {
  const eventDefinitions = node.get('eventDefinitions');

  if (eventDefinitions) {
    return eventDefinitions[ 0 ];
  }
}

module.exports.getEventDefinition = getEventDefinition;

module.exports.getMessageEventDefinition = function(node) {
  if (is(node, 'bpmn:ReceiveTask')) {
    return node;
  }

  return getEventDefinition(node);
};

function findExtensionElements(node, types) {
  const extensionElements = node.get('extensionElements');

  if (!extensionElements) {
    return;
  }

  const values = extensionElements.get('values');

  if (!values || !values.length) {
    return;
  }

  if (!isArray(types)) {
    types = [ types ];
  }

  return values.filter(value => isAny(value, types));
}

module.exports.findExtensionElements = findExtensionElements;

function findExtensionElement(node, types) {
  const extensionElements = findExtensionElements(node, types);

  if (extensionElements && extensionElements.length) {
    return extensionElements[ 0 ];
  }
}

module.exports.findExtensionElement = findExtensionElement;

function formatNames(names, exclusive = false) {
  return names.reduce((string, name, index) => {

    // first
    if (index === 0) {
      return `<${ name }>`;
    }

    // last
    if (index === names.length - 1) {
      return `${ string } ${ exclusive ? 'or' : 'and' } <${ name }>`;
    }

    return `${ string }, <${ name }>`;
  }, '');
}

module.exports.formatNames = formatNames;

module.exports.hasDuplicatedPropertyValues = function(node, propertiesName, propertyName, parentNode = null) {
  const properties = node.get(propertiesName);

  const propertyValues = properties.map(property => property.get(propertyName));

  // (1) find duplicates
  const duplicates = propertyValues.reduce((duplicates, propertyValue, index) => {
    if (propertyValues.indexOf(propertyValue) !== index && !duplicates.includes(propertyValue)) {
      return [
        ...duplicates,
        propertyValue
      ];
    }

    return duplicates;
  }, []);

  // (2) report error for each duplicate
  if (duplicates.length) {
    return duplicates.map(duplicate => {

      // (3) find properties with duplicate
      const duplicateProperties = properties.filter(property => property.get(propertyName) === duplicate);

      // (4) report error
      return {
        message: `Properties of type <${ duplicateProperties[ 0 ].$type }> have property <${ propertyName }> with duplicate value of <${ duplicate }>`,
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node,
          parentNode: parentNode == node ? null : parentNode,
          duplicatedProperty: propertyName,
          duplicatedPropertyValue: duplicate,
          properties: duplicateProperties,
          propertiesName
        }
      };
    });
  }

  return [];
};

module.exports.hasProperties = function(node, properties, parentNode = null) {
  return Object.entries(properties).reduce((results, property) => {
    const [ propertyName, propertyChecks ] = property;

    const { allowedVersion = null } = propertyChecks;

    const path = getPath(node, parentNode);

    const propertyValue = node.get(propertyName);

    if (propertyChecks.required && !propertyValue) {
      return [
        ...results,
        {
          message: allowedVersion
            ? `Element of type <${ node.$type }> without property <${ propertyName }> only allowed by Camunda Platform ${ allowedVersion } or newer`
            : `Element of type <${ node.$type }> must have property <${ propertyName }>`,
          path: path
            ? [ ...path, propertyName ]
            : [ propertyName ],
          data: addAllowedVersion({
            type: ERROR_TYPES.PROPERTY_REQUIRED,
            node,
            parentNode: parentNode == node ? null : parentNode,
            requiredProperty: propertyName
          }, allowedVersion)
        }
      ];
    }

    if (propertyChecks.dependentRequired) {
      const dependency = node.get(propertyChecks.dependentRequired);

      if (dependency && !propertyValue) {
        return [
          ...results,
          {
            message: `Element of type <${ node.$type }> must have property <${ propertyName }> if it has property <${ propertyChecks.dependentRequired }>`,
            path: path
              ? [ ...path, propertyName ]
              : [ propertyName ],
            data: {
              type: ERROR_TYPES.PROPERTY_DEPENDENT_REQUIRED,
              node,
              parentNode: parentNode == node ? null : parentNode,
              property: propertyChecks.dependentRequired,
              dependentRequiredProperty: propertyName
            }
          }
        ];
      }
    }

    if (
      propertyChecks.type
      && propertyValue
      && (
        !propertyValue.$instanceOf
        || (!isArray(propertyChecks.type) && !propertyValue.$instanceOf(propertyChecks.type))
        || (isArray(propertyChecks.type) && !some(propertyChecks.type, type => propertyValue.$instanceOf(type)))
      )
    ) {
      return [
        ...results,
        {
          message: allowedVersion
            ? `Property <${ propertyName }> of type <${ propertyValue.$type }> only allowed by Camunda Platform ${ allowedVersion } or newer`
            : `Property <${ propertyName }> of type <${ propertyValue.$type }> not allowed`,
          path: path
            ? [ ...path, propertyName ]
            : [ propertyName ],
          data: addAllowedVersion({
            type: ERROR_TYPES.PROPERTY_TYPE_NOT_ALLOWED,
            node,
            parentNode: parentNode == node ? null : parentNode,
            property: propertyName,
            allowedPropertyType: propertyChecks.type
          }, allowedVersion)
        }
      ];
    }

    if ('value' in propertyChecks && propertyChecks.value !== propertyValue) {
      return [
        ...results,
        {
          message: `Property <${ propertyName }> must have value of <${ propertyChecks.value }>`,
          path: path
            ? [ ...path, propertyName ]
            : [ propertyName ],
          data: {
            type: ERROR_TYPES.PROPERTY_VALUE_REQUIRED,
            node,
            parentNode: parentNode == node ? null : parentNode,
            property: propertyName,
            requiredValue: propertyChecks.value
          }
        }
      ];
    }

    if (propertyChecks.allowed === false && isDefined(propertyValue) && !isNil(propertyValue)) {
      return [
        ...results,
        {
          message: allowedVersion
            ? `Property <${ propertyName }> only allowed by Camunda Platform ${ allowedVersion } or newer`
            : `Property <${ propertyName }> not allowed`,
          path: path
            ? [ ...path, propertyName ]
            : [ propertyName ],
          data: addAllowedVersion({
            type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
            node,
            parentNode: parentNode == node ? null : parentNode,
            property: propertyName
          }, allowedVersion)
        }
      ];
    }

    if (isFunction(propertyChecks.allowed) && !propertyChecks.allowed(propertyValue)) {
      return [
        ...results,
        {
          message: allowedVersion
            ? `Property value of <${ truncate(propertyValue) }> only allowed by Camunda Platform ${ allowedVersion } or newer`
            : `Property value of <${ truncate(propertyValue) }> not allowed`,
          path: path
            ? [ ...path, propertyName ]
            : [ propertyName ],
          data: addAllowedVersion({
            type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
            node,
            parentNode: parentNode == node ? null : parentNode,
            property: propertyName
          }, allowedVersion)
        }
      ];
    }

    return results;
  }, []);
};

module.exports.hasProperty = function(node, propertyNames, parentNode = null) {
  propertyNames = isArray(propertyNames) ? propertyNames : [ propertyNames ];

  const properties = findProperties(node, propertyNames);

  if (properties.length !== 1) {
    return [
      {
        message: `Element of type <${ node.$type }> must have property ${ formatNames(propertyNames, true) }`,
        path: getPath(node, parentNode),
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node,
          parentNode: parentNode == node ? null : parentNode,
          requiredProperty: propertyNames
        }
      }
    ];
  }

  return [];
};

function findProperties(node, propertyNames) {
  const properties = [];

  for (const propertyName of propertyNames) {
    if (isDefined(node.get(propertyName))) {
      properties.push(node.get(propertyName));
    }
  }

  return properties;
}

module.exports.hasExtensionElement = function(node, types, parentNode = null) {
  const typesArray = isArray(types) ? types : [ types ];

  const extensionElements = findExtensionElements(node, typesArray);

  if (!extensionElements || extensionElements.length !== 1) {
    return [
      {
        message: `Element of type <${ node.$type }> must have one extension element of type ${ formatNames(typesArray, true) }`,
        path: getPath(node, parentNode),
        data: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          node,
          parentNode: parentNode == node ? null : parentNode,
          requiredExtensionElement: types
        }
      }
    ];
  }

  return [];
};

module.exports.hasNoExtensionElement = function(node, type, parentNode = null, allowedVersion = null) {
  const extensionElement = findExtensionElement(node, type);

  if (extensionElement) {
    return [
      {
        message: allowedVersion
          ? `Extension element of type <${ type }> only allowed by Camunda Platform ${ allowedVersion }`
          : `Extension element of type <${ type }> not allowed`,
        path: getPath(extensionElement, parentNode),
        data: addAllowedVersion({
          type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
          node,
          parentNode: parentNode == node ? null : parentNode,
          extensionElement
        }, allowedVersion)
      }
    ];
  }

  return [];
};

module.exports.hasExpression = function(node, propertyName, check, parentNode = null) {
  const expression = node.get(propertyName);

  if (!expression) {
    throw new Error('Expression not found');
  }

  let propertyValue = expression;

  if (is(expression, 'bpmn:Expression')) {
    propertyValue = expression.get('body');
  }

  const path = getPath(node, parentNode);

  if (!propertyValue) {
    if (check.required !== false) {
      return [
        {
          message: `Property <${ propertyName }> must have expression value`,
          path: path
            ? [ ...path, propertyName ]
            : null,
          data: {
            type: ERROR_TYPES.EXPRESSION_REQUIRED,
            node: is(expression, 'bpmn:Expression') ? expression : node,
            parentNode,
            property: propertyName
          }
        }
      ];
    }

    return [];
  }

  const allowed = check.allowed(propertyValue);

  if (allowed !== true) {
    let allowedVersion = null;

    if (isObject(allowed)) {
      ({ allowedVersion } = allowed);
    }

    return [
      {
        message: allowedVersion
          ? `Expression value of <${ propertyValue }> only allowed by Camunda Platform ${ allowedVersion }`
          : `Expression value of <${ propertyValue }> not allowed`,
        path: path
          ? [ ...path, propertyName ]
          : null,
        data: addAllowedVersion({
          type: ERROR_TYPES.EXPRESSION_VALUE_NOT_ALLOWED,
          node: is(expression, 'bpmn:Expression') ? expression : node,
          parentNode,
          property: propertyName
        }, allowedVersion)
      }
    ];
  }

  return [];
};

function isExactly(node, type) {
  const { $model } = node;

  return $model.getType(node.$type) === $model.getType(type);
}

module.exports.isExactly = isExactly;

module.exports.isAnyExactly = function(node, types) {
  return some(types, (type) => isExactly(node, type));
};

function truncate(string, maxLength = 10) {
  const stringified = `${ string }`;

  return stringified.length > maxLength ? `${ stringified.slice(0, maxLength) }...` : stringified;
}

function addAllowedVersion(data, allowedVersion) {
  if (!allowedVersion) {
    return data;
  }

  return {
    ...data,
    allowedVersion
  };
}

function findParent(node, type) {
  if (!node) {
    return null;
  }

  const parent = node.$parent;

  if (!parent) {
    return node;
  }

  if (is(parent, type)) {
    return parent;
  }

  return findParent(parent, type);
}

module.exports.findParent = findParent;