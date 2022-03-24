const camundaCloud12Checks = require('./camunda-cloud-1-2-checks');

const {
  checkEvery,
  replaceCheck
} = require('./utils/rule');

const {
  hasZeebeCalledDecisionOrTaskDefinition,
  hasZeebeLoopCharacteristics
} = require('./utils/cloud/element');

module.exports = [
  ...replaceCheck(
    camundaCloud12Checks,
    'bpmn:BusinessRuleTask',
    checkEvery(
      hasZeebeCalledDecisionOrTaskDefinition,
      hasZeebeLoopCharacteristics
    )
  )
];