const camundaCloud10ElementsTaskDefinition = [
  'bpmn:ServiceTask'
];

const camundaCloud11ElementsTaskDefinition = [
  ...camundaCloud10ElementsTaskDefinition,
  'bpmn:BusinessRuleTask',
  'bpmn:ScriptTask',
  'bpmn:SendTask'
];

const camundaCloud12ElementsTaskDefinition = [
  ...camundaCloud11ElementsTaskDefinition,
  'bpmn:IntermediateThrowEvent'
];

module.exports = {
  camundaCloud10: {
    elementsTaskDefinition: camundaCloud10ElementsTaskDefinition
  },
  camundaCloud11: {
    elementsTaskDefinition: camundaCloud11ElementsTaskDefinition
  },
  camundaCloud12: {
    elementsTaskDefinition: camundaCloud12ElementsTaskDefinition
  },
  camundaCloud13: {
    elementsCalledDecision: [
      'bpmn:BusinessRuleTask'
    ],
    elementsTaskDefinition: camundaCloud12ElementsTaskDefinition
  }
};