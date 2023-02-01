const { is } = require('bpmnlint-utils');

const { greaterOrEqual } = require('./version');

module.exports = function(childRule) {
  return function(config = {}) {
    const { check: childCheck } = childRule(config);

    const { version } = config;

    function check(node, reporter) {
      if (version && greaterOrEqual(version, '8.2') && isNonExecutableProcess(node)) {
        return false;
      }

      return childCheck(node, reporter);
    }

    return {
      check
    };
  };
};

function isNonExecutableProcess(node) {
  let process;

  if (is(node, 'bpmn:Process')) {
    process = node;
  }

  if (is(node, 'bpmndi:BPMNPlane')
    && is(node.get('bpmnElement'), 'bpmn:Process')) {
    process = node.get('bpmnElement');
  }

  return process && !process.get('isExecutable');
}