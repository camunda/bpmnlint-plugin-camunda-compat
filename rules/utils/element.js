const {
  isArray,
  isObject,
  isString,
  some
} = require('min-dash');

const {
  is,
  isAny
} = require('bpmnlint-utils');

const { getPath } = require('@philippfromme/moddle-helpers');

const ERROR_TYPES = Object.freeze({
  ELEMENT_TYPE: 'elementType',
  EXTENSION_ELEMENT_REQUIRED: 'extensionElementRequired',
  PROPERTY_DEPENDEND_REQUIRED: 'propertyDependendRequired',
  PROPERTY_REQUIRED: 'propertyRequired',
  PROPERTY_TYPE: 'propertyType'
});

module.exports.ERROR_TYPES = ERROR_TYPES;

/**
 * @param {ModdleElement} node
 *
 * @returns {boolean|string}
 */
function hasNoEventDefinition(node) {
  const eventDefinitions = node.get('eventDefinitions');

  return !eventDefinitions
    || !eventDefinitions.length
    || getElementNotSupportedError(node.$type, eventDefinitions[ 0 ].$type, [ 'eventDefinitions', 0 ]);
}

module.exports.hasNoEventDefinition = hasNoEventDefinition;

/**
 * @param {ModdleElement} node
 * @param {string[]} types
 *
 * @returns {boolean|string}
 */
function hasEventDefinitionOfType(node, types) {
  if (!isArray(types)) {
    types = [ types ];
  }

  const eventDefinitions = node.get('eventDefinitions');

  if (!eventDefinitions || eventDefinitions.length !== 1) {
    return getElementNotSupportedError(node.$type, null);
  }

  const eventDefinition = eventDefinitions[ 0 ];

  return isAny(eventDefinition, types)
    || getElementNotSupportedError(node.$type, eventDefinition.$type, [ 'eventDefinitions', 0 ]);
}

/**
 * @param {string[]} types
 *
 * @returns {Function}
 */
module.exports.hasEventDefinitionOfType = function(types) {
  return function(node) {
    return hasEventDefinitionOfType(node, types);
  };
};

/**
 * @param {string[]} types
 *
 * @returns {Function}
 */
module.exports.hasEventDefinitionOfTypeOrNone = function(types) {
  return function(node) {
    const results = [
      hasNoEventDefinition(node),
      hasEventDefinitionOfType(node, types)
    ];

    return some(results, result => result === true)
      || results.find(result => isArray(result) || isObject(result) || isString(result));
  };
};

module.exports.hasLoopCharacteristics = function(node) {
  return !!node.get('loopCharacteristics');
};

/**
 * @param {string[]} types
 *
 * @returns {boolean|string}
 */
module.exports.hasLoopCharacteristicsOfTypeOrNone = function(type) {
  return function(node) {
    const loopCharacteristics = node.get('loopCharacteristics');

    if (!loopCharacteristics) {
      return true;
    }

    return is(loopCharacteristics, type)
      || getElementNotSupportedError(node.$type, loopCharacteristics.$type, [ 'loopCharacteristics' ]);
  };
};

/**
 * @param {ModdleElement} node
 *
 * @returns {boolean|Object|Object[]}
 */
module.exports.hasMultiInstanceLoopCharacteristics = function(node) {
  const results = checkProperties(node, {
    loopCharacteristics: {
      type: 'bpmn:MultiInstanceLoopCharacteristics'
    }
  }, node);

  if (results.length === 1) {
    return results[ 0 ];
  } else if (results.length > 1) {
    return results;
  }

  return true;
};

module.exports.hasNoLanes = function(node) {
  const laneSets = node.get('laneSets');

  return !laneSets
    || !laneSets.length
    || getElementNotSupportedError(node.$type, 'bpmn:LaneSet', [ 'laneSets' ]);
};

module.exports.isNotBpmn = function(node) {
  return !is(node, 'bpmn:BaseElement');
};

function findExtensionElement(node, types) {
  const extensionElements = findExtensionElements(node, types);

  if (extensionElements && extensionElements.length) {
    return extensionElements[ 0 ];
  }
}

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

module.exports.findExtensionElement = findExtensionElement;

