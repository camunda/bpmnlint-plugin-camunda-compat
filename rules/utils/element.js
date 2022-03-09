const {
  isArray,
  isString,
  some
} = require('min-dash');

const {
  is,
  isAny
} = require('bpmnlint-utils');

/**
 * @param {ModdleElement} node
 *
 * @returns {boolean|string}
 */
function hasNoEventDefinition(node) {
  const eventDefinitions = node.get('eventDefinitions');

  return !eventDefinitions
    || !eventDefinitions.length
    || getMessage(`${ node.$type} (${ eventDefinitions[ 0 ].$type })`);
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
    return getMessage(`${ node.$type}`);
  }

  const eventDefinition = eventDefinitions[ 0 ];

  return isAny(eventDefinition, types)
    || getMessage(`${ node.$type} (${ eventDefinition.$type })`);
}

/**
 * Factory function.
 *
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
 * Factory function.
 *
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
      || results.find(result => isString(result));
  };
};

/**
 * Factory function.
 *
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

    if (!is(loopCharacteristics, type)) {
      return getMessage(`${ node.$type } (${ loopCharacteristics.$type })`);
    }

    if (type === 'bpmn:MultiInstanceLoopCharacteristics') {
      return checkMultiInstanceLoopCharacteristics(loopCharacteristics, node);
    }

    return true;
  };
};

module.exports.hasNoLanes = function(node) {
  const laneSets = node.get('laneSets');

  return !laneSets
    || !laneSets.length
    || getMessage(`${ node.$type } (bpmn:LaneSet)`);
};

module.exports.isNotBpmn = function(node) {
  return !is(node, 'bpmn:BaseElement');
};

module.exports.findExtensionElement = function(node, type) {
  const extensionElements = node.get('extensionElements');

  if (!extensionElements) {
    return;
  }

  const values = extensionElements.get('values');

  if (!values || !values.length) {
    return;
  }

  return values.find(value => is(value, type));
};

function getMessage(type) {
  return `Element of type <${ type }> not supported by {{ executionPlatform }} {{ executionPlatformVersion }}`;
}

function checkMultiInstanceLoopCharacteristics(node, parentNode) {
  const zeebeLoopCharacteristics = module.exports.findExtensionElement(node, 'zeebe:LoopCharacteristics');

  if (!zeebeLoopCharacteristics) {
    return {
      message: `Element of type <${parentNode.$type}> must have <zeebe:LoopCharacteristics> extension element`
    };
  }

  return true;
}
