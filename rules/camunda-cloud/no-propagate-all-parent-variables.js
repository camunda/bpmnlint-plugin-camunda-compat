const { is } = require('bpmnlint-utils');

const {
  findExtensionElement,
  hasProperties
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:CallActivity')) {
      return;
    }

    const calledElement = findExtensionElement(node, 'zeebe:CalledElement');

    if (!calledElement) {
      return;
    }

    const errors = hasProperties(calledElement, {
      propagateAllParentVariables: {
        allowed: false,
        allowedVersion: '8.2'
      }
    }, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});