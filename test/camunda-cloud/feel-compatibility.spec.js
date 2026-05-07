const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/feel-compatibility');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
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
    name: 'from json (non-executable process)',
    config: { version: '8.6', engines: { camunda: '8.6' } },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:input source="=from json(input)" target="InputVariable_1" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:process>
    `))
  }
];

const invalid = [
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
      message: 'FEEL function <from json> requires Camunda >=8.9',
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

RuleTester.verify('feel-compatibility', rule, {
  valid,
  invalid
});