function getElementNotSupportedError(type, propertyType, path = null) {
  if (propertyType) {
    return {
      message: `Element of type <${ type }> (<${ propertyType }>) not supported by {{ executionPlatform }} {{ executionPlatformVersion }}`,
      path,
      error: {
        type: ERROR_TYPES.ELEMENT_TYPE,
        elementType: type,
        propertyType
      }
    };
  }

  return {
    message: `Element of type <${ type }> not supported by {{ executionPlatform }} {{ executionPlatformVersion }}`,
    path,
    error: {
      type: ERROR_TYPES.ELEMENT_TYPE,
      elementType: type
    }
  };
}

/**
 * @param {string|Object} type
 *
 * @returns {string}
 */
function getType(type) {
  if (isObject(type)) {
    return type.type;
  }

  return type;
}

/**
 * @param {string|Object} type
 *
 * @returns {string|Object}
 */
function getProperties(type) {
  if (isObject(type)) {
    return type.properties;
  }
}

/**
 * @param {Function} check
 * @param {Function} ifFn
 * @param {*} [elseReturnValue]
 *
 * @returns {Function}
 */
module.exports.checkIf = function(check, ifFn, elseReturnValue = true) {
  return function(node) {
    if (ifFn(node) === true) {
      return check(node);
    }

    return elseReturnValue;
  };
};

function formatTypes(types, exclusive = false) {
  return types.reduce((string, type, index) => {
    type = getType(type);

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

function checkProperties(node, properties, parentNode) {
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
            message: `Element of type <${ node.$type }> must have property <${ propertyName }> if property <${ propertyChecks.dependendRequired }> is set`,
            path: path
              ? [ ...path, propertyName ]
              : [ propertyName ],
            error: {
              type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
              dependendRequiredProperty: propertyName
            }
          }
        ];
      }
    }

    if (propertyChecks.type && propertyValue && (!propertyValue.$instanceOf || !propertyValue.$instanceOf(propertyChecks.type))) {
      return [
        ...results,
        {
          message: `Element of type <${ node.$type }> must have property <${ propertyName }> of type <${ propertyChecks.type }>`,
          path: path
            ? [ ...path, propertyName ]
            : [ propertyName ],
          error: {
            type: ERROR_TYPES.PROPERTY_TYPE,
            propertyType: propertyChecks.type
          }
        }
      ];
    }

    return results;
  }, []);
}

module.exports.checkProperties = checkProperties;

/**
 * @example
 *
 * const check = hasExtensionElementsOfTypes([ 'zeebe:CalledDecision', 'zeebe:TaskDefinition' ]);
 *
 * check(node, parentNode);
 *
 * @example
 *
 * const check = hasExtensionElementsOfTypes([
 *   {
 *     type: 'zeebe:CalledDecision',
 *     properties: {
 *       decisionId: { required: true },
 *       resultVariable: { required: true }
 *     }
 *   },
 *   {
 *     type: 'zeebe:TaskDefinition',
 *     properties: {
 *       type: { required: true }
 *     }
 *   }
 * ]);
 *
 * check(node, parentNode);
 *
 * @param {string[]|Object[]} types
 *
 * @returns {Function}
 */
module.exports.hasExtensionElementsOfTypes = function(types, exclusive = false) {
  return function(node, parentNode) {
    const extensionElements = findExtensionElements(node, types.map(type => getType(type)));

    if (!extensionElements || !extensionElements.length) {
      return {
        message: `Element of type <${ node.$type }> must have have at least one ${ formatTypes(types, true) } extension element`,
        path: getPath(node, parentNode),
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: getType(types[ 0 ])
        }
      };
    }

    if (exclusive && extensionElements.length > 1) {
      return {
        message: `Element of type <${ node.$type }> must have have either one ${ formatTypes(types, true) } extension element`,
        path: getPath(node, parentNode)
      };
    }

    const results = extensionElements.reduce((errors, extensionElement) => {
      const type = types.find(type => is(extensionElement, getType(type)));

      const properties = getProperties(type);

      if (properties) {
        return [
          ...errors,
          ...checkProperties(extensionElement, properties, parentNode)
        ];
      }

      return errors;
    }, []);

    if (results.length === 1) {
      return results[ 0 ];
    } else if (results.length > 1) {
      return results;
    }

    return true;
  };
};

