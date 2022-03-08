const camundaCloud12Checks = require('./camunda-cloud-1-2-checks');

const {
  checkEvery,
  replaceCheck
} = require('./utils/rule');

const { hasLoopCharacteristicsOfTypeOrNone } = require('./utils/element');

const { hasZeebeCalledDecisionOrTaskDefinition } = require('./utils/cloud/element');

module.exports = [
  ...replaceCheck(
    camundaCloud12Checks,
    'bpmn:BusinessRuleTask',
    checkEvery(
      hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics'),
      hasZeebeCalledDecisionOrTaskDefinition
    )
  )
];