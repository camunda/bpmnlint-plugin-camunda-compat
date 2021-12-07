const { createModdle } = require('bpmnlint/lib/testers/helper');

const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaCloud10Rule = require('../rules/camunda-cloud-1-0');

const { createDefinitions } = require('./helper');

const createCollaboration = require('./helper').createCollaboration('1.0.0'),
      createProcess = require('./helper').createProcess('1.0.0');

const valid = [
  {
    name: 'artifacts',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1" />
      <bpmn:textAnnotation id="TextAnnotation_1" />
      <bpmn:association id="Association_1" sourceRef="StartEvent_1" targetRef="TextAnnotation_1" />
    `))
  },
  {
    name: 'call activity',
    moddleElement: createModdle(createProcess('<bpmn:callActivity id="CallActivity_1"/>'))
  },
  {
    name: 'collaboration',
    moddleElement: createModdle(createCollaboration())
  },
  {
    name: 'data object',
    moddleElement: createModdle(createProcess(`
      <bpmn:dataObjectReference id="DataObjectReference_1" dataObjectRef="DataObject_1" />
      <bpmn:dataObject id="DataObject_1" />
    `))
  },
  {
    name: 'data store reference',
    moddleElement: createModdle(createProcess('<bpmn:dataStoreReference id="DataStoreReference_1" />'))
  },
  {
    name: 'DI',
    moddleElement: createModdle(createProcess(`
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:endEvent id="EndEvent_1">
      <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
    `, `
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
        <bpmndi:BPMNEdge id="SequenceFlow_1_di" bpmnElement="SequenceFlow_1">
          <di:waypoint x="188" y="100" />
          <di:waypoint x="242" y="100" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
          <dc:Bounds x="152" y="82" width="36" height="36" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
          <dc:Bounds x="242" y="82" width="36" height="36" />
        </bpmndi:BPMNShape>
      </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
    `))
  },
  {
    name: 'error boundary event',
    moddleElement: createModdle(createProcess(`
    <bpmn:serviceTask id="ServiceTask_1" />
    <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
      <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
    </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'error end event',
    moddleElement: createModdle(createProcess(`
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
      </bpmn:endEvent>
    `))
  },
  {
    name: 'error start event',
    moddleElement: createModdle(createProcess(`
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
    </bpmn:startEvent>
    `))
  },
  {
    name: 'event-based gateway',
    moddleElement: createModdle(createProcess('<bpmn:eventBasedGateway id="EventBasedGateway_1"/>'))
  },
  {
    name: 'exclusive gateway',
    moddleElement: createModdle(createProcess('<bpmn:exclusiveGateway id="ExclusiveGateway_1"/>'))
  },
  {
    name: 'group',
    moddleElement: createModdle(createProcess('<bpmn:group id="Group_1"/>'))
  },
  {
    name: 'message boundary event',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
        <bpmn:messageEventDefinition id="ErrorEventDefinition_1" />
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'message flow',
    moddleElement: createModdle(createCollaboration(`
      <bpmn:participant id="Participant_1" />
      <bpmn:participant id="Participant_2" />
      <bpmn:messageFlow id="MessageFlow_1" sourceRef="Participant_1" targetRef="Participant_2" />
    `))
  },
  {
    name: 'message start event',
    moddleElement: createModdle(createProcess(`
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:messageEventDefinition id="ErrorEventDefinition_1" />
    </bpmn:startEvent>
    `))
  },
  {
    name: 'parallel gateway',
    moddleElement: createModdle(createProcess('<bpmn:parallelGateway id="ParallelGateway_1"/>'))
  },
  {
    name: 'receive task',
    moddleElement: createModdle(createProcess('<bpmn:receiveTask id="ReceiveTask_1" />'))
  },
  {
    name: 'receive task (multi-instance)',
    moddleElement: createModdle(createProcess(`
      <bpmn:receiveTask id="ReceiveTask_1">
        <bpmn:multiInstanceLoopCharacteristics />
      </bpmn:receiveTask>
    `))
  },
  {
    name: 'receive task (multi-instance sequential)',
    moddleElement: createModdle(createProcess(`
      <bpmn:receiveTask id="ReceiveTask_1">
        <bpmn:multiInstanceLoopCharacteristics isSequential="true" />
      </bpmn:receiveTask>
    `))
  },
  {
    name: 'sequence flow',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
    `))
  },
  {
    name: 'service task',
    moddleElement: createModdle(createProcess('<bpmn:serviceTask id="ServiceTask_1" />'))
  },
  {
    name: 'service task (multi-instance)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:multiInstanceLoopCharacteristics />
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'service task (multi-instance sequential)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:multiInstanceLoopCharacteristics isSequential="true" />
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'timer boundary event',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1" />
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'timer start event',
    moddleElement: createModdle(createProcess(`
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:timerEventDefinition id="TimerEventDefinition_1" />
    </bpmn:startEvent>
    `))
  },
  {
    name: 'user task',
    moddleElement: createModdle(createProcess('<bpmn:userTask id="UserTask_1" />'))
  },
  {
    name: 'user task (multi-instance)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:multiInstanceLoopCharacteristics />
      </bpmn:userTask>
    `))
  },
  {
    name: 'user task (multi-instance sequential)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:multiInstanceLoopCharacteristics isSequential="true" />
      </bpmn:userTask>
    `))
  }
];

module.exports.valid = valid;

const invalid = [
  {
    name: 'business rule task',
    moddleElement: createModdle(createProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />')),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <bpmn:BusinessRuleTask> not supported by Camunda Cloud 1.0'
    }
  },
  {
    name: 'complex gateway',
    moddleElement: createModdle(createProcess('<bpmn:complexGateway id="ComplexGateway_1" />')),
    report: {
      id: 'ComplexGateway_1',
      message: 'Element of type <bpmn:ComplexGateway> not supported by Camunda Cloud 1.0'
    }
  },
  {
    name: 'lane',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:collaboration id="Collaboration_1">
        <bpmn:participant id="Participant_1" processRef="Process_1" />
      </bpmn:collaboration>
      <bpmn:process id="Process_1">
        <bpmn:laneSet id="LaneSet_1">
          <bpmn:lane id="Lane_1" />
        </bpmn:laneSet>
      </bpmn:process>
    `)),
    report: {
      id: 'Process_1',
      message: 'Element of type <bpmn:Process (bpmn:LaneSet)> not supported by Camunda Cloud 1.0'
    }
  },
  {
    name: 'manual task',
    moddleElement: createModdle(createProcess('<bpmn:manualTask id="ManualTask_1" />')),
    report: {
      id: 'ManualTask_1',
      message: 'Element of type <bpmn:ManualTask> not supported by Camunda Cloud 1.0'
    }
  },
  {
    name: 'script task',
    moddleElement: createModdle(createProcess('<bpmn:scriptTask id="ScriptTask_1" />')),
    report: {
      id: 'ScriptTask_1',
      message: 'Element of type <bpmn:ScriptTask> not supported by Camunda Cloud 1.0'
    }
  },
  {
    name: 'send task',
    moddleElement: createModdle(createProcess('<bpmn:sendTask id="SendTask_1" />')),
    report: {
      id: 'SendTask_1',
      message: 'Element of type <bpmn:SendTask> not supported by Camunda Cloud 1.0'
    }
  },
  {
    name: 'signal start event',
    moddleElement: createModdle(createProcess(`
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:signalEventDefinition id="SignalEventDefinition_1" />
    </bpmn:startEvent>
    `)),
    report: {
      id: 'StartEvent_1',
      message: 'Element of type <bpmn:StartEvent (bpmn:SignalEventDefinition)> not supported by Camunda Cloud 1.0'
    }
  }
];

RuleTester.verify('camunda-cloud-1-0', camundaCloud10Rule, {
  valid,
  invalid
});