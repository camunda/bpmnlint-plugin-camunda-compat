const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/agent-fromai-contract');

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
        <zeebe:properties>
          <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
        </zeebe:properties>
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

function ahspInputNoExtension(source, attributes = '') {
  return createProcess(`
    <bpmn:adHocSubProcess id="AHSP_1" ${attributes}>
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

const TOOL_CONTAINER_MARKER = `
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
        </bpmn:extensionElements>`;

// A service task tool root (no incoming, directly in the AHSP) whose
// zeebe:taskDefinition carries the given attributes, optionally alongside an
// input mapping declaring a key. `agentic` controls whether the AHSP carries
// the toolContainer marker.
function taskDefinitionTool(taskDefAttrs, { agentic = true, inputMapping = '' } = {}) {
  return createProcess(`
    <bpmn:adHocSubProcess id="AHSP_1">${agentic ? TOOL_CONTAINER_MARKER : ''}
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition ${taskDefAttrs} />
          ${inputMapping}
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    </bpmn:adHocSubProcess>
  `);
}

function inputMappingXml(source, target = 'value') {
  return `<zeebe:ioMapping><zeebe:input source="${source}" target="${target}" /></zeebe:ioMapping>`;
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
  {
    name: 'description omitted — valid, the description argument is optional (neither rule reports)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url)'))
  },
  {
    name: 'legacy AI Agent template — treated as an agentic sub-process',
    config: { version: '8.8' },
    moddleElement: createModdle(ahspInputNoExtension(
      '=fromAi(toolCall.url)',
      'zeebe:modelerTemplate="io.camunda.connectors.agenticai.aiagent.jobworker.v1"'
    ))
  },
  {
    name: 'fromAi() in Retries, key declared by an input mapping on the same tool — the wrapper is redundant, not broken',
    config: { version: '8.8' },
    moddleElement: createModdle(taskDefinitionTool(
      'retries="=fromAi(toolCall.retries)"',
      { inputMapping: inputMappingXml(`=fromAi(toolCall.retries, ${GOOD_DESC}, &quot;number&quot;)`) }
    ))
  },
  {
    name: 'plain toolCall.retries read in Retries, no fromAi() wrapper — never swept at all',
    config: { version: '8.8' },
    moddleElement: createModdle(taskDefinitionTool(
      'retries="=toolCall.retries"',
      { inputMapping: inputMappingXml(`=fromAi(toolCall.retries, ${GOOD_DESC}, &quot;number&quot;)`) }
    ))
  },
  {
    name: 'retries is a plain FEEL literal, not fromAi() — rule ignores it',
    config: { version: '8.8' },
    moddleElement: createModdle(taskDefinitionTool('retries="=3"'))
  },
  {
    name: 'zeebe:taskHeader value with no parseable fromAi() invocation',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="search" />
            <zeebe:taskHeaders>
              <zeebe:header key="note" value="=not really feel fromAi" />
            </zeebe:taskHeaders>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'bpmn:Documentation mentioning fromAi() in prose is not swept',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:serviceTask id="Task_1">
          <bpmn:documentation>=fromAi(toolCall.x) is used to tag AI-provided values</bpmn:documentation>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:input source="=fromAi(toolCall.url, ${GOOD_DESC})" target="value" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'nested agent-as-tool — fromAi() in the inner agentic AHSP\'s own input mapping is a live tool-input declaration',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_Outer">${TOOL_CONTAINER_MARKER}
        <bpmn:adHocSubProcess id="AHSP_Inner">
          <bpmn:extensionElements>
            <zeebe:properties>
              <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
            </zeebe:properties>
            <zeebe:ioMapping>
              <zeebe:input source="=fromAi(toolCall.q, ${GOOD_DESC})" target="value" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
          <bpmn:serviceTask id="Task_1" />
        </bpmn:adHocSubProcess>
      </bpmn:adHocSubProcess>
    `))
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
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
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
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
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
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
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
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
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
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
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
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
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
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
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
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },
  {
    name: 'T10 — key is a conditional expression (if-expression)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput(
      `=fromAi(if x then toolCall.a else toolCall.b, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() key must be a FEEL path starting with "toolCall.", not a conditional expression. The connector requires a plain reference regardless of which branch would apply at runtime.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },
  {
    name: 'T11 — no key argument (empty call)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi()')),
    report: {
      id: 'Task_1',
      message: 'fromAi() requires a key argument: a FEEL path like toolCall.url.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_MISSING },
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },

  // ─── Description argument errors ───────────────────────────────────────────
  // Any non-string-literal description has no legitimate reading: the
  // connector requires a literal string (ConstString) to build the tool
  // schema from the deployed process definition and throws otherwise, per
  // FromAiTaggedParameterExtractor (camunda/camunda). This includes a bare
  // number, null, a variable reference, or any other expression -- none of
  // them can ever resolve to text there, regardless of process variables.
  // A missing or blank description is valid (the argument is optional) and
  // is not reported at all.

  {
    name: 'T15 — description is numeric literal',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, 42)')),
    report: {
      id: 'Task_1',
      message: 'fromAi() description must be a string literal: a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID },
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },
  {
    name: 'T15b — description is null',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, null)')),
    report: {
      id: 'Task_1',
      message: 'fromAi() description must be a string literal: a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID },
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },
  {
    name: 'T13 — description is a variable reference',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticInput('=fromAi(toolCall.url, myDescription)')),
    report: {
      id: 'Task_1',
      message: 'fromAi() description must be a string literal: a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID },
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },

  // ─── Duplicate keys ────────────────────────────────────────────────────────

  {
    name: 'duplicate fromAi key across two inputs of one tool',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
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
      paths: [ [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ], [ 'extensionElements', 'values', 0, 'inputParameters', 1, 'source' ] ]
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
      message: 'Wrong function name "fromai". Use fromAi (case-sensitive).',
      data: { type: ERROR_TYPES.AGENT_FEEL_FUNCTION_NAME_INVALID },
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
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
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },
  {
    name: 'T18 — fromAi inside AHSP with no agentic marker (not agentic), unnamed AHSP falls back to its id',
    config: { version: '8.8' },
    moddleElement: createModdle(ahspInputNoExtension(
      `=fromAi(toolCall.url, ${GOOD_DESC})`
    )),
    report: {
      id: 'Task_1',
      message: 'The "AHSP_1" sub-process is not marked as agentic, so fromAi() has no effect.',
      data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },
  {
    name: 'fromAi inside AHSP with no agentic marker (not agentic), named AHSP uses its name',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1" name="Delivery Tools">
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:input source="=fromAi(toolCall.url, ${GOOD_DESC})" target="value" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'The "Delivery Tools" sub-process is not marked as agentic, so fromAi() has no effect.',
      data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },
  {
    name: 'fromAi on a non-entry element — ignored at runtime',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
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
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },
  {
    name: 'fromAi nested inside a sub-process tool — not the tool root, ignored at runtime',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
        </bpmn:extensionElements>
        <bpmn:subProcess id="Sub_1">
          <bpmn:serviceTask id="Inner_1">
            <bpmn:extensionElements>
              <zeebe:ioMapping>
                <zeebe:input source="=fromAi(toolCall.subject, ${GOOD_DESC})" target="subject" />
              </zeebe:ioMapping>
            </bpmn:extensionElements>
          </bpmn:serviceTask>
        </bpmn:subProcess>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Inner_1',
      message: 'fromAi() is ignored here: only the tool\'s entry element defines AI inputs. Define it there and read the toolCall variable directly.',
      data: { type: ERROR_TYPES.AGENT_FEEL_NON_ENTRY_ELEMENT },
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ]
    }
  },
  {
    name: 'T19 — fromAi in an output mapping source, key not declared anywhere (ignored at runtime)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
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
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.url is never provided and this output mapping resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.url here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:Output',
        parentNode: 'Task_1',
        property: 'source'
      },
      path: [ 'extensionElements', 'values', 0, 'outputParameters', 0, 'source' ]
    }
  },
  {
    name: 'T20 — fromAi in a sequence flow condition, key not declared anywhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
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
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.ready is never provided and this sequence flow condition resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.ready here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'Flow_1',
        parentNode: 'Flow_1',
        property: 'conditionExpression'
      },
      path: [ 'conditionExpression' ]
    }
  },

  // ─── Legacy template invalid cases ──────────────────────────────────────────

  {
    name: 'legacy template — duplicate fromAi key across two inputs',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1" zeebe:modelerTemplate="io.camunda.connectors.agenticai.aiagent.jobworker.v1">
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
      paths: [ [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ], [ 'extensionElements', 'values', 0, 'inputParameters', 1, 'source' ] ]
    }
  },
  {
    name: 'legacy template — fromAi in output mapping, key not declared anywhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1" zeebe:modelerTemplate="io.camunda.connectors.agenticai.aiagent.jobworker.v1">
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
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.url is never provided and this output mapping resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.url here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:Output',
        parentNode: 'Task_1',
        property: 'source'
      },
      path: [ 'extensionElements', 'values', 0, 'outputParameters', 0, 'source' ]
    }
  },
  {
    name: 'legacy template — fromAi in sequence flow condition, key not declared anywhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1" zeebe:modelerTemplate="io.camunda.connectors.agenticai.aiagent.jobworker.v1">
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
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.ready is never provided and this sequence flow condition resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.ready here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'Flow_1',
        parentNode: 'Flow_1',
        property: 'conditionExpression'
      },
      path: [ 'conditionExpression' ]
    }
  },

  // ─── Non-input properties: undeclared key (the #256 bug) ───────────────────

  {
    name: 'screenshot repro — fromAi() in Retries, non-agentic AHSP, key declared nowhere',
    config: { version: '8.8' },
    moddleElement: createModdle(taskDefinitionTool(
      `type="search" retries="=fromAi(toolCall.query, ${GOOD_DESC})"`,
      { agentic: false }
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.query is never provided and the <retries> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.query here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:TaskDefinition',
        parentNode: 'Task_1',
        property: 'retries'
      },
      path: [ 'extensionElements', 'values', 0, 'retries' ]
    }
  },
  {
    name: 'fromAi() in Retries, agentic AHSP, key declared nowhere',
    config: { version: '8.8' },
    moddleElement: createModdle(taskDefinitionTool(
      `retries="=fromAi(toolCall.retries, ${GOOD_DESC}, &quot;number&quot;)"`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.retries is never provided and the <retries> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.retries here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:TaskDefinition',
        parentNode: 'Task_1',
        property: 'retries'
      },
      path: [ 'extensionElements', 'values', 0, 'retries' ]
    }
  },
  {
    name: 'per-element precision — key declared on a different tool does not excuse this one',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:serviceTask id="Task_A">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:input source="=fromAi(toolCall.retries, ${GOOD_DESC}, &quot;number&quot;)" target="value" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_B">
          <bpmn:extensionElements>
            <zeebe:taskDefinition retries="=fromAi(toolCall.retries)" />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_B',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.retries is never provided and the <retries> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.retries here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:TaskDefinition',
        parentNode: 'Task_B',
        property: 'retries'
      },
      path: [ 'extensionElements', 'values', 0, 'retries' ]
    }
  },
  {
    name: 'fromAi() in taskDefinition type, key declared nowhere',
    config: { version: '8.8' },
    moddleElement: createModdle(taskDefinitionTool(
      `type="=fromAi(toolCall.jobType, ${GOOD_DESC})"`
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.jobType is never provided and the <type> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.jobType here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:TaskDefinition',
        parentNode: 'Task_1',
        property: 'type'
      },
      path: [ 'extensionElements', 'values', 0, 'type' ]
    }
  },
  {
    name: 'fromAi() in a zeebe:taskHeader value, key declared nowhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="search" />
            <zeebe:taskHeaders>
              <zeebe:header key="resultExpression" value="=fromAi(toolCall.expr, ${GOOD_DESC})" />
            </zeebe:taskHeaders>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.expr is never provided and the <value> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.expr here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:Header',
        parentNode: 'Task_1',
        property: 'value'
      },
      path: [ 'extensionElements', 'values', 1, 'values', 0, 'value' ]
    }
  },
  {
    name: 'fromAi() in a zeebe:property value, key declared nowhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:properties>
              <zeebe:property name="custom" value="=fromAi(toolCall.custom, ${GOOD_DESC})" />
            </zeebe:properties>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.custom is never provided and the <value> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.custom here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:Property',
        parentNode: 'Task_1',
        property: 'value'
      },
      path: [ 'extensionElements', 'values', 0, 'properties', 0, 'value' ]
    }
  },
  {
    name: 'fromAi() in a zeebe:script expression, key declared nowhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:scriptTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:script expression="=fromAi(toolCall.expr, ${GOOD_DESC})" resultVariable="result" />
          </bpmn:extensionElements>
        </bpmn:scriptTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.expr is never provided and the <expression> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.expr here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:Script',
        parentNode: 'Task_1',
        property: 'expression'
      },
      path: [ 'extensionElements', 'values', 0, 'expression' ]
    }
  },
  {
    name: 'fromAi() in zeebe:assignmentDefinition assignee, key declared nowhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:userTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:assignmentDefinition assignee="=fromAi(toolCall.assignee, ${GOOD_DESC})" />
          </bpmn:extensionElements>
        </bpmn:userTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.assignee is never provided and the <assignee> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.assignee here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:AssignmentDefinition',
        parentNode: 'Task_1',
        property: 'assignee'
      },
      path: [ 'extensionElements', 'values', 0, 'assignee' ]
    }
  },
  {
    name: 'fromAi() in an execution listener retries, key declared nowhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="search" />
            <zeebe:executionListeners>
              <zeebe:executionListener eventType="start" type="my-listener" retries="=fromAi(toolCall.retries, ${GOOD_DESC}, &quot;number&quot;)" />
            </zeebe:executionListeners>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.retries is never provided and the <retries> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.retries here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:ExecutionListener',
        parentNode: 'Task_1',
        property: 'retries'
      },
      path: [ 'extensionElements', 'values', 1, 'listeners', 0, 'retries' ]
    }
  },
  {
    name: 'fromAi() in multi-instance inputCollection, key declared nowhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:serviceTask id="Task_1">
          <bpmn:multiInstanceLoopCharacteristics>
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="=fromAi(toolCall.items, ${GOOD_DESC})" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.items is never provided and the <inputCollection> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.items here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:LoopCharacteristics',
        parentNode: 'Task_1',
        property: 'inputCollection'
      },
      path: [ 'loopCharacteristics', 'extensionElements', 'values', 0, 'inputCollection' ]
    }
  },
  {
    name: 'fromAi() in a timer duration, key declared nowhere — reported once, not twice',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:intermediateCatchEvent id="Task_1">
          <bpmn:timerEventDefinition>
            <bpmn:timeDuration>=fromAi(toolCall.wait, ${GOOD_DESC})</bpmn:timeDuration>
          </bpmn:timerEventDefinition>
        </bpmn:intermediateCatchEvent>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.wait is never provided and the <timeDuration> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.wait here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'bpmn:TimerEventDefinition',
        parentNode: 'Task_1',
        property: 'timeDuration'
      },
      path: [ 'eventDefinitions', 0, 'timeDuration' ]
    }
  },
  {
    name: 'both a valid input source and an undeclared retries key on one task — reports only retries',
    config: { version: '8.8' },
    moddleElement: createModdle(taskDefinitionTool(
      `retries="=fromAi(toolCall.other, ${GOOD_DESC}, &quot;number&quot;)"`,
      { inputMapping: inputMappingXml(`=fromAi(toolCall.a, ${GOOD_DESC})`) }
    )),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.other is never provided and the <retries> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.other here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:TaskDefinition',
        parentNode: 'Task_1',
        property: 'retries'
      },
      path: [ 'extensionElements', 'values', 0, 'retries' ]
    }
  },

  // ─── The agent's own properties ─────────────────────────────────────────────

  {
    name: 'fromAi() in the agent\'s own input mapping — not a tool, toolCall never in scope there',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
          <zeebe:ioMapping>
            <zeebe:input source="=fromAi(toolCall.systemPrompt, ${GOOD_DESC})" target="value" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'AHSP_1',
      message: 'fromAi() defines a tool input and has no effect on the agent sub-process itself. Define it on a tool inside this sub-process.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:Input',
        parentNode: 'AHSP_1',
        property: 'source'
      },
      path: [ 'extensionElements', 'values', 1, 'inputParameters', 0, 'source' ]
    }
  },
  {
    name: 'fromAi() in the agent\'s own zeebe:adHoc activeElementsCollection',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
          <zeebe:adHoc activeElementsCollection="=fromAi(toolCall.elements, ${GOOD_DESC})" />
        </bpmn:extensionElements>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'AHSP_1',
      message: 'fromAi() defines a tool input and has no effect on the agent sub-process itself. Define it on a tool inside this sub-process.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:AdHoc',
        parentNode: 'AHSP_1',
        property: 'activeElementsCollection'
      },
      path: [ 'extensionElements', 'values', 1, 'activeElementsCollection' ]
    }
  },
  {
    name: 'fromAi() in the agent\'s own completionCondition',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">${TOOL_CONTAINER_MARKER}
        <bpmn:completionCondition>=fromAi(toolCall.done, ${GOOD_DESC})</bpmn:completionCondition>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'AHSP_1',
      message: 'fromAi() defines a tool input and has no effect on the agent sub-process itself. Define it on a tool inside this sub-process.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'AHSP_1',
        parentNode: 'AHSP_1',
        property: 'completionCondition'
      },
      path: [ 'completionCondition' ]
    }
  },

  // ─── Widening: non-input surfaces report regardless of context ─────────────

  {
    name: 'fromAi() in an output mapping, non-agentic AHSP',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
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
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.url is never provided and this output mapping resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.url here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:Output',
        parentNode: 'Task_1',
        property: 'source'
      },
      path: [ 'extensionElements', 'values', 0, 'outputParameters', 0, 'source' ]
    }
  },
  {
    name: 'fromAi() in a sequence flow condition, non-agentic AHSP',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
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
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.ready is never provided and this sequence flow condition resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.ready here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'Flow_1',
        parentNode: 'Flow_1',
        property: 'conditionExpression'
      },
      path: [ 'conditionExpression' ]
    }
  },
  {
    name: 'fromAi() in an output mapping, no AHSP anywhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:output source="=fromAi(toolCall.url, ${GOOD_DESC})" target="result" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.url is never provided and this output mapping resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.url here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:Output',
        parentNode: 'Task_1',
        property: 'source'
      },
      path: [ 'extensionElements', 'values', 0, 'outputParameters', 0, 'source' ]
    }
  },
  {
    name: 'fromAi() in taskDefinition retries, no AHSP anywhere',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition retries="=fromAi(toolCall.retries, ${GOOD_DESC}, &quot;number&quot;)" />
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'Task_1',
      message: 'fromAi() only defines a tool input in an input mapping, so toolCall.retries is never provided and the <retries> property resolves to null. Declare it in an input mapping on the tool\'s entry element, then read toolCall.retries here.',
      data: {
        type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
        node: 'zeebe:TaskDefinition',
        parentNode: 'Task_1',
        property: 'retries'
      },
      path: [ 'extensionElements', 'values', 0, 'retries' ]
    }
  }
];

RuleTester.verify('agent-fromai-contract', rule, {
  valid,
  invalid
});
