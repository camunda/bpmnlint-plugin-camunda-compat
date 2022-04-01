const camundaCloud12Checks = require('./camunda-cloud-1-2-checks');

const {
  checkEvery,
  replaceCheck
} = require('./utils/rule');

const { withTranslations } = require('./utils/element');

const {
  hasZeebeCalledDecisionOrTaskDefinition,
  hasZeebeLoopCharacteristics
} = require('./utils/cloud/element');

module.exports = [
  ...replaceCheck(
    camundaCloud12Checks,
    'bpmn:BusinessRuleTask',
    withTranslations(
      checkEvery(
        hasZeebeCalledDecisionOrTaskDefinition,
        hasZeebeLoopCharacteristics
      ),
      {
        'Element of type <bpmn:BusinessRuleTask> must have have at least one <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element': 'A Business Rule Task must have a defined Implementation',
        'Element of type <bpmn:BusinessRuleTask> must have have either one <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element': 'A Business Rule Task must have a defined Implementation',
        'Element of type <zeebe:CalledDecision> must have property <decisionId>': 'A Business Rule Task with Implementation: DMN decision must have a defined Called decision ID',
        'Element of type <zeebe:CalledDecision> must have property <resultVariable>': 'A Business Rule Task with Implementation: DMN decision must have a defined Result variable'
      }
    )
  )
];