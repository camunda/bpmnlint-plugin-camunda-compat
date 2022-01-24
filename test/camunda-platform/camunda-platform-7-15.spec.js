const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaPlatform715Rule = require('../../rules/camunda-platform-7-15');

const { createModdle } = require('../helper');

const createPlaformProcess = require('../helper').createPlaformProcess('7.15.0');

const valid = [
  {
    name: 'process',
    moddleElement: createModdle(createPlaformProcess(`
      <bpmn:Task id="Task" />
    `))
  }
];

module.exports.valid = valid;

const invalid = [];

RuleTester.verify('camunda-platform-7-15', camundaPlatform715Rule, {
  valid,
  invalid
});