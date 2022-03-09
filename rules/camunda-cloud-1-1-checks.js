const camundaCloud10Checks = require('./camunda-cloud-1-0-checks');

const { checkSome, checkEvery } = require('./utils/rule');

const {
  hasLoopCharacteristicsOfTypeOrNone,
  hasNoEventDefinition
} = require('./utils/element');

const { hasZeebeTaskDefinition } = require('./utils/cloud/element');

module.exports = [
  ...camundaCloud10Checks,
  {
    type: 'bpmn:BusinessRuleTask',
    check: checkEvery(
      hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics'),
      hasZeebeTaskDefinition
    )
  },
  {
    type: 'bpmn:IntermediateThrowEvent',
    check: hasNoEventDefinition
  },
  {
    type: 'bpmn:ManualTask',
    check: hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')
  },
  {
    type: 'bpmn:ScriptTask',
    check: checkEvery(
      hasZeebeTaskDefinition,
      hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')
    )
  },
  {
    type: 'bpmn:SendTask',
    check: hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')
  }
];