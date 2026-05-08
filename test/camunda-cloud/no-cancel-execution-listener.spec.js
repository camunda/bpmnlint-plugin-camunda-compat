const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/no-cancel-execution-listener');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'process with start and end execution listeners',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(`
      <bpmn:extensionElements>
        <zeebe:executionListeners>
          <zeebe:executionListener eventType="start" type="com.example.StartListener" />
          <zeebe:executionListener eventType="end" type="com.example.EndListener" />
        </zeebe:executionListeners>
      </bpmn:extensionElements>
    `))
  },
  {
    name: 'process without execution listeners',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(''))
  },
  {
    name: 'cancel execution listener (non-executable process)',
    config: { version: '8.9' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="cancel" type="com.example.CancelListener" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'process with cancel execution listener (Camunda 8.9)',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(`
      <bpmn:extensionElements>
        <zeebe:executionListeners>
          <zeebe:executionListener eventType="cancel" type="com.example.CancelListener" />
        </zeebe:executionListeners>
      </bpmn:extensionElements>
    `)),
    report: {
      id: 'Process_1',
      message: 'Property value of <cancel> only allowed by Camunda 8.10 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'listeners',
        0,
        'eventType'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'zeebe:ExecutionListener',
        parentNode: 'Process_1',
        property: 'eventType',
        allowedVersion: '8.10'
      }
    }
  },
  {
    name: 'process with cancel listener mixed with start listener (Camunda 8.9)',
    config: { version: '8.9' },
    moddleElement: createModdle(createProcess(`
      <bpmn:extensionElements>
        <zeebe:executionListeners>
          <zeebe:executionListener eventType="start" type="com.example.StartListener" />
          <zeebe:executionListener eventType="cancel" type="com.example.CancelListener" />
        </zeebe:executionListeners>
      </bpmn:extensionElements>
    `)),
    report: {
      id: 'Process_1',
      message: 'Property value of <cancel> only allowed by Camunda 8.10 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'listeners',
        1,
        'eventType'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'zeebe:ExecutionListener',
        parentNode: 'Process_1',
        property: 'eventType',
        allowedVersion: '8.10'
      }
    }
  }
];

RuleTester.verify('no-cancel-execution-listener', rule, {
  valid,
  invalid
});
