const {
  checkEventDefinition,
  checkFlowNode,
  checkIf,
  hasErrorReference,
  hasEventDefinitionOfType,
  hasEventDefinitionOfTypeOrNone,
  hasNoLanes,
  isNotBpmn,
  withTranslations
} = require('./utils/element');

const {
  hasZeebeCalledElement,
  hasZeebeLoopCharacteristics,
  hasZeebeSubscription,
  hasZeebeTaskDefinition
} = require('./utils/cloud/element');

const { checkEvery } = require('./utils/rule');

module.exports = [
  {
    check: isNotBpmn
  },
  'bpmn:Association',
  'bpmn:Collaboration',
  'bpmn:DataObject',
  'bpmn:DataObjectReference',
  'bpmn:DataStoreReference',
  'bpmn:Definitions',
  'bpmn:EventBasedGateway',
  'bpmn:ExclusiveGateway',
  'bpmn:Group',
  'bpmn:MessageFlow',
  'bpmn:ParallelGateway',
  'bpmn:Participant',
  'bpmn:SequenceFlow',
  'bpmn:TextAnnotation',
  {
    type: 'bpmn:BoundaryEvent',
    check: checkEvery(
      hasEventDefinitionOfType([
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ]),
      checkIf(
        checkEventDefinition(hasErrorReference),
        hasEventDefinitionOfType('bpmn:ErrorEventDefinition')
      ),
      checkIf(
        checkEventDefinition(hasZeebeSubscription),
        hasEventDefinitionOfType('bpmn:MessageEventDefinition')
      )
    )
  },
  {
    type: 'bpmn:CallActivity',
    check: checkEvery(
      hasZeebeCalledElement,
      hasZeebeLoopCharacteristics
    )
  },
  {
    type: 'bpmn:EndEvent',
    check: checkEvery(
      hasEventDefinitionOfTypeOrNone('bpmn:ErrorEventDefinition'),
      checkIf(
        checkEventDefinition(hasErrorReference),
        hasEventDefinitionOfType('bpmn:ErrorEventDefinition')
      )
    )
  },
  {
    type: 'bpmn:IntermediateCatchEvent',
    check: checkEvery(
      hasEventDefinitionOfType([
        'bpmn:TimerEventDefinition',
        'bpmn:MessageEventDefinition'
      ]),
      checkIf(
        checkEventDefinition(hasZeebeSubscription),
        hasEventDefinitionOfType('bpmn:MessageEventDefinition')
      )
    )
  },
  {
    type: 'bpmn:Process',
    check: hasNoLanes
  },
  {
    type: 'bpmn:ReceiveTask',
    check: checkEvery(
      checkFlowNode(hasZeebeSubscription),
      hasZeebeLoopCharacteristics
    )
  },
  {
    type: 'bpmn:ServiceTask',
    check: withTranslations(
      checkEvery(
        hasZeebeLoopCharacteristics,
        hasZeebeTaskDefinition
      ),
      {
        'Element of type <bpmn:ServiceTask> must have <zeebe:TaskDefinition> extension element': 'Must have implementation'
      }
    )
  },
  {
    type: 'bpmn:StartEvent',
    check: checkEvery(
      hasEventDefinitionOfTypeOrNone([
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ]),
      checkIf(
        checkEventDefinition(hasErrorReference),
        hasEventDefinitionOfType('bpmn:ErrorEventDefinition')
      ),
      checkIf(
        checkEventDefinition(hasZeebeSubscription),
        hasEventDefinitionOfType('bpmn:MessageEventDefinition')
      )
    )
  },
  {
    type: 'bpmn:SubProcess',
    check: hasZeebeLoopCharacteristics
  },
  {
    type: 'bpmn:UserTask',
    check: hasZeebeLoopCharacteristics
  }
];
