const { isString } = require('min-dash');

const { getPath, pathConcat } = require('@bpmn-io/moddle-utils');

const { findExtensionElement } = require('../utils/element');

const { ERROR_TYPES } = require('../utils/error-types');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { findSecretReferenceViolations, containsSecretReferenceLiteral } = require('./utils/feel');

// list/if-branch checks are `zeebe:Input`-only; the string-literal check
// also applies to `zeebe:Property` values; see
// https://docs.camunda.io/docs/next/components/concepts/variables/#secret-references-in-input-mappings
module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    const errors = [
      ...checkInputSources(node),
      ...checkPropertyValues(node)
    ];

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  // `zeebe:Input` source: checked for all three violations.
  function checkInputSources(node) {
    const ioMapping = findExtensionElement(node, 'zeebe:IoMapping');

    if (!ioMapping) {
      return [];
    }

    return ioMapping.get('inputParameters').reduce((errors, inputParameter) => {
      const source = inputParameter.get('source');

      errors.push(...getStringLiteralErrors('source', source, inputParameter, node));

      if (isString(source) && source.includes('secrets.') && isFeelExpression(source)) {
        const violations = findSecretReferenceViolations(source.substring(1));

        if (violations.insideList) {
          errors.push(getInsideListReport('source', inputParameter, node));
        }

        if (violations.insideIfBranchContext) {
          errors.push(getInsideIfBranchContextReport('source', inputParameter, node));
        }
      }

      return errors;
    }, []);
  }

  // the misplaced-reference check is `zeebe:Input`-only; only the
  // string-literal check applies to `zeebe:Property` values too
  function checkPropertyValues(node) {
    const properties = findExtensionElement(node, 'zeebe:Properties');

    if (!properties) {
      return [];
    }

    return properties.get('properties').reduce((errors, property) => {
      return [
        ...errors,
        ...getStringLiteralErrors('value', property.get('value'), property, node)
      ];
    }, []);
  }

  function getStringLiteralErrors(propertyName, value, node, parentNode) {
    if (!isString(value) || !value.includes('secrets.')) {
      return [];
    }

    if (!isFeelExpression(value)) {

      // plain (non-FEEL) value, e.g. missing the leading `=` -- captured as
      // inert text instead of resolved
      return containsSecretReferenceLiteral(value)
        ? [ getStringLiteralReport(propertyName, node, parentNode) ]
        : [];
    }

    return findSecretReferenceViolations(value.substring(1)).stringLiteral
      ? [ getStringLiteralReport(propertyName, node, parentNode) ]
      : [];
  }

  // not `isFeelProperty` from `./utils/feel`: it always ignores
  // `zeebe:Property`'s `value`, which this rule must also check
  function isFeelExpression(value) {
    return isString(value) && value.startsWith('=');
  }

  return {
    meta: {
      documentation: {
        url: 'https://docs.camunda.io/docs/next/components/concepts/variables/#secret-references-in-input-mappings'
      }
    },
    check
  };
});

function getStringLiteralReport(propertyName, node, parentNode) {
  const path = getPath(node, parentNode);

  return {
    message: `Property <${ propertyName }> must use a secret reference as an expression (e.g. =camunda.secrets.NAME), not as a string literal`,
    path: pathConcat(path || [], propertyName),
    data: {
      type: ERROR_TYPES.SECRET_REFERENCE_STRING_LITERAL_NOT_ALLOWED,
      node,
      parentNode: parentNode,
      property: propertyName
    }
  };
}

function getInsideListReport(propertyName, node, parentNode) {
  const path = getPath(node, parentNode);

  return {
    message: `Property <${ propertyName }> must not assign a secret reference inside a list`,
    path: pathConcat(path || [], propertyName),
    data: {
      type: ERROR_TYPES.SECRET_REFERENCE_INSIDE_LIST_NOT_ALLOWED,
      node,
      parentNode: parentNode,
      property: propertyName
    }
  };
}

function getInsideIfBranchContextReport(propertyName, node, parentNode) {
  const path = getPath(node, parentNode);

  return {
    message: `Property <${ propertyName }> must not assign a secret reference inside a context returned by an if expression branch`,
    path: pathConcat(path || [], propertyName),
    data: {
      type: ERROR_TYPES.SECRET_REFERENCE_INSIDE_IF_BRANCH_CONTEXT_NOT_ALLOWED,
      node,
      parentNode: parentNode,
      property: propertyName
    }
  };
}
