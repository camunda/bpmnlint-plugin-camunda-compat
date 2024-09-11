const { is } = require('bpmnlint-utils');

const { hasNoExtensionElement } = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const allowedVersion = '8.6';

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (is(node, 'bpmn:Process')) {
      const errors = hasNoExtensionElement(node, 'zeebe:VersionTag', node, allowedVersion);

      if (errors && errors.length) {
        reportErrors(node, reporter, errors);
      }
    }
  }

  return {
    check
  };
});