const { is } = require('bpmnlint-utils');

const { hasNoExtensionElement } = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { greaterOrEqual } = require('../utils/version');

const startFormAllowedVersion = '8.3';

module.exports = skipInNonExecutableProcess(function({ version }) {
  function check(node, reporter) {
    if (!is(node, 'bpmn:StartEvent') || greaterOrEqual(version, startFormAllowedVersion)) {
      return;
    }

    let errors = hasNoExtensionElement(node, 'zeebe:FormDefinition', node, startFormAllowedVersion);

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});
