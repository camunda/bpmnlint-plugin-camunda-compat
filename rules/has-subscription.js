const {
  is,
  isAny
} = require('bpmnlint-utils');

const {
  findExtensionElement,
  getEventDefinition,
  hasExtensionElementOfType,
  hasProperties
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

module.exports = function() {
  function check(node, reporter) {
    if (!isAny(node, [ 'bpmn:CatchEvent', 'bpmn:ThrowEvent', 'bpmn:ReceiveTask' ])) {
      return;
    }

    let eventDefinitionOrReceiveTask = node;

    if (!is(node, 'bpmn:ReceiveTask')) {
      const eventDefinition = getEventDefinition(node);

      if (!eventDefinition || !is(eventDefinition, 'bpmn:MessageEventDefinition')) {
        return;
      }

      eventDefinitionOrReceiveTask = eventDefinition;
    }

    const messageRef = eventDefinitionOrReceiveTask.get('messageRef');

    if (!messageRef) {
      return;
    }

    let errors = hasExtensionElementOfType(messageRef, 'zeebe:Subscription', node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }

    const subscription = findExtensionElement(messageRef, 'zeebe:Subscription');

    errors = hasProperties(subscription, {
      correlationKey: {
        required: true
      }
    }, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
};