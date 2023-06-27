const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/no-multiple-start-events');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'One start event',
    moddleElement: createModdle(createDefinitions(`
    <bpmn:process id="Process_0anhjd3" isExecutable="true">
      <bpmn:startEvent id="StartEvent_1" />
    </bpmn:process>
    `))
  },
  {
    name: 'Multiple event start events',
    moddleElement: createModdle(createDefinitions(`
    <bpmn:process id="Process_0anhjd3" isExecutable="true">
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_0gzmqea" />
      </bpmn:startEvent>
      <bpmn:startEvent id="Event_0poq2qp">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1y1pwyb" />
      </bpmn:startEvent>
      <bpmn:startEvent id="Event_0nemfhw">
        <bpmn:conditionalEventDefinition id="ConditionalEventDefinition_0v2atb8">
          <bpmn:condition xsi:type="bpmn:tFormalExpression" />
        </bpmn:conditionalEventDefinition>
      </bpmn:startEvent>
      <bpmn:startEvent id="Event_0wzzunu">
        <bpmn:signalEventDefinition id="SignalEventDefinition_0oczll9" />
      </bpmn:startEvent>
      <bpmn:startEvent id="Event_0odl9fr" />
    </bpmn:process>
    `))
  },
  {
    name: 'task',
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  }
];

const invalid = [
  {
    name: 'Multiple start events',
    moddleElement: createModdle(createDefinitions(`
    <bpmn:process id="Process_0anhjd3" isExecutable="true">
      <bpmn:startEvent id="StartEvent_1" />
      <bpmn:startEvent id="StartEvent_2" />
    </bpmn:process>
    `)),
    report: [
      {
        id: 'StartEvent_1',
        message: 'A <bpmn:Process> only supports one blank start event.',
        data: {
          type: ERROR_TYPES.ELEMENT_MULTIPLE_NOT_ALLOWED,
          'node': 'StartEvent_1',
          parentNode: null
        }
      },
      {
        id: 'StartEvent_2',
        message: 'A <bpmn:Process> only supports one blank start event.',
        data: {
          type: ERROR_TYPES.ELEMENT_MULTIPLE_NOT_ALLOWED,
          'node': 'StartEvent_2',
          parentNode: null
        }
      }
    ]
  },
];

RuleTester.verify('executable-process', rule, {
  valid,
  invalid
});