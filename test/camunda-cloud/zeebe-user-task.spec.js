const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/zeebe-user-task');

const {
  createModdle,
  createProcess,
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'UserTask with one zeebe:UserTask extension element',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:UserTask />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  }
];

const invalid = [
  {
    name: 'UserTask with no zeebe:UserTask extension element (invalid if required)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_5">
        <bpmn:extensionElements>
          <zeebe:OtherExtension />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_5',
      message: 'Element of type <bpmn:UserTask> must have one extension element of type <zeebe:UserTask>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'UserTask_5',
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
