const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/element-type');

const elementTypeConfig = require('../../rules/element-type/config');

const {
  addConfig,
  createCollaboration,
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'association/text annotation',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
      <bpmn:textAnnotation id="TextAnnotation_1" />
      <bpmn:association id="Association_1" sourceRef="ServiceTask_1" targetRef="TextAnnotation_1" />
    `))
  },
  {
    name: 'boundary event (error)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
        <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'boundary event (message)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'boundary event (timer)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1" />
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'call activity',
    moddleElement: createModdle(createProcess('<bpmn:callActivity id="CallActivity_1" />'))
  },
  {
    name: 'collaboration',
    moddleElement: createModdle(createCollaboration())
  },
  {
    name: 'definitions',
    moddleElement: createModdle(createDefinitions())
  },
  {
    name: 'end event',
    moddleElement: createModdle(createProcess(`
      <bpmn:endEvent id="EndEvent_1" />
    `))
  },
  {
    name: 'end event (error)',
    moddleElement: createModdle(createProcess(`
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
      </bpmn:endEvent>
    `))
  },
  {
    name: 'event-based gateway',
    moddleElement: createModdle(createProcess('<bpmn:eventBasedGateway id="EventBasedGateway_1" />'))
  },
  {
    name: 'exclusive gateway',
    moddleElement: createModdle(createProcess('<bpmn:exlusiveGateway id="ExclusiveGateway_1" />'))
  },
  {
    name: 'group',
    moddleElement: createModdle(createProcess('<bpmn:group id="Group_1" categoryValueRef="CategoryValue_1" />'))
  },
  {
    name: 'intermediate catch event (message)',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
      </bpmn:intermediateCatchEvent>
    `))
  },
  {
    name: 'intermediate catch event (timer)',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1" />
      </bpmn:intermediateCatchEvent>
    `))
  },
  {
    name: 'message flow',
    moddleElement: createModdle(createCollaboration(`
      <bpmn:participant id="Participant_1" />
      <bpmn:participant id="Participant_2" />
      <bpmn:messageFlow id="Flow_1" sourceRef="Participant_1" targetRef="Participant_2" />
    `))
  },
  {
    name: 'parallel gateway',
    moddleElement: createModdle(createProcess('<bpmn:parallelGateway id="ParallelGateway_1" />'))
  },
  {
    name: 'participant',
    moddleElement: createModdle(createCollaboration('<bpmn:participant id="Participant_1" />'))
  },
  {
    name: 'process',
    moddleElement: createModdle(createProcess())
  },
  {
    name: 'receive task',
    moddleElement: createModdle(createProcess('<bpmn:receiveTask id="ReceiveTask_1" />'))
  },
  {
    name: 'service task',
    moddleElement: createModdle(createProcess('<bpmn:serviceTask id="ServiceTask_1" />'))
  },
  {
    name: 'start event',
    moddleElement: createModdle(createProcess('<bpmn:startEvent id="StartEvent_1" />'))
  },
  {
    name: 'start event (error)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
      </bpmn:startEvent>
    `))
  },
  {
    name: 'start event (message)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
      </bpmn:startEvent>
    `))
  },
  {
    name: 'start event (timer)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1" />
      </bpmn:startEvent>
    `))
  },
  {
    name: 'sub process',
    moddleElement: createModdle(createProcess('<bpmn:subProcess id="SubProcess_1" />'))
  },
  {
    name: 'user task',
    moddleElement: createModdle(createProcess('<bpmn:userTask id="UserTask_1" />'))
  }
];

module.exports.valid = valid;

const invalid = [
  {
    name: 'boundary event (no event definition)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1" />
    `)),
    report: {
      id: 'BoundaryEvent_1',
      message: 'Element of type <bpmn:BoundaryEvent> must have property <eventDefinitions>',
      path: [
        'eventDefinitions'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'BoundaryEvent_1',
        parentNode: null,
        requiredProperty: 'eventDefinitions'
      }
    }
  },
  {
    name: 'business rule task',
    moddleElement: createModdle(createProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />')),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <bpmn:BusinessRuleTask> not allowed',
      path: null,
      error: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'BusinessRuleTask_1',
        parentNode: null
      }
    }
  },
  {
    name: 'complex gateway',
    moddleElement: createModdle(createProcess('<bpmn:complexGateway id="ComplexGateway_1" />')),
    report: {
      id: 'ComplexGateway_1',
      message: 'Element of type <bpmn:ComplexGateway> not allowed',
      path: null,
      error: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'ComplexGateway_1',
        parentNode: null
      }
    }
  },
  {
    name: 'intermediate catch event',
    moddleElement: createModdle(createProcess('<bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1" />')),
    report: {
      id: 'IntermediateCatchEvent_1',
      message: 'Element of type <bpmn:IntermediateCatchEvent> must have property <eventDefinitions>',
      path: [
        'eventDefinitions'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'IntermediateCatchEvent_1',
        parentNode: null,
        requiredProperty: 'eventDefinitions'
      }
    }
  },
  {
    name: 'intermediate catch event (error)',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
      </bpmn:intermediateCatchEvent>
    `)),
    report: {
      id: 'IntermediateCatchEvent_1',
      message: 'Property of type <bpmn:ErrorEventDefinition> not allowed',
      path: [
        'eventDefinitions',
        0
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_TYPE_NOT_ALLOWED,
        node: 'IntermediateCatchEvent_1',
        parentNode: null,
        property: 'eventDefinitions',
        requiredPropertyType: [
          'bpmn:MessageEventDefinition',
          'bpmn:TimerEventDefinition'
        ]
      }
    }
  },
  {
    name: 'task',
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />')),
    report: {
      id: 'Task_1',
      message: 'Element of type <bpmn:Task> not allowed',
      path: null,
      error: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'Task_1',
        parentNode: null
      }
    }
  }
];

RuleTester.verify('camunda-cloud-1-0-element-type', rule, {
  valid: addConfig(valid, elementTypeConfig.camundaCloud10),
  invalid: addConfig(invalid, elementTypeConfig.camundaCloud10)
});