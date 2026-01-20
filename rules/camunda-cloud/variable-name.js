const { is } = require('bpmnlint-utils');

const {
  findExtensionElement,
  hasProperties
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { isValidVariableName } = require('../utils/variable-name');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    const errors = [];

    // zeebe:IoMapping#inputParameters/outputParameters
    const ioMapping = findExtensionElement(node, 'zeebe:IoMapping');
    if (ioMapping) {
      const inputParameters = ioMapping.get('inputParameters') || [];
      const outputParameters = ioMapping.get('outputParameters') || [];

      inputParameters.forEach((input) => {
        errors.push(...hasProperties(input, {
          target: {
            allowed: isValidVariableName
          }
        }, node));
      });

      outputParameters.forEach((output) => {
        errors.push(...hasProperties(output, {
          target: {
            allowed: isValidVariableName
          }
        }, node));
      });
    }

    const loopCharacteristics = node.get('loopCharacteristics');
    if (loopCharacteristics && is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')) {
      const zeebeLoopCharacteristics = findExtensionElement(loopCharacteristics, 'zeebe:LoopCharacteristics');

      if (zeebeLoopCharacteristics) {
        errors.push(...hasProperties(zeebeLoopCharacteristics, {
          inputElement: {
            allowed: isValidVariableName
          },
          outputCollection: {
            allowed: isValidVariableName
          }
        }, node));
      }
    }

    // zeebe:Script#resultVariable
    if (is(node, 'bpmn:ScriptTask')) {
      const script = findExtensionElement(node, 'zeebe:Script');

      if (script) {
        errors.push(...hasProperties(script, {
          resultVariable: {
            allowed: isValidVariableName
          }
        }, node));
      }
    }

    // zeebe:CalledDecision#resultVariable)
    if (is(node, 'bpmn:BusinessRuleTask')) {
      const calledDecision = findExtensionElement(node, 'zeebe:CalledDecision');

      if (calledDecision) {
        errors.push(...hasProperties(calledDecision, {
          resultVariable: {
            allowed: isValidVariableName
          }
        }, node));
      }
    }

    // zeebe:AdHoc#outputCollection
    if (is(node, 'bpmn:AdHocSubProcess')) {
      const adHoc = findExtensionElement(node, 'zeebe:AdHoc');

      if (adHoc) {
        errors.push(...hasProperties(adHoc, {
          outputCollection: {
            allowed: isValidVariableName
          }
        }, node));
      }
    }

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});
