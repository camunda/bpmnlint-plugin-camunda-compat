const {
  findExtensionElement
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { greaterOrEqual } = require('../utils/version');
const { getPath } = require('@bpmn-io/moddle-utils');
const { ERROR_TYPES } = require('../utils/error-types');

// Define constants for inbound and outbound connector types
const CONNECTOR_TYPES = {
  INBOUND: {
    extensionElement: 'zeebe:Properties',
    subExtensionElement: 'properties',
    key: 'name',
  },
  OUTBOUND: {
    extensionElement: 'zeebe:IoMapping',
    subExtensionElement: 'inputParameters',
    key: 'target',
  },
};

// Array of objects specifying property version compatibility rules
const propertyVersionCompatibility = [
  {
    minimalVersion: '8.6',
    type: CONNECTOR_TYPES.INBOUND,
    propertyNames: [ 'messageTtl', 'consumeUnmatchedEvents' ],
    definitionTypes: [
      'io.camunda:webhook:1',
      'io.camunda:connector-rabbitmq-inbound:1',
      'io.camunda:http-polling:1',
      'io.camunda:connector-kafka-inbound:1',
      'io.camunda:slack-webhook:1',
      'io.camunda:aws-sqs-inbound:1',
      'io.camunda:aws-sns-webhook:1'
    ]
  },
  {
    minimalVersion: '8.6',
    type: CONNECTOR_TYPES.INBOUND,
    propertyNames: [ 'deduplicationModeManualFlag' ],
    definitionTypes: [
      'io.camunda:connector-rabbitmq-inbound:1',
      'io.camunda:http-polling:1',
      'io.camunda:connector-kafka-inbound:1',
      'io.camunda:aws-sqs-inbound:1'
    ]
  }

  // example for outbound connector (uncommit for testing with integretion test):
  // {
  //   minimalVersion: '8.7',
  //   type: CONNECTOR_TYPES.OUTBOUND,
  //   propertyNames: [ 'routing.exchange' ],
  //   definitionTypes: [
  //     'io.camunda:aws-sagemaker:1',
  //     'io.camunda:aws-sns:1',
  //     'io.camunda:connector-rabbitmq:1'
  //   ]
  // }
];

module.exports = skipInNonExecutableProcess(function({ version }) {
  function check(node, reporter) {
    const errors = propertyVersionCompatibility.reduce((acc, currentCase) => {
      if (greaterOrEqual(version, currentCase.minimalVersion)) {
        return acc; // Skip checking if the version is not less than the minimal version required
      }
      if (currentCase.type === CONNECTOR_TYPES.OUTBOUND) {
        const taskDefinitionExtension = findExtensionElement(node, 'zeebe:TaskDefinition');
        if (!taskDefinitionExtension) {
          return acc; // Skip if no task definition found for outbound connector templates
        }
        if (currentCase.definitionTypes.includes(taskDefinitionExtension.type)) {
          const extension = findExtensionElement(node, currentCase.type.extensionElement);
          if (!extension) {
            return acc; // Skip if no extension found
          }
          let properties = extension.get(currentCase.type.subExtensionElement);
          if (!properties) {
            return acc; // Skip if properties are not found
          }
          checkProperties(properties, currentCase, extension, node, acc);
        }
      } else if (currentCase.type === CONNECTOR_TYPES.INBOUND) {
        const extension = findExtensionElement(node, currentCase.type.extensionElement);
        if (!extension) {
          return acc; // Skip if no extension found for inbound connector templates
        }
        let properties = extension.get(CONNECTOR_TYPES.INBOUND.subExtensionElement);
        if (!properties) {
          return acc; // Skip if properties are not found
        }
        const inboundTypeProperty = properties.find(prop => prop && prop.get(currentCase.type.key) === 'inbound.type');
        if (inboundTypeProperty && currentCase.definitionTypes.includes(inboundTypeProperty.value)) {
          checkProperties(properties, currentCase, extension, node, acc);
        }
      }

      return acc;
    }, []);

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});

function checkProperties(properties, currentCase, connectorExtension, node, acc) {
  properties = Array.isArray(properties) ? properties : [ properties ];
  currentCase.propertyNames.forEach(propertyName => {
    const property = properties.find(prop => prop && prop.get(currentCase.type.key) === propertyName);
    if (property) {
      acc.push(getReport(propertyName, connectorExtension, node, currentCase.minimalVersion));
    }
  });
}


function getReport(propertyName, node, parentNode, version) {
  const path = getPath(node, parentNode);

  return {
    message: `The property '${propertyName}' is only supported in Camunda Platform ${version} or newer.`,
    path: path ? [ ...getPath(node, parentNode), propertyName ] : [ propertyName ],
    data: {
      type: ERROR_TYPES.VERSION_INCOMPATIBILITY,
      node,
      parentNode: parentNode,
      property: propertyName
    }
  };
}
