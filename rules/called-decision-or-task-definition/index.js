const { is } = require('bpmnlint-utils');

const { getPath } = require('@bpmn-io/moddle-utils');

const config = require('./config');

const { greaterOrEqual } = require('../utils/version');

const {
  findExtensionElement,
  getEventDefinition,
  hasExtensionElement,
  hasProperties
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { ERROR_TYPES } = require('../utils/error-types');

module.exports = function({ version }) {
  function check(node, reporter) {
    if (
      (!config.calledDecision[ node.$type ] || !greaterOrEqual(version, config.calledDecision[ node.$type ]))
      && (!config.taskDefinition[ node.$type ] || !greaterOrEqual(version, config.taskDefinition[ node.$type ]))) {
      return;
    }

    if (is(node, 'bpmn:ThrowEvent') && !getEventDefinition(node)) {
      return;
    }

    let errors;

    const calledDecision = findExtensionElement(node, 'zeebe:CalledDecision'),
          taskDefinition = findExtensionElement(node, 'zeebe:TaskDefinition');

    if (calledDecision && !taskDefinition) {

      if (!isCalledDecisionAllowed(node, version)) {
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

      if (!isTaskDefinitionAllowed(node, version)) {
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

    if (isCalledDecisionAllowed(node, version) && isTaskDefinitionAllowed(node, version)) {
      errors = hasExtensionElement(node, [
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ], node);
    } else if (isCalledDecisionAllowed(node, version)) {
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

function isCalledDecisionAllowed(node, version) {
  const { calledDecision } = config;

  return calledDecision[ node.$type ] && greaterOrEqual(version, calledDecision[ node.$type ]);
}

function isTaskDefinitionAllowed(node, version) {
  const { taskDefinition } = config;

  return taskDefinition[ node.$type ] && greaterOrEqual(version, taskDefinition[ node.$type ]);
}