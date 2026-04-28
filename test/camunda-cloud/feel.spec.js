const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/feel');

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
    name: 'backticks',
    moddleElement: createModdle(createProcess(`
     <bpmn:serviceTask id="Task_1">
      <bpmn:extensionElements>
        <zeebe:ioMapping>
          <zeebe:input source="=\`backticks\`" target="InputVariable_1" />
        </zeebe:ioMapping>
      </bpmn:extensionElements>
    </bpmn:serviceTask>
    `))
  },
  {
    name: 'multiline',
    moddleElement: createModdle(createProcess(`
     <bpmn:serviceTask id="Task_1">
      <bpmn:extensionElements>
        <zeebe:ioMapping>
          <zeebe:input source="=&#34;multiline&#10;string&#34;" target="InputVariable_1" />
        </zeebe:ioMapping>
      </bpmn:extensionElements>
    </bpmn:serviceTask>
    `))
  },
  {
    name: 'get or else (unparsable feel extensions)',
    moddleElement: createModdle(createProcess(`
     <bpmn:serviceTask id="Task_1">
      <bpmn:extensionElements>
        <zeebe:ioMapping>
          <zeebe:input source="=get or else(default, value)" target="InputVariable_1" />
        </zeebe:ioMapping>
      </bpmn:extensionElements>
    </bpmn:serviceTask>
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
              <zeebe:output source="==..." target="OutputVariable_1" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:process>
    `))
  },
  {
    name: 'name with FEEL-like expression (ignored)',
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task_1" name="==...foo" />
    `))
  },
  {
    name: 'input target with FEEL-like expression (ignored)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input target="=...foo" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'output target with FEEL-like expression (ignored)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:output target="=...foo" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'task header key and value with FEEL-like expression (ignored)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="==...foo" value="==...foo" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'zeebe property name and value with FEEL-like expression (ignored)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="==...foo" value="==...foo" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'called decision resultVariable with FEEL-like expression (ignored)',
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision decisionId="myDecision" resultVariable="==...foo" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  },
  {
    name: 'script resultVariable with FEEL-like expression (ignored)',
    moddleElement: createModdle(createProcess(`
      <bpmn:scriptTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:script expression="=1+1" resultVariable="==...foo" />
        </bpmn:extensionElements>
      </bpmn:scriptTask>
    `))
  },
  {
    name: 'from json (available engine version)',
    config: { engines: { camunda: '8.9' } },
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=from json(input)" target="InputVariable_1" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'from json (no engines configured)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=from json(input)" target="InputVariable_1" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  }
];

const invalid = [
  {
    name: 'invalid FEEL expression (string property) (task)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:output source="==..." target="OutputVariable_1" />
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
    name: 'invalid FEEL expression (bpmn:Expression property) (start event)',
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
  },
  {
    name: 'invalid FEEL expression (string property) (process)',
    moddleElement: createModdle(createProcess(`
      <bpmn:extensionElements>
        <zeebe:executionListeners>
          <zeebe:executionListener eventType="start" type="=1 >" />
        </zeebe:executionListeners>
      </bpmn:extensionElements>
    `)),
    report: {
      id: 'Process_1',
      message: 'Property <type> is not a valid FEEL expression',
      path: [
        'extensionElements',
        'values',
        0,
        'listeners',
        0,
        'type'
      ],
      data: {
        type: ERROR_TYPES.FEEL_EXPRESSION_INVALID,
        node: 'zeebe:ExecutionListener',
        parentNode: 'Process_1',
        property: 'type'
      }
    }
  },
  {
    name: 'from json (engine version too old)',
    config: { engines: { camunda: '8.6' } },
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=from json(input)" target="InputVariable_1" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'Task_1',
      message: 'Function <from json> requires Camunda >=8.9',
      path: [
        'extensionElements',
        'values',
        0,
        'inputParameters',
        0,
        'source'
      ],
      data: {
        type: ERROR_TYPES.FEEL_EXPRESSION_UNSUPPORTED_FUNCTION,
        node: 'zeebe:Input',
        parentNode: 'Task_1',
        property: 'source'
      }
    }
  }
];

RuleTester.verify('feel', rule, {
  valid,
  invalid
});