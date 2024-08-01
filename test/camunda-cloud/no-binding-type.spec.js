const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/no-binding-type');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'called element (latest)',
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement bindingType="latest" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `))
  },
  {
    name: 'called element (deployment) (non-executable process)',
    config: { version: '8.2' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:extensionElements>
            <zeebe:calledElement bindingType="deployment" />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'called decision (deployment)',
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision bindingType="deployment" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Property value of <deployment> only allowed by Camunda 8.6 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'bindingType'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'zeebe:CalledDecision',
        parentNode: 'BusinessRuleTask_1',
        property: 'bindingType',
        allowedVersion: '8.6'
      }
    }
  },
  {
    name: 'called element (deployment)',
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement bindingType="deployment" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `)),
    report: {
      id: 'CallActivity_1',
      message: 'Property value of <deployment> only allowed by Camunda 8.6 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'bindingType'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'zeebe:CalledElement',
        parentNode: 'CallActivity_1',
        property: 'bindingType',
        allowedVersion: '8.6'
      }
    }
  },
  {
    name: 'form definition (deployment)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition bindingType="deployment" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Property value of <deployment> only allowed by Camunda 8.6 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'bindingType'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        property: 'bindingType',
        allowedVersion: '8.6'
      }
    }
  }
];

RuleTester.verify('no-binding-type', rule, {
  valid,
  invalid
});