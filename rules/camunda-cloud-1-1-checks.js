const camundaCloud10Checks = require('./camunda-cloud-1-0-checks');

const {
  checkSome,
  hasLoopCharacteristicsOfType,
  hasNoEventDefinition,
  hasNoLoopCharacteristics
} = require('./utils/rule');

module.exports = [
  ...camundaCloud10Checks,
  {
    type: 'bpmn:BusinessRuleTask',
    check: checkSome(
      hasNoLoopCharacteristics,
      hasLoopCharacteristicsOfType('bpmn:MultiInstanceLoopCharacteristics')
    )
  },
  {
    type: 'bpmn:IntermediateThrowEvent',
    check: hasNoEventDefinition
  },
  {
    type: 'bpmn:ManualTask',
    check: checkSome(
      hasNoLoopCharacteristics,
      hasLoopCharacteristicsOfType('bpmn:MultiInstanceLoopCharacteristics')
    )
  },
  {
    type: 'bpmn:ScriptTask',
    check: checkSome(
      hasNoLoopCharacteristics,
      hasLoopCharacteristicsOfType('bpmn:MultiInstanceLoopCharacteristics')
    )
  },
  {
    type: 'bpmn:SendTask',
    check: checkSome(
      hasNoLoopCharacteristics,
      hasLoopCharacteristicsOfType('bpmn:MultiInstanceLoopCharacteristics')
    )
  }
];