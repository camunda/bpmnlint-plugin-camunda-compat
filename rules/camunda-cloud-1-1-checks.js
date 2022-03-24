const camundaCloud10Checks = require('./camunda-cloud-1-0-checks');

const { checkEvery } = require('./utils/rule');

const { hasNoEventDefinition } = require('./utils/element');

const {
  hasZeebeTaskDefinition,
  hasZeebeLoopCharacteristics
} = require('./utils/cloud/element');

module.exports = [
  ...camundaCloud10Checks,
  {
    type: 'bpmn:BusinessRuleTask',
    check: checkEvery(
      hasZeebeLoopCharacteristics,
      hasZeebeTaskDefinition
    )
  },
  {
    type: 'bpmn:IntermediateThrowEvent',
    check: hasNoEventDefinition
  },
  {
    type: 'bpmn:ManualTask',
    check: hasZeebeLoopCharacteristics
  },
  {
    type: 'bpmn:ScriptTask',
    check: checkEvery(
      hasZeebeLoopCharacteristics,
      hasZeebeTaskDefinition
    )
  },
  {
    type: 'bpmn:SendTask',
    check: checkEvery(
      hasZeebeLoopCharacteristics,
      hasZeebeTaskDefinition
    )
  }
];