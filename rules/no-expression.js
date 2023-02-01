const {
  is
} = require('bpmnlint-utils');

const { getPath } = require('@bpmn-io/moddle-utils');

const {
  ERROR_TYPES,
  getEventDefinition
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

const skipIfNonExecutableProcess = require('./utils/skipIfNonExecutableProcess');

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
  '8.2': [
    checkErrorCatchEvent,
    checkEscalationCatchEvent
  ]
};

module.exports = skipIfNonExecutableProcess(noExpressionRule);

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
    const handlerErrors = handler(node) || [];
    return errors.concat(handlerErrors);
  }, []);
}

function noExpression(node, propertyName, parentNode, allowedVersion) {
  const propertyValue = node.get(propertyName);
  const path = getPath(node, parentNode);

  if (!isExpression(propertyValue)) {
    return;
  }

  const errorMessage = allowedVersion ?
    `Expression statement <${truncate(propertyValue)}> only supported by Camunda Platform ${allowedVersion} or newer` :
    `Expression statement <${truncate(propertyValue)}> not supported`;

  return {
    message: errorMessage,
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
  if (!is(node, 'bpmn:Event')) {
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

  if (is(node, 'bpmn:CatchEvent')) {
    return noExpression(errorRef, 'errorCode', node, null);
  } else {
    return noExpression(errorRef, 'errorCode', node, '8.2');
  }
}

function checkErrorCatchEvent(node) {
  if (!is(node, 'bpmn:CatchEvent')) {
    return;
  }

  return checkErrorCode(node);
}

function checkEscalationCatchEvent(node) {
  if (!is(node, 'bpmn:CatchEvent')) {
    return;
  }

  const eventDefinition = getEventDefinition(node);

  if (!eventDefinition || !is(eventDefinition, 'bpmn:EscalationEventDefinition')) {
    return;
  }

  const escalationRef = eventDefinition.get('escalationRef');

  if (!escalationRef) {
    return;
  }

  return noExpression(escalationRef, 'escalationCode', node, null);
}

function truncate(string, maxLength = 10) {
  const stringified = `${ string }`;

  return stringified.length > maxLength ? `${ stringified.slice(0, maxLength) }...` : stringified;
}
