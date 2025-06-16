const { is } = require('bpmnlint-utils');

const { skipInNonExecutableProcess } = require('../utils/rule');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {

    if (!is(node, 'bpmn:Process')) {
      return;
    }

    if (!node.get('camunda:historyTimeToLive')) {
      reporter.report(node.id, 'Property <historyTimeToLive> should be configured on <bpmn:Process> or engine level.', [ 'historyTimeToLive' ]);
    }
  }

  return {
    meta: {
      documentation: {
        url: 'https://docs.camunda.org/manual/latest/modeler/history-time-to-live/'
      }
    },
    check
  };
});