const { findExtensionElement, hasProperties } = require('../utils/element');
const { reportErrors } = require('../utils/reporter');
const { skipInNonExecutableProcess } = require('../utils/rule');

module.exports = skipInNonExecutableProcess(function({ version }) {
  function check(node, reporter) {
    const ioMapping = findExtensionElement(node, 'zeebe:IoMapping');

    if (!ioMapping) {
      return [];
    }


    const errors = [];

    const inputParameters = ioMapping.get('inputParameters');
    errors.push(...inputParameters.flatMap((parameter) => hasProperties(parameter, {
      source: {
        required: true
      },
      target: {
        required: true
      }
    }, node)));

    const outputParameters = ioMapping.get('outputParameters');
    errors.push(...outputParameters.flatMap((parameter) => hasProperties(parameter, {
      source: {
        required: true
      },
      target: {
        required: true
      }
    }, node)));

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }

  }
  return { check };
});
