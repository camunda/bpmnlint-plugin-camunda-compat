const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/task-listener');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'task listener with type',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="assignment" type="com.example.AssignmentListener" />
          </zeebe:taskListeners>
          <zeebe:userTask />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  }
];

const invalid = [
  {
    name: 'task listener not in zeebe:UserTask',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="complete" type="complete_listener" />
          </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <bpmn:UserTask> must have one extension element of type <zeebe:UserTask>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'UserTask_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:UserTask'
      }
    }
  },
  {
    name: 'task listener with empty type',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="complete" type="" />
          </zeebe:taskListeners>
          <zeebe:userTask />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:TaskListener> must have property <type>',
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
        node: 'zeebe:TaskListener',
        parentNode: 'UserTask_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'task listener with no type',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="assignment" />
          </zeebe:taskListeners>
          <zeebe:userTask />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:TaskListener> must have property <type>',
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
        node: 'zeebe:TaskListener',
        parentNode: 'UserTask_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'multiple task listeners with no type',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="complete" />
            <zeebe:taskListener eventType="complete" />
            <zeebe:taskListener eventType="complete" />
            <zeebe:taskListener eventType="complete" />
          </zeebe:taskListeners>
          <zeebe:userTask />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: [
      {
        id: 'UserTask_1',
        message: 'Element of type <zeebe:TaskListener> must have property <type>',
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
          node: 'zeebe:TaskListener',
          parentNode: 'UserTask_1',
          requiredProperty: 'type'
        }
      },
      {
        id: 'UserTask_1',
        message: 'Element of type <zeebe:TaskListener> must have property <type>',
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
          node: 'zeebe:TaskListener',
          parentNode: 'UserTask_1',
          requiredProperty: 'type'
        }
      },
      {
        id: 'UserTask_1',
        message: 'Element of type <zeebe:TaskListener> must have property <type>',
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
          node: 'zeebe:TaskListener',
          parentNode: 'UserTask_1',
          requiredProperty: 'type'
        }
      },
      {
        id: 'UserTask_1',
        message: 'Element of type <zeebe:TaskListener> must have property <type>',
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
          node: 'zeebe:TaskListener',
          parentNode: 'UserTask_1',
          requiredProperty: 'type'
        }
      }
    ]
  }
];

RuleTester.verify('task-listener', rule, {
  valid,
  invalid
});