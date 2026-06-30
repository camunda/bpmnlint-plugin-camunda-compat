const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/agent-tool-output-key');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/error-types');

const CORRECT_TARGET = 'toolCallResult';
const DOCS_URL = 'https://docs.camunda.io/docs/components/modeler/bpmn/agent-tools/';

function agenticToolTask(outputXml = '') {
  return createProcess(`
    <bpmn:adHocSubProcess id="AHSP_1">
      <bpmn:extensionElements>
        <zeebe:adHoc />
      </bpmn:extensionElements>
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=toolCall.url" target="url" />
            ${outputXml}
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    </bpmn:adHocSubProcess>
  `);
}

const valid = [
  {
    name: 'correct output target inside agentic AHSP',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=taskResult" target="toolCallResult" />
    `))
  },
  {
    name: 'no outputs — nothing to check',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask())
  },
  {
    name: 'task inside AHSP without zeebe:AdHoc — not agentic, skipped',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=taskResult" target="wrongKey" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'task outside AHSP — not scoped to agent context, skipped',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:output source="=taskResult" target="wrongKey" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  }
];

const invalid = [
  {
    name: 'blank output target',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=taskResult" target="" />
    `)),
    report: {
      id: 'Task_1',
      message: `Output mapping target must be "${CORRECT_TARGET}". The target is blank — the agent will not receive the tool result. See ${DOCS_URL}`,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID }
    }
  },
  {
    name: 'FEEL-prefixed output target',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=taskResult" target="= toolCallResult" />
    `)),
    report: {
      id: 'Task_1',
      message: 'Output mapping target "= toolCallResult" should be a plain string, not a FEEL expression. Remove the "=" prefix.',
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID }
    }
  },
  {
    name: 'typo in output target (toolcallresult)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=taskResult" target="toolcallresult" />
    `)),
    report: {
      id: 'Task_1',
      message: `Output mapping target "toolcallresult" looks like a typo. Did you mean "${CORRECT_TARGET}"?`,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID }
    }
  },
  {
    name: 'typo in output target (toolcalresult)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=taskResult" target="toolcalresult" />
    `)),
    report: {
      id: 'Task_1',
      message: `Output mapping target "toolcalresult" looks like a typo. Did you mean "${CORRECT_TARGET}"?`,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID }
    }
  },
  {
    name: 'wrong output target key',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=taskResult" target="result" />
    `)),
    report: {
      id: 'Task_1',
      message: `Output mapping target must be "${CORRECT_TARGET}" so the agent can receive the tool result. Got "result". See ${DOCS_URL}`,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID }
    }
  }
];

RuleTester.verify('agent-tool-output-key', rule, {
  valid,
  invalid
});
