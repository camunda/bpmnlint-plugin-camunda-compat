const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/execution-listener');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'execution listener with type',
    config: { version: '8.6' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  }
];

const invalid = [
  {
    name: 'execution listener with empty type',
    config: { version: '8.6' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:ExecutionListener> must have property <type>',
      path: [
        'extensionElements',
        'values',
        0,
        'listeners',
        0,
        'type'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:ExecutionListener',
        parentNode: 'UserTask_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'execution listener with no type',
    config: { version: '8.6' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:ExecutionListener> must have property <type>',
      path: [
        'extensionElements',
        'values',
        0,
        'listeners',
        0,
        'type'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:ExecutionListener',
        parentNode: 'UserTask_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'multiple execution listeners with no type',
    config: { version: '8.6' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" />
            <zeebe:executionListener eventType="start" />
            <zeebe:executionListener eventType="start" />
            <zeebe:executionListener eventType="start" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: [
      {
        id: 'UserTask_1',
        message: 'Element of type <zeebe:ExecutionListener> must have property <type>',
        path: [
          'extensionElements',
          'values',
          0,
          'listeners',
          0,
          'type'
        ],
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node: 'zeebe:ExecutionListener',
          parentNode: 'UserTask_1',
          requiredProperty: 'type'
        }
      },
      {
        id: 'UserTask_1',
        message: 'Element of type <zeebe:ExecutionListener> must have property <type>',
        path: [
          'extensionElements',
          'values',
          0,
          'listeners',
          1,
          'type'
        ],
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node: 'zeebe:ExecutionListener',
          parentNode: 'UserTask_1',
          requiredProperty: 'type'
        }
      },
      {
        id: 'UserTask_1',
        message: 'Element of type <zeebe:ExecutionListener> must have property <type>',
        path: [
          'extensionElements',
          'values',
          0,
          'listeners',
          2,
          'type'
        ],
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node: 'zeebe:ExecutionListener',
          parentNode: 'UserTask_1',
          requiredProperty: 'type'
        }
      },
      {
        id: 'UserTask_1',
        message: 'Element of type <zeebe:ExecutionListener> must have property <type>',
        path: [
          'extensionElements',
          'values',
          0,
          'listeners',
          3,
          'type'
        ],
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node: 'zeebe:ExecutionListener',
          parentNode: 'UserTask_1',
          requiredProperty: 'type'
        }
      }
    ]
  }
];

RuleTester.verify('execution-listener', rule, {
  valid,
  invalid
});