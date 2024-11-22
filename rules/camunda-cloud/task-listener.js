const { is } = require('bpmnlint-utils');

const {
  findExtensionElement,
  hasProperties,
  hasExtensionElement
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');


module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:UserTask')) {
      return;
    }

    const taskListeners = findExtensionElement(node, 'zeebe:TaskListeners');

    if (!taskListeners) {
      return;
    }

    let errors = hasExtensionElement(node, 'zeebe:UserTask');

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }

    const listeners = taskListeners.get('listeners');
    errors = listeners.flatMap(listener => hasProperties(listener, {
      type: {
        required: true
      }
    }, node));

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});
