const { findExtensionElement } = require('../utils/element');
const { reportErrors } = require('../utils/reporter');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { addAllowedVersion } = require('../utils/element');
const { greaterOrEqual } = require('../utils/version');
const { getPath } = require('@bpmn-io/moddle-utils');
const { ERROR_TYPES } = require('../utils/error-types');

const ALLOWED_VERSION_NO_INPUT_SOURCE = '8.7';

module.exports = skipInNonExecutableProcess(function({ version }) {
  function check(node, reporter) {
    const ioMapping = findExtensionElement(node, 'zeebe:IoMapping');

    if (!ioMapping) {
      return [];
    }

    const errors = [];

    const inputParameters = ioMapping.get('inputParameters');
    if (Array.isArray(inputParameters)) {
      inputParameters.forEach((parameter) => {

        // Camunda >= 8.7 allows optional source for input mapping
        if (!greaterOrEqual(version, ALLOWED_VERSION_NO_INPUT_SOURCE)) {
          if (!parameter.get('source')) {
            errors.push(getError('Input', 'source', parameter, node, ALLOWED_VERSION_NO_INPUT_SOURCE));
          }
        }
        if (!parameter.get('target')) {
          errors.push(getError('Input', 'target', parameter, node));
        }
      });
    }

    const outputParameters = ioMapping.get('outputParameters');
    if (Array.isArray(outputParameters)) {
      outputParameters.forEach((parameter) => {
        if (!parameter.get('source')) {
          errors.push(getError('Output', 'source', parameter, node));
        }
        if (!parameter.get('target')) {
          errors.push(getError('Output', 'target', parameter, node));
        }
      });
    }

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }

  }
  return { check };
});

function getError(parameterType, propertyName, node, parentNode, allowedVersion) {
  const path = getPath(node, parentNode);

  return {
    message: allowedVersion ?
      `${parameterType} mapping without <${propertyName}> only allowed by Camunda ${allowedVersion} or newer.` :
      `${parameterType} mapping <${propertyName}> must be defined.`,

    path: path
      ? [ ...getPath(node, parentNode), propertyName ]
      : [ propertyName ],
    data: addAllowedVersion({
      type: ERROR_TYPES.IO_MAPPING_INCOMPLETE,
      node,
      parentNode: parentNode,
      property: propertyName
    }, allowedVersion)
  };
}


