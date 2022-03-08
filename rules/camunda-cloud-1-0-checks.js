const {
  hasEventDefinitionOfType,
  hasEventDefinitionOfTypeOrNone,
  hasLoopCharacteristicsOfTypeOrNone,
  hasNoLanes,
  isNotBpmn
} = require('./utils/element');

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
    check: hasEventDefinitionOfTypeOrNone([
      'bpmn:ErrorEventDefinition'
    ])
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
    check: hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')
  },
  {
    type: 'bpmn:ServiceTask',
    check: hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')
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
