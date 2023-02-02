const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/element-type');

const {
  withConfig,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  ...require('./camunda-cloud-1-0-element-type.spec').valid,
  {
    name: 'business rule task',
    moddleElement: createModdle(createProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />'))
  }
];

module.exports.valid = valid;

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
  },
  {
    name: 'task',
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />')),
    report: {
      id: 'Task_1',
      message: 'Element of type <bpmn:Task> only allowed by Camunda Platform 8.2 or newer',
      path: null,
      data: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'Task_1',
        parentNode: null,
        allowedVersion: '8.2'
      }
    }
  },
  {
    name: 'inlusive gateway',
    moddleElement: createModdle(createProcess('<bpmn:inclusiveGateway id="InclusiveGateway_1" />')),
    report: {
      id: 'InclusiveGateway_1',
      message: 'Element of type <bpmn:InclusiveGateway> only allowed by Camunda Platform 8.1 or newer',
      path: null,
      data: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'InclusiveGateway_1',
        parentNode: null,
        allowedVersion: '8.1'
      }
    }
  },
  {
    name: 'end event (terminate)',
    moddleElement: createModdle(createProcess(`
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:terminateEventDefinition id="TerminateEventDefinition_1" />
      </bpmn:endEvent>
    `)),
    report: {
      id: 'EndEvent_1',
      message: 'Element of type <bpmn:EndEvent> with event definition of type <bpmn:TerminateEventDefinition> only allowed by Camunda Platform 8.1 or newer',
      path: null,
      data: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'EndEvent_1',
        parentNode: null,
        eventDefinition: 'TerminateEventDefinition_1',
        allowedVersion: '8.1'
      }
    }
  },
  {
    name: 'data store',
    moddleElement: createModdle(createProcess(`
    <bpmn:dataStoreReference id="DataStoreReference_1" />
    `)),
    report: {
      id: 'DataStoreReference_1',
      message: 'Element of type <bpmn:DataStoreReference> only allowed by Camunda Platform 8.0 or newer',
      path: null,
      data: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'DataStoreReference_1',
        parentNode: null,
        allowedVersion: '8.0'
      }
    }
  },
  {
    name: 'data object',
    moddleElement: createModdle(createProcess(`
    <bpmn:dataObjectReference id="DataObjectReference_1" />
    `)),
    report: {
      id: 'DataObjectReference_1',
      message: 'Element of type <bpmn:DataObjectReference> only allowed by Camunda Platform 8.0 or newer',
      path: null,
      data: {
        type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
        node: 'DataObjectReference_1',
        parentNode: null,
        allowedVersion: '8.0'
      }
    }
  }
];

RuleTester.verify('camunda-cloud-1-1-element-type', rule, {
  valid: withConfig(valid, { version: '1.1' }),
  invalid: withConfig(invalid, { version: '1.1' })
});