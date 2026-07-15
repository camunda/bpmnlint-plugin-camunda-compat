const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/called-element');

const {
  createDefinitions,
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
  },
  {
    name: 'call activity (non-executable process)',
    config: { version: '8.2' },
    moddleElement: createModdle(createDefinitions(`
    <bpmn:process id="Process_1">
      <bpmn:callActivity id="CallActivity_1" />
    </bpmn:process>
    `))
  },
  {
    name: 'call activity (empty business ID)',
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement processId="foo" businessId="" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `))
  },
  {
    name: 'call activity (business ID FEEL expression, not length-checked)',
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement processId="foo" businessId="=${ 'a'.repeat(300) }" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `))
  },
  {
    name: 'call activity (literal business ID shorter than 256 characters)',
    config: { version: '8.10' },
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement processId="foo" businessId="order-123" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `))
  },
  {
    name: 'call activity (literal business ID before 8.10, flagged by no-business-id instead)',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement processId="foo" businessId="${ 'a'.repeat(300) }" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `))
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
  },
  {
    name: 'call activity (literal business ID with 256 characters)',
    config: { version: '8.10' },
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement processId="foo" businessId="${ 'a'.repeat(256) }" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `)),
    report: {
      id: 'CallActivity_1',
      message: `Property value of <${ 'a'.repeat(10) }...> not allowed`,
      path: [
        'extensionElements',
        'values',
        0,
        'businessId'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'zeebe:CalledElement',
        parentNode: 'CallActivity_1',
        property: 'businessId'
      }
    }
  }
];

RuleTester.verify('called-element', rule, {
  valid,
  invalid
});