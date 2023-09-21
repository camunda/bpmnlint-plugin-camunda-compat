module.exports = {
  'bpmn:Association': '1.0',
  'bpmn:BoundaryEvent': {
    'bpmn:ErrorEventDefinition': '1.0',
    'bpmn:EscalationEventDefinition': '8.2',
    'bpmn:MessageEventDefinition': '1.0',
    'bpmn:TimerEventDefinition': '1.0',
    'bpmn:SignalEventDefinition': '8.3',
  },
  'bpmn:BusinessRuleTask': '1.1',
  'bpmn:CallActivity': '1.0',
  'bpmn:Collaboration': '1.0',
  'bpmn:DataObject': '8.0',
  'bpmn:DataObjectReference': '8.0',
  'bpmn:DataStoreReference': '8.0',
  'bpmn:Definitions': '1.0',
  'bpmn:EndEvent': {
    '_': '1.0',
    'bpmn:ErrorEventDefinition': '1.0',
    'bpmn:EscalationEventDefinition': '8.2',
    'bpmn:MessageEventDefinition': '1.2',
    'bpmn:SignalEventDefinition': '8.3',
    'bpmn:TerminateEventDefinition': '8.1'
  },
  'bpmn:EventBasedGateway': '1.0',
  'bpmn:ExclusiveGateway': '1.0',
  'bpmn:Group': '1.0',
  'bpmn:InclusiveGateway': '8.1',
  'bpmn:IntermediateCatchEvent': {
    'bpmn:MessageEventDefinition': '1.0',
    'bpmn:LinkEventDefinition': '8.2',
    'bpmn:TimerEventDefinition': '1.0',
    'bpmn:SignalEventDefinition': '8.3'
  },
  'bpmn:IntermediateThrowEvent': {
    '_': '1.1',
    'bpmn:EscalationEventDefinition': '8.2',
    'bpmn:LinkEventDefinition': '8.2',
    'bpmn:MessageEventDefinition': '1.2',
    'bpmn:SignalEventDefinition': '8.3'
  },
  'bpmn:ManualTask': '1.1',
  'bpmn:MessageFlow': '1.0',
  'bpmn:ParallelGateway': '1.0',
  'bpmn:Participant': '1.0',
  'bpmn:Process': '1.0',
  'bpmn:ReceiveTask': '1.0',
  'bpmn:ScriptTask': '1.1',
  'bpmn:SendTask': '1.1',
  'bpmn:SequenceFlow': '1.0',
  'bpmn:ServiceTask': '1.0',
  'bpmn:StartEvent': {
    '_': '1.0',
    'bpmn:ErrorEventDefinition': '1.0',
    'bpmn:EscalationEventDefinition': '8.2',
    'bpmn:MessageEventDefinition': '1.0',
    'bpmn:SignalEventDefinition': '8.2',
    'bpmn:TimerEventDefinition': '1.0'
  },
  'bpmn:SubProcess': '1.0',
  'bpmn:Task': '8.2',
  'bpmn:TextAnnotation': '1.0',
  'bpmn:UserTask': '1.0'
};