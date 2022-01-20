const {
  checkSome,
  hasEventDefinitionOfType,
  hasLoopCharacteristicsOfType,
  hasNoEventDefinition,
  hasNoLanes,
  hasNoLoopCharacteristics,
  isNotBpmn
} = require('./utils/rule');

module.exports = [
  {
    check: isNotBpmn
  },
  'bpmn:Association',
  'bpmn:CallActivity',
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
    check: hasEventDefinitionOfType([
      'bpmn:ErrorEventDefinition',
      'bpmn:MessageEventDefinition',
      'bpmn:TimerEventDefinition'
    ])
  },
  {
    type: 'bpmn:EndEvent',
    check: checkSome(
      hasNoEventDefinition,
      hasEventDefinitionOfType([
        'bpmn:ErrorEventDefinition'
      ])
    )
  },
  {
    type: 'bpmn:IntermediateCatchEvent',
    check: hasEventDefinitionOfType([
      'bpmn:MessageEventDefinition',
      'bpmn:TimerEventDefinition'
    ])
  },
  {
    type: 'bpmn:Process',
    check: hasNoLanes
  },
  {
    type: 'bpmn:ReceiveTask',
    check: checkSome(
      hasNoLoopCharacteristics,
      hasLoopCharacteristicsOfType('bpmn:MultiInstanceLoopCharacteristics')
    )
  },
  {
    type: 'bpmn:ServiceTask',
    check: checkSome(
      hasNoLoopCharacteristics,
      hasLoopCharacteristicsOfType('bpmn:MultiInstanceLoopCharacteristics')
    )
  },
  {
    type: 'bpmn:StartEvent',
    check: checkSome(
      hasNoEventDefinition,
      hasEventDefinitionOfType([
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ])
    )
  },
  {
    type: 'bpmn:SubProcess',
    check: checkSome(
      hasNoLoopCharacteristics,
      hasLoopCharacteristicsOfType('bpmn:MultiInstanceLoopCharacteristics')
    )
  },
  {
    type: 'bpmn:UserTask',
    check: checkSome(
      hasNoLoopCharacteristics,
      hasLoopCharacteristicsOfType('bpmn:MultiInstanceLoopCharacteristics')
    )
  }
];
