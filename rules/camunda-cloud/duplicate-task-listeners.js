const {
  findExtensionElement,
  hasDuplicatedPropertiesValues
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    const taskListeners = findExtensionElement(node, 'zeebe:TaskListeners');

    if (!taskListeners) {
      return;
    }

    const errors = hasDuplicatedTaskListeners(taskListeners, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});

// helpers //////////
function hasDuplicatedTaskListeners(taskListeners, parentNode = null) {
  return hasDuplicatedPropertiesValues(taskListeners, 'listeners', [ 'eventType', 'type' ], parentNode);
}
