const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/element-type');

const elementTypeConfig = require('../../rules/element-type/config');

const {
  addConfig,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  ...require('./camunda-cloud-1-2-element-type.spec').valid,
  {
    name: 'inclusive gateway',
    moddleElement: createModdle(createProcess(`
      <bpmn:inclusiveGateway id="InclusiveGateway_1" />
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
      message: 'Element of type <bpmn:BoundaryEvent> must have property <eventDefinitions>',
      path: [
        'eventDefinitions'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'BoundaryEvent_1',
        parentNode: null,
        requiredProperty: 'eventDefinitions'
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
      error: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'ComplexGateway_1',
        parentNode: null
      }
    }
  },
  {
    name: 'intermediate catch event',
    moddleElement: createModdle(createProcess('<bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1" />')),
    report: {
      id: 'IntermediateCatchEvent_1',
      message: 'Element of type <bpmn:IntermediateCatchEvent> must have property <eventDefinitions>',
      path: [
        'eventDefinitions'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'IntermediateCatchEvent_1',
        parentNode: null,
        requiredProperty: 'eventDefinitions'
      }
    }
  },
  {
    name: 'task',
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />')),
    report: {
      id: 'Task_1',
      message: 'Element of type <bpmn:Task> not allowed',
      path: null,
      error: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'Task_1',
        parentNode: null
      }
    }
  }
];

RuleTester.verify('camunda-cloud-8-1-element-type', rule, {
  valid: addConfig(valid, elementTypeConfig.camundaCloud81),
  invalid: addConfig(invalid, elementTypeConfig.camundaCloud81)
});