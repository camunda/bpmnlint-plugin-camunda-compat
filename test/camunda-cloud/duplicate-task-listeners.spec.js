const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/duplicate-task-listeners');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'service task',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="start" type="com.example.StartListener" />
            <zeebe:taskListener eventType="start" type="com.example.StartListener_2" />
          </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'send task',
    moddleElement: createModdle(createProcess(`
      <bpmn:sendTask id="SendTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="start" type="com.example.StartListener" />
            <zeebe:taskListener eventType="start" type="com.example.StartListener_2" />
          </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:sendTask>
    `))
  },
  {
    name: 'user task',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="start" type="com.example.StartListener" />
            <zeebe:taskListener eventType="start" type="com.example.StartListener_2" />
          </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  },
  {
    name: 'business rule task',
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
            <zeebe:taskListeners>
              <zeebe:taskListener eventType="start" type="com.example.StartListener" />
              <zeebe:taskListener eventType="start" type="com.example.StartListener_2" />
            </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  },
  {
    name: 'script task',
    moddleElement: createModdle(createProcess(`
      <bpmn:scriptTask id="ScriptTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="start" type="com.example.StartListener" />
            <zeebe:taskListener eventType="start" type="com.example.StartListener_2" />
            <zeebe:taskListener eventType="end" type="com.example.StartListener" />
            <zeebe:taskListener eventType="end" type="com.example.StartListener_2" />
          </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:scriptTask>
    `))
  },
  {
    name: 'message throw event',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateThrowEvent id="MessageEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="start" type="com.example.StartListener" />
            <zeebe:taskListener eventType="start" type="com.example.StartListener_2" />
          </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:intermediateThrowEvent>
    `))
  },
  {
    name: 'service task (non-executable process)',
    config: { version: '8.7' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:taskListeners>
              <zeebe:taskListener eventType="start" type="com.example.StartListener" />
              <zeebe:taskListener eventType="start" type="com.example.StartListener_2" />
            </zeebe:taskListeners>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'service task',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="start" type="duplicate" />
            <zeebe:taskListener eventType="start" type="duplicate" />
          </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Properties of type <zeebe:TaskListener> have properties with duplicate values (property <eventType> with duplicate value of <start>, property <type> with duplicate value of <duplicate>)',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUES_DUPLICATED,
        node: 'zeebe:TaskListeners',
        parentNode: 'ServiceTask_1',
        'duplicatedProperties': {
          'eventType': 'start',
          'type': 'duplicate'
        },
        properties: [
          'zeebe:TaskListener',
          'zeebe:TaskListener'
        ],
        propertiesName: 'listeners'
      }
    }
  },
  {
    name: 'service task (multiple duplicates)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="start" type="duplicate" />
            <zeebe:taskListener eventType="start" type="duplicate" />
            <zeebe:taskListener eventType="start" type="duplicate" />
          </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Properties of type <zeebe:TaskListener> have properties with duplicate values (property <eventType> with duplicate value of <start>, property <type> with duplicate value of <duplicate>)',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUES_DUPLICATED,
          node: 'zeebe:TaskListeners',
          parentNode: 'ServiceTask_1',
          'duplicatedProperties': {
            'eventType': 'start',
            'type': 'duplicate'
          },
          properties: [
            'zeebe:TaskListener',
            'zeebe:TaskListener',
            'zeebe:TaskListener'
          ],
          propertiesName: 'listeners'
        }
      },
      {
        id: 'ServiceTask_1',
        message: 'Properties of type <zeebe:TaskListener> have properties with duplicate values (property <eventType> with duplicate value of <start>, property <type> with duplicate value of <duplicate>)',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUES_DUPLICATED,
          node: 'zeebe:TaskListeners',
          parentNode: 'ServiceTask_1',
          'duplicatedProperties': {
            'eventType': 'start',
            'type': 'duplicate'
          },
          properties: [
            'zeebe:TaskListener',
            'zeebe:TaskListener',
            'zeebe:TaskListener'
          ],
          propertiesName: 'listeners'
        }
      }
    ]
  },
  {
    name: 'service task (multiple duplicates)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="start" type="duplicate" />
            <zeebe:taskListener eventType="start" type="duplicate" />
            <zeebe:taskListener eventType="start" type="duplicate_2" />
            <zeebe:taskListener eventType="start" type="duplicate_2" />
          </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Properties of type <zeebe:TaskListener> have properties with duplicate values (property <eventType> with duplicate value of <start>, property <type> with duplicate value of <duplicate>)',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUES_DUPLICATED,
          node: 'zeebe:TaskListeners',
          parentNode: 'ServiceTask_1',
          'duplicatedProperties': {
            'eventType': 'start',
            'type': 'duplicate'
          },
          properties: [
            'zeebe:TaskListener',
            'zeebe:TaskListener'
          ],
          propertiesName: 'listeners'
        }
      },
      {
        id: 'ServiceTask_1',
        message: 'Properties of type <zeebe:TaskListener> have properties with duplicate values (property <eventType> with duplicate value of <start>, property <type> with duplicate value of <duplicate_2>)',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUES_DUPLICATED,
          node: 'zeebe:TaskListeners',
          parentNode: 'ServiceTask_1',
          'duplicatedProperties': {
            'eventType': 'start',
            'type': 'duplicate_2'
          },
          properties: [
            'zeebe:TaskListener',
            'zeebe:TaskListener'
          ],
          propertiesName: 'listeners'
        }
      }
    ]
  },
  {
    name: 'service task (no type)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskListeners>
            <zeebe:taskListener eventType="start" type="" />
            <zeebe:taskListener eventType="start" type="" />
          </zeebe:taskListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Properties of type <zeebe:TaskListener> have properties with duplicate values (property <eventType> with duplicate value of <start>, property <type> with duplicate value of <>)',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUES_DUPLICATED,
        node: 'zeebe:TaskListeners',
        parentNode: 'ServiceTask_1',
        'duplicatedProperties': {
          'eventType': 'start',
          'type': ''
        },
        properties: [
          'zeebe:TaskListener',
          'zeebe:TaskListener'
        ],
        propertiesName: 'listeners'
      }
    }
  }
];

RuleTester.verify('duplicate-task-listeners', rule, {
  valid,
  invalid
});