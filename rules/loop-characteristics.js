const { is } = require('bpmnlint-utils');

const {
  findExtensionElement,
  hasProperties,
  hasExtensionElement
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

module.exports = function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:Activity')) {
      return;
    }

    let loopCharacteristics = node.get('loopCharacteristics');

    if (!loopCharacteristics) {
      return;
    }

    let errors = hasProperties(node, {
      loopCharacteristics: {
        type: 'bpmn:MultiInstanceLoopCharacteristics'
      }
    }, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }

    errors = hasExtensionElement(loopCharacteristics, 'zeebe:LoopCharacteristics', node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }

    loopCharacteristics = findExtensionElement(loopCharacteristics, 'zeebe:LoopCharacteristics');

    errors = hasProperties(loopCharacteristics, {
      inputCollection: {
        required: true
      },
      outputCollection: {
        dependendRequired: 'outputElement'
      },
      outputElement: {
        dependendRequired: 'outputCollection'
      }
    }, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
};