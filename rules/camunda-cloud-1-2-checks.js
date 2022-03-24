const camundaCloud11Checks = require('./camunda-cloud-1-1-checks');

const {
  checkEvery,
  replaceChecks
} = require('./utils/rule');

const {
  checkEventDefinition,
  checkIf,
  hasErrorReference,
  hasEventDefinitionOfType,
  hasEventDefinitionOfTypeOrNone,
} = require('./utils/element');

const { hasZeebeTaskDefinition } = require('./utils/cloud/element');

module.exports = [
  ...replaceChecks(
    camundaCloud11Checks,
    [
      {
        type: 'bpmn:IntermediateThrowEvent',
        check: checkEvery(
          hasEventDefinitionOfTypeOrNone('bpmn:MessageEventDefinition'),
          checkIf(
            hasZeebeTaskDefinition,
            hasEventDefinitionOfType('bpmn:MessageEventDefinition')
          )
        )
      },
      {
        type: 'bpmn:EndEvent',
        check: checkEvery(
          hasEventDefinitionOfTypeOrNone([
            'bpmn:ErrorEventDefinition',
            'bpmn:MessageEventDefinition'
          ]),
          checkIf(
            checkEventDefinition(hasErrorReference),
            hasEventDefinitionOfType('bpmn:ErrorEventDefinition')
          )
        )
      }
    ]
  )
];