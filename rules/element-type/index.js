const { isAny } = require('bpmnlint-utils');

const {
  isAnyExactly,
  getEventDefinition
} = require('../utils/element');

const { ERROR_TYPES } = require('../utils/error-types');

const { reportErrors } = require('../utils/reporter');

module.exports = function(config) {
  const {
    elements,
    elementsNoEventDefinitionRequired,
    eventDefinitions
  } = config;

  function check(node, reporter) {
    if (!isAny(node, [ 'bpmn:FlowElement', 'bpmn:FlowElementsContainer' ])) {
      return;
    }

    if (!isAnyExactly(node, elements)) {
      const error = {
        message: `Element of type <${ node.$type }> not allowed`,
        path: null,
        error: {
          type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
          node,
          parentNode: null
        }
      };

      reportErrors(node, reporter, error);

      return;
    }

    const eventDefinition = getEventDefinition(node);

    if (isAny(node, [ 'bpmn:CatchEvent', 'ThrowEvent' ]) && !eventDefinition && !elementsNoEventDefinitionRequired.includes(node.$type)) {
      const error = {
        message: `Element of type <${ node.$type }> must have property <eventDefinitions>`,
        path: [ 'eventDefinitions' ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node,
          parentNode: null,
          requiredProperty: 'eventDefinitions'
        }
      };

      reportErrors(node, reporter, error);

      return;
    }

    if (!eventDefinition) {
      return;
    }

    if (!eventDefinitions[ node.$type ] || !isAny(eventDefinition, eventDefinitions[ node.$type ])) {
      const error = {
        message: `Property of type <${ eventDefinition.$type }> not allowed`,
        path: [
          'eventDefinitions',
          0
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_TYPE_NOT_ALLOWED,
          node: node,
          parentNode: null,
          property: 'eventDefinitions',
          requiredPropertyType: eventDefinitions[ node.$type ]
        }
      };

      reportErrors(node, reporter, error);
    }
  }

  return {
    check
  };
};