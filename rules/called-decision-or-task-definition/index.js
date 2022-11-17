const { is } = require('bpmnlint-utils');

const { getPath } = require('@bpmn-io/moddle-utils');

const { isString } = require('min-dash');

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
    const calledDecisionConfig = config.calledDecision[ node.$type ];
    const taskDefinitionConfig = config.taskDefinition[ node.$type ];

    if (
      (!calledDecisionConfig || (isString(calledDecisionConfig) && !greaterOrEqual(version, calledDecisionConfig)))
      && (!taskDefinitionConfig || (isString(taskDefinitionConfig) && !greaterOrEqual(version, taskDefinitionConfig)))) {
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
        const allowedVersion = getAllowedVersion(calledDecisionConfig, node);

        reportErrors(node, reporter, {
          message: allowedVersion
            ? `Extension element of type <zeebe:CalledDecision> only allowed by Camunda Platform ${ allowedVersion } or newer`
            : 'Extension element of type <zeebe:CalledDecision> not allowed',
          path: getPath(calledDecision, node),
          data: {
            type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
            node,
            parentNode: null,
            extensionElement: calledDecision,
            allowedVersion
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
        const allowedVersion = getAllowedVersion(taskDefinitionConfig, node);

        reportErrors(node, reporter, {
          message: allowedVersion
            ? `Extension element of type <zeebe:TaskDefinition> only allowed by Camunda Platform ${ allowedVersion } or newer`
            : 'Extension element of type <zeebe:TaskDefinition> not allowed',
          path: getPath(taskDefinition, node),
          data: {
            type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
            node,
            parentNode: null,
            extensionElement: taskDefinition,
            allowedVersion
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
    } else if (isTaskDefinitionAllowed(node, version)) {
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

  const allowedVersion = getAllowedVersion(taskDefinition[ node.$type ], node);

  return allowedVersion && greaterOrEqual(version, allowedVersion);
}

function getAllowedVersion(config, node) {
  if (!config) {
    return null;
  }

  if (isString(config)) {
    return config;
  }

  const eventDefinition = getEventDefinition(node);

  return eventDefinition && config[ eventDefinition.$type ];
}