const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/agent-fromai-guidance');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/error-types');

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
    name: 'non-FEEL source (no = prefix) — rule ignores it',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('plainValue'))
  },
  {
    name: 'FEEL expression without fromAi call — rule ignores it',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=someVariable'))
  },
  {
    name: 'documented overloads — 3rd (type), 4th (schema), 5th (options) args are not errors',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(toolCall.url, ${GOOD_DESC}, &quot;string&quot;, { type: &quot;string&quot; }, {})`
    ))
  },
  {
    name: 'valid fromAi nested in a FEEL context object',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `={ q: fromAi(toolCall.query, ${GOOD_DESC}) }`
    ))
  },
  {
    name: 'valid fromAi inside a string concatenation',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=&quot;https://api.example.com/&quot; + fromAi(toolCall.path, ${GOOD_DESC})`
    ))
  },

  // ─── Silent deferral to agent-fromai-contract (structural cases) ───────────
  // These are structural breaks owned by agent-fromai-contract; this rule
  // must not double-report them, even though they're technically invalid.

  {
    name: 'key type invalid (string literal) — not this rule\'s concern',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(&quot;toolCall.url&quot;, ${GOOD_DESC})`
    ))
  },
  {
    name: 'missing key argument — not this rule\'s concern',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi()'))
  },
  {
    name: 'function name casing typo — not this rule\'s concern',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromai(toolCall.url, ${GOOD_DESC})`
    ))
  },
  {
    name: 'used outside any AHSP — not this rule\'s concern',
    config: { version: '8.8' },
    moddleElement: createModdle(bareInput(
      `=fromAi(toolCall.url, ${GOOD_DESC})`
    ))
  },
  {
    name: 'AHSP without zeebe:AdHoc (not agentic) — not this rule\'s concern',
    config: { version: '8.8' },
    moddleElement: createModdle(ahspInputNoExtension(
      `=fromAi(toolCall.url, ${GOOD_DESC})`
    ))
  },
  {
    name: 'T15 — description is numeric literal — not this rule\'s concern (agent-fromai-contract\'s job, no legitimate reading)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, 42)'))
  },
  {
    name: 'T15b — description is null — not this rule\'s concern (agent-fromai-contract\'s job, no legitimate reading)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, null)'))
  },
  {
    name: 'T13 — description is a variable reference — not this rule\'s concern (agent-fromai-contract\'s job, no legitimate reading)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, myDescription)'))
  },
  {
    name: 'description omitted — valid, the description argument is optional',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url)'))
  },
  {
    name: 'description is an empty string — valid, the description argument is optional',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, &quot;&quot;)'))
  }
];

const invalid = [

  // ─── Conditional key ────────────────────────────────────────────────────────

  {
    name: 'T10 — key is conditional (if-expression) — warn, not block',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(if x then toolCall.a else toolCall.b, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key uses a conditional expression. Ensure at least one branch resolves to a toolCall.* path.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_CONDITIONAL },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
    }
  }
];

RuleTester.verify('agent-fromai-guidance', rule, {
  valid,
  invalid
});
