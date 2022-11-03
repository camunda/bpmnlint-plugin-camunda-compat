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
      message: 'Extension element of type <zeebe:Properties> only allowed by Camunda Platform 8.1',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
        node: 'ServiceTask_1',
        parentNode: null,
        extensionElement: 'zeebe:Properties',
        allowedVersion: '8.1'
      }
    }
  }
];

RuleTester.verify('no-zeebe-properties', rule, {
  valid,
  invalid
});