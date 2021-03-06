const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/user-task-form');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'user task (user task form)',
    moddleElement: createModdle(createProcess(`
      <bpmn:extensionElements>
        <zeebe:userTaskForm id="userTaskForm_1">{}</zeebe:userTaskForm>
      </bpmn:extensionElements>
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition formKey="camunda-forms:bpmn:userTaskForm_1" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  },
  {
    name: 'user task',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1" />
    `))
  }
];

const invalid = [
  {
    name: 'user task (no form key)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:FormDefinition> must have property <formKey>',
      path: [
        'extensionElements',
        'values',
        0,
        'formKey'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        requiredProperty: 'formKey'
      }
    }
  },
  {
    name: 'user task (empty user task form)',
    moddleElement: createModdle(createProcess(`
      <bpmn:extensionElements>
        <zeebe:userTaskForm id="userTaskForm_1"></zeebe:userTaskForm>
      </bpmn:extensionElements>
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition formKey="camunda-forms:bpmn:userTaskForm_1" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:UserTaskForm> must have property <body>',
      path: [
        'rootElements',
        0,
        'extensionElements',
        'values',
        0,
        'body'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:UserTaskForm',
        parentNode: 'UserTask_1',
        requiredProperty: 'body'
      }
    }
  }
];

RuleTester.verify('user-task-form', rule, {
  valid,
  invalid
});