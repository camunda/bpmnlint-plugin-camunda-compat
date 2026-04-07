const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/no-execution-listener-headers');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'execution listener without headers',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  },
  {
    name: 'no execution listeners',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1" />
    `))
  }
];

const invalid = [
  {
    name: 'execution listener with headers (Camunda 8.9)',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener">
              <zeebe:taskHeaders>
                <zeebe:header key="authToken" value="abc" />
              </zeebe:taskHeaders>
            </zeebe:executionListener>
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Property <zeebe:TaskHeaders> of <zeebe:ExecutionListener> only allowed by Camunda 8.10',
      path: [
        'extensionElements',
        'values',
        0,
        'listeners',
        0,
        'headers'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
        node: 'zeebe:ExecutionListener',
        parentNode: 'UserTask_1',
        property: 'headers',
        allowedVersion: '8.10'
      }
    }
  }
];

RuleTester.verify('no-execution-listener-headers', rule, {
  valid,
  invalid
});
