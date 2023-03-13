const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/task-schedule');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'user task (due date)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:TaskSchedule dueDate="2022-09-21T00:00:00Z" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  },
  {
    name: 'user task (follow-up date)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:TaskSchedule followUpDate="2022-09-21T00:00:00Z" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  }
];

const invalid = [
  {
    name: 'user task (invalid due date)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:TaskSchedule dueDate="invalid" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Expression value of <invalid> not allowed',
      path: [
        'extensionElements',
        'values',
        0,
        'dueDate'
      ],
      data: {
        type: ERROR_TYPES.EXPRESSION_VALUE_NOT_ALLOWED,
        node: 'zeebe:TaskSchedule',
        parentNode: 'UserTask_1',
        property: 'dueDate'
      }
    }
  },
  {
    name: 'user task (invalid follow-up date)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:TaskSchedule followUpDate="invalid" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Expression value of <invalid> not allowed',
      path: [
        'extensionElements',
        'values',
        0,
        'followUpDate'
      ],
      data: {
        type: ERROR_TYPES.EXPRESSION_VALUE_NOT_ALLOWED,
        node: 'zeebe:TaskSchedule',
        parentNode: 'UserTask_1',
        property: 'followUpDate'
      }
    }
  }
];

RuleTester.verify('task-schedule', rule, {
  valid,
  invalid
});