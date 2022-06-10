const {
  isArray,
  isDefined,
  some
} = require('min-dash');

const { isAny } = require('bpmnlint-utils');

const { getPath } = require('@bpmn-io/moddle-utils');

const { ERROR_TYPES } = require('./error-types');

module.exports.ERROR_TYPES = ERROR_TYPES;

module.exports.getEventDefinition = function(node) {
  const eventDefinitions = node.get('eventDefinitions');

  if (eventDefinitions) {
    return eventDefinitions[ 0 ];
  }
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
          message: `Property <${ propertyName }> of type <${ propertyValue.$type }> not allowed`,
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

    if (propertyChecks.allowed === false && isDefined(propertyValue)) {
      return [
        ...results,
        {
          message: `Property <${ propertyName }> not allowed`,
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

    return results;
  }, []);
};

module.exports.hasExtensionElementsOfTypes = function(node, types, parentNode = null, exclusive = false) {
  const extensionElements = findExtensionElements(node, types);

  if (!extensionElements || !extensionElements.length) {
    return [
      {
        message: exclusive
          ? `Element of type <${ node.$type }> must have one extension element of type ${ formatTypes(types, true) }`
          : `Element of type <${ node.$type }> must have one or many extension elements of type ${ formatTypes(types, true) }`,
        path: getPath(node, parentNode),
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          node,
          parentNode: parentNode == node ? null : parentNode,
          requiredExtensionElement: types,
          exclusive
        }
      }
    ];
  }

  if (exclusive && extensionElements.length > 1) {
    return [
      {
        message: `Element of type <${ node.$type }> must have one extension element of type ${ formatTypes(types, true) }`,
        path: getPath(node, parentNode),
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          node,
          parentNode: parentNode == node ? null : parentNode,
          requiredExtensionElement: types,
          exclusive
        }
      }
    ];
  }

  return [];
};

module.exports.hasExtensionElementOfType = function(node, type, parentNode = null) {
  const extensionElement = findExtensionElement(node, type);

  if (!extensionElement) {
    return [
      {
        message: `Element of type <${ node.$type }> must have extension element of type <${ type }>`,
        path: getPath(node, parentNode),
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          node,
          parentNode: parentNode == node ? null : parentNode,
          requiredExtensionElement: type
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