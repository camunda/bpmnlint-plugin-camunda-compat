const {
  is,
  isAny
} = require('bpmnlint-utils');

const { getPath } = require('@bpmn-io/moddle-utils');

const {
  findExtensionElement,
  getEventDefinition,
  hasExtensionElement,
  hasProperties
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { ERROR_TYPES } = require('../utils/error-types');

module.exports = function(config) {
  const {
    elementsCalledDecision = [],
    elementsTaskDefinition = []
  } = config;

  function check(node, reporter) {
    if (!isAny(node, elementsCalledDecision) && !isAny(node, elementsTaskDefinition)) {
      return;
    }

    if (is(node, 'bpmn:ThrowEvent') && !getEventDefinition(node)) {
      return;
    }

    let errors;

    const calledDecision = findExtensionElement(node, 'zeebe:CalledDecision'),
          taskDefinition = findExtensionElement(node, 'zeebe:TaskDefinition');

    if (calledDecision && !taskDefinition) {

      if (!isAny(node, elementsCalledDecision)) {
        reportErrors(node, reporter, {
          message: 'Extension element of type <zeebe:CalledDecision> not allowed',
          path: getPath(calledDecision, node),
          error: {
            type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
            node,
            parentNode: null,
            extensionElement: calledDecision
          }
        });

        return;
      }

      errors = hasProperties(calledDecision, {
        decisionId: {
          required: true
        },
        resultVariable: {
          required: true
        }
      }, node);

      if (errors && errors.length) {
        reportErrors(node, reporter, errors);

        return;
      }
    }

    if (!calledDecision && taskDefinition) {

      if (!isAny(node, elementsTaskDefinition)) {
        reportErrors(node, reporter, {
          message: 'Extension element of type <zeebe:TaskDefinition> not allowed',
          path: getPath(taskDefinition, node),
          error: {
            type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
            node,
            parentNode: null,
            extensionElement: taskDefinition
          }
        });

        return;
      }

      errors = hasProperties(taskDefinition, {
        type: {
          required: true
        }
      }, node);

      if (errors && errors.length) {
        reportErrors(node, reporter, errors);
      }
    }

    if (isAny(node, elementsCalledDecision) && isAny(node, elementsTaskDefinition)) {
      errors = hasExtensionElement(node, [
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ], node);
    } else if (isAny(node, elementsCalledDecision)) {
      errors = hasExtensionElement(node, 'zeebe:CalledDecision', node);
    } else {
      errors = hasExtensionElement(node, 'zeebe:TaskDefinition', node);
    }

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }
  }

  return {
    check
  };
};