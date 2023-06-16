const { is } = require('bpmnlint-utils');

const { ERROR_TYPES } = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

module.exports = function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:Process')) {
      return;
    }

    const flowElements = node.get('flowElements') || [];

    const blankStartEvents = flowElements
      .filter(e => is(e, 'bpmn:StartEvent'))
      .filter(e => !e.get('eventDefinitions').length);

    if (blankStartEvents.length <= 1) {
      return;
    }

    blankStartEvents.forEach(startEvent => {
      reportErrors(startEvent, reporter, {
        message: `A <${node.$type}> only supports one blank start event.`,
        data: {
          type: ERROR_TYPES.ELEMENT_MULTIPLE_NOT_ALLOWED,
          node: startEvent,
          parentNode: null
        }
      });
    });
  }

  return {
    check
  };
};
