const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/inclusive-gateway');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'inclusive gateway (1 outgoing sequence flow)',
    moddleElement: createModdle(createProcess(`
      <bpmn:inclusiveGateway id="InclusiveGateway_1">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
      </bpmn:inclusiveGateway>
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="InclusiveGateway_1" targetRef="EndEvent_1" />
    `))
  },
  {
    name: 'inclusive gateway (2 outgoing sequence flows with condition)',
    moddleElement: createModdle(createProcess(`
      <bpmn:inclusiveGateway id="InclusiveGateway_1">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
        <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
      </bpmn:inclusiveGateway>
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="InclusiveGateway_1" targetRef="EndEvent_1">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=foo</bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:endEvent id="EndEvent_2">
        <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="InclusiveGateway_1" targetRef="EndEvent_2">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=bar</bpmn:conditionExpression>
      </bpmn:sequenceFlow>
    `))
  },
  {
    name: 'inclusive gateway (2 outgoing sequence flows, 1 default, 1 with condition)',
    moddleElement: createModdle(createProcess(`
      <bpmn:inclusiveGateway id="InclusiveGateway_1" default="SequenceFlow_2">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
        <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
      </bpmn:inclusiveGateway>
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="InclusiveGateway_1" targetRef="EndEvent_1">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=foo</bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:endEvent id="EndEvent_2">
        <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="InclusiveGateway_1" targetRef="EndEvent_2" />
    `))
  },
  {
    name: 'end event',
    moddleElement: createModdle(createProcess('<bpmn:endEvent id="EndEvent_1" />'))
  },
  {
    name: 'task',
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  }
];

const invalid = [
  {
    name: 'inclusive gateway (2 incoming sequence flows)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:inclusiveGateway id="InclusiveGateway_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
        <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
      </bpmn:inclusiveGateway>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="InclusiveGateway_1" />
      <bpmn:startEvent id="StartEvent_2">
        <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="StartEvent_2" targetRef="InclusiveGateway_1" />
    `)),
    report: {
      id: 'InclusiveGateway_1',
      message: 'Element of type <bpmn:InclusiveGateway> must have one property <incoming> of type <bpmn:SequenceFlow>',
      path: [
        'incoming'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
        node: 'InclusiveGateway_1',
        parentNode: null,
        property: 'incoming'
      }
    }
  },
  {
    name: 'inclusive gateway (2 outgoing sequence flows, one without condition)',
    moddleElement: createModdle(createProcess(`
      <bpmn:inclusiveGateway id="InclusiveGateway_1">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
        <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
      </bpmn:inclusiveGateway>
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="InclusiveGateway_1" targetRef="EndEvent_1">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=foo</bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:endEvent id="EndEvent_2">
        <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="InclusiveGateway_1" targetRef="EndEvent_2" />
    `)),
    report: {
      id: 'SequenceFlow_2',
      message: 'Element of type <bpmn:SequenceFlow> must have property <conditionExpression>',
      path: [
        'conditionExpression'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'SequenceFlow_2',
        parentNode: null,
        requiredProperty: 'conditionExpression'
      }
    }
  },
  {
    name: 'inclusive gateway (2 outgoing sequence flows, 2 without condition)',
    moddleElement: createModdle(createProcess(`
      <bpmn:inclusiveGateway id="InclusiveGateway_1">
        <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
        <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
      </bpmn:inclusiveGateway>
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="InclusiveGateway_1" targetRef="EndEvent_1" />
      <bpmn:endEvent id="EndEvent_2">
        <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="InclusiveGateway_1" targetRef="EndEvent_2" />
    `)),
    report: [
      {
        id: 'SequenceFlow_1',
        message: 'Element of type <bpmn:SequenceFlow> must have property <conditionExpression>',
        path: [
          'conditionExpression'
        ],
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node: 'SequenceFlow_1',
          parentNode: null,
          requiredProperty: 'conditionExpression'
        }
      },
      {
        id: 'SequenceFlow_2',
        message: 'Element of type <bpmn:SequenceFlow> must have property <conditionExpression>',
        path: [
          'conditionExpression'
        ],
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node: 'SequenceFlow_2',
          parentNode: null,
          requiredProperty: 'conditionExpression'
        }
      }
    ]
  }
];

RuleTester.verify('inclusive-gateway', rule, {
  valid,
  invalid
});