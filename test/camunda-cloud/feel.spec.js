const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/feel');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'valid FEEL expression',
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
    name: 'static value',
    moddleElement: createModdle(createProcess(`
      <bpmn:extensionElements>
        <zeebe:taskDefinition retries="5" />
      </bpmn:extensionElements>
      <bpmn:serviceTask id="Task_1" />
    `))
  }
];

const invalid = [
  {
    name: 'invalid FEEL expression',
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
      message: 'Property <source> is not valid FEEL expression',
      path: [
        'extensionElements',
        'values',
        0,
        'outputParameters',
        0,
        'source'
      ],
      error: {
        type: ERROR_TYPES.FEEL_INVALID,
        node: 'zeebe:Output',
        parentNode: 'Task_1',
        property: 'source'
      }
    }
  },
];

RuleTester.verify('feel', rule, {
  valid,
  invalid
});