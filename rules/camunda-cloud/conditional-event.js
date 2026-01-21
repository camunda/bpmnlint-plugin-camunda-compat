const {
  is
} = require('bpmnlint-utils');

const {
  findExtensionElement,
  getEventDefinition
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { ERROR_TYPES } = require('../utils/error-types');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { isValidVariableName } = require('../utils/variable-name');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {

    if (!is(node, 'bpmn:Event')) {
      return;
    }

    const eventDefinition = getEventDefinition(node);
    if (!eventDefinition || !is(eventDefinition, 'bpmn:ConditionalEventDefinition')) {
      return;
    }

    const conditionalFilter = findExtensionElement(eventDefinition, 'zeebe:ConditionalFilter');
    if (!conditionalFilter) {
      return;
    }

    const variableNames = conditionalFilter.get('variableNames');
    if (!variableNames) {
      return;
    }


    // Validate `variableNames` property of `zeebe:ConditionalFilter`

    // (1) Is empty or a comma-separated list
    if (!isCommaSeparatedList(variableNames)) {
      reportErrors(node, reporter, {
        message: 'Variable names must be a comma-separated list',
        path: [ 'extensionElements', 'values', 'variableNames' ],
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_INVALID,
          node,
          parentNode: node,
          property: 'variableNames'
        }
      });

      // (!) Stop further validation if the list is invalid
      return;
    }

    const errors = [];

    // (2) Each variable name is a valid variable identifier
    const variables = variableNames.split(',').map(v => v.trim());
    variables.forEach(variable => {
      if (!isValidVariableName(variable)) {
        errors.push({
          message: `Variable name "${variable}" is not a valid variable identifier`,
          path: [ 'extensionElements', 'values', 'variableNames' ],
          data: {
            type: ERROR_TYPES.PROPERTY_VALUE_INVALID,
            node,
            parentNode: node,
            property: 'variableNames'
          }
        });
      }
    });

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});

function isCommaSeparatedList(string) {
  if (string === '') {
    return true;
  }

  return string.split(',').every(i => i.trim() !== '');
}
