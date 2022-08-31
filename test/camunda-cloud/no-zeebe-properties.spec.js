const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/no-zeebe-properties');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'service task',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
    `))
  }
];

const invalid = [
  {
    name: 'service task',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="foo" value="bar" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <bpmn:ServiceTask> must not have extension element of type <zeebe:Properties>',
      path: [
        'extensionElements',
        'values',
        0
      ],
      error: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
        node: 'ServiceTask_1',
        parentNode: null,
        extensionElement: 'zeebe:Properties'
      }
    }
  }
];

RuleTester.verify('no-zeebe-properties', rule, {
  valid,
  invalid
});