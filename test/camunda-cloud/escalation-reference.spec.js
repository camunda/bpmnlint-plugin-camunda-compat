const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/escalation-reference');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'end event (escalation)',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:escalationEventDefinition id="EscalationEventDefinition_1" escalationRef="Escalation_1" />
        </bpmn:endEvent>
      </bpmn:process>
      <bpmn:escalation id="Escalation_1" escalationCode="foo" />
    `))
  },
  {
    name: 'end event (message)',
    moddleElement: createModdle(createProcess(`
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
      </bpmn:endEvent>
    `))
  },
  {
    name: 'end event',
    moddleElement: createModdle(createProcess('<bpmn:endEvent id="EndEvent_1" />'))
  },
  {
    name: 'task',
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  },
  {
    name: 'escalation end event (no escalation reference) (non-executable process)',
    config: { version: '8.2' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:escalationEventDefinition id="EscalationEventDefinition_1" />
        </bpmn:endEvent>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'escalation end event (no escalation reference)',
    moddleElement: createModdle(createProcess(`
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:escalationEventDefinition id="EscalationEventDefinition_1" />
      </bpmn:endEvent>
    `)),
    report: {
      id: 'EndEvent_1',
      message: 'Element of type <bpmn:EscalationEventDefinition> must have property <escalationRef>',
      path: [
        'eventDefinitions',
        0,
        'escalationRef'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'EscalationEventDefinition_1',
        parentNode: 'EndEvent_1',
        requiredProperty: 'escalationRef'
      }
    }
  },
  {
    name: 'escalation end event (no escalation code)',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:escalationEventDefinition id="EscalationEventDefinition_1" escalationRef="Escalation_1" />
        </bpmn:endEvent>
      </bpmn:process>
      <bpmn:escalation id="Escalation_1" />
    `)),
    report: {
      id: 'EndEvent_1',
      message: 'Element of type <bpmn:Escalation> must have property <escalationCode>',
      path: [
        'rootElements',
        1,
        'escalationCode'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'Escalation_1',
        parentNode: 'EndEvent_1',
        requiredProperty: 'escalationCode'
      }
    }
  }
];

RuleTester.verify('escalation-reference', rule, {
  valid,
  invalid
});