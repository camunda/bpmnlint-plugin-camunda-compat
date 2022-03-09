const camundaCloud11Checks = require('./camunda-cloud-1-1-checks');

const { replaceCheck, checkEvery } = require('./utils/rule');

const { hasEventDefinitionOfTypeOrNone } = require('./utils/element');
const { hasZeebeTaskDefinitionIfChild } = require('./utils/cloud/element');

module.exports = [
  ...replaceCheck(
    camundaCloud11Checks,
    'bpmn:IntermediateThrowEvent',
    checkEvery(
      hasEventDefinitionOfTypeOrNone([
        'bpmn:MessageEventDefinition'
      ]),
      hasZeebeTaskDefinitionIfChild('bpmn:MessageEventDefinition')
    )
  ),
  {
    type: 'bpmn:EndEvent',
    check: hasEventDefinitionOfTypeOrNone([
      'bpmn:MessageEventDefinition'
    ])
  }
];