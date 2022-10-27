const { is } = require('bpmnlint-utils');

const { hasNoExtensionElement } = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

module.exports = function() {
  function check(node, reporter) {
    if (!is(node, 'zeebe:PropertiesHolder')) {
      return;
    }

    const errors = hasNoExtensionElement(node, 'zeebe:Properties', node, '8.1');

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
};