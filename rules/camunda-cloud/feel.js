const { isString } = require('min-dash');

const {
  is,
  isAny
} = require('bpmnlint-utils');

const { lintExpression } = require('@bpmn-io/feel-lint');

const { getPath } = require('@bpmn-io/moddle-utils');

const { reportErrors } = require('../utils/reporter');

const { ERROR_TYPES } = require('../utils/error-types');

const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (is(node, 'bpmn:Expression')) {
      return;
    }

    const parentNode = findParentNode(node);

    if (!parentNode) {
      return;
    }

    const errors = [];

    Object.entries(node).forEach(([ propertyName, propertyValue ]) => {
      if (propertyValue && is(propertyValue, 'bpmn:Expression')) {
        propertyValue = propertyValue.get('body');
      }

      if (isFeelProperty([ propertyName, propertyValue ])) {
        const lintErrors = lintExpression(propertyValue.substring(1));

        // syntax error
        if (lintErrors.find(({ type }) => type === 'Syntax Error')) {
          const path = getPath(node, parentNode);

          errors.push(
            {
              message: `Property <${ propertyName }> is not a valid FEEL expression`,
              path: path
                ? [ ...path, propertyName ]
                : [ propertyName ],
              data: {
                type: ERROR_TYPES.FEEL_EXPRESSION_INVALID,
                node,
                parentNode,
                property: propertyName
              }
            }
          );
        }
      }
    });

    if (errors && errors.length) {
      reportErrors(parentNode, reporter, errors);
    }
  }

  return annotateRule('feel', {
    check
  });
});

const isFeelProperty = ([ propertyName, value ]) => {
  return !isIgnoredProperty(propertyName) && isString(value) && value.startsWith('=');
};

const isIgnoredProperty = propertyName => {
  return propertyName.startsWith('$');
};

const findParentNode = node => {
  while (node && !isAny(node, [ 'bpmn:FlowElement', 'bpmn:FlowElementsContainer' ])) {
    node = node.$parent;
  }

  return node;
};