const camundaCloud11Checks = require('./camunda-cloud-1-1-checks');

const { replaceCheck } = require('./utils/rule');

const { hasEventDefinitionOfTypeOrNone } = require('./utils/element');

module.exports = [
  ...replaceCheck(
    camundaCloud11Checks,
    'bpmn:IntermediateThrowEvent',
    hasEventDefinitionOfTypeOrNone([
      'bpmn:MessageEventDefinition'
    ])
  ),
  {
    type: 'bpmn:EndEvent',
    check: hasEventDefinitionOfTypeOrNone([
      'bpmn:MessageEventDefinition'
    ])
  }
];