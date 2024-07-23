const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/duplicate-execution-listeners');

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
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener" />
            <zeebe:executionListener eventType="start" type="com.example.StartListener_2" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'send task',
    moddleElement: createModdle(createProcess(`
      <bpmn:sendTask id="SendTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener" />
            <zeebe:executionListener eventType="start" type="com.example.StartListener_2" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:sendTask>
    `))
  },
  {
    name: 'user task',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener" />
            <zeebe:executionListener eventType="start" type="com.example.StartListener_2" />
          </zeebe:executionListeners>
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
            <zeebe:executionListeners>
              <zeebe:executionListener eventType="start" type="com.example.StartListener" />
              <zeebe:executionListener eventType="start" type="com.example.StartListener_2" />
            </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  },
  {
    name: 'script task',
    moddleElement: createModdle(createProcess(`
      <bpmn:scriptTask id="ScriptTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener" />
            <zeebe:executionListener eventType="start" type="com.example.StartListener_2" />
            <zeebe:executionListener eventType="end" type="com.example.StartListener" />
            <zeebe:executionListener eventType="end" type="com.example.StartListener_2" />
          </zeebe:executionListeners>
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
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener" />
            <zeebe:executionListener eventType="start" type="com.example.StartListener_2" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:intermediateThrowEvent>
    `))
  },
  {
    name: 'service task (non-executable process)',
    config: { version: '8.6' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:executionListeners>
              <zeebe:executionListener eventType="start" type="com.example.StartListener" />
              <zeebe:executionListener eventType="start" type="com.example.StartListener_2" />
            </zeebe:executionListeners>
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
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="duplicate" />
            <zeebe:executionListener eventType="start" type="duplicate" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Duplicate execution listener with event type <start> and job type <duplicate>',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
        node: 'zeebe:ExecutionListeners',
        parentNode: 'ServiceTask_1',
        duplicatedProperty: 'type',
        duplicatedPropertyValue: 'duplicate',
        properties: [
          'zeebe:ExecutionListener',
          'zeebe:ExecutionListener'
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
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="duplicate" />
            <zeebe:executionListener eventType="start" type="duplicate" />
            <zeebe:executionListener eventType="start" type="duplicate" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Duplicate execution listener with event type <start> and job type <duplicate>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: 'zeebe:ExecutionListeners',
          parentNode: 'ServiceTask_1',
          duplicatedProperty: 'type',
          duplicatedPropertyValue: 'duplicate',
          properties: [
            'zeebe:ExecutionListener',
            'zeebe:ExecutionListener',
            'zeebe:ExecutionListener'
          ],
          propertiesName: 'listeners'
        }
      },
      {
        id: 'ServiceTask_1',
        message: 'Duplicate execution listener with event type <start> and job type <duplicate>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: 'zeebe:ExecutionListeners',
          parentNode: 'ServiceTask_1',
          duplicatedProperty: 'type',
          duplicatedPropertyValue: 'duplicate',
          properties: [
            'zeebe:ExecutionListener',
            'zeebe:ExecutionListener',
            'zeebe:ExecutionListener'
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
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="duplicate" />
            <zeebe:executionListener eventType="start" type="duplicate" />
            <zeebe:executionListener eventType="start" type="duplicate_2" />
            <zeebe:executionListener eventType="start" type="duplicate_2" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Duplicate execution listener with event type <start> and job type <duplicate>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: 'zeebe:ExecutionListeners',
          parentNode: 'ServiceTask_1',
          duplicatedProperty: 'type',
          duplicatedPropertyValue: 'duplicate',
          properties: [
            'zeebe:ExecutionListener',
            'zeebe:ExecutionListener'
          ],
          propertiesName: 'listeners'
        }
      },
      {
        id: 'ServiceTask_1',
        message: 'Duplicate execution listener with event type <start> and job type <duplicate_2>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: 'zeebe:ExecutionListeners',
          parentNode: 'ServiceTask_1',
          duplicatedProperty: 'type',
          duplicatedPropertyValue: 'duplicate_2',
          properties: [
            'zeebe:ExecutionListener',
            'zeebe:ExecutionListener'
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
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="" />
            <zeebe:executionListener eventType="start" type="" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Duplicate execution listener with event type <start> and job type <>',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
        node: 'zeebe:ExecutionListeners',
        parentNode: 'ServiceTask_1',
        duplicatedProperty: 'type',
        duplicatedPropertyValue: '',
        properties: [
          'zeebe:ExecutionListener',
          'zeebe:ExecutionListener'
        ],
        propertiesName: 'listeners'
      }
    }
  }
];

RuleTester.verify('duplicate-execution-listeners', rule, {
  valid,
  invalid
});