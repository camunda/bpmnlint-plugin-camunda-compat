const { is, isAny } = require('bpmnlint-utils');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');
const { greaterOrEqual } = require('../utils/version');

const COMPLETION_ATTRIBUTES_SUPPORT_VERSION = '8.8';

module.exports = skipInNonExecutableProcess(function({ version }) {
  function check(node, reporter) {
    if (!is(node, 'bpmn:AdHocSubProcess')) {
      return;
    }

    // Ad-Hoc Sub-Process must contain at least one activity
    if (!node.get('flowElements').some(isActivity)) {
      reportErrors(node, reporter, {
        message: 'Element of type <bpmn:AdHocSubProcess> must contain at least one activity',
        data: {
          node,
          parentNode: null
        }
      });
    }

    if (!greaterOrEqual(version, COMPLETION_ATTRIBUTES_SUPPORT_VERSION)) {
      if (node.get('completionCondition')) {
        reportErrors(node, reporter, [
          {
            message:  'Element of type <bpmn:completionCondition> within <bpmn:AdHocSubProcess> only allowed by Camunda 8.8 or newer',
            data: {
              node,
              parentNode: null
            }
          }
        ]);
      }

      // check for property existence here as the attributes defaults to true and a value will always be present
      if (Object.prototype.hasOwnProperty.call(node, 'cancelRemainingInstances')) {
        reportErrors(node, reporter, [
          {
            message:  'Element of type <bpmn:AdHocSubProcess> with property <cancelRemainingInstances> only allowed by Camunda 8.8 or newer',
            data: {
              node,
              parentNode: null
            }
          }
        ]);
      }
    }
  }

  return {
    check
  };
});

function isActivity(element) {
  return isAny(element, [ 'bpmn:Task', 'bpmn:SubProcess' ]);
}
