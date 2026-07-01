const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/feel-function-contracts');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/error-types');

const DOCS_URL = 'https://docs.camunda.io/docs/components/modeler/bpmn/agent-tools/';

// Helpers

function agenticInput(source) {
  return createProcess(`
    <bpmn:adHocSubProcess id="AHSP_1">
      <bpmn:extensionElements>
        <zeebe:adHoc />
      </bpmn:extensionElements>
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="${source}" target="value" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    </bpmn:adHocSubProcess>
  `);
}

function ahspInputNoExtension(source) {
  return createProcess(`
    <bpmn:adHocSubProcess id="AHSP_1">
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="${source}" target="value" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    </bpmn:adHocSubProcess>
  `);
}

function bareInput(source) {
  return createProcess(`
    <bpmn:serviceTask id="Task_1">
      <bpmn:extensionElements>
        <zeebe:ioMapping>
          <zeebe:input source="${source}" target="value" />
        </zeebe:ioMapping>
      </bpmn:extensionElements>
    </bpmn:serviceTask>
  `);
}

const GOOD_DESC = '&quot;fetch the URL for the given search query&quot;';

const valid = [
  {
    name: 'T1 — correct fromAi usage: valid key path and good description',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(toolCall.url, ${GOOD_DESC})`
    ))
  },
  {
    name: 'T1b — correct fromAi with nested path key',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(toolCall.params.query, ${GOOD_DESC})`
    ))
  },
  {
    name: 'non-FEEL source (no = prefix) — rule ignores it',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('plainValue'))
  },
  {
    name: 'FEEL expression without fromAi call — rule ignores it',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=someVariable'))
  }
];

const invalid = [
  // ─── Key argument errors ───────────────────────────────────────────────────

  {
    name: 'T2 — key is string literal (quoted)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(&quot;toolCall.url&quot;, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key must be a FEEL path, not a string literal. Remove the quotes around "toolCall.url".',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID }
    }
  },
  {
    name: 'T3 — key is null',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(null, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key must be a FEEL path starting with toolCall., not null.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID }
    }
  },
  {
    name: 'T4 — key is numeric literal',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(42, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key must be a FEEL path starting with toolCall., not a number.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID }
    }
  },
  {
    name: 'T5 — key is arithmetic expression',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(toolCall.a + toolCall.b, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key must be a FEEL path starting with toolCall., not an arithmetic expression.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID }
    }
  },
  {
    name: 'T6 — key uses bracket notation (filter expression)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(toolCall[&quot;url&quot;], ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key must use dot notation, not bracket notation. Use toolCall.name instead of toolCall["name"].',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID }
    }
  },
  {
    name: 'T7 — key is bare variable name (missing toolCall. prefix)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(url, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key must start with toolCall.. Use toolCall.url instead of a bare name.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_PREFIX_MISSING }
    }
  },
  {
    name: 'T8 — key path does not start with toolCall.',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(context.url, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key must start with toolCall.. Got context.url.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_PREFIX_MISSING }
    }
  },
  {
    name: 'T10 — key is conditional (if-expression) — warn, not block',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(if x then toolCall.a else toolCall.b, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key uses a conditional expression. Ensure at least one branch resolves to a toolCall.* path.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_CONDITIONAL }
    }
  },
  {
    name: 'T11 — no key argument (empty call)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi()')),
    report: {
      id: 'Task_1',
      message: 'fromAi() requires a key argument — a FEEL path like toolCall.url.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_MISSING }
    }
  },

  // ─── Description argument errors ──────────────────────────────────────────

  {
    name: 'T12 — description argument missing',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url)')),
    report: {
      id: 'Task_1',
      message: `fromAi() description is missing. Add a string describing what the agent should provide for this parameter. See ${DOCS_URL}`,
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_MISSING }
    }
  },
  {
    name: 'T13 — description is a variable reference',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, myDescription)')),
    report: {
      id: 'Task_1',
      message: 'fromAi() description should be a string literal — use a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID }
    }
  },
  {
    name: 'T14a — description is blank',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      '=fromAi(toolCall.url, &quot;&quot;)'
    )),
    report: {
      id: 'Task_1',
      message: `fromAi() description is blank. Add a string describing what the agent should provide for this parameter. See ${DOCS_URL}`,
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TOO_WEAK }
    }
  },
  {
    name: 'T15 — description is numeric literal',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, 42)')),
    report: {
      id: 'Task_1',
      message: 'fromAi() description must be a string literal — a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID }
    }
  },
  {
    name: 'T15b — description is null',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, null)')),
    report: {
      id: 'Task_1',
      message: 'fromAi() description must be a string literal — a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID }
    }
  },

  // ─── Function name errors ──────────────────────────────────────────────────

  {
    name: 'T16 — function name casing typo (fromai)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromai(toolCall.url, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'Wrong function name "fromai" — use fromAi (case-sensitive).',
      data: { type: ERROR_TYPES.AGENT_FEEL_FUNCTION_NAME_INVALID }
    }
  },

  // ─── Context errors ────────────────────────────────────────────────────────

  {
    name: 'T17 — fromAi used outside any AHSP',
    config: { version: '8.8' },
    moddleElement: createModdle(bareInput(
      `=fromAi(toolCall.url, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() should only be used inside an agentic sub-process.',
      data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT }
    }
  },
  {
    name: 'T18 — fromAi inside AHSP without zeebe:AdHoc (not agentic)',
    config: { version: '8.8' },
    moddleElement: createModdle(ahspInputNoExtension(
      `=fromAi(toolCall.url, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'This sub-process is not configured as agentic. Add zeebe:AdHoc to use agent tool contracts.',
      data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT }
    }
  }
];

RuleTester.verify('feel-function-contracts', rule, {
  valid,
  invalid
});
