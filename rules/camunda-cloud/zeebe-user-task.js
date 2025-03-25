const { is } = require('bpmnlint-utils');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { hasExtensionElement } = require('../utils/element');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:UserTask')) {
      return;
    }

    const errors = hasExtensionElement(node, 'zeebe:UserTask', node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    meta: {
      documentation: {
        url: 'https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-user-tasks'
      }
    },
    check
  };
});
