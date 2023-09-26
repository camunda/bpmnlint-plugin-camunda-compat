const {
  is,
  isAny
} = require('bpmnlint-utils');

const {
  getEventDefinition,
  hasProperties
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!isAny(node, [
      'bpmn:StartEvent',
      'bpmn:IntermediateThrowEvent',
      'bpmn:IntermediateCatchEvent',
      'bpmn:EndEvent',
      'bpmn:BoundaryEvent'
    ])) {
      return;
    }

    const eventDefinition = getEventDefinition(node);

    if (!eventDefinition || !is(eventDefinition, 'bpmn:SignalEventDefinition')) {
      return;
    }

    let errors = hasProperties(eventDefinition, {
      signalRef: {
        required: true
      }
    }, node);

    if (errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }

    const signalRef = eventDefinition.get('signalRef');

    if (!signalRef) {
      return;
    }

    errors = hasProperties(signalRef, {
      name: {
        required: true
      }
    }, node);

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});