module.exports = {
  camundaCloud10: {
    elementsTaskDefinition: [
      'bpmn:ServiceTask'
    ]
  },
  camundaCloud11: {
    elementsTaskDefinition: [
      'bpmn:BusinessRuleTask',
      'bpmn:ServiceTask',
      'bpmn:ScriptTask',
      'bpmn:SendTask'
    ]
  },
  camundaCloud12: {
    elementsTaskDefinition: [
      'bpmn:BusinessRuleTask',
      'bpmn:IntermediateThrowEvent',
      'bpmn:ServiceTask',
      'bpmn:ScriptTask',
      'bpmn:SendTask'
    ]
  },
  camundaCloud13: {
    elementsCalledDecision: [
      'bpmn:BusinessRuleTask'
    ],
    elementsTaskDefinition: [
      'bpmn:BusinessRuleTask',
      'bpmn:IntermediateThrowEvent',
      'bpmn:ServiceTask',
      'bpmn:ScriptTask',
      'bpmn:SendTask'
    ]
  }
};