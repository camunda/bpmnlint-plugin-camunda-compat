const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/no-loop');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'no loop',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:exclusiveGateway id="ExclusiveGateway_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
        <bpmn:incoming>SequenceFlow_5</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_3</bpmn:outgoing>
      </bpmn:serviceTask>
      <bpmn:exclusiveGateway id="ExclusiveGateway_2">
        <bpmn:incoming>SequenceFlow_3</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_5</bpmn:outgoing>
        <bpmn:outgoing>SequenceFlow_4</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:incoming>SequenceFlow_4</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="ExclusiveGateway_1" />
      <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="ExclusiveGateway_1" targetRef="ServiceTask_1" />
      <bpmn:sequenceFlow id="SequenceFlow_3" sourceRef="ServiceTask_1" targetRef="ExclusiveGateway_2" />
      <bpmn:sequenceFlow id="SequenceFlow_4" sourceRef="ExclusiveGateway_2" targetRef="EndEvent_1" />
      <bpmn:sequenceFlow id="SequenceFlow_5" sourceRef="ExclusiveGateway_2" targetRef="ExclusiveGateway_1" />
    `))
  },
  {
    name: 'ignored loop',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:exclusiveGateway id="ExclusiveGateway_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
        <bpmn:incoming>SequenceFlow_4</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:exclusiveGateway id="ExclusiveGateway_2">
        <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_4</bpmn:outgoing>
        <bpmn:outgoing>SequenceFlow_3</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:incoming>SequenceFlow_3</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="ExclusiveGateway_1" />
      <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="ExclusiveGateway_1" targetRef="ExclusiveGateway_2" />
      <bpmn:sequenceFlow id="SequenceFlow_3" sourceRef="ExclusiveGateway_2" targetRef="EndEvent_1" />
      <bpmn:sequenceFlow id="SequenceFlow_4" sourceRef="ExclusiveGateway_2" targetRef="ExclusiveGateway_1" />
    `))
  },
  {
    name: 'call activity',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:startEvent id="StartEvent_1">
          <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
        </bpmn:startEvent>
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:extensionElements>
            <zeebe:calledElement processId="Process_2" propagateAllChildVariables="false" />
          </bpmn:extensionElements>
          <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
          <bpmn:incoming>SequenceFlow_4</bpmn:incoming>
          <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
        </bpmn:callActivity>
        <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="CallActivity_1" />
        <bpmn:exclusiveGateway id="ExclusiveGateway_1">
          <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
          <bpmn:outgoing>SequenceFlow_3</bpmn:outgoing>
          <bpmn:outgoing>SequenceFlow_4</bpmn:outgoing>
        </bpmn:exclusiveGateway>
        <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="CallActivity_1" targetRef="ExclusiveGateway_1" />
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:incoming>SequenceFlow_3</bpmn:incoming>
        </bpmn:endEvent>
        <bpmn:sequenceFlow id="SequenceFlow_3" sourceRef="ExclusiveGateway_1" targetRef="EndEvent_1" />
        <bpmn:sequenceFlow id="SequenceFlow_4" sourceRef="ExclusiveGateway_1" targetRef="CallActivity_1" />
      </bpmn:process>
    `))
  },
  {
    name: 'simple loop (non-executable process)',
    config: { version: '8.2' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:startEvent id="StartEvent_1">
          <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
        </bpmn:startEvent>
        <bpmn:exclusiveGateway id="ExclusiveGateway_1">
          <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
          <bpmn:incoming>SequenceFlow_5</bpmn:incoming>
          <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
        </bpmn:exclusiveGateway>
        <bpmn:task id="Task_1">
          <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
          <bpmn:outgoing>SequenceFlow_3</bpmn:outgoing>
        </bpmn:task>
        <bpmn:exclusiveGateway id="ExclusiveGateway_2">
          <bpmn:incoming>SequenceFlow_3</bpmn:incoming>
          <bpmn:outgoing>SequenceFlow_5</bpmn:outgoing>
          <bpmn:outgoing>SequenceFlow_4</bpmn:outgoing>
        </bpmn:exclusiveGateway>
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:incoming>SequenceFlow_4</bpmn:incoming>
        </bpmn:endEvent>
        <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="ExclusiveGateway_1" />
        <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="ExclusiveGateway_1" targetRef="Task_1" />
        <bpmn:sequenceFlow id="SequenceFlow_3" sourceRef="Task_1" targetRef="ExclusiveGateway_2" />
        <bpmn:sequenceFlow id="SequenceFlow_5" sourceRef="ExclusiveGateway_2" targetRef="ExclusiveGateway_1" />
        <bpmn:sequenceFlow id="SequenceFlow_4" sourceRef="ExclusiveGateway_2" targetRef="EndEvent_1" />
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'simple loop',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:exclusiveGateway id="ExclusiveGateway_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
        <bpmn:incoming>SequenceFlow_5</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:task id="Task_1">
        <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_3</bpmn:outgoing>
      </bpmn:task>
      <bpmn:exclusiveGateway id="ExclusiveGateway_2">
        <bpmn:incoming>SequenceFlow_3</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_5</bpmn:outgoing>
        <bpmn:outgoing>SequenceFlow_4</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:incoming>SequenceFlow_4</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="ExclusiveGateway_1" />
      <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="ExclusiveGateway_1" targetRef="Task_1" />
      <bpmn:sequenceFlow id="SequenceFlow_3" sourceRef="Task_1" targetRef="ExclusiveGateway_2" />
      <bpmn:sequenceFlow id="SequenceFlow_5" sourceRef="ExclusiveGateway_2" targetRef="ExclusiveGateway_1" />
      <bpmn:sequenceFlow id="SequenceFlow_4" sourceRef="ExclusiveGateway_2" targetRef="EndEvent_1" />
    `)),
    report: {
      id: 'Process_1',
      message: 'Loop detected: ExclusiveGateway_1 -> Task_1 -> ExclusiveGateway_2 -> ExclusiveGateway_1',
      path: null,
      data: {
        type: ERROR_TYPES.LOOP_NOT_ALLOWED,
        node: 'Process_1',
        parentNode: null,
        elements: [
          'ExclusiveGateway_1',
          'Task_1',
          'ExclusiveGateway_2'
        ]
      }
    }
  },
  {
    name: 'sub-process loop',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:exclusiveGateway id="ExclusiveGateway_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
        <bpmn:incoming>SequenceFlow_5</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:subProcess id="SubProcess_1">
        <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_3</bpmn:outgoing>
        <bpmn:startEvent id="StartEvent_2">
          <bpmn:outgoing>SequenceFlow_6</bpmn:outgoing>
        </bpmn:startEvent>
        <bpmn:task id="Task_1">
          <bpmn:incoming>SequenceFlow_6</bpmn:incoming>
          <bpmn:outgoing>SequenceFlow_7</bpmn:outgoing>
        </bpmn:task>
        <bpmn:endEvent id="EndEvent_2">
          <bpmn:incoming>SequenceFlow_7</bpmn:incoming>
        </bpmn:endEvent>
        <bpmn:sequenceFlow id="SequenceFlow_6" sourceRef="StartEvent_2" targetRef="Task_1" />
        <bpmn:sequenceFlow id="SequenceFlow_7" sourceRef="Task_1" targetRef="EndEvent_2" />
      </bpmn:subProcess>
      <bpmn:exclusiveGateway id="ExclusiveGateway_2">
        <bpmn:incoming>SequenceFlow_3</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_5</bpmn:outgoing>
        <bpmn:outgoing>SequenceFlow_4</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:incoming>SequenceFlow_4</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="ExclusiveGateway_1" />
      <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="ExclusiveGateway_1" targetRef="SubProcess_1" />
      <bpmn:sequenceFlow id="SequenceFlow_3" sourceRef="SubProcess_1" targetRef="ExclusiveGateway_2" />
      <bpmn:sequenceFlow id="SequenceFlow_5" sourceRef="ExclusiveGateway_2" targetRef="ExclusiveGateway_1" />
      <bpmn:sequenceFlow id="SequenceFlow_4" sourceRef="ExclusiveGateway_2" targetRef="EndEvent_1" />
    `)),
    report: {
      id: 'Process_1',
      message: 'Loop detected: ExclusiveGateway_1 -> SubProcess_1 -> StartEvent_2 -> Task_1 -> EndEvent_2 -> ExclusiveGateway_2 -> ExclusiveGateway_1',
      path: null,
      data: {
        type: ERROR_TYPES.LOOP_NOT_ALLOWED,
        node: 'Process_1',
        parentNode: null,
        elements: [
          'ExclusiveGateway_1',
          'SubProcess_1',
          'StartEvent_2',
          'Task_1',
          'EndEvent_2',
          'ExclusiveGateway_2'
        ]
      }
    }
  },
  {
    name: 'call activity loop',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:startEvent id="StartEvent_1">
          <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
        </bpmn:startEvent>
        <bpmn:manualTask id="ManualTask_1">
          <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
          <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
        </bpmn:manualTask>
        <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="ManualTask_1" />
        <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="ManualTask_1" targetRef="CallActivity_1" />
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:incoming>SequenceFlow_3</bpmn:incoming>
        </bpmn:endEvent>
        <bpmn:sequenceFlow id="SequenceFlow_3" sourceRef="CallActivity_1" targetRef="EndEvent_1" />
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:extensionElements>
            <zeebe:calledElement processId="Process_1" propagateAllChildVariables="false" />
          </bpmn:extensionElements>
          <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
          <bpmn:outgoing>SequenceFlow_3</bpmn:outgoing>
        </bpmn:callActivity>
      </bpmn:process>
    `)),
    report: {
      id: 'Process_1',
      message: 'Loop detected: StartEvent_1 -> ManualTask_1 -> CallActivity_1 -> StartEvent_1',
      path: null,
      data: {
        type: ERROR_TYPES.LOOP_NOT_ALLOWED,
        node: 'Process_1',
        parentNode: null,
        elements: [
          'StartEvent_1',
          'ManualTask_1',
          'CallActivity_1'
        ]
      }
    }
  }
];

RuleTester.verify('no-loop', rule, {
  valid,
  invalid
});