const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/agent-fromai-guidance');

const {
  createModdle,
  createProcess
} = require('../helper');

// This rule is currently a placeholder: every case that once lived here
// (missing/blank description, conditional key) was either found to be valid
// (an optional description) or moved to agent-fromai-contract as an error
// (a conditional key has no legitimate reading, same as any other non-Ref
// key). See rules/camunda-cloud/agent-fromai-guidance.js.

const valid = [
  {
    name: 'reports nothing, regardless of input',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:adHoc />
        </bpmn:extensionElements>
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:input source="=fromAi(if x then toolCall.a else toolCall.b)" target="value" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `))
  }
];

RuleTester.verify('agent-fromai-guidance', rule, {
  valid,
  invalid: []
});
