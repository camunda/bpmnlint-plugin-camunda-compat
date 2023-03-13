const { hasNoExtensionElement } = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

const { skipInNonExecutableProcess } = require('./utils/rule');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    const errors = hasNoExtensionElement(node, 'zeebe:Properties', node, '8.1');

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});