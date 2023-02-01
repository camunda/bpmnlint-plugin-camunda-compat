const {
  is,
  isAny
} = require('bpmnlint-utils');

const {
  getEventDefinition,
  hasProperties
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

const skipIfNonExecutableProcess = require('./utils/skipIfNonExecutableProcess');

module.exports = skipIfNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!isAny(node, [ 'bpmn:CatchEvent', 'bpmn:ThrowEvent' ])) {
      return;
    }

    const eventDefinition = getEventDefinition(node);

    if (!eventDefinition || !is(eventDefinition, 'bpmn:ErrorEventDefinition')) {
      return;
    }

    let errors = hasProperties(eventDefinition, {
      errorRef: {
        required: true
      }
    }, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }

    const errorRef = eventDefinition.get('errorRef');

    errors = hasProperties(errorRef, {
      errorCode: {
        required: true
      }
    }, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});