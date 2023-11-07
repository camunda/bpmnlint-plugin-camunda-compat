const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/user-task-form');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'user task (user task form)',
    config: { version: '8.2' },
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
    config: { version: '8.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1" />
    `))
  },
  {
    name: 'user task (no form key) (non-executable process)',
    config: { version: '8.2' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:userTask id="UserTask_1">
          <bpmn:extensionElements>
            <zeebe:formDefinition />
          </bpmn:extensionElements>
        </bpmn:userTask>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'user task (no form key) (Camunda 8.2)',
    config: { version: '8.2' },
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
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        requiredProperty: 'formKey'
      }
    }
  },
  {
    name: 'user task (empty form key) (Camunda 8.2)',
    config: { version: '8.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition formKey="" />
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
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        requiredProperty: 'formKey'
      }
    }
  },
  {
    name: 'user task (no form key or form ID) (Camunda 8.3)',
    config: { version: '8.3' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:FormDefinition> must have property <formKey> or <formId>',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        requiredProperty: [
          'formKey',
          'formId'
        ]
      }
    }
  },
  {
    name: 'user task (empty form key) (Camunda 8.3)',
    config: { version: '8.3' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition formKey="" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:FormDefinition> must have property <formKey> or <formId>',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        requiredProperty: [
          'formKey',
          'formId'
        ]
      }
    }
  },
  {
    name: 'user task (empty form ID) (Camunda 8.3)',
    config: { version: '8.3' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition formId="" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:FormDefinition> must have property <formKey> or <formId>',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        requiredProperty: [
          'formKey',
          'formId'
        ]
      }
    }
  },
  {
    name: 'user task (form ID) (Camunda 8.2)',
    config: { version: '8.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition formId="foo" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Property <formId> only allowed by Camunda 8.3 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'formId'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        property: 'formId',
        allowedVersion: '8.3'
      }
    }
  },
  {
    name: 'user task (form key and form ID) (Camunda 8.3)',
    config: { version: '8.3' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition formKey="foo" formId="bar" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:FormDefinition> must have property <formKey> or <formId>',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        requiredProperty: [
          'formKey',
          'formId'
        ]
      }
    }
  },
  {
    name: 'user task (empty user task form) (Camunda 8.2)',
    config: { version: '8.2' },
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
      data: {
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