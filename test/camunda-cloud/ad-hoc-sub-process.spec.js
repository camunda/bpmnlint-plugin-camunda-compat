const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/ad-hoc-sub-process');

const {
  createModdle,
  createProcess
} = require('../helper');

const valid = [
  {
    name: 'ad hoc sub process (with task)',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1">
        <bpmn:task id="Task_1" />
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'ad hoc sub process (with completionCondition)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1">
        <bpmn:task id="Task_1" />
        <bpmn:completionCondition xsi:type="bpmn:tFormalExpression">=myCondition</bpmn:completionCondition>
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'ad hoc sub process (with cancelRemainingInstances attribute)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1" cancelRemainingInstances="false">
        <bpmn:task id="Task_1" />
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'ad hoc sub process (with completionCondition and cancelRemainingInstances attribute)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1" cancelRemainingInstances="false">
        <bpmn:task id="Task_1" />
        <bpmn:completionCondition xsi:type="bpmn:tFormalExpression">=myCondition</bpmn:completionCondition>
      </bpmn:adHocSubProcess>
    `))
  },
];

const invalid = [
  {
    name: 'ad hoc sub process (empty)',
    config: { version: '8.7' },
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
    config: { version: '8.7' },
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
  },
  {
    name: 'ad hoc sub process (with completionCondition)',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1">
        <bpmn:task id="Task_1" />
        <bpmn:completionCondition xsi:type="bpmn:tFormalExpression">=myCondition</bpmn:completionCondition>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Subprocess_1',
      message: 'Element of type <bpmn:completionCondition> within <bpmn:AdHocSubProcess> only allowed by Camunda 8.8 or newer',
      data: {
        node: 'Subprocess_1',
        parentNode: null
      }
    }
  },
  {
    name: 'ad hoc sub process (with cancelRemainingInstances attribute)',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1" cancelRemainingInstances="false">
        <bpmn:task id="Task_1" />
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Subprocess_1',
      message: 'Element of type <bpmn:AdHocSubProcess> with property <cancelRemainingInstances> only allowed by Camunda 8.8 or newer',
      data: {
        node: 'Subprocess_1',
        parentNode: null
      }
    }
  },
];

RuleTester.verify('ad-hoc-sub-process', rule, {
  valid,
  invalid
});