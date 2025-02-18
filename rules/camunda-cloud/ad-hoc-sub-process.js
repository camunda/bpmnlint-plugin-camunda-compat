const { is, isAny } = require('bpmnlint-utils');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:AdHocSubProcess')) {
      return;
    }

    // Ad-Hoc Sub-Process must contain at least one activity
    if (node.get('flowElements').some(isActivity)) {
      return;
    }

    reportErrors(node, reporter, {
      message: 'Element of type <bpmn:AdHocSubProcess> must contain at least one activity',
      data: {
        node,
        parentNode: null
      }
    });
  }

  return {
    check
  };
});

function isActivity(element) {
  return isAny(element, [ 'bpmn:Task', 'bpmn:SubProcess' ]);
}