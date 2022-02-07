const camundaCloud11Checks = require('./camunda-cloud-1-1-checks');

const { hasEventDefinitionOfType } = require('./utils/element');

module.exports = [
  ...camundaCloud11Checks,
  {
    type: 'bpmn:EndEvent',
    check: hasEventDefinitionOfType([
      'bpmn:MessageEventDefinition'
    ])
  },
  {
    type: 'bpmn:IntermediateThrowEvent',
    check: hasEventDefinitionOfType([
      'bpmn:MessageEventDefinition'
    ])
  }
];