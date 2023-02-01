const { is } = require('bpmnlint-utils');

const {
  findExtensionElement,
  hasExtensionElement,
  hasProperties
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

const skipIfNonExecutableProcess = require('./utils/skipIfNonExecutableProcess');

module.exports = skipIfNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:CallActivity')) {
      return;
    }

    let errors = hasExtensionElement(node, 'zeebe:CalledElement', node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }

    const calledElement = findExtensionElement(node, 'zeebe:CalledElement');

    errors = hasProperties(calledElement, {
      processId: {
        required: true
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