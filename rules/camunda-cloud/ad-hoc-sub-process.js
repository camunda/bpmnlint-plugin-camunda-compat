const { is, isAny } = require('bpmnlint-utils');

const { hasProperties } = require('../utils/element');
const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');
const { greaterOrEqual } = require('../utils/version');

const COMPLETION_ATTRIBUTES_SUPPORT_VERSION = '8.8';

module.exports = skipInNonExecutableProcess(function({ version }) {
  function check(node, reporter) {
    if (!is(node, 'bpmn:AdHocSubProcess')) {
      return;
    }

    const errors = [];

    // Ad-Hoc Sub-Process must contain at least one activity
    if (!node.get('flowElements').some(isActivity)) {
      errors.push({
        message: 'Element of type <bpmn:AdHocSubProcess> must contain at least one activity',
        data: {
          node,
          parentNode: null
        }
      });
    }

    if (!greaterOrEqual(version, COMPLETION_ATTRIBUTES_SUPPORT_VERSION)) {
      errors.push(...hasProperties(node, {
        completionCondition: {
          allowed: false,
          allowedVersion: COMPLETION_ATTRIBUTES_SUPPORT_VERSION
        },
        cancelRemainingInstances: {
          allowed: value => value !== false, // only allow true which is default value
          allowedVersion: COMPLETION_ATTRIBUTES_SUPPORT_VERSION
        }
      }, node));
    }

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});

function isActivity(element) {
  return isAny(element, [ 'bpmn:Task', 'bpmn:SubProcess' ]);
}
