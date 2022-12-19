const {
  is,
  isAny
} = require('bpmnlint-utils');

const { getPath } = require('@bpmn-io/moddle-utils');

const {
  ERROR_TYPES,
  getEventDefinition
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

const handlersMap = {
  '1.0': [
    checkErrorCode
  ],
  '1.1': [
    checkErrorCode
  ],
  '1.2': [
    checkErrorCode
  ],
  '1.3': [
    checkErrorCode
  ],
  '8.0': [
    checkErrorCode
  ],
  '8.1': [
    checkErrorCode
  ],
  '8.2': []
};

module.exports = noExpressionRule;

/**
 * Make sure that certain properties do not contain expressions in older versions.
 * @param {{ version: string }} config
 */
function noExpressionRule({ version }) {
  function check(node, reporter) {
    const errors = checkForVersion(node, version);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
}

function checkForVersion(node, version) {
  const handlers = handlersMap[version];

  return handlers.reduce((errors, handler) => {
    const handlerErrors = handler(node, version) || [];
    return errors.concat(handlerErrors);
  }, []);
}

function noExpression(node, propertyName, parentNode, allowedVersion) {
  const propertyValue = node.get(propertyName);
  const path = getPath(node, parentNode);

  if (!isExpression(propertyValue)) {
    return;
  }

  return {
    message: `Expression statement <${truncate(propertyValue)}> only supported by Camunda Platform 8.2 or newer`,
    path: path
      ? [ ...path, propertyName ]
      : [ propertyName ],
    data: {
      type: ERROR_TYPES.EXPRESSION_NOT_ALLOWED,
      node,
      parentNode: parentNode == node ? null : parentNode,
      property: propertyName,
      allowedVersion
    }
  };
}

function isExpression(value) {
  return value && value.startsWith('=');
}

function checkErrorCode(node) {
  if (!isAny(node, [ 'bpmn:CatchEvent', 'bpmn:ThrowEvent' ])) {
    return;
  }

  const eventDefinition = getEventDefinition(node);

  if (!eventDefinition || !is(eventDefinition, 'bpmn:ErrorEventDefinition')) {
    return;
  }

  const errorRef = eventDefinition.get('errorRef');

  if (!errorRef) {
    return;
  }

  return errorRef && noExpression(errorRef, 'errorCode', node, '8.2');
}

function truncate(string, maxLength = 10) {
  const stringified = `${ string }`;

  return stringified.length > maxLength ? `${ stringified.slice(0, maxLength) }...` : stringified;
}
