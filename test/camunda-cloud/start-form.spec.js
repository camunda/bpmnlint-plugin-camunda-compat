const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/start-form');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'Start Event',
    config: { version: '8.1' },
    moddleElement: createModdle(createProcess(`
        <bpmn:startEvent id="StartEvent_1"></bpmn:startEvent>
    `))
  },
  {
    name: 'Start Event with formDefinition (8.3)',
    config: { version: '8.3' },
    moddleElement: createModdle(createProcess(`
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:extensionElements>
        <zeebe:formDefinition formKey="camunda-forms:bpmn:userTaskForm_1emt8e4" />
      </bpmn:extensionElements>
    </bpmn:startEvent>
    `))
  }
];

const invalid = [
  {
    name: 'Start Event with formDefinition',
    config: { version: '8.1' },
    moddleElement: createModdle(createProcess(`
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:extensionElements>
        <zeebe:formDefinition formKey="camunda-forms:bpmn:userTaskForm_1emt8e4" />
      </bpmn:extensionElements>
    </bpmn:startEvent>
    `)),
    report: {
      id: 'StartEvent_1',
      message: 'Extension element of type <zeebe:FormDefinition> only allowed by Camunda Platform 8.3',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
        node: 'StartEvent_1',
        parentNode: null,
        extensionElement: 'zeebe:FormDefinition',
        allowedVersion: '8.3'
      }
    }
  }
];

RuleTester.verify('start-form', rule, {
  valid,
  invalid
});