const { isString } = require('min-dash');

const { isAny } = require('bpmnlint-utils');

const config = require('./config');

const { greaterOrEqual } = require('../utils/version');

const { getEventDefinition } = require('../utils/element');

const { ERROR_TYPES } = require('../utils/error-types');

const { reportErrors } = require('../utils/reporter');

module.exports = function({ version }) {
  function check(node, reporter) {
    if (!isAny(node, [ 'bpmn:FlowElement', 'bpmn:FlowElementsContainer' ])) {
      return;
    }

    const element = config[ node.$type ];

    if (!element || (isString(element) && !greaterOrEqual(version, element))) {

      // (1) Element not allowed
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

    if (!isAny(node, [ 'bpmn:CatchEvent', 'bpmn:ThrowEvent' ])) {
      return;
    }

    const eventDefinition = getEventDefinition(node);

    if (eventDefinition) {
      if (!element[ eventDefinition.$type ] || !greaterOrEqual(version, element[ eventDefinition.$type ])) {

        // (2) Element with event definition not allowed
        const error = {
          message: `Element of type <${ node.$type }> with event definition of type <${ eventDefinition.$type }> not allowed`,
          path: null,
          error: {
            type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
            node,
            parentNode: null,
            eventDefinition
          }
        };

        reportErrors(node, reporter, error);
      }
    } else {
      if (!element[ '_' ] || !greaterOrEqual(version, element[ '_' ])) {

        // (3) Element without event definition not allowed
        const error = {
          message: `Element of type <${ node.$type }> with no event definition not allowed`,
          path: null,
          error: {
            type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
            node,
            parentNode: null,
            eventDefinition
          }
        };

        reportErrors(node, reporter, error);
      }
    }
  }

  return {
    check
  };
};