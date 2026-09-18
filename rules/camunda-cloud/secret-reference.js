const { isString } = require('min-dash');

const { getPath, pathConcat } = require('@bpmn-io/moddle-utils');

const { findExtensionElement } = require('../utils/element');

const { ERROR_TYPES } = require('../utils/error-types');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { isFeelProperty, findSecretReferenceViolations, containsSecretReferenceLiteral } = require('./utils/feel');

// secret references only resolve in input mappings on job-creating elements; see
// https://docs.camunda.io/docs/next/components/concepts/variables/#secret-references-in-input-mappings
module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    const ioMapping = findExtensionElement(node, 'zeebe:IoMapping');

    if (!ioMapping) {
      return;
    }

    const errors = ioMapping.get('inputParameters').reduce((errors, inputParameter) => {
      const source = inputParameter.get('source');

      if (!isString(source) || !source.includes('secrets.')) {
        return errors;
      }

      if (!isFeelProperty(inputParameter, 'source', source)) {

        // written as a plain (non-FEEL) value, e.g. missing the leading `=`
        // -- the engine never evaluates it as an expression, so an otherwise
        // valid reference is captured as literal text instead of resolved
        if (containsSecretReferenceLiteral(source)) {
          errors.push(getStringLiteralReport('source', inputParameter, node));
        }

        return errors;
      }

      const violations = findSecretReferenceViolations(source.substring(1));

      if (violations.stringLiteral) {
        errors.push(getStringLiteralReport('source', inputParameter, node));
      }

      if (violations.insideList) {
        errors.push(getInsideListReport('source', inputParameter, node));
      }

      if (violations.insideIfBranchContext) {
        errors.push(getInsideIfBranchContextReport('source', inputParameter, node));
      }

      return errors;
    }, []);

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
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
