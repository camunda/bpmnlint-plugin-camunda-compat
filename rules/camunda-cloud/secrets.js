const { isString } = require('min-dash');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { findExtensionElement } = require('../utils/element');

module.exports = skipInNonExecutableProcess(checkNodeForErrors);

function checkNodeForErrors() {
  function check(node, reporter) {
    const errors = validateZeebeProperties(node);
    reportIfErrorsExist(node, reporter, errors);
  }

  return {
    check
  };
}

function reportIfErrorsExist(node, reporter, errors) {
  if (errors && errors.length) {
    reportErrors(node, reporter, errors);
  }
}

function validateSubscription(subscription, node) {
  const correlationKey = subscription.get('correlationKey');
  return containInvalidSecret(correlationKey) ?
    [ createErrorForInvalidSecret('correlationKey', subscription, node) ] :
    [];
}

function validateIoMapping(ioMapping, node) {
  return (ioMapping.inputParameters || ioMapping.$children)
    .filter(parameter => containInvalidSecret(parameter.source))
    .map(parameter => createErrorForInvalidSecret(parameter.target, parameter, node));
}

function validateProperties(properties, node) {
  return (properties.properties || properties.$children)
    .filter(parameter => containInvalidSecret(parameter.value))
    .map(parameter => createErrorForInvalidSecret(parameter.name, parameter, node));
}

function validateZeebeProperties(node) {
  const errors = [];
  const extensionElements = {
    'zeebe:subscription': validateSubscription,
    'zeebe:Subscription': validateSubscription,
    'zeebe:ioMapping': validateIoMapping,
    'zeebe:IoMapping': validateIoMapping,
    'zeebe:properties': validateProperties,
    'zeebe:Properties': validateProperties
  };

  for (const [ type, validationFunction ] of Object.entries(extensionElements)) {
    const element = findExtensionElement(node, type);
    if (element) {
      errors.push(...validationFunction(element, node));
    }
  }

  return errors;
}

function createErrorForInvalidSecret(propertyName, node, parentNode) {
  return {
    message: `Element of type <${node.$type}> contains an invalid secret format in property '${propertyName}'. Must be {{secrets.YOUR_SECRET}}`,
    path: null,
    data: {
      type: ERROR_TYPES.INVALID_SECRET_FORMAT,
      node,
      parentNode: parentNode,
      invalidProperty: propertyName
    }
  };
}

function containInvalidSecret(value) {
  return isString(value) && value.includes('secrets.') && !/{{secrets\.[a-zA-Z0-9_]+}}/.test(value);
}
