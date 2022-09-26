const {
  isArray,
  isDefined,
  isFunction,
  isNil,
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

function formatTypes(types, exclusive = false) {
  return types.reduce((string, type, index) => {

    // first
    if (index === 0) {
      return `<${ type }>`;
    }

    // last
    if (index === types.length - 1) {
      return `${ string } ${ exclusive ? 'or' : 'and' } <${ type }>`;
    }

    return `${ string }, <${ type }>`;
  }, '');
}

module.exports.formatTypes = formatTypes;

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
        error: {
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

    const path = getPath(node, parentNode);

    const propertyValue = node.get(propertyName);

    if (propertyChecks.required && !propertyValue) {
      return [
        ...results,
        {
          message: `Element of type <${ node.$type }> must have property <${ propertyName }>`,
          path: path
            ? [ ...path, propertyName ]
            : [ propertyName ],
          error: {
            type: ERROR_TYPES.PROPERTY_REQUIRED,
            node,
            parentNode: parentNode == node ? null : parentNode,
            requiredProperty: propertyName
          }
        }
      ];
    }

    if (propertyChecks.dependendRequired) {
      const dependency = node.get(propertyChecks.dependendRequired);

      if (dependency && !propertyValue) {
        return [
          ...results,
          {
            message: `Element of type <${ node.$type }> must have property <${ propertyName }> if it has property <${ propertyChecks.dependendRequired }>`,
            path: path
              ? [ ...path, propertyName ]
              : [ propertyName ],
            error: {
              type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
              node,
              parentNode: parentNode == node ? null : parentNode,
              property: propertyChecks.dependendRequired,
              dependendRequiredProperty: propertyName
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
          message: `Element of type <${ node.$type }> must not have property <${ propertyName }> of type <${ propertyValue.$type }>`,
          path: path
            ? [ ...path, propertyName ]
            : [ propertyName ],
          error: {
            type: ERROR_TYPES.PROPERTY_TYPE_NOT_ALLOWED,
            node,
            parentNode: parentNode == node ? null : parentNode,
            property: propertyName,
            allowedPropertyType: propertyChecks.type
          }
        }
      ];
    }

    if (propertyChecks.allowed === false && isDefined(propertyValue) && !isNil(propertyValue)) {
      return [
        ...results,
        {
          message: `Element of type <${ node.$type }> must not have property <${ propertyName }>`,
          path: path
            ? [ ...path, propertyName ]
            : [ propertyName ],
          error: {
            type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
            node,
            parentNode: parentNode == node ? null : parentNode,
            property: propertyName
          }
        }
      ];
    }

    if (isFunction(propertyChecks.allowed) && !propertyChecks.allowed(propertyValue)) {
      return [
        ...results,
        {
          message: `Property <${ propertyName }> of element of type <${ node.$type }> must not have value of <${ propertyValue }>`,
          path: path
            ? [ ...path, propertyName ]
            : [ propertyName ],
          error: {
            type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
            node,
            parentNode: parentNode == node ? null : parentNode,
            property: propertyName,
          }
        }
      ];
    }

    return results;
  }, []);
};

module.exports.hasProperty = function(node, types, parentNode = null) {
  const typesArray = isArray(types) ? types : [ types ];

  const properties = findProperties(node, typesArray);

  if (properties.length !== 1) {
    return [
      {
        message: `Element of type <${ node.$type }> must have one property of type ${ formatTypes(typesArray, true) }`,
        path: getPath(node, parentNode),
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node,
          parentNode: parentNode == node ? null : parentNode,
          requiredProperty: types
        }
      }
    ];
  }

  return [];
};

function findProperties(node, types) {
  const properties = [];
  for (const type of types) {
    if (isDefined(node.get(type))) {
      properties.push(node.get(type));
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
        message: `Element of type <${ node.$type }> must have one extension element of type ${ formatTypes(typesArray, true) }`,
        path: getPath(node, parentNode),
        error: {
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

module.exports.hasNoExtensionElement = function(node, type, parentNode = null) {
  const extensionElement = findExtensionElement(node, type);

  if (extensionElement) {
    return [
      {
        message: `Element of type <${ node.$type }> must not have extension element of type <${ type }>`,
        path: getPath(extensionElement, parentNode),
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
          node,
          parentNode: parentNode == node ? null : parentNode,
          extensionElement
        }
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