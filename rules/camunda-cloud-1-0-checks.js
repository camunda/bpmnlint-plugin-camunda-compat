const {
  hasEventDefinitionOfType,
  hasEventDefinitionOfTypeOrNone,
  hasLoopCharacteristicsOfTypeOrNone,
  hasNoLanes,
  isNotBpmn
} = require('./utils/element');

const {
  hasZeebeCalledElement,
  hasZeebeTaskDefinition,
  hasSubscriptionIfInSubProcess,
  hasSubscriptionIfMessageCatchInSubProcess
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
    type: 'bpmn:CallActivity',
    check: hasZeebeCalledElement
  },
  {
    type: 'bpmn:BoundaryEvent',
    check: hasEventDefinitionOfType([
      'bpmn:ErrorEventDefinition',
      'bpmn:MessageEventDefinition',
      'bpmn:TimerEventDefinition'
    ])
  },
  {
    type: 'bpmn:EndEvent',
    check: hasEventDefinitionOfTypeOrNone([
      'bpmn:ErrorEventDefinition'
    ])
  },
  {
    type: 'bpmn:IntermediateCatchEvent',
    check: checkEvery(
      hasEventDefinitionOfType([
        'bpmn:TimerEventDefinition',
        'bpmn:MessageEventDefinition'
      ]),
      hasSubscriptionIfMessageCatchInSubProcess
    )
  },
  {
    type: 'bpmn:Process',
    check: hasNoLanes
  },
  {
    type: 'bpmn:ReceiveTask',
    check: checkEvery(
      hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics'),
      hasSubscriptionIfInSubProcess()
    )
  },
  {
    type: 'bpmn:ServiceTask',
    check: checkEvery(
      hasZeebeTaskDefinition,
      hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')
    )
  },
  {
    type: 'bpmn:StartEvent',
    check: hasEventDefinitionOfTypeOrNone([
      'bpmn:ErrorEventDefinition',
      'bpmn:MessageEventDefinition',
      'bpmn:TimerEventDefinition'
    ])
  },
  {
    type: 'bpmn:SubProcess',
    check: hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')
  },
  {
    type: 'bpmn:UserTask',
    check: hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')
  }
];
