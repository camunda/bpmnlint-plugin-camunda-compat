const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-platform/history-time-to-live');

const {
  createDefinitions,
  createModdleCamundaPlatform: createModdle
} = require('../helper');

const valid = [
  {
    name: 'process (history time to live)',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true" camunda:historyTimeToLive="123" />
    `)),
  },
  {
    name: 'non-executable process (history time to live)',
    config: { platform: 'camunda-platform' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" />
    `)),
  }
];

const invalid = [
  {
    name: 'process (no history time to live)',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true" />
    `)),
    report: {
      id: 'Process_1',
      message: 'Property <historyTimeToLive> should be configured on <bpmn:Process> or engine level.',
      path: [
        'historyTimeToLive'
      ]
    }
  }
];

RuleTester.verify('history-time-to-live', rule, {
  valid,
  invalid
});