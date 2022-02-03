const { isArray } = require('min-dash');

const {
  is,
  isAny
} = require('bpmnlint-utils');

module.exports.hasEventDefinition = function(node) {
  const eventDefinitions = node.get('eventDefinitions');

  return eventDefinitions && eventDefinitions.length === 1;
}

module.exports.hasNoEventDefinition = function(node) {
  const eventDefinitions = node.get('eventDefinitions');

  return !eventDefinitions
    || !eventDefinitions.length
    || getMessage(`${ node.$type} (${ eventDefinitions[ 0 ].$type })`);
}

module.exports.hasEventDefinitionOfType = function(types) {
  return function(node) {
    if (!isArray(types)) {
      types = [ types ];
    }

    const eventDefinitions = node.get('eventDefinitions');

    if (!eventDefinitions || eventDefinitions.length !== 1) {
      return false;
    }

    const eventDefinition = eventDefinitions[ 0 ];

    return isAny(eventDefinition, types)
      || getMessage(`${ node.$type} (${ eventDefinition.$type })`);
  };
}

module.exports.hasLoopCharacteristics = function(node) {
  const loopCharacteristics = node.get('loopCharacteristics');

  return !!loopCharacteristics;
}

module.exports.hasNoLoopCharacteristics = function(node) {
  const loopCharacteristics = node.get('loopCharacteristics');

  return !loopCharacteristics
    || getMessage(`${ node.$type} (${ loopCharacteristics.$type })`);
}

module.exports.hasNoLanes = function(node) {
  const laneSets = node.get('laneSets');

  return !laneSets
    || !laneSets.length
    || getMessage(`${ node.$type } (bpmn:LaneSet)`);
}

module.exports.hasLoopCharacteristicsOfType = function(type) {
  return function(node) {
    const loopCharacteristics = node.get('loopCharacteristics');

    if (!loopCharacteristics) {
      return false;
    }

    return is(loopCharacteristics, type)
      || getMessage(`${ node.$type } (${ loopCharacteristics.$type })`);
  };
}

module.exports.isNotBpmn = function(node) {
  return !is(node, 'bpmn:BaseElement');
}

function getMessage(type) {
  return `Element of type <${ type }> not supported by {{ executionPlatform }} {{ executionPlatformVersion }}`;
}