/**
 * @example
 *
 * const check = hasExtensionElementOfType('zeebe:TaskDefinition');
 *
 * check(node, parentNode);
 *
 * @example
 *
 * const check = hasExtensionElementOfType(
 *   {
 *     type: 'zeebe:TaskDefinition',
 *     properties: {
 *       type: { required: true }
 *     }
 *   }
 * );
 *
 * check(node, parentNode);
 *
 * @param {string[]|Object[]} types
 *
 * @returns {Function}
 */
module.exports.hasExtensionElementOfType = function(type) {
  return function(node, parentNode) {
    const extensionElement = findExtensionElement(node, getType(type));

    if (!extensionElement) {
      return {
        message: `Element of type <${ node.$type }> must have <${getType(
          type
        )}> extension element`,
        path: getPath(node, parentNode),
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: getType(type)
        }
      };
    }

    const properties = getProperties(type);

    if (properties) {
      const results = checkProperties(extensionElement, properties, parentNode);

      if (results.length === 1) {
        return results[ 0 ];
      } else if (results.length > 1) {
        return results;
      }
    }

    return true;
  };
};

/**
 * @example
 *
 * const check = checkError((error) => { ... });
 *
 * check(errorEventDefinition);
 *
 * @param {Function} check
 *
 * @returns {Function}
 */
function checkError(check) {
  return function(node, parentNode) {
    const results = checkProperties(node, {
      errorRef: {
        required: true
      }
    }, parentNode);

    if (results.length === 1) {
      return results[ 0 ];
    } else if (results.length > 1) {
      return results;
    }

    const error = node.get('errorRef');

    return check(error);
  };
}

module.exports.checkError = checkError;

/**
 * @example
 *
 * const check = checkEventDefinition((eventDefinition, event) => { ... });
 *
 * check(startEvent);
 *
 * @param {Function} check
 *
 * @returns {Function}
 */
module.exports.checkEventDefinition = function(check) {
  return function(node) {
    const results = checkProperties(node, {
      eventDefinitions: {
        required: true
      }
    });

    if (results.length === 1) {
      return results[ 0 ];
    } else if (results.length > 1) {
      return results;
    }

    const eventDefinitions = node.get('eventDefinitions');

    return check(eventDefinitions[ 0 ], node);
  };
};

/**
 * @example
 *
 * const check = checkFlowNode((node, parentNode) => { ... });
 *
 * check(serviceTask);
 *
 * @param {Function} check
 *
 * @returns {Function}
 */
module.exports.checkFlowNode = function(check) {
  return function(node) {
    return check(node, node);
  };
};

/**
 * @example
 *
 * const check = checkMessage((message) => { ... });
 *
 * check(messageEventDefinition);
 *
 * @param {Function} check
 *
 * @returns {Function}
 */
module.exports.checkMessage = function(check) {
  return function(node, parentNode) {
    const results = checkProperties(node, {
      messageRef: {
        required: true
      }
    }, parentNode);

    if (results.length === 1) {
      return results[ 0 ];
    } else if (results.length > 1) {
      return results;
    }

    const message = node.get('messageRef');

    return check(message);
  };
};

/**
 * @example
 *
 * const check = checkLoopCharacteristics((loopCharacteristics, activity) => { ... });
 *
 * check(serviceTask);
 *
 * @param {Function} check
 *
 * @returns {Function}
 */
module.exports.checkLoopCharacteristics = function(check) {
  return function(node) {
    const results = checkProperties(node, {
      loopCharacteristics: {
        required: true
      }
    });

    if (results.length === 1) {
      return results[ 0 ];
    } else if (results.length > 1) {
      return results;
    }

    const loopCharacteristics = node.get('loopCharacteristics');

    return check(loopCharacteristics, node);
  };
};

module.exports.hasErrorReference = checkError(() => true);

function translate(result, translations) {
  if (isString(result)) {
    return translations[result] || result;
  }

  const { message } = result;

  return {
    ...result,
    message: translations[message] || message
  };
}

module.exports.withTranslations = function(check, translations) {
  return function(node) {
    const results = check(node);

    if (isObject(results) || isString(results)) {
      return translate(results, translations);
    }

    if (isArray(results)) {
      return results.map((result) => translate(result, translations));
    }

    return results;
  };
};