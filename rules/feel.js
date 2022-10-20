const { is } = require('bpmnlint-utils');
const { lintExpression } = require('@bpmn-io/feel-lint');

const { reportErrors } = require('./utils/reporter');
const { getPath } = require('@bpmn-io/moddle-utils');
const { ERROR_TYPES } = require('./utils/error-types');

module.exports = function() {
  function check(node, reporter) {

    const parentNode = findFlowElement(node);
    const errors = [];

    if (!parentNode) {
      return;
    }

    Object.entries(node).forEach(([ propertyName, value ]) => {
      if (isFeelValue([ propertyName, value ])) {
        const lintErrors = lintExpression(value.substring(1));

        // syntax error
        if (lintErrors.find(({ type }) => type === 'syntaxError')) {
          const path = getPath(node, parentNode);

          errors.push(
            {
              message: `Invalid FEEL expression in <${ propertyName }>`,
              path: path
                ? [ ...path, propertyName ]
                : [ propertyName ],
              error: {
                type: ERROR_TYPES.FEEL_INVALID,
                node: node,
                parentNode,
                property: propertyName
              }
            }
          );
        }
      }
    });

    errors.length && reportErrors(parentNode, reporter, errors);
  }

  return {
    check
  };
};

const isFeelValue = ([ key, value ]) => {
  return shouldCheck(key) && typeof value === 'string' && value.startsWith('=');
};

const shouldCheck = key => {
  return !key.startsWith('$');
};

const findFlowElement = node => {
  while (node && !is(node, 'bpmn:FlowElement')) {
    node = node.$parent;
  }

  return node;
};