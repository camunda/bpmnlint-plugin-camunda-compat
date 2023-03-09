const { is } = require('bpmnlint-utils');

const { greaterOrEqual } = require('./version');

function skipInNonExecutableProcess(ruleFactory) {
  return function(config = {}) {
    const rule = ruleFactory(config);

    const { version, platform = 'zeebe' } = config;

    function check(node, reporter) {
      if (platform === 'zeebe' && version && greaterOrEqual(version, '8.2') && isNonExecutableProcess(node)) {
        return false;
      }

      if (platform === 'platform' && isNonExecutableProcess(node)) {
        return false;
      }

      return rule.check(node, reporter);
    }

    return {
      ...rule,
      check
    };
  };
}

module.exports = {
  skipInNonExecutableProcess
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