const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/history-time-to-live');

const {
  createDefinitions,
  createModdle
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'process (history time to live)',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true" camunda:historyTimeToLive="123" />
    `), 'platform'),
  },
  {
    name: 'non-executable process (history time to live)',
    config: { platform: 'camunda-platform' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" />
    `), 'platform'),
  }
];

const invalid = [
  {
    name: 'process (no history time to live)',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true" />
    `), 'platform'),
    report: {
      id: 'Process_1',
      message: 'Element of type <bpmn:Process> must have property <historyTimeToLive>',
      path: [
        'historyTimeToLive'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'Process_1',
        parentNode: null,
        requiredProperty: 'historyTimeToLive'
      }
    }
  }
];

RuleTester.verify('history-time-to-live', rule, {
  valid,
  invalid
});