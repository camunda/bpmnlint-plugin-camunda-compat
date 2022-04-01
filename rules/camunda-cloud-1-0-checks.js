const {
  checkEventDefinition,
  checkFlowNode,
  checkIf,
  hasErrorReference,
  hasEventDefinitionOfType,
  hasEventDefinitionOfTypeOrNone,
  hasMessageReference,
  hasNoLanes,
  isNotBpmn,
  withTranslations
} = require('./utils/element');

const {
  hasZeebeCalledElement,
  hasZeebeLoopCharacteristics,
  hasZeebeSubscription,
  hasZeebeTaskDefinition
} = require('./utils/cloud/element');

const { checkEvery } = require('./utils/rule');

module.exports = [
  {
    check: isNotBpmn
  },
  {
    type: 'bpmn:Task',
    check: () => 'An Undefined Task is not supported by {{ executionPlatform }} {{ executionPlatformVersion }}'
  },
  'bpmn:Association',
  'bpmn:Collaboration',
  'bpmn:DataObject',
  'bpmn:DataObjectReference',
  'bpmn:DataStoreReference',
  'bpmn:Definitions',
  'bpmn:EventBasedGateway',
  'bpmn:ExclusiveGateway',
  'bpmn:Group',
  'bpmn:MessageFlow',
  'bpmn:ParallelGateway',
  'bpmn:Participant',
  'bpmn:SequenceFlow',
  'bpmn:TextAnnotation',
  {
    type: 'bpmn:BoundaryEvent',
    check: checkEvery(
      hasEventDefinitionOfType([
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ]),
      checkIf(
        checkEventDefinition(hasErrorReference),
        hasEventDefinitionOfType('bpmn:ErrorEventDefinition')
      ),
      checkIf(
        checkEvery(
          checkEventDefinition(hasMessageReference),
          checkIf(
            checkEventDefinition(hasZeebeSubscription),
            checkEventDefinition(hasMessageReference)
          )
        ),
        hasEventDefinitionOfType('bpmn:MessageEventDefinition')
      )
    )
  },
  {
    type: 'bpmn:CallActivity',
    check: withTranslations(
      checkEvery(
        hasZeebeCalledElement,
        hasZeebeLoopCharacteristics
      ),
      {
        'Element of type <bpmn:CallActivity> must have extension element of type <zeebe:CalledElement>': 'A <Call Activity> must have a defined <Called element>',
        'Element of type <zeebe:CalledElement> must have property <processId>': 'A <Call Activity> must have a defined <Called element>'
      }
    )
  },
  {
    type: 'bpmn:EndEvent',
    check: checkEvery(
      hasEventDefinitionOfTypeOrNone('bpmn:ErrorEventDefinition'),
      checkIf(
        checkEventDefinition(hasErrorReference),
        hasEventDefinitionOfType('bpmn:ErrorEventDefinition')
      )
    )
  },
  {
    type: 'bpmn:IntermediateCatchEvent',
    check: checkEvery(
      hasEventDefinitionOfType([
        'bpmn:TimerEventDefinition',
        'bpmn:MessageEventDefinition'
      ]),
      checkIf(
        checkEvery(
          checkEventDefinition(hasMessageReference),
          checkIf(
            checkEventDefinition(hasZeebeSubscription),
            checkEventDefinition(hasMessageReference)
          )
        ),
        hasEventDefinitionOfType('bpmn:MessageEventDefinition')
      )
    )
  },
  {
    type: 'bpmn:Process',
    check: hasNoLanes
  },
  {
    type: 'bpmn:ReceiveTask',
    check: checkEvery(
      checkFlowNode(hasMessageReference),
      checkIf(
        checkFlowNode(hasZeebeSubscription),
        checkFlowNode(hasMessageReference)
      ),
      hasZeebeLoopCharacteristics
    )
  },
  {
    type: 'bpmn:ServiceTask',
    check: withTranslations(
      checkEvery(
        hasZeebeLoopCharacteristics,
        hasZeebeTaskDefinition
      ),
      {
        'Element of type <bpmn:ServiceTask> must have extension element of type <zeebe:TaskDefinition>': 'A <Service Task> must have a <Task definition type>',
        'Element of type <zeebe:TaskDefinition> must have property <type>': 'A <Service Task> must have a <Task definition type>'
      }
    )
  },
  {
    type: 'bpmn:StartEvent',
    check: checkEvery(
      hasEventDefinitionOfTypeOrNone([
        'bpmn:ErrorEventDefinition',
        'bpmn:MessageEventDefinition',
        'bpmn:TimerEventDefinition'
      ]),
      checkIf(
        checkEventDefinition(hasErrorReference),
        hasEventDefinitionOfType('bpmn:ErrorEventDefinition')
      ),
      checkIf(
        checkEvery(
          checkEventDefinition(hasMessageReference),
          checkIf(
            checkEventDefinition(hasZeebeSubscription),
            checkEventDefinition(hasMessageReference)
          )
        ),
        hasEventDefinitionOfType('bpmn:MessageEventDefinition')
      )
    )
  },
  {
    type: 'bpmn:SubProcess',
    check: hasZeebeLoopCharacteristics
  },
  {
    type: 'bpmn:UserTask',
    check: hasZeebeLoopCharacteristics
  }
];
