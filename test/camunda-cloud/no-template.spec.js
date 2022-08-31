const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/no-template');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'service task',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
    `))
  }
];

const invalid = [
  {
    name: 'service task (template)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" zeebe:modelerTemplate="foo" />
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <bpmn:ServiceTask> must not have property <modelerTemplate>',
      path: [
        'modelerTemplate'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
        node: 'ServiceTask_1',
        parentNode: null,
        property: 'modelerTemplate'
      }
    }
  },
  {
    name: 'service task (REST connector)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" zeebe:modelerTemplate="io.camunda.connectors.HttpJson.v1.noAuth" />
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <bpmn:ServiceTask> must not have property <modelerTemplate>',
      path: [
        'modelerTemplate'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
        node: 'ServiceTask_1',
        parentNode: null,
        property: 'modelerTemplate'
      }
    }
  }
];

RuleTester.verify('no-template', rule, {
  valid,
  invalid
});