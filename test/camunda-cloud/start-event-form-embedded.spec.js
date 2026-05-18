const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/start-event-form-embedded');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/error-types');

const valid = [
  {
    name: 'start event with linked form',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition formId="myFormId" />
        </bpmn:extensionElements>
      </bpmn:startEvent>
    `))
  },
  {
    name: 'start event without form',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1" />
    `))
  },
  {
    name: 'user task with embedded form (not affected)',
    config: { version: '8.9' },
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
  }
];

const invalid = [
  {
    name: 'start event with embedded form',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(`
      <bpmn:extensionElements>
        <zeebe:userTaskForm id="userTaskForm_1">{}</zeebe:userTaskForm>
      </bpmn:extensionElements>
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition formKey="camunda-forms:bpmn:userTaskForm_1" />
        </bpmn:extensionElements>
      </bpmn:startEvent>
    `)),
    report: {
      id: 'StartEvent_1',
      message: 'Embedded forms on start events are deprecated; use a linked form instead',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_DEPRECATED,
        node: 'zeebe:FormDefinition',
        parentNode: 'StartEvent_1',
        property: 'formKey'
      }
    }
  }
];

RuleTester.verify('start-event-form-embedded', rule, {
  valid,
  invalid
});
