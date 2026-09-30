const { is } = require('bpmnlint-utils');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { hasProperties } = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {

    if (!is(node, 'bpmn:Process')) {
      return;
    }

    // `node` as parentNode keeps the path relative (`[ 'historyTimeToLive' ]`)
    // rather than absolute from the root
    const errors = hasProperties(node, {
      historyTimeToLive: { required: true }
    }, node).map(error => ({
      ...error,
      message: 'Property <historyTimeToLive> should be configured on <bpmn:Process> or engine level.'
    }));

    if (errors.length) {
      reportErrors(node, reporter, errors);
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
