const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/no-task-schedule');

const {
  createModdle,
  createProcess,
  createDefinitions
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'user task',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1" />
    `))
  },
  {
    name: 'user task (non-executable process)',
    config: { version: '8.2' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:userTask id="UserTask_1">
          <bpmn:extensionElements>
            <zeebe:TaskSchedule dueDate="2022-09-21T00:00:00Z" />
          </bpmn:extensionElements>
        </bpmn:userTask>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'user task',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:TaskSchedule dueDate="2022-09-21T00:00:00Z" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Extension element of type <zeebe:TaskSchedule> only allowed by Camunda Platform 8.2',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
        node: 'UserTask_1',
        parentNode: null,
        extensionElement: 'zeebe:TaskSchedule',
        allowedVersion: '8.2'
      }
    }
  }
];

RuleTester.verify('no-task-schedule', rule, {
  valid,
  invalid
});