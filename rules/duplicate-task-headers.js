const {
  is,
  isAny
} = require('bpmnlint-utils');

const {
  findExtensionElement,
  getMessageEventDefinition,
  hasDuplicatedPropertyValues
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

const skipIfNonExecutableProcess = require('./utils/skipIfNonExecutableProcess');

module.exports = skipIfNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:UserTask') && !isZeebeServiceTask(node)) {
      return;
    }

    const taskHeaders = findExtensionElement(node, 'zeebe:TaskHeaders');

    if (!taskHeaders) {
      return;
    }

    const errors = hasDuplicatedPropertyValues(taskHeaders, 'values', 'key', node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});

// helpers //////////

function isZeebeServiceTask(element) {
  if (is(element, 'zeebe:ZeebeServiceTask')) {
    return true;
  }

  if (isAny(element, [
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent'
  ])) {
    return getMessageEventDefinition(element);
  }

  if (is(element, 'bpmn:BusinessRuleTask')) {
    return findExtensionElement(element, 'zeebe:TaskDefinition');
  }

  return false;
}