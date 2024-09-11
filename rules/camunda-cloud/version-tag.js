const { is } = require('bpmnlint-utils');

const {
  findExtensionElement,
  hasProperties
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (is(node, 'bpmn:Process')) {
      const versionTag = findExtensionElement(node, 'zeebe:VersionTag');

      if (!versionTag) {
        return;
      }

      const errors = hasProperties(versionTag, {
        value: {
          required: true
        }
      }, node);

      if (errors && errors.length) {
        reportErrors(node, reporter, errors);
      }
    }

    let extensionElement;

    if (is(node, 'bpmn:BusinessRuleTask')) {
      extensionElement = findExtensionElement(node, 'zeebe:CalledDecision');
    } else if (is(node, 'bpmn:CallActivity')) {
      extensionElement = findExtensionElement(node, 'zeebe:CalledElement');
    } else if (is(node, 'bpmn:UserTask')) {
      extensionElement = findExtensionElement(node, 'zeebe:FormDefinition');
    }

    if (extensionElement && extensionElement.get('bindingType') === 'versionTag') {
      const errors = hasProperties(extensionElement, {
        versionTag: {
          required: true
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