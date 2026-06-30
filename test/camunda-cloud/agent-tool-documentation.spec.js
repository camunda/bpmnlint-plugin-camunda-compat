const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/agent-tool-documentation');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/error-types');

const DOCS_URL = 'https://docs.camunda.io/docs/components/modeler/bpmn/agent-tools/';

function agenticAHSP(taskXml) {
  return createProcess(`
    <bpmn:adHocSubProcess id="AHSP_1">
      <bpmn:extensionElements>
        <zeebe:adHoc />
      </bpmn:extensionElements>
      ${taskXml}
    </bpmn:adHocSubProcess>
  `);
}

const valid = [
  {
    name: 'tool task with documentation inside agentic AHSP',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticAHSP(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:documentation>Searches the web for relevant information based on a user query string.</bpmn:documentation>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'tool task with multi-element documentation inside agentic AHSP',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticAHSP(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:documentation>Fetches data from the external REST API endpoint.</bpmn:documentation>
        <bpmn:documentation>Returns a JSON response for further processing.</bpmn:documentation>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'task inside regular SubProcess (not AHSP) — skipped',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:subProcess id="Sub_1">
        <bpmn:serviceTask id="Task_1" />
      </bpmn:subProcess>
    `))
  },
  {
    name: 'task inside AHSP without zeebe:AdHoc — not agentic, skipped',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:serviceTask id="Task_1" />
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'agentic AHSP itself — skipped (no ancestor AHSP)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:adHoc />
        </bpmn:extensionElements>
        <bpmn:serviceTask id="Task_1">
          <bpmn:documentation>Searches the web for information.</bpmn:documentation>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `))
  }
];

const invalid = [
  {
    name: 'tool task with no documentation inside agentic AHSP',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticAHSP(`
      <bpmn:serviceTask id="Task_1" />
    `)),
    report: {
      id: 'Task_1',
      message: `Tool documentation is missing. Describe what this tool does so the agent knows when to use it. See ${DOCS_URL}`,
      data: { type: ERROR_TYPES.AGENT_TOOL_DOCUMENTATION_MISSING }
    }
  },
  {
    name: 'tool task with empty documentation inside agentic AHSP',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticAHSP(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:documentation></bpmn:documentation>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'Task_1',
      message: `Tool documentation is missing. Describe what this tool does so the agent knows when to use it. See ${DOCS_URL}`,
      data: { type: ERROR_TYPES.AGENT_TOOL_DOCUMENTATION_MISSING }
    }
  },
  {
    name: 'user task with no documentation inside agentic AHSP',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticAHSP(`
      <bpmn:userTask id="Task_1" />
    `)),
    report: {
      id: 'Task_1',
      message: `Tool documentation is missing. Describe what this tool does so the agent knows when to use it. See ${DOCS_URL}`,
      data: { type: ERROR_TYPES.AGENT_TOOL_DOCUMENTATION_MISSING }
    }
  }
];

RuleTester.verify('agent-tool-documentation', rule, {
  valid,
  invalid
});
