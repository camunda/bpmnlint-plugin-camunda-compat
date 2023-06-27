const { is } = require('bpmnlint-utils');

const { hasProperties } = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {

    if (!is(node, 'bpmn:Process')) {
      return;
    }

    let errors = hasProperties(node, {
      'historyTimeToLive': {
        required: true
      }
    }, node);

    if (errors) {
      reportErrors(node, reporter, errors);
    }
    return;
  }

  return {
    check
  };
});