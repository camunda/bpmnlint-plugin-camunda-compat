const camundaCloud10Checks = require('./camunda-cloud-1-0-checks');

const { checkEvery } = require('./utils/rule');

const {
  hasNoEventDefinition,
  withTranslations
} = require('./utils/element');

const {
  hasZeebeTaskDefinition,
  hasZeebeLoopCharacteristics
} = require('./utils/cloud/element');

module.exports = [
  ...camundaCloud10Checks,
  {
    type: 'bpmn:BusinessRuleTask',
    check: withTranslations(
      checkEvery(
        hasZeebeLoopCharacteristics,
        hasZeebeTaskDefinition
      ),
      {
        'Element of type <bpmn:BusinessRuleTask> must have extension element of type <zeebe:TaskDefinition>': 'A <Business Rule Task> must have a <Task definition type>',
        'Element of type <zeebe:TaskDefinition> must have property <type>': 'A <Business Rule Task> must have a <Task definition type>'
      }
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
    check: withTranslations(
      checkEvery(
        hasZeebeLoopCharacteristics,
        hasZeebeTaskDefinition
      ),
      {
        'Element of type <bpmn:ScriptTask> must have extension element of type <zeebe:TaskDefinition>': 'A <Script Task> must have a <Task definition type>',
        'Element of type <zeebe:TaskDefinition> must have property <type>': 'A <Script Task> must have a <Task definition type>'
      }
    )
  },
  {
    type: 'bpmn:SendTask',
    check: withTranslations(
      checkEvery(
        hasZeebeLoopCharacteristics,
        hasZeebeTaskDefinition
      ),
      {
        'Element of type <bpmn:SendTask> must have extension element of type <zeebe:TaskDefinition>': 'A <Send Task> must have a <Task definition type>',
        'Element of type <zeebe:TaskDefinition> must have property <type>': 'A <Send Task> must have a <Task definition type>'
      }
    )
  }
];