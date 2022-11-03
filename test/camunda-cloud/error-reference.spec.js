const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/error-reference');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'end event (error)',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:errorEventDefinition id="ErrorEventDefinition_1" errorRef="Error_1" />
        </bpmn:endEvent>
      </bpmn:process>
      <bpmn:error id="Error_1" errorCode="foo" />
    `))
  },
  {
    name: 'end event (message)',
    moddleElement: createModdle(createProcess(`
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
      </bpmn:endEvent>
    `))
  },
  {
    name: 'end event',
    moddleElement: createModdle(createProcess('<bpmn:endEvent id="EndEvent_1" />'))
  },
  {
    name: 'task',
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  }
];

const invalid = [
  {
    name: 'error end event (no error reference)',
    moddleElement: createModdle(createProcess(`
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:errorEventDefinition id="ErrorEventDefinition_1" />
      </bpmn:endEvent>
    `)),
    report: {
      id: 'EndEvent_1',
      message: 'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>',
      path: [
        'eventDefinitions',
        0,
        'errorRef'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'ErrorEventDefinition_1',
        parentNode: 'EndEvent_1',
        requiredProperty: 'errorRef'
      }
    }
  },
  {
    name: 'error end event (no error code)',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:errorEventDefinition id="ErrorEventDefinition_1" errorRef="Error_1" />
        </bpmn:endEvent>
      </bpmn:process>
      <bpmn:error id="Error_1" />
    `)),
    report: {
      id: 'EndEvent_1',
      message: 'Element of type <bpmn:Error> must have property <errorCode>',
      path: [
        'rootElements',
        1,
        'errorCode'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'Error_1',
        parentNode: 'EndEvent_1',
        requiredProperty: 'errorCode'
      }
    }
  }
];

RuleTester.verify('error-reference', rule, {
  valid,
  invalid
});