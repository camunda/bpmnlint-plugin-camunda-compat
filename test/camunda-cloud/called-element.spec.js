const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/called-element');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'call activity',
    moddleElement: createModdle(createProcess(`
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:extensionElements>
            <zeebe:calledElement processId="foo" />
          </bpmn:extensionElements>
        </bpmn:callActivity>
    `))
  },
  {
    name: 'task',
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  }
];

const invalid = [
  {
    name: 'call activity (no called element)',
    moddleElement: createModdle(createProcess('<bpmn:callActivity id="CallActivity_1" />')),
    report: {
      id: 'CallActivity_1',
      message: 'Element of type <bpmn:CallActivity> must have one extension element of type <zeebe:CalledElement>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'CallActivity_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:CalledElement'
      }
    }
  },
  {
    name: 'call activity (no process ID)',
    moddleElement: createModdle(createProcess(`
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:extensionElements>
            <zeebe:calledElement />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      `)),
    report: {
      id: 'CallActivity_1',
      message: 'Element of type <zeebe:CalledElement> must have property <processId>',
      path: [
        'extensionElements',
        'values',
        0,
        'processId'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:CalledElement',
        parentNode: 'CallActivity_1',
        requiredProperty: 'processId'
      }
    }
  }
];

RuleTester.verify('called-element', rule, {
  valid,
  invalid
});