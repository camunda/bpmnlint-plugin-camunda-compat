const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/ad-hoc-sub-process');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

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
    name: 'ad hoc sub process (with subprocess)',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1">
        <bpmn:subProcess id="SubProcess" />
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'ad hoc sub process (with call activity)',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Subprocess_1">
        <bpmn:callActivity id="CallActivity" />
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
      message: 'Property <completionCondition> only allowed by Camunda 8.8 or newer',
      path: [
        'completionCondition'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
        node: 'Subprocess_1',
        parentNode: null,
        property: 'completionCondition',
        allowedVersion: '8.8'
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
      message: 'Property value of <false> only allowed by Camunda 8.8 or newer',
      path: [
        'cancelRemainingInstances'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'Subprocess_1',
        parentNode: null,
        property: 'cancelRemainingInstances',
        allowedVersion: '8.8'
      }
    }
  },
];

RuleTester.verify('ad-hoc-sub-process', rule, {
  valid,
  invalid
});