const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/feel');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'valid FEEL expression (string property)',
    moddleElement: createModdle(createProcess(`
      <bpmn:extensionElements>
        <zeebe:taskDefinition retries="=5" />
      </bpmn:extensionElements>
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:output source="=source" target="OutputVariable_1" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'valid FEEL expression (bpmn:Expression property)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1">
          <bpmn:timeCycle xsi:type="bpmn:tFormalExpression">=cycle(duration("PT1S"))</bpmn:timeCycle>
        </bpmn:timerEventDefinition>
      </bpmn:startEvent>
    `))
  },
  {
    name: 'static value',
    moddleElement: createModdle(createProcess(`
      <bpmn:extensionElements>
        <zeebe:taskDefinition retries="5" />
      </bpmn:extensionElements>
      <bpmn:serviceTask id="Task_1" />
    `))
  },
  {
    name: 'invalid FEEL expression (string property) (non-executable process)',
    config: { version: '8.2' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="==foo" target="OutputVariable_1" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'invalid FEEL expression (string property)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:output source="==foo" target="OutputVariable_1" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'Task_1',
      message: 'Property <source> is not a valid FEEL expression',
      path: [
        'extensionElements',
        'values',
        0,
        'outputParameters',
        0,
        'source'
      ],
      data: {
        type: ERROR_TYPES.FEEL_EXPRESSION_INVALID,
        node: 'zeebe:Output',
        parentNode: 'Task_1',
        property: 'source'
      }
    }
  },
  {
    name: 'invalid FEEL expression (bpmn:Expression property)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1">
          <bpmn:timeCycle xsi:type="bpmn:tFormalExpression">=cycle(duration("PT1S")</bpmn:timeCycle>
        </bpmn:timerEventDefinition>
      </bpmn:startEvent>
    `)),
    report: {
      id: 'StartEvent_1',
      message: 'Property <timeCycle> is not a valid FEEL expression',
      path: [
        'eventDefinitions',
        0,
        'timeCycle'
      ],
      data: {
        type: ERROR_TYPES.FEEL_EXPRESSION_INVALID,
        node: 'TimerEventDefinition_1',
        parentNode: 'StartEvent_1',
        property: 'timeCycle'
      }
    }
  }
];

RuleTester.verify('feel', rule, {
  valid,
  invalid
});