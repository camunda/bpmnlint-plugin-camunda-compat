const { is } = require('bpmnlint-utils');

const { reportErrors } = require('../utils/reporter');

const { hasProperties } = require('../utils/element');


/**
 * Rule that disallows interrupting start events in event subprocesses
 * that are placed inside ad-hoc subprocesses.
 */
module.exports = function() {
  function check(node, reporter) {

    // Only check event subprocesses
    if (!isEventSubProcess(node)) {
      return;
    }

    // Check if event subprocess is inside an ad-hoc subprocess
    const parent = node.$parent;
    if (!parent || !is(parent, 'bpmn:AdHocSubProcess')) {
      return;
    }

    // Check if the event subprocess has any interrupting start events
    const startEvents = getStartEvents(node);

    const errors = startEvents.flatMap(startEvent => hasProperties(startEvent, {
      isInterrupting: {
        value: false
      }
    }, node));

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check: check
  };
};

function isEventSubProcess(node) {
  return is(node, 'bpmn:SubProcess') && node.get('triggeredByEvent');
}

function getStartEvents(node) {
  return node.get('flowElements').filter(element => {
    return is(element, 'bpmn:StartEvent');
  });
}
