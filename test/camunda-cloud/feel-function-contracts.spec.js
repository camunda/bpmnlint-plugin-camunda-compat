const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/feel-function-contracts');

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
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      message: 'fromAi() key must be a FEEL path starting with "toolCall.", not null.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      message: 'fromAi() key must be a FEEL path starting with "toolCall.", not a number.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      message: 'fromAi() key must be a FEEL path starting with "toolCall.", not an arithmetic expression.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      message: 'fromAi() key must start with "toolCall.". Use toolCall.url instead of a bare name.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_PREFIX_MISSING },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      message: 'fromAi() key must start with "toolCall.". Got context.url.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_PREFIX_MISSING },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
    }
  },
  {
    name: 'T9 — nested key path: connector uses the last segment as parameter name',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(toolCall.params.query, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key must be a single name under toolCall. Use toolCall.query instead of toolCall.params.query.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_SEGMENTS_INVALID },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_CONDITIONAL },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
    }
  },
  {
    name: 'T11 — no key argument (empty call)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi()')),
    report: {
      id: 'Task_1',
      message: 'fromAi() requires a key argument — a FEEL path like toolCall.url.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_MISSING },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
    }
  },

  // ─── Description argument errors ──────────────────────────────────────────

  {
    name: 'T12 — description argument missing',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url)')),
    report: {
      id: 'Task_1',
      message: 'fromAi() description is missing.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_MISSING },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
    }
  },
  {
    name: 'T13 — description is a variable reference',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, myDescription)')),
    report: {
      id: 'Task_1',
      message: 'fromAi() description should be a string literal — use a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      message: 'fromAi() description is blank.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TOO_WEAK },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
    }
  },
  {
    name: 'fromAi nested in a context object — missing description still found',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      '={ q: fromAi(toolCall.query) }'
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() description is missing.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_MISSING },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
    }
  },
  {
    name: 'two fromAi invocations in one expression — one report per invocation',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      '={ a: fromAi(toolCall.a), b: fromAi(toolCall.b) }'
    )),
    report: [
      {
        id: 'Task_1',
        message: 'fromAi() description is missing.',
        data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_MISSING },
        propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
      },
      {
        id: 'Task_1',
        message: 'fromAi() description is missing.',
        data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_MISSING },
        propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
      }
    ]
  },

  // ─── Tool-scope errors ─────────────────────────────────────────────────────

  {
    name: 'fromAi on a non-entry element — ignored at runtime',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:adHoc />
        </bpmn:extensionElements>
        <bpmn:serviceTask id="Task_1">
          <bpmn:outgoing>Flow_1</bpmn:outgoing>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:input source="=fromAi(toolCall.confirmation, ${GOOD_DESC})" target="confirmation" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_2">
          <bpmn:incoming>Flow_1</bpmn:incoming>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:input source="=fromAi(toolCall.subject, ${GOOD_DESC})" target="subject" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2" />
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_2',
      message: 'fromAi() is ignored here: only the tool\'s entry element defines AI inputs. Define it there and read the toolCall variable directly.',
      data: { type: ERROR_TYPES.AGENT_FEEL_NON_ENTRY_ELEMENT },
      propertiesPanel: { entryIds: [ 'Task_2-input-0-source' ] }
    }
  },
  {
    name: 'duplicate fromAi key across two inputs of one tool',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:adHoc />
        </bpmn:extensionElements>
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:input source="=fromAi(toolCall.a, ${GOOD_DESC})" target="first" />
              <zeebe:input source="=fromAi(toolCall.a, ${GOOD_DESC})" target="second" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() key toolCall.a is declared more than once in this tool. Declare it once and reference it directly elsewhere.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_DUPLICATE },
      propertiesPanel: { entryIds: [ 'inputs' ] }
    }
  },
  {
    name: 'T15 — description is numeric literal',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, 42)')),
    report: {
      id: 'Task_1',
      message: 'fromAi() description must be a string literal — a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
    }
  },
  {
    name: 'T15b — description is null',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, null)')),
    report: {
      id: 'Task_1',
      message: 'fromAi() description must be a string literal — a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      data: { type: ERROR_TYPES.AGENT_FEEL_FUNCTION_NAME_INVALID },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
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
      data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
      propertiesPanel: { entryIds: [ 'Task_1-input-0-source' ] }
    }
  },
  {
    name: 'T19 — fromAi in an output mapping source (ignored at runtime)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:adHoc />
        </bpmn:extensionElements>
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=fromAi(toolCall.url, ${GOOD_DESC})" target="result" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() defines a tool input and has no effect in an output mapping. Define it in an input mapping on the tool\'s entry element.',
      data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
      propertiesPanel: { entryIds: [ 'Task_1-output-0-source' ] }
    }
  },
  {
    name: 'T20 — fromAi in a sequence flow condition (toolCall not in scope)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:adHoc />
        </bpmn:extensionElements>
        <bpmn:serviceTask id="Task_1">
          <bpmn:outgoing>Flow_1</bpmn:outgoing>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_2">
          <bpmn:incoming>Flow_1</bpmn:incoming>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2">
          <bpmn:conditionExpression>=fromAi(toolCall.ready, ${GOOD_DESC})</bpmn:conditionExpression>
        </bpmn:sequenceFlow>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Flow_1',
      message: 'fromAi() defines a tool input and cannot be used in a sequence flow condition. Define it in an input mapping on the tool\'s entry element.',
      data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
      propertiesPanel: { entryIds: [ 'conditionExpression' ] }
    }
  }
];

RuleTester.verify('feel-function-contracts', rule, {
  valid,
  invalid
});
