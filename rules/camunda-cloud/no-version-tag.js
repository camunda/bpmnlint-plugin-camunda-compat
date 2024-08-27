const { is } = require('bpmnlint-utils');

const { hasProperties, findExtensionElement, hasNoExtensionElement } = require('../utils/element');

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

      return;
    }

    let extensionElement;

    if (is(node, 'bpmn:BusinessRuleTask')) {
      extensionElement = findExtensionElement(node, 'zeebe:CalledDecision');
    } else if (is(node, 'bpmn:CallActivity')) {
      extensionElement = findExtensionElement(node, 'zeebe:CalledElement');
    } else if (is(node, 'bpmn:UserTask')) {
      extensionElement = findExtensionElement(node, 'zeebe:FormDefinition');
    }

    if (extensionElement) {
      const errors = hasProperties(extensionElement, {
        versionTag: {
          allowed: false,
          allowedVersion
        }
      }, node);

      if (errors && errors.length) {
        reportErrors(node, reporter, errors);
      }
    }
  }

  return {
    check
  };
});