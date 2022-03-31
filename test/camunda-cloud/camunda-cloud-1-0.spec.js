const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaCloud10Rule = require('../../rules/camunda-cloud-1-0');

const { createModdle } = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

function createValid(executionPlatformVersion = '1.0.0') {
  const createCloudCollaboration = require('../helper').createCloudCollaboration(executionPlatformVersion),
        createCloudDefinitions = require('../helper').createCloudDefinitions(executionPlatformVersion),
        createCloudProcess = require('../helper').createCloudProcess(executionPlatformVersion);

  return [

    // DI
    {
      name: 'DI',
      moddleElement: createModdle(createCloudProcess(`
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

    // bpmn:Association
    // bpmn:TextAnnotation
    {
      name: 'artifacts',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:startEvent id="StartEvent_1" />
        <bpmn:textAnnotation id="TextAnnotation_1" />
        <bpmn:association id="Association_1" sourceRef="StartEvent_1" targetRef="TextAnnotation_1" />
      `))
    },

    // bpmn:Collaboration
    // bpmn:Participant
    {
      name: 'collaboration',
      moddleElement: createModdle(createCloudCollaboration())
    },

    // bpmn:DataObject
    {
      name: 'data object',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:dataObjectReference id="DataObjectReference_1" dataObjectRef="DataObject_1" />
        <bpmn:dataObject id="DataObject_1" />
      `))
    },

    // bpmn:DataStoreReference
    {
      name: 'data store reference',
      moddleElement: createModdle(createCloudProcess('<bpmn:dataStoreReference id="DataStoreReference_1" />'))
    },

    // bpmn:EventBasedGateway
    {
      name: 'event-based gateway',
      moddleElement: createModdle(createCloudProcess('<bpmn:eventBasedGateway id="EventBasedGateway_1" />'))
    },

    // bpmn:ExclusiveGateway
    {
      name: 'exclusive gateway',
      moddleElement: createModdle(createCloudProcess('<bpmn:exclusiveGateway id="ExclusiveGateway_1" />'))
    },

    // bpmn:Group
    {
      name: 'group',
      moddleElement: createModdle(createCloudProcess('<bpmn:group id="Group_1" />'))
    },

    // bpmn:MessageFlow
    {
      name: 'message flow',
      moddleElement: createModdle(createCloudCollaboration(`
        <bpmn:participant id="Participant_1" />
        <bpmn:participant id="Participant_2" />
        <bpmn:messageFlow id="MessageFlow_1" sourceRef="Participant_1" targetRef="Participant_2" />
      `))
    },

    // bpmn:ParallelGateway
    {
      name: 'parallel gateway',
      moddleElement: createModdle(createCloudProcess('<bpmn:parallelGateway id="ParallelGateway_1" />'))
    },

    // bpmn:SequenceFlow
    {
      name: 'sequence flow',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:startEvent id="StartEvent_1">
          <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
        </bpmn:startEvent>
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
        </bpmn:endEvent>
        <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
      `))
    },

    // bpmn:BoundaryEvent
    {
      name: 'error boundary event',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:serviceTask id="ServiceTask_1">
            <bpmn:extensionElements>
              <zeebe:taskDefinition type="foo" />
            </bpmn:extensionElements>
          </bpmn:serviceTask>
          <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
            <bpmn:errorEventDefinition id="ErrorEventDefinition_1" errorRef="Error_1" />
          </bpmn:boundaryEvent>
        </bpmn:process>
        <bpmn:error id="Error_1" name="Error_1" errorCode="foo" />
      `))
    },
    {
      name: 'message boundary event',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:serviceTask id="ServiceTask_1">
            <bpmn:extensionElements>
              <zeebe:taskDefinition type="foo" />
            </bpmn:extensionElements>
          </bpmn:serviceTask>
          <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:boundaryEvent>
        </bpmn:process>
        <bpmn:message id="Message_1" name="Message_1">
          <bpmn:extensionElements>
            <zeebe:Subscription correlationKey="foo" />
          </bpmn:extensionElements>
        </bpmn:message>
      `))
    },
    {
      name: 'timer boundary event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
          <bpmn:timerEventDefinition id="TimerEventDefinition_1" />
        </bpmn:boundaryEvent>
      `))
    },

    // bpmn:CallActivity
    {
      name: 'call activity',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:extensionElements>
            <zeebe:calledElement processId="foo" />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      `))
    },
    {
      name: 'call activity (multi-instance)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:multiInstanceLoopCharacteristics >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:calledElement processId="foo" />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      `))
    },
    {
      name: 'call activity (multi-instance sequential)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:multiInstanceLoopCharacteristics isSequential="true" >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:calledElement processId="foo" />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      `))
    },

    // bpmn:EndEvent
    {
      name: 'end event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:endEvent id="EndEvent_1" />
      `))
    },
    {
      name: 'error end event',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:endEvent id="EndEvent_1">
            <bpmn:errorEventDefinition id="ErrorEventDefinition_1" errorRef="Error_1" />
          </bpmn:endEvent>
        </bpmn:process>
        <bpmn:error id="Error_1" name="Error_1" errorCode="foo" />
      `))
    },

    // bpmn:IntermediateCatchEvent
    {
      name: 'message intermediate catch event',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:intermediateCatchEvent id="IntermeditateCatchEvent_1">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:intermediateCatchEvent>
        </bpmn:process>
        <bpmn:message id="Message_1" name="Message_1">
          <bpmn:extensionElements>
            <zeebe:Subscription correlationKey="foo" />
          </bpmn:extensionElements>
        </bpmn:message>
      `))
    },
    {
      name: 'timer intermediate catch event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
          <bpmn:timerEventDefinition id="TimerEventDefinition_1" />
        </bpmn:intermediateCatchEvent>
      `))
    },

    // bpmn:ReceiveTask
    {
      name: 'receive task',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process id="Process_1">
          <bpmn:receiveTask id="ReceiveTask_1" messageRef="Message_1" />
        </bpmn:process>
        <bpmn:message id="Message_1" name="Message_1">
          <bpmn:extensionElements>
            <zeebe:subscription correlationKey="foo" />
          </bpmn:extensionElements>
        </bpmn:message>
      `))
    },
    {
      name: 'receive task (multi-instance)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process id="Process_1">
          <bpmn:receiveTask id="ReceiveTask_1" messageRef="Message_1">
            <bpmn:multiInstanceLoopCharacteristics>
              <bpmn:extensionElements>
                <zeebe:loopCharacteristics inputCollection="foo" />
              </bpmn:extensionElements>
            </bpmn:multiInstanceLoopCharacteristics>
          </bpmn:receiveTask>
        </bpmn:process>
        <bpmn:message id="Message_1" name="Message_1">
          <bpmn:extensionElements>
            <zeebe:subscription correlationKey="foo" />
          </bpmn:extensionElements>
        </bpmn:message>
      `))
    },
    {
      name: 'receive task (multi-instance sequential)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process id="Process_1">
          <bpmn:receiveTask id="ReceiveTask_1" messageRef="Message_1">
            <bpmn:multiInstanceLoopCharacteristics isSequential="true">
              <bpmn:extensionElements>
                <zeebe:loopCharacteristics inputCollection="foo" />
              </bpmn:extensionElements>
            </bpmn:multiInstanceLoopCharacteristics>
          </bpmn:receiveTask>
        </bpmn:process>
        <bpmn:message id="Message_1" name="Message_1">
          <bpmn:extensionElements>
            <zeebe:subscription correlationKey="foo" />
          </bpmn:extensionElements>
        </bpmn:message>
      `))
    },

    // bpmn:ServiceTask
    {
      name: 'service task',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      `))
    },
    {
      name: 'service task (multi-instance)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:multiInstanceLoopCharacteristics >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      `))
    },
    {
      name: 'service task (multi-instance sequential)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:multiInstanceLoopCharacteristics isSequential="true" >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      `))
    },

    // bpmn:StartEvent
    {
      name: 'start event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:startEvent id="StartEvent_1" />
      `))
    },
    {
      name: 'error start event',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:startEvent id="StartEvent_1">
            <bpmn:errorEventDefinition id="ErrorEventDefinition_1" errorRef="Error_1" />
          </bpmn:startEvent>
        </bpmn:process>
        <bpmn:error id="Error_1" name="Error_1" errorCode="foo" />
      `))
    },
    {
      name: 'message start event',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:startEvent id="StartEvent_1">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:startEvent>
        </bpmn:process>
        <bpmn:message id="Message_1" name="Message_1">
          <bpmn:extensionElements>
            <zeebe:Subscription correlationKey="foo" />
          </bpmn:extensionElements>
        </bpmn:message>
      `))
    },
    {
      name: 'timer start event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:startEvent id="StartEvent_1">
          <bpmn:timerEventDefinition id="TimerEventDefinition_1" />
        </bpmn:startEvent>
      `))
    },

    // bpmn:SubProcess
    {
      name: 'sub process',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:subProcess id="SubProcess_1" />
      `))
    },
    {
      name: 'sub process (multi-instance)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:subProcess id="SubProcess_1">
          <bpmn:multiInstanceLoopCharacteristics>
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
        </bpmn:subProcess>
      `))
    },
    {
      name: 'sub process (multi-instance sequential)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:subProcess id="SubProcess_1">
          <bpmn:multiInstanceLoopCharacteristics>
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
        </bpmn:subProcess>
      `))
    },

    // bpmn:UserTask
    {
      name: 'user task',
      moddleElement: createModdle(createCloudProcess('<bpmn:userTask id="UserTask_1" />'))
    },
    {
      name: 'user task (multi-instance)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:userTask id="UserTask_1">
          <bpmn:multiInstanceLoopCharacteristics >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
        </bpmn:userTask>
      `))
    },
    {
      name: 'user task (multi-instance sequential)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:userTask id="UserTask_1">
          <bpmn:multiInstanceLoopCharacteristics isSequential="true" >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
        </bpmn:userTask>
      `))
    }
  ];
}

module.exports.createValid = createValid;

function createInvalid(executionPlatformVersion = '1.0.0') {
  const createCloudDefinitions = require('../helper').createCloudDefinitions(executionPlatformVersion),
        createCloudProcess = require('../helper').createCloudProcess(executionPlatformVersion);

  return [
    ...[
      [ 'bpmn:BusinessRuleTask', 'bpmn:businessRuleTask' ],
      [ 'bpmn:ComplexGateway', 'bpmn:complexGateway' ],
      [ 'bpmn:ManualTask', 'bpmn:manualTask' ],
      [ 'bpmn:ScriptTask', 'bpmn:scriptTask' ],
      [ 'bpmn:SendTask', 'bpmn:sendTask' ]
    ].map(([ type, tagName ]) => {
      return {
        name: type,
        moddleElement: createModdle(createCloudProcess(`<${ tagName } id="FlowNode_1" />`)),
        report: {
          id: 'FlowNode_1',
          message: `Element of type <${ type }> not supported by Zeebe 1.0`
        }
      };
    }),

    // bpmn:BoundaryEvent
    {
      name: 'boundary event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1" />
      `)),
      report: {
        id: 'BoundaryEvent_1',
        message: 'Element of type <bpmn:BoundaryEvent> not supported by Zeebe 1.0',
        path: null,
        error: {
          type: ERROR_TYPES.ELEMENT_TYPE,
          elementType: 'bpmn:BoundaryEvent'
        }
      }
    },
    {
      name: 'error boundary event (no error ref)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
          <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
        </bpmn:boundaryEvent>
      `)),
      report: {
        id: 'BoundaryEvent_1',
        message: 'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>',
        path: [
          'eventDefinitions',
          0,
          'errorRef'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'errorRef'
        }
      }
    },
    {
      name: 'error boundary event (no error code)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:serviceTask id="ServiceTask_1">
            <bpmn:extensionElements>
              <zeebe:taskDefinition type="foo" retries="bar" />
            </bpmn:extensionElements>
          </bpmn:serviceTask>
          <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
            <bpmn:errorEventDefinition id="ErrorEventDefinition_1" errorRef="Error_1" />
          </bpmn:boundaryEvent>
        </bpmn:process>
        <bpmn:error id="Error_1" name="Error_1" />
      `)),
      report: {
        id: 'BoundaryEvent_1',
        message: 'Element of type <bpmn:Error> must have property <errorCode>',
        path: [
          'rootElements',
          1,
          'errorCode'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'errorCode'
        }
      }
    },
    {
      name: 'message boundary event (no message ref)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
          <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        </bpmn:boundaryEvent>
      `)),
      report: {
        id: 'BoundaryEvent_1',
        message: 'Element of type <bpmn:MessageEventDefinition> must have property <messageRef>',
        path: [
          'eventDefinitions',
          0,
          'messageRef'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'messageRef'
        }
      }
    },
    {
      name: 'message boundary event (no message name)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:serviceTask id="ServiceTask_1">
            <bpmn:extensionElements>
              <zeebe:taskDefinition type="foo" retries="bar" />
            </bpmn:extensionElements>
          </bpmn:serviceTask>
          <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:boundaryEvent>
        </bpmn:process>
        <bpmn:message id="Message_1" />
      `)),
      report: {
        id: 'BoundaryEvent_1',
        message: 'Element of type <bpmn:Message> must have property <name>',
        path: [
          'rootElements',
          1,
          'name'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'name'
        }
      }
    },

    // bpmn:CallActivity
    {
      name: 'call activity',
      moddleElement: createModdle(createCloudProcess('<bpmn:callActivity id="CallActivity_1" />')),
      report: {
        id: 'CallActivity_1',
        message: 'Element of type <bpmn:CallActivity> must have <zeebe:CalledElement> extension element',
        path: null,
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:CalledElement'
        }
      }
    },
    {
      name: 'call activity (called element)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:extensionElements>
            <zeebe:calledElement />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      `)),
      report: {
        id: 'CallActivity_1',
        message: 'Element of type <zeebe:CalledElement> must have property <processId>',
        path: [
          'extensionElements',
          'values',
          0,
          'processId'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'processId'
        }
      }
    },
    {
      name: 'call activity (no loop characteristics)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:multiInstanceLoopCharacteristics />
          <bpmn:extensionElements>
            <zeebe:calledElement processId="foo" />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      `)),
      report: {
        id: 'CallActivity_1',
        message: 'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have <zeebe:LoopCharacteristics> extension element',
        path: [
          'loopCharacteristics'
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:LoopCharacteristics'
        }
      }
    },
    {
      name: 'call activity (outputCollection)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:multiInstanceLoopCharacteristics >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" outputCollection="bar" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:calledElement processId="foo" />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      `)),
      report: {
        id: 'CallActivity_1',
        message: 'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if property <outputCollection> is set',
        path: [
          'loopCharacteristics',
          'extensionElements',
          'values',
          0,
          'outputElement'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
          dependendRequiredProperty: 'outputElement'
        }
      }
    },
    {
      name: 'call activity (outputElement)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:multiInstanceLoopCharacteristics >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" outputElement="bar" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:calledElement processId="foo" />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      `)),
      report: {
        id: 'CallActivity_1',
        message: 'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if property <outputElement> is set',
        path: [
          'loopCharacteristics',
          'extensionElements',
          'values',
          0,
          'outputCollection'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
          dependendRequiredProperty: 'outputCollection'
        }
      }
    },

    // bpmn:EndEvent
    {
      name: 'message end event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        </bpmn:endEvent>
      `)),
      report: {
        id: 'EndEvent_1',
        message: 'Element of type <bpmn:EndEvent> (<bpmn:MessageEventDefinition>) not supported by Zeebe 1.0',
        path: [
          'eventDefinitions',
          0
        ],
        error: {
          type: ERROR_TYPES.ELEMENT_TYPE,
          elementType: 'bpmn:EndEvent',
          propertyType: 'bpmn:MessageEventDefinition'
        }
      }
    },
    {
      name: 'error end event (no error ref)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
        </bpmn:endEvent>
      `)),
      report: {
        id: 'EndEvent_1',
        message: 'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>',
        path: [
          'eventDefinitions',
          0,
          'errorRef'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'errorRef'
        }
      }
    },

    // bpmn:IntermediateCatchEvent
    {
      name: 'intermediate catch event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:intermediateCatchEvent id="IntermeditateCatchEvent_1" />
      `)),
      report: {
        id: 'IntermeditateCatchEvent_1',
        message: 'Element of type <bpmn:IntermediateCatchEvent> not supported by Zeebe 1.0',
        path: null,
        error: {
          type: ERROR_TYPES.ELEMENT_TYPE,
          elementType: 'bpmn:IntermediateCatchEvent'
        }
      }
    },
    {
      name: 'signal intermediate catch event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:intermediateCatchEvent id="IntermeditateCatchEvent_1">
          <bpmn:signalEventDefinition id="SignalEventDefinition_1" />
        </bpmn:intermediateCatchEvent>
      `)),
      report: {
        id: 'IntermeditateCatchEvent_1',
        message: 'Element of type <bpmn:IntermediateCatchEvent> (<bpmn:SignalEventDefinition>) not supported by Zeebe 1.0',
        path: [
          'eventDefinitions',
          0
        ],
        error: {
          type: ERROR_TYPES.ELEMENT_TYPE,
          elementType: 'bpmn:IntermediateCatchEvent',
          propertyType: 'bpmn:SignalEventDefinition'
        }
      }
    },
    {
      name: 'message intermediate catch event (no message ref)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:intermediateCatchEvent id="IntermeditateCatchEvent_1">
          <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        </bpmn:intermediateCatchEvent>
      `)),
      report: {
        id: 'IntermeditateCatchEvent_1',
        message: 'Element of type <bpmn:MessageEventDefinition> must have property <messageRef>',
        path: [
          'eventDefinitions',
          0,
          'messageRef'
        ],
        error: {
          type: 'propertyRequired',
          requiredProperty: 'messageRef'
        }
      }
    },
    {
      name: 'message intermediate catch event (no message name)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:intermediateCatchEvent id="IntermeditateCatchEvent_1">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:intermediateCatchEvent>
        </bpmn:process>
        <bpmn:message id="Message_1" />
      `)),
      report: {
        id: 'IntermeditateCatchEvent_1',
        message: 'Element of type <bpmn:Message> must have property <name>',
        path: [
          'rootElements',
          1,
          'name'
        ],
        error: {
          type: 'propertyRequired',
          requiredProperty: 'name'
        }
      }
    },
    {
      name: 'message intermediate catch event (no subscription)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:intermediateCatchEvent id="IntermeditateCatchEvent_1">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:intermediateCatchEvent>
        </bpmn:process>
        <bpmn:message id="Message_1" name="Message_1" />
      `)),
      report: {
        id: 'IntermeditateCatchEvent_1',
        message: 'Element of type <bpmn:Message> must have <zeebe:Subscription> extension element',
        path: [
          'rootElements',
          1
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:Subscription'
        }
      }
    },

    // bpmn:Process
    {
      name: 'lane',
      moddleElement: createModdle(createCloudDefinitions(`
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
        message: 'Element of type <bpmn:Process> (<bpmn:LaneSet>) not supported by Zeebe 1.0',
        path: [
          'laneSets'
        ],
        error: {
          type: ERROR_TYPES.ELEMENT_TYPE,
          elementType: 'bpmn:Process',
          propertyType: 'bpmn:LaneSet'
        }
      }
    },

    // bpmn:ReceiveTask
    {
      name: 'receive task (no message ref)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:receiveTask id="ReceiveTask_1" />
      `)),
      report: {
        id: 'ReceiveTask_1',
        message: 'Element of type <bpmn:ReceiveTask> must have property <messageRef>',
        path: [
          'messageRef'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'messageRef'
        }
      }
    },
    {
      name: 'receive task (no message name)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process id="Process_1">
          <bpmn:receiveTask id="ReceiveTask_1" messageRef="Message_1" />
        </bpmn:process>
        <bpmn:message id="Message_1" />
      `)),
      report: {
        id: 'ReceiveTask_1',
        message: 'Element of type <bpmn:Message> must have property <name>',
        path: [
          'rootElements',
          1,
          'name'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'name'
        }
      }
    },
    {
      name: 'receive task (no subscription)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process id="Process_1">
          <bpmn:receiveTask id="ReceiveTask_1" messageRef="Message_1" />
        </bpmn:process>
        <bpmn:message id="Message_1" name="Message_1" />
      `)),
      report: {
        id: 'ReceiveTask_1',
        message: 'Element of type <bpmn:Message> must have <zeebe:Subscription> extension element',
        path: [
          'rootElements',
          1
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:Subscription'
        }
      }
    },
    {
      name: 'receive task (no loop characteristics)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process id="Process_1">
          <bpmn:receiveTask id="ReceiveTask_1" messageRef="Message_1">
            <bpmn:multiInstanceLoopCharacteristics />
          </bpmn:receiveTask>
        </bpmn:process>
        <bpmn:message id="Message_1" name="Message_1">
          <bpmn:extensionElements>
            <zeebe:subscription correlationKey="foo" />
          </bpmn:extensionElements>
        </bpmn:message>
      `)),
      report: {
        id: 'ReceiveTask_1',
        message: 'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have <zeebe:LoopCharacteristics> extension element',
        path: [
          'loopCharacteristics'
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:LoopCharacteristics'
        }
      }
    },

    // bpmn:ServiceTask
    {
      name: 'service task (no task definition)',
      moddleElement: createModdle(createCloudProcess('<bpmn:serviceTask id="ServiceTask_1" />')),
      report: {
        id: 'ServiceTask_1',
        message: 'Element of type <bpmn:ServiceTask> must have <zeebe:TaskDefinition> extension element',
        path: null,
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:TaskDefinition'
        }
      }
    },
    {
      name: 'service task (no task definition type)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      `)),
      report: {
        id: 'ServiceTask_1',
        message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
        path: [
          'extensionElements',
          'values',
          0,
          'type'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'type'
        }
      }
    },
    {
      name: 'service task (no loop characteristics)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:multiInstanceLoopCharacteristics />
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      `)),
      report: {
        id: 'ServiceTask_1',
        message: 'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have <zeebe:LoopCharacteristics> extension element',
        path: [
          'loopCharacteristics'
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:LoopCharacteristics'
        }
      }
    },

    // bpmn:StartEvent
    {
      name: 'signal start event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:startEvent id="StartEvent_1">
          <bpmn:signalEventDefinition id="SignalEventDefinition_1" />
        </bpmn:startEvent>
      `)),
      report: {
        id: 'StartEvent_1',
        message: 'Element of type <bpmn:StartEvent> (<bpmn:SignalEventDefinition>) not supported by Zeebe 1.0',
        path: [
          'eventDefinitions',
          0
        ],
        error: {
          type: ERROR_TYPES.ELEMENT_TYPE,
          elementType: 'bpmn:StartEvent',
          propertyType: 'bpmn:SignalEventDefinition'
        }
      }
    },
    {
      name: 'error start event (no error ref)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:startEvent id="StartEvent_1">
          <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
        </bpmn:startEvent>
      `)),
      report: {
        id: 'StartEvent_1',
        message: 'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>',
        path: [
          'eventDefinitions',
          0,
          'errorRef'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'errorRef'
        }
      }
    },
    {
      name: 'error start event (no error code)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:startEvent id="StartEvent_1">
            <bpmn:errorEventDefinition id="ErrorEventDefinition_1" errorRef="Error_1" />
          </bpmn:startEvent>
        </bpmn:process>
        <bpmn:error id="Error_1" name="Error_1" />
      `)),
      report: {
        id: 'StartEvent_1',
        message: 'Element of type <bpmn:Error> must have property <errorCode>',
        path: [
          'rootElements',
          1,
          'errorCode'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'errorCode'
        }
      }
    },
    {
      name: 'message start event (no message ref)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:startEvent id="StartEvent_1">
          <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        </bpmn:startEvent>
      `)),
      report: {
        id: 'StartEvent_1',
        message: 'Element of type <bpmn:MessageEventDefinition> must have property <messageRef>',
        path: [
          'eventDefinitions',
          0,
          'messageRef'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'messageRef'
        }
      }
    },
    {
      name: 'message start event (no message name)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:startEvent id="StartEvent_1">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:startEvent>
        </bpmn:process>
        <bpmn:message id="Message_1" />
      `)),
      report: {
        id: 'StartEvent_1',
        message: 'Element of type <bpmn:Message> must have property <name>',
        path: [
          'rootElements',
          1,
          'name'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'name'
        }
      }
    },
    {
      name: 'message start event (no subscription)',
      moddleElement: createModdle(createCloudDefinitions(`
        <bpmn:process>
          <bpmn:startEvent id="StartEvent_1">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:startEvent>
        </bpmn:process>
        <bpmn:message id="Message_1" name="Message_1" />
      `)),
      report: {
        id: 'StartEvent_1',
        message: 'Element of type <bpmn:Message> must have <zeebe:Subscription> extension element',
        path: [
          'rootElements',
          1
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:Subscription'
        }
      }
    },

    // bpmn:SubProcess
    {
      name: 'sub process (no loop characteristics)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:subProcess id="SubProcess_1">
          <bpmn:multiInstanceLoopCharacteristics />
        </bpmn:subProcess>
      `)),
      report: {
        id: 'SubProcess_1',
        message: 'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have <zeebe:LoopCharacteristics> extension element',
        path: [
          'loopCharacteristics'
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:LoopCharacteristics'
        }
      }
    },

    // bpmn:UserTask
    {
      name: 'user task (no loop characteristics)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:userTask id="UserTask_1">
          <bpmn:multiInstanceLoopCharacteristics />
        </bpmn:userTask>
      `)),
      report: {
        id: 'UserTask_1',
        message: 'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have <zeebe:LoopCharacteristics> extension element',
        path: [
          'loopCharacteristics'
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:LoopCharacteristics'
        }
      }
    }
  ];
}

RuleTester.verify('camunda-cloud-1-0', camundaCloud10Rule, {
  valid: createValid(),
  invalid: createInvalid()
});
