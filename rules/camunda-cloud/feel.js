const { isString } = require('min-dash');

const {
  is,
  isAny
} = require('bpmnlint-utils');

const { lintExpression } = require('@bpmn-io/feel-lint');

const { getPath } = require('@bpmn-io/moddle-utils');
const { camundaBuiltins, camundaReservedNameBuiltins } = require('@camunda/feel-builtins');

const { reportErrors } = require('../utils/reporter');

const { ERROR_TYPES } = require('../utils/error-types');

const { isCompatible } = require('@bpmn-io/semver-compat');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

// Properties ignored globally
const IGNORED_PROPERTIES = [
  'name'
];

// Properties ignored only for specific element types
const IGNORED_PROPERTIES_BY_TYPE = {
  'zeebe:Input': [ 'target' ],
  'zeebe:Output': [ 'target' ],
  'zeebe:Header': [ 'key', 'value' ],
  'zeebe:Property': [ 'name', 'value' ],
  'zeebe:CalledDecision': [ 'resultVariable' ],
  'zeebe:Script': [ 'resultVariable' ]
};

module.exports = skipInNonExecutableProcess(function(config = {}) {
  const { engines = {} } = config;

  const unavailableBuiltins = getUnavailableBuiltins(camundaBuiltins, engines);

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

      if (isFeelProperty(node, propertyName, propertyValue)) {
        const path = getPath(node, parentNode);

        const expression = propertyValue.substring(1);

        const lintErrors = lintExpression(expression, {
          parserDialect: 'camunda',
          builtins: camundaReservedNameBuiltins
        });

        // syntax error
        if (lintErrors.find(({ type }) => type === 'Syntax Error')) {
          errors.push({
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
          });

          return;
        }

        // unsupported function call for the configured engines
        for (const builtin of unavailableBuiltins) {
          if (isFunctionCalled(expression, builtin.name)) {
            errors.push({
              message: `Function <${ builtin.name }> requires Camunda ${ builtin.engines.camunda }`,
              path: path
                ? [ ...path, propertyName ]
                : [ propertyName ],
              data: {
                type: ERROR_TYPES.FEEL_EXPRESSION_UNSUPPORTED_FUNCTION,
                node,
                parentNode,
                property: propertyName
              }
            });

            break;
          }
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

// --- FEEL helpers ------------------------------------------------------------

/**
 * Returns builtins that are incompatible with the provided engine versions.
 * Deduplicates by name, keeping the first occurrence.
 *
 * @param { Array<{ name: string, engines?: Record<string, string> }> } builtins
 * @param { Record<string, string> } engines
 * @returns { Array<{ name: string, engines: Record<string, string> }> }
 */
function getUnavailableBuiltins(builtins, engines) {
  if (!Object.keys(engines).length) {
    return [];
  }

  const seen = new Set();

  return builtins.filter(builtin => {
    if (seen.has(builtin.name)) {
      return false;
    }

    if (!isBuiltinCompatible(builtin, engines)) {
      seen.add(builtin.name);
      return true;
    }

    seen.add(builtin.name);
    return false;
  });
}

function isBuiltinCompatible(builtin, engines) {
  if (!builtin.engines) {
    return true;
  }

  return isCompatible(builtin.engines, engines);
}

/**
 * Returns true if the given FEEL expression contains a call to the named function.
 * Handles multi-word FEEL function names such as `from json` or `get or else`.
 *
 * @param {string} expression
 * @param {string} functionName
 * @returns {boolean}
 */
function isFunctionCalled(expression, functionName) {
  const pattern = functionName
    .split(/\s+/)
    .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+') + '\\s*\\(';

  return new RegExp('\\b' + pattern).test(expression);
}

// --- shared helpers ----------------------------------------------------------

const isFeelProperty = (node, propertyName, value) => {
  return !isIgnoredProperty(node, propertyName) && isString(value) && value.startsWith('=');
};

const isIgnoredProperty = (node, propertyName) => {
  if (propertyName.startsWith('$') || IGNORED_PROPERTIES.includes(propertyName)) {
    return true;
  }

  const nodeType = node.$type;
  const ignoredForType = IGNORED_PROPERTIES_BY_TYPE[nodeType];

  return ignoredForType && ignoredForType.includes(propertyName);
};

const findParentNode = node => {
  while (node && !isAny(node, [ 'bpmn:FlowElement', 'bpmn:FlowElementsContainer' ])) {
    node = node.$parent;
  }

  return node;
};
