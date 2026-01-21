const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/conditional-event');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'conditional event with valid variableNames (single)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:conditionalEventDefinition id="ConditionalEventDefinition_1">
          <bpmn:extensionElements>
            <zeebe:conditionalFilter variableNames="foo" />
          </bpmn:extensionElements>
        </bpmn:conditionalEventDefinition>
      </bpmn:startEvent>
    `))
  },
  {
    name: 'conditional event with valid variableNames (multiple)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:conditionalEventDefinition id="ConditionalEventDefinition_1">
          <bpmn:extensionElements>
            <zeebe:conditionalFilter variableNames="foo,bar" />
          </bpmn:extensionElements>
        </bpmn:conditionalEventDefinition>
      </bpmn:startEvent>
    `))
  },
  {
    name: 'conditional event with valid variableNames (with spaces)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:conditionalEventDefinition id="ConditionalEventDefinition_1">
          <bpmn:extensionElements>
            <zeebe:conditionalFilter variableNames="foo, bar" />
          </bpmn:extensionElements>
        </bpmn:conditionalEventDefinition>
      </bpmn:startEvent>
    `))
  },
  {
    name: 'conditional event with empty variableNames',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:conditionalEventDefinition id="ConditionalEventDefinition_1">
          <bpmn:extensionElements>
            <zeebe:conditionalFilter variableNames="" />
          </bpmn:extensionElements>
        </bpmn:conditionalEventDefinition>
      </bpmn:startEvent>
    `))
  },
  {
    name: 'conditional event without variableNames',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:conditionalEventDefinition id="ConditionalEventDefinition_1">
          <bpmn:extensionElements>
            <zeebe:conditionalFilter />
          </bpmn:extensionElements>
        </bpmn:conditionalEventDefinition>
      </bpmn:startEvent>
    `))
  },
  {
    name: 'conditional event without extension elements',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:conditionalEventDefinition id="ConditionalEventDefinition_1" />
      </bpmn:startEvent>
    `))
  }
];

const invalid = [
  {
    name: 'conditional event with invalid variableNames (trailing comma)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:conditionalEventDefinition id="ConditionalEventDefinition_1">
          <bpmn:extensionElements>
            <zeebe:conditionalFilter variableNames="foo," />
          </bpmn:extensionElements>
        </bpmn:conditionalEventDefinition>
      </bpmn:startEvent>
    `)),
    report: {
      id: 'StartEvent_1',
      message: 'Variable names must be a comma-separated list',
      path: [ 'extensionElements', 'values', 'variableNames' ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_INVALID,
        node: 'StartEvent_1',
        parentNode: 'StartEvent_1',
        property: 'variableNames'
      }
    }
  },
  {
    name: 'conditional event with invalid variableNames (starts with number)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:conditionalEventDefinition id="ConditionalEventDefinition_1">
          <bpmn:extensionElements>
            <zeebe:conditionalFilter variableNames="123foo" />
          </bpmn:extensionElements>
        </bpmn:conditionalEventDefinition>
      </bpmn:startEvent>
    `)),
    report: {
      id: 'StartEvent_1',
      message: 'Variable name "123foo" is not a valid variable identifier',
      path: [ 'extensionElements', 'values', 'variableNames' ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_INVALID,
        node: 'StartEvent_1',
        parentNode: 'StartEvent_1',
        property: 'variableNames'
      }
    }
  },
  {
    name: 'conditional event with invalid variableNames (spaces)',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:conditionalEventDefinition id="ConditionalEventDefinition_1">
          <bpmn:extensionElements>
            <zeebe:conditionalFilter variableNames="foo bar" />
          </bpmn:extensionElements>
        </bpmn:conditionalEventDefinition>
      </bpmn:startEvent>
    `)),
    report: {
      id: 'StartEvent_1',
      message: 'Variable name "foo bar" is not a valid variable identifier',
      path: [ 'extensionElements', 'values', 'variableNames' ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_INVALID,
        node: 'StartEvent_1',
        parentNode: 'StartEvent_1',
        property: 'variableNames'
      }
    }
  }
];

RuleTester.verify('conditional-event', rule, {
  valid,
  invalid
});
