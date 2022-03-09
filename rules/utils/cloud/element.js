const { findExtensionElement, hasEventDefinitionOfType } = require('../element');

const { getPath } = require('@philippfromme/moddle-helpers');

function checkZeebeCalledElement(node) {
  const calledDecision = findExtensionElement(node, 'zeebe:CalledDecision');

  let results = [];

  if (calledDecision && !calledDecision.get('zeebe:decisionId')) {
    results = [
      ...results,
      {
        message: 'Element of type <zeebe:CalledDecision> must have <zeebe:decisionId> property',
        path: [ ...getPath(calledDecision, node), 'decisionId' ]
      }
    ];
  }

  if (calledDecision && !calledDecision.get('zeebe:resultVariable')) {
    results = [
      ...results,
      {
        message: 'Element of type <zeebe:CalledDecision> must have <zeebe:resultVariable> property',
        path: [ ...getPath(calledDecision, node), 'resultVariable' ]
      }
    ];
  }

  return results;
}

function checkZeebeTaskDefinition(node) {
  const taskDefinition = findExtensionElement(node, 'zeebe:TaskDefinition');

  let results = [];

  if (taskDefinition && !taskDefinition.get('zeebe:type')) {
    results = [
      ...results,
      {
        message: 'Element of type <zeebe:TaskDefinition> must have <zeebe:type> property',
        path: [ ...getPath(taskDefinition, node), 'type' ]
      }
    ];
  }

  if (taskDefinition && !taskDefinition.get('zeebe:retries')) {
    results = [
      ...results,
      {
        message: 'Element of type <zeebe:TaskDefinition> must have <zeebe:retries> property',
        path: [ ...getPath(taskDefinition, node), 'retries' ]
      }
    ];
  }

  return results;
}

module.exports.hasZeebeCalledDecisionOrTaskDefinition = function(node) {
  const calledDecision = findExtensionElement(node, 'zeebe:CalledDecision'),
        taskDefinition = findExtensionElement(node, 'zeebe:TaskDefinition');

  if (calledDecision && taskDefinition || (!calledDecision && !taskDefinition)) {
    return `Element of type <${ node.$type }> must have either <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element`;
  }

  let results = [
    ...checkZeebeCalledElement(node),
    ...checkZeebeTaskDefinition(node)
  ];

  if (results.length) {
    return results;
  }

  return true;
};

module.exports.hasZeebeTaskDefinition = function(node) {
  const taskDefinition = findExtensionElement(node, 'zeebe:TaskDefinition');

  if (!taskDefinition) {
    return `Element of type <${ node.$type }> must have <zeebe:TaskDefinition> extension element`;
  }

  let results = checkZeebeTaskDefinition(node);

  if (results.length) {
    return results;
  }

  return true;
};

module.exports.hasZeebeCalledElement = function(node) {
  const calledElement = findExtensionElement(node, 'zeebe:CalledElement');

  if (!calledElement) {
    return getExtensionElementMessage(node.$type, 'zeebe:CalledElement');
  }

  return true;
};

module.exports.hasZeebeTaskDefinitionIfChild = function(type) {
  return function(node) {

    if (hasEventDefinitionOfType(type)(node)) {
      if (module.exports.hasZeebeTaskDefinition(node) !== true) {
        return getExtensionElementMessage(`${node.$type} (${type})`, 'zeebe:TaskDefinition');
      }
    }

    return true;
  };
};

function getExtensionElementMessage(type, extensionElement) {
  return {
    message: `Element of type <${ type }> must have <${ extensionElement }> extension element`
  };
}
