const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/ad-hoc-sub-process-activity');

const {
  createModdle,
  createProcess
} = require('../helper');

const valid = [
  {
    name: 'ad hoc sub process (with task)',
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1">
        <bpmn:task id="Task_1" />
      </bpmn:adHocSubProcess>
    `))
  }
];

const invalid = [
  {
    name: 'ad hoc sub process (empty)',
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1">
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Subprocess_1',
      message: 'Element of type <bpmn:AdHocSubProcess> must contain at least one activity',
      data: {
        node: 'Subprocess_1',
        parentNode: null
      }
    }
  },
  {
    name: 'ad hoc sub process (no activity)',
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1">
        <bpmn:exclusiveGateway id="Gateway_1" />
        <bpmn:intermediateThrowEvent id="Event_1" />
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Subprocess_1',
      message: 'Element of type <bpmn:AdHocSubProcess> must contain at least one activity',
      data: {
        node: 'Subprocess_1',
        parentNode: null
      }
    }
  }
];

RuleTester.verify('called-element', rule, {
  valid,
  invalid
});