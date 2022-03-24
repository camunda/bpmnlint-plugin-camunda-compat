const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaCloud13Rule = require('../../rules/camunda-cloud-1-3');

const { createModdle } = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const { createValid: createCamundaCloud12Valid } = require('./camunda-cloud-1-2.spec');

function createValid(executionPlatformVersion = '1.3.0') {
  const createCloudProcess = require('../helper').createCloudProcess(executionPlatformVersion);

  return [
    ...createCamundaCloud12Valid(executionPlatformVersion),

    // bpmn:BusinessRuleTask
    {
      name: 'business rule task (called decision)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:extensionElements>
            <zeebe:calledDecision decisionId="foo" resultVariable="bar" />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `))
    }
  ];
}

module.exports.createValid = createValid;

function createInvalid(executionPlatformVersion = '1.3.0') {
  const createCloudProcess = require('../helper').createCloudProcess(executionPlatformVersion);

  return [

    // bpmn:BusinessRuleTask
    {
      name: 'business rule task (called decision)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:extensionElements>
            <zeebe:calledDecision />
            <zeebe:taskDefinition />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `)),
      report: {
        id: 'BusinessRuleTask_1',
        message: 'Element of type <bpmn:BusinessRuleTask> must have have either one <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element',
        path: null
      }
    },
    {
      name: 'business rule task (no called decision)',
      moddleElement: createModdle(createCloudProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />')),
      report: {
        id: 'BusinessRuleTask_1',
        message: 'Element of type <bpmn:BusinessRuleTask> must have have at least one <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element',
        path: null,
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:CalledDecision'
        }
      }
    },
    {
      name: 'business rule task (no called decision decision ID)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:extensionElements>
            <zeebe:calledDecision resultVariable="bar" />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `)),
      report: {
        id: 'BusinessRuleTask_1',
        message: 'Element of type <zeebe:CalledDecision> must have property <decisionId>',
        path: [
          'extensionElements',
          'values',
          0,
          'decisionId'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'decisionId'
        }
      }
    },
  ];
}

module.exports.createInvalid = createInvalid;

RuleTester.verify('camunda-cloud-1-3', camundaCloud13Rule, {
  valid: createValid(),
  invalid: createInvalid()
});