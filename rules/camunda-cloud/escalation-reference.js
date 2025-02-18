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
const { annotateRule } = require('../helper');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!isAny(node, [ 'bpmn:CatchEvent', 'bpmn:ThrowEvent' ])) {
      return;
    }

    const eventDefinition = getEventDefinition(node);

    if (!eventDefinition || !is(eventDefinition, 'bpmn:EscalationEventDefinition')) {
      return;
    }

    let errors = [];

    if (!isNoEscalationRefAllowed(node)) {
      errors = hasProperties(eventDefinition, {
        escalationRef: {
          required: true
        }
      }, node);

      if (errors.length) {
        reportErrors(node, reporter, errors);

        return;
      }
    }

    const escalationRef = eventDefinition.get('escalationRef');

    if (!escalationRef) {
      return;
    }

    errors = hasProperties(escalationRef, {
      escalationCode: {
        required: true
      }
    }, node);

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return annotateRule('escalation-reference', {
    check
  });
});

function isNoEscalationRefAllowed(node) {
  return isAny(node, [ 'bpmn:CatchEvent', 'bpmn:BoundaryEvent' ]);
}