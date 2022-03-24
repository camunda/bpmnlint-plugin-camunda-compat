const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaCloud80Rule = require('../../rules/camunda-cloud-8-0');

const {
  createValid: createCamundaCloud13Valid,
  createInvalid: createCamundaCloud13Invalid
} = require('./camunda-cloud-1-3.spec');

function createValid(executionPlatformVersion = '8.0.0') {
  return [
    ...createCamundaCloud13Valid(executionPlatformVersion)
  ];
}

function createInvalid(executionPlatformVersion = '8.0.0') {
  return [
    ...createCamundaCloud13Invalid(executionPlatformVersion)
  ];
}

RuleTester.verify('camunda-cloud-8-0', camundaCloud80Rule, {
  valid: createValid(),
  invalid: createInvalid()
});