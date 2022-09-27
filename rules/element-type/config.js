const camundaCloud10Elements = [
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
];

const camundaCloud11Elements = [
  ...camundaCloud10Elements,
  'bpmn:BusinessRuleTask',
  'bpmn:IntermediateThrowEvent',
  'bpmn:ManualTask',
  'bpmn:ScriptTask',
  'bpmn:SendTask'
];

const camundaCloud12Elements = [
  ...camundaCloud11Elements
];

const camundaCloud81Elements = [
  ...camundaCloud12Elements,
  'bpmn:InclusiveGateway'
];

const camundaCloud10ElementsNoEventDefinitionRequired = [
  'bpmn:EndEvent',
  'bpmn:StartEvent'
];

const camundaCloud11ElementsNoEventDefinitionRequired = [
  ...camundaCloud10ElementsNoEventDefinitionRequired,
  'bpmn:IntermediateThrowEvent'
];

const camundaCloud12ElementsNoEventDefinitionRequired = [
  ...camundaCloud11ElementsNoEventDefinitionRequired
];

const camundaCloud81ElementsNoEventDefinitionRequired = [
  ...camundaCloud12ElementsNoEventDefinitionRequired
];

const camundaCloud10EventDefinitions = {
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
};

const camundaCloud11EventDefinitions = {
  ...camundaCloud10EventDefinitions
};

const camundaCloud12EventDefinitions = {
  ...camundaCloud11EventDefinitions,
  'bpmn:EndEvent': [
    ...camundaCloud11EventDefinitions['bpmn:EndEvent'],
    'bpmn:MessageEventDefinition'
  ],
  'bpmn:IntermediateThrowEvent': [
    'bpmn:MessageEventDefinition'
  ]
};

const camundaCloud81EventDefinitions = {
  ...camundaCloud12EventDefinitions,
  'bpmn:EndEvent': [
    ...camundaCloud12EventDefinitions['bpmn:EndEvent'],
    'bpmn:TerminateEventDefinition'
  ]
};

module.exports = {
  camundaCloud10: {
    elements: camundaCloud10Elements,
    elementsNoEventDefinitionRequired: camundaCloud10ElementsNoEventDefinitionRequired,
    eventDefinitions: camundaCloud10EventDefinitions
  },
  camundaCloud11: {
    elements: camundaCloud11Elements,
    elementsNoEventDefinitionRequired: camundaCloud11ElementsNoEventDefinitionRequired,
    eventDefinitions: camundaCloud11EventDefinitions
  },
  camundaCloud12: {
    elements: camundaCloud12Elements,
    elementsNoEventDefinitionRequired: camundaCloud12ElementsNoEventDefinitionRequired,
    eventDefinitions: camundaCloud12EventDefinitions
  },
  camundaCloud81: {
    elements: camundaCloud81Elements,
    elementsNoEventDefinitionRequired: camundaCloud81ElementsNoEventDefinitionRequired,
    eventDefinitions: camundaCloud81EventDefinitions
  }
};