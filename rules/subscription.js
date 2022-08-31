const {
  is,
  isAny
} = require('bpmnlint-utils');

const {
  findExtensionElement,
  getEventDefinition,
  hasExtensionElement,
  hasProperties
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

module.exports = function() {
  function check(node, reporter) {
    if (!isAny(node, [ 'bpmn:CatchEvent', 'bpmn:ThrowEvent', 'bpmn:ReceiveTask' ])
      || (is(node, 'bpmn:StartEvent') && !is(node.$parent, 'bpmn:SubProcess'))) {
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

    let errors = hasExtensionElement(messageRef, 'zeebe:Subscription', node);

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