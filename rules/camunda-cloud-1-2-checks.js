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
  withTranslations
} = require('./utils/element');

const { hasZeebeTaskDefinition } = require('./utils/cloud/element');

module.exports = [
  ...replaceChecks(
    camundaCloud11Checks,
    [
      {
        type: 'bpmn:IntermediateThrowEvent',
        check: withTranslations(
          checkEvery(
            hasEventDefinitionOfTypeOrNone('bpmn:MessageEventDefinition'),
            checkIf(
              hasZeebeTaskDefinition,
              hasEventDefinitionOfType('bpmn:MessageEventDefinition')
            )
          ),
          {
            'Element of type <bpmn:IntermediateThrowEvent> must have extension element of type <zeebe:TaskDefinition>': 'An <Intermediate Throw Event> must have a <Task definition type>',
            'Element of type <zeebe:TaskDefinition> must have property <type>': 'An <Intermediate Throw Event> must have a <Task definition type>'
          }
        )
      },
      {
        type: 'bpmn:EndEvent',
        check: withTranslations(
          checkEvery(
            hasEventDefinitionOfTypeOrNone([
              'bpmn:ErrorEventDefinition',
              'bpmn:MessageEventDefinition'
            ]),
            checkIf(
              checkEventDefinition(hasErrorReference),
              hasEventDefinitionOfType('bpmn:ErrorEventDefinition')
            )
          ),
          {
            'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>': 'An <Error End Event> must have a defined <Error Reference>',
            'Element of type <bpmn:Error> must have property <errorCode>': 'An <Error End Event> with <Error Reference> must have a defined <Error code>'
          }
        )
      }
    ]
  )
];