const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/element-type');

const {
  addConfig,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  ...require('./camunda-cloud-8-1-element-type.spec').valid,
  {
    name: 'task',
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  },
  {
    name: 'link intermediate catch event',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:linkEventDefinition id="LinkEventDefinition_1" name="foo" />
      </bpmn:intermediateCatchEvent>
    `))
  },
  {
    name: 'link intermediate throw event',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateThrowEvent id="IntermediateCatchEvent_1">
        <bpmn:linkEventDefinition id="LinkEventDefinition_1" name="foo" />
      </bpmn:intermediateThrowEvent>
    `))
  }
];

const invalid = [
  {
    name: 'boundary event (no event definition)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="ServiceTask_1" />
    `)),
    report: {
      id: 'BoundaryEvent_1',
      message: 'Element of type <bpmn:BoundaryEvent> with no event definition not allowed',
      path: null,
      data: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'BoundaryEvent_1',
        parentNode: null,
        allowedVersion: null
      }
    }
  },
  {
    name: 'complex gateway',
    moddleElement: createModdle(createProcess('<bpmn:complexGateway id="ComplexGateway_1" />')),
    report: {
      id: 'ComplexGateway_1',
      message: 'Element of type <bpmn:ComplexGateway> not allowed',
      path: null,
      data: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'ComplexGateway_1',
        parentNode: null,
        allowedVersion: null
      }
    }
  },
  {
    name: 'intermediate catch event',
    moddleElement: createModdle(createProcess('<bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1" />')),
    report: {
      id: 'IntermediateCatchEvent_1',
      message: 'Element of type <bpmn:IntermediateCatchEvent> with no event definition not allowed',
      path: null,
      data: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'IntermediateCatchEvent_1',
        parentNode: null,
        allowedVersion: null
      }
    }
  }
];

RuleTester.verify('camunda-cloud-8-2-element-type', rule, {
  valid: addConfig(valid, { version: '8.2' }),
  invalid: addConfig(invalid, { version: '8.2' })
});
