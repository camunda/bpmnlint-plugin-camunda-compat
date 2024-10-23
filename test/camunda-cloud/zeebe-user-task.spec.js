const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/zeebe-user-task');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'zeebe user task (Camunda 8.7)',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:userTask />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  }
];

const invalid = [
  {
    name: 'job worker user task (Camunda 8.7)',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1" />
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <bpmn:UserTask> must have one extension element of type <zeebe:UserTask>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'UserTask_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:UserTask'
      }
    }
  }
];

RuleTester.verify('zeebe-user-task', rule, {
  valid,
  invalid
});