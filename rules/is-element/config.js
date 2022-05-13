module.exports = {
  camundaCloud10: {
    elements: [
      'bpmn:Association',
      'bpmn:BoundaryEvent',
      'bpmn:CallActivity',
      'bpmn:Collaboration',
      'bpmn:Definitions',
      'bpmn:EndEvent',
      'bpmn:EventBasedGateway',
      'bpmn:ExclusiveGateway',
      'bpmn:Group',
      'bpmn:IntermediateCatchEvent',
      'bpmn:MessageFlow',
      'bpmn:ParallelGateway',
      'bpmn:Participant',
      'bpmn:Process',
      'bpmn:ReceiveTask',
      'bpmn:SequenceFlow',
      'bpmn:ServiceTask',
      'bpmn:StartEvent',
      'bpmn:SubProcess',
      'bpmn:TextAnnotation',
      'bpmn:UserTask'
    ],
    elementsNoEventDefinitionRequired: [
      'bpmn:EndEvent',
      'bpmn:StartEvent'
    ],
    eventDefinitions: {
      'bpmn:BoundaryEvent': [
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ],
      'bpmn:EndEvent': [
        'bpmn:ErrorEventDefinition'
      ],
      'bpmn:IntermediateCatchEvent': [
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ],
      'bpmn:StartEvent': [
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ]
    }
  },
  camundaCloud11: {
    elements: [

      // 1.0
      'bpmn:Association',
      'bpmn:BoundaryEvent',
      'bpmn:CallActivity',
      'bpmn:Collaboration',
      'bpmn:Definitions',
      'bpmn:EndEvent',
      'bpmn:EventBasedGateway',
      'bpmn:ExclusiveGateway',
      'bpmn:Group',
      'bpmn:IntermediateCatchEvent',
      'bpmn:MessageFlow',
      'bpmn:ParallelGateway',
      'bpmn:Participant',
      'bpmn:Process',
      'bpmn:ReceiveTask',
      'bpmn:SequenceFlow',
      'bpmn:ServiceTask',
      'bpmn:StartEvent',
      'bpmn:SubProcess',
      'bpmn:TextAnnotation',
      'bpmn:UserTask',

      // 1.1
      'bpmn:BusinessRuleTask',
      'bpmn:IntermediateThrowEvent',
      'bpmn:ManualTask',
      'bpmn:ScriptTask',
      'bpmn:SendTask'
    ],
    elementsNoEventDefinitionRequired: [

      // 1.0
      'bpmn:EndEvent',
      'bpmn:StartEvent',

      // 1.1
      'bpmn:IntermediateThrowEvent'
    ],
    eventDefinitions: {
      'bpmn:BoundaryEvent': [
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ],
      'bpmn:EndEvent': [
        'bpmn:ErrorEventDefinition'
      ],
      'bpmn:IntermediateCatchEvent': [
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ],
      'bpmn:StartEvent': [
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ]
    }
  },
  camundaCloud12: {
    elements: [

      // 1.0
      'bpmn:Association',
      'bpmn:BoundaryEvent',
      'bpmn:CallActivity',
      'bpmn:Collaboration',
      'bpmn:Definitions',
      'bpmn:EndEvent',
      'bpmn:EventBasedGateway',
      'bpmn:ExclusiveGateway',
      'bpmn:Group',
      'bpmn:IntermediateCatchEvent',
      'bpmn:MessageFlow',
      'bpmn:ParallelGateway',
      'bpmn:Participant',
      'bpmn:Process',
      'bpmn:ReceiveTask',
      'bpmn:SequenceFlow',
      'bpmn:ServiceTask',
      'bpmn:StartEvent',
      'bpmn:SubProcess',
      'bpmn:TextAnnotation',
      'bpmn:UserTask',

      // 1.1
      'bpmn:BusinessRuleTask',
      'bpmn:IntermediateThrowEvent',
      'bpmn:ManualTask',
      'bpmn:ScriptTask',
      'bpmn:SendTask'
    ],
    elementsNoEventDefinitionRequired: [

      // 1.0
      'bpmn:EndEvent',
      'bpmn:StartEvent',

      // 1.1
      'bpmn:IntermediateThrowEvent'
    ],
    eventDefinitions: {

      // 1.1
      'bpmn:BoundaryEvent': [
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ],
      'bpmn:EndEvent': [

        // 1.0
        'bpmn:ErrorEventDefinition',

        // 1.1
        'bpmn:MessageEventDefinition'
      ],
      'bpmn:IntermediateCatchEvent': [
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ],
      'bpmn:StartEvent': [
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ],

      // 1.2
      'bpmn:IntermediateThrowEvent': [
        'bpmn:MessageEventDefinition'
      ]
    }
  }
};