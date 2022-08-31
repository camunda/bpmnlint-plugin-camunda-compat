const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/loop-characteristics');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'service task',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:loopCharacteristics inputCollection="foo" />
          </bpmn:extensionElements>
        </bpmn:multiInstanceLoopCharacteristics>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'end event',
    moddleElement: createModdle(createProcess('<bpmn:endEvent id="EndEvent_1" />'))
  }
];

const invalid = [
  {
    name: 'service task (standard loop characteristics)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:standardLoopCharacteristics />
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <bpmn:ServiceTask> must not have property <loopCharacteristics> of type <bpmn:StandardLoopCharacteristics>',
      path: [
        'loopCharacteristics'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_TYPE_NOT_ALLOWED,
        node: 'ServiceTask_1',
        parentNode: null,
        property: 'loopCharacteristics',
        allowedPropertyType: 'bpmn:MultiInstanceLoopCharacteristics'
      }
    }
  },
  {
    name: 'service task (no loop characteristics)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:multiInstanceLoopCharacteristics />
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have one extension element of type <zeebe:LoopCharacteristics>',
      path: [
        'loopCharacteristics'
      ],
      error: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'bpmn:MultiInstanceLoopCharacteristics',
        parentNode: 'ServiceTask_1',
        requiredExtensionElement: 'zeebe:LoopCharacteristics'
      }
    }
  },
  {
    name: 'service task (no input collection)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:loopCharacteristics />
          </bpmn:extensionElements>
        </bpmn:multiInstanceLoopCharacteristics>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>',
      path: [
        'loopCharacteristics',
        'extensionElements',
        'values',
        0,
        'inputCollection'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:LoopCharacteristics',
        parentNode: 'ServiceTask_1',
        requiredProperty: 'inputCollection'
      }
    }
  },
  {
    name: 'service task (no output collection)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:loopCharacteristics inputCollection="foo" outputElement="bar" />
          </bpmn:extensionElements>
        </bpmn:multiInstanceLoopCharacteristics>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>',
      path: [
        'loopCharacteristics',
        'extensionElements',
        'values',
        0,
        'outputCollection'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
        node: 'zeebe:LoopCharacteristics',
        parentNode: 'ServiceTask_1',
        property: 'outputElement',
        dependendRequiredProperty: 'outputCollection'
      }
    }
  },
  {
    name: 'service task (no output element)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:loopCharacteristics inputCollection="foo" outputCollection="bar" />
          </bpmn:extensionElements>
        </bpmn:multiInstanceLoopCharacteristics>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>',
      path: [
        'loopCharacteristics',
        'extensionElements',
        'values',
        0,
        'outputElement'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
        node: 'zeebe:LoopCharacteristics',
        parentNode: 'ServiceTask_1',
        property: 'outputCollection',
        dependendRequiredProperty: 'outputElement'
      }
    }
  }
];

RuleTester.verify('loop-characteristics', rule, {
  valid,
  invalid
});