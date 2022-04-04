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
    check: withTranslations(
      checkEvery(
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
      ),
      {
        'Element of type <bpmn:BoundaryEvent> not supported by {{ executionPlatform }} {{ executionPlatformVersion }}': 'An <Undefined Boundary Event> is not supported by {{ executionPlatform }} {{ executionPlatformVersion }}',
        'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>': 'An <Error Boundary Event> must have a defined <Error Reference>',
        'Element of type <bpmn:Error> must have property <errorCode>': 'An <Error Boundary Event> with <Error Reference> must have a defined <Error code>',
        'Element of type <bpmn:MessageEventDefinition> must have property <messageRef>': 'A <Message Boundary Event> must have a defined <Message Reference>',
        'Element of type <bpmn:Message> must have property <name>': 'A <Message Boundary Event> with <Message Reference> must have a defined <Name>',
        'Element of type <bpmn:Message> must have extension element of type <zeebe:Subscription>': 'A <Message Boundary Event> with <Message Reference> must have a defined <Subscription correlation key>',
        'Element of type <zeebe:Subscription> must have property <correlationKey>': 'A <Message Boundary Event> with <Message Reference> must have a defined <Subscription correlation key>'
      }
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
        'Element of type <zeebe:CalledElement> must have property <processId>': 'A <Call Activity> must have a defined <Called element>',
        'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have extension element of type <zeebe:LoopCharacteristics>': 'A <Call Activity> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>': 'A <Call Activity> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>': 'A <Call Activity> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>': 'A <Call Activity> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>'
      }
    )
  },
  {
    type: 'bpmn:EndEvent',
    check: withTranslations(
      checkEvery(
        hasEventDefinitionOfTypeOrNone('bpmn:ErrorEventDefinition'),
        checkIf(
          checkEventDefinition(hasErrorReference),
          hasEventDefinitionOfType('bpmn:ErrorEventDefinition')
        )
      ),
      {
        'Element of type <bpmn:EndEvent> (<bpmn:MessageEventDefinition>) not supported by {{ executionPlatform }} {{ executionPlatformVersion }}': 'A <Message End Event> is not supported by {{ executionPlatform }} {{ executionPlatformVersion }}',
        'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>': 'An <Error End Event> must have a defined <Error Reference>',
        'Element of type <bpmn:Error> must have property <errorCode>': 'An <Error End Event> with <Error Reference> must have a defined <Error code>'
      }
    )
  },
  {
    type: 'bpmn:IntermediateCatchEvent',
    check: withTranslations(
      checkEvery(
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
      ),
      {
        'Element of type <bpmn:IntermediateCatchEvent> not supported by {{ executionPlatform }} {{ executionPlatformVersion }}': 'A <Undefined Intermediate Catch Event> is not supported by {{ executionPlatform }} {{ executionPlatformVersion }}',
        'Element of type <bpmn:MessageEventDefinition> must have property <messageRef>': 'A <Message Intermediate Catch Event> must have a defined <Message Reference>',
        'Element of type <bpmn:Message> must have property <name>': 'A <Message Intermediate Catch Event> with <Message Reference> must have a defined <Name>',
        'Element of type <bpmn:Message> must have extension element of type <zeebe:Subscription>': 'A <Message Intermediate Catch Event> with <Message Reference> must have a defined <Subscription correlation key>',
        'Element of type <zeebe:Subscription> must have property <correlationKey>': 'A <Message Intermediate Catch Event> with <Message Reference> must have a defined <Subscription correlation key>'
      }
    )
  },
  {
    type: 'bpmn:Process',
    check: withTranslations(
      hasNoLanes,
      {
        'Element of type <bpmn:Process> (<bpmn:LaneSet>) not supported by {{ executionPlatform }} {{ executionPlatformVersion }}': 'A <Lane> is not supported by Zeebe 1.0'
      }
    )
  },
  {
    type: 'bpmn:ReceiveTask',
    check: withTranslations(
      checkEvery(
        checkFlowNode(hasMessageReference),
        checkIf(
          checkFlowNode(hasZeebeSubscription),
          checkFlowNode(hasMessageReference)
        ),
        hasZeebeLoopCharacteristics
      ),
      {
        'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have extension element of type <zeebe:LoopCharacteristics>': 'A <Receive Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>': 'A <Receive Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>': 'A <Receive Task> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>': 'A <Receive Task> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>',
        'Element of type <bpmn:ReceiveTask> must have property <messageRef>': 'A <Receive Task> must have a defined <Message Reference>',
        'Element of type <bpmn:Message> must have property <name>': 'A <Receive Task> with <Message Reference> must have a defined <Name>',
        'Element of type <bpmn:Message> must have extension element of type <zeebe:Subscription>': 'A <Receive Task> with <Message Reference> must have a defined <Subscription correlation key>',
        'Element of type <zeebe:Subscription> must have property <correlationKey>': 'A <Receive Task> with <Message Reference> must have a defined <Subscription correlation key>'
      }
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
        'Element of type <zeebe:TaskDefinition> must have property <type>': 'A <Service Task> must have a <Task definition type>',
        'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have extension element of type <zeebe:LoopCharacteristics>': 'A <Service Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>': 'A <Service Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>': 'A <Service Task> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>': 'A <Service Task> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>'
      }
    )
  },
  {
    type: 'bpmn:StartEvent',
    check: withTranslations(
      checkEvery(
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
      ),
      {
        'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>': 'An <Error Start Event> must have a defined <Error Reference>',
        'Element of type <bpmn:Error> must have property <errorCode>': 'An <Error Start Event> with <Error Reference> must have a defined <Error code>',
        'Element of type <bpmn:MessageEventDefinition> must have property <messageRef>': 'A <Message Start Event> must have a defined <Message Reference>',
        'Element of type <bpmn:Message> must have property <name>': 'A <Message Start Event> with <Message Reference> must have a defined <Name>',
        'Element of type <bpmn:Message> must have extension element of type <zeebe:Subscription>': 'A <Message Start Event> with <Message Reference> must have a defined <Subscription correlation key>',
        'Element of type <zeebe:Subscription> must have property <correlationKey>': 'A <Message Start Event> with <Message Reference> must have a defined <Subscription correlation key>'
      }
    )
  },
  {
    type: 'bpmn:SubProcess',
    check: withTranslations(
      hasZeebeLoopCharacteristics,
      {
        'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have extension element of type <zeebe:LoopCharacteristics>': 'A <Sub Process> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>': 'A <Sub Process> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>': 'A <Sub Process> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>': 'A <Sub Process> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>'
      }
    )
  },
  {
    type: 'bpmn:UserTask',
    check: withTranslations(
      hasZeebeLoopCharacteristics,
      {
        'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have extension element of type <zeebe:LoopCharacteristics>': 'A <User Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>': 'A <User Task> with <Multi-instance marker> must have a defined <Input collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>': 'A <User Task> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>',
        'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>': 'A <User Task> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>'
      }
    )
  }
];
