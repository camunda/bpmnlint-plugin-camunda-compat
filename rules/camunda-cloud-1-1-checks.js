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
        'Element of type <zeebe:TaskDefinition> must have property <type>': 'A <Business Rule Task> must have a <Task definition type>',
        'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have extension element of type <zeebe:LoopCharacteristics>': 'A <Business Rule Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>': 'A <Business Rule Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>': 'A <Business Rule Task> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>': 'A <Business Rule Task> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>'
      }
    )
  },
  {
    type: 'bpmn:IntermediateThrowEvent',
    check: hasNoEventDefinition
  },
  {
    type: 'bpmn:ManualTask',
    check: withTranslations(
      hasZeebeLoopCharacteristics,
      {
        'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have extension element of type <zeebe:LoopCharacteristics>': 'A <Manual Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>': 'A <Manual Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>': 'A <Manual Task> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>': 'A <Manual Task> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>'
      }
    )
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
        'Element of type <zeebe:TaskDefinition> must have property <type>': 'A <Script Task> must have a <Task definition type>',
        'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have extension element of type <zeebe:LoopCharacteristics>': 'A <Script Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>': 'A <Script Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>': 'A <Script Task> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>': 'A <Script Task> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>'
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
        'Element of type <zeebe:TaskDefinition> must have property <type>': 'A <Send Task> must have a <Task definition type>',
        'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have extension element of type <zeebe:LoopCharacteristics>': 'A <Send Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>': 'A <Send Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>': 'A <Send Task> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>': 'A <Send Task> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>'
      }
    )
  }
];