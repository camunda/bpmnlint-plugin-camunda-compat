const RuleTester = require('bpmnlint/lib/testers/rule-tester');
const { Linter } = require('bpmnlint');
const { expect } = require('chai');

const rule = require('../../rules/camunda-cloud/agent-tool-output-key');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/error-types');

const WARN_MESSAGE = '"toolCallResult" output is not mapped.';

const OUTPUT_TARGET_PATH = [ 'extensionElements', 'values', 0, 'outputParameters', 0, 'target' ];
const HEADER_VALUE_PATH = [ 'extensionElements', 'values', 0, 'values', 0, 'value' ];
const RESULT_VARIABLE_PATH = [ 'extensionElements', 'values', 0, 'resultVariable' ];
const OUTPUTS_ANCHOR_PATH = [ 'extensionElements', 'values', 0, 'outputParameters' ];

function agenticToolTask(outputXml = '') {
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
            <zeebe:input source="=toolCall.url" target="url" />
            ${outputXml}
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    </bpmn:adHocSubProcess>
  `);
}

function agenticToolEvent(outputXml = '') {
  return createProcess(`
    <bpmn:adHocSubProcess id="AHSP_1">
      <bpmn:extensionElements>
        <zeebe:properties>
          <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
        </zeebe:properties>
      </bpmn:extensionElements>
      <bpmn:intermediateCatchEvent id="Event_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            ${outputXml}
          </zeebe:ioMapping>
        </bpmn:extensionElements>
        <bpmn:messageEventDefinition />
      </bpmn:intermediateCatchEvent>
    </bpmn:adHocSubProcess>
  `);
}

function agenticToolFlow(inner, definitions = '') {
  return createModdle(createDefinitions(`
    <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:adHocSubProcess id="AHSP_1">
      <bpmn:extensionElements>
        <zeebe:properties>
          <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
        </zeebe:properties>
      </bpmn:extensionElements>
      ${ inner }
    </bpmn:adHocSubProcess>
    </bpmn:process>
    ${ definitions }
  `));
}

function potentialExitFlow(outputXml = '', eventType = 'endEvent', definition = 'escalation') {
  return `
    <bpmn:serviceTask id="Task_1">
      <bpmn:extensionElements>
        <zeebe:ioMapping>${ outputXml }</zeebe:ioMapping>
      </bpmn:extensionElements>
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:${ eventType } id="Throw_1">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:${ definition }EventDefinition />
    </bpmn:${ eventType }>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Throw_1" />
  `;
}

function sharedExitFlow(outputXml = '', boundary = true, sharedLeaf = false, completesThroughExit = false) {
  return agenticToolFlow(`
      <bpmn:serviceTask id="Search" name="Search web">
        <bpmn:extensionElements>
          <zeebe:ioMapping>${ outputXml }</zeebe:ioMapping>
        </bpmn:extensionElements>
        <bpmn:outgoing>Flow_1</bpmn:outgoing>
      </bpmn:serviceTask>
      <bpmn:exclusiveGateway id="Split">
        <bpmn:incoming>Flow_1</bpmn:incoming>
        <bpmn:outgoing>Flow_2</bpmn:outgoing>
        <bpmn:outgoing>Flow_3</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:serviceTask id="Summarize" name="LLM Summarize">
        <bpmn:incoming>Flow_2</bpmn:incoming>
        ${ sharedLeaf ? '<bpmn:incoming>Flow_7</bpmn:incoming>' : '' }
        ${ completesThroughExit ? '<bpmn:outgoing>Flow_8</bpmn:outgoing>' : '' }
      </bpmn:serviceTask>
      ${ boundary ? `<bpmn:boundaryEvent id="Timeout" attachedToRef="Summarize">
        <bpmn:outgoing>Flow_4</bpmn:outgoing>
        <bpmn:timerEventDefinition />
      </bpmn:boundaryEvent>` : '' }
      <bpmn:serviceTask id="Check" name="Check account">
        <bpmn:outgoing>Flow_5</bpmn:outgoing>
        ${ sharedLeaf ? '<bpmn:outgoing>Flow_7</bpmn:outgoing>' : '' }
      </bpmn:serviceTask>
      <bpmn:exclusiveGateway id="Join">
        <bpmn:incoming>Flow_3</bpmn:incoming>
        ${ boundary ? '<bpmn:incoming>Flow_4</bpmn:incoming>' : '' }
        ${ completesThroughExit ? '<bpmn:incoming>Flow_8</bpmn:incoming>' : '' }
        <bpmn:incoming>Flow_5</bpmn:incoming>
        <bpmn:outgoing>Flow_6</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:endEvent id="Stop" name="Stop agent">
        <bpmn:incoming>Flow_6</bpmn:incoming>
        <bpmn:escalationEventDefinition />
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_1" sourceRef="Search" targetRef="Split" />
      <bpmn:sequenceFlow id="Flow_2" sourceRef="Split" targetRef="Summarize" />
      <bpmn:sequenceFlow id="Flow_3" sourceRef="Split" targetRef="Join" />
      ${ boundary ? '<bpmn:sequenceFlow id="Flow_4" sourceRef="Timeout" targetRef="Join" />' : '' }
      <bpmn:sequenceFlow id="Flow_5" sourceRef="Check" targetRef="Join" />
      <bpmn:sequenceFlow id="Flow_6" sourceRef="Join" targetRef="Stop" />
      ${ sharedLeaf ? '<bpmn:sequenceFlow id="Flow_7" sourceRef="Check" targetRef="Summarize" />' : '' }
      ${ completesThroughExit ? '<bpmn:sequenceFlow id="Flow_8" sourceRef="Summarize" targetRef="Join" />' : '' }
    `);
}

const valid = [
  ...[
    [ 'endEvent', 'error' ],
    [ 'endEvent', 'escalation' ],
    [ 'intermediateThrowEvent', 'escalation' ]
  ].map(([ eventType, definition ]) => ({
    name: `${ definition } ${ eventType } is a potential exit without a catch`,
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(potentialExitFlow('', eventType, definition))
  })),
  {
    name: 'potential exit suppresses misdirected-output warnings',
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(potentialExitFlow(`
      <zeebe:output source="=reason" target="reason" />
    `))
  },
  ...[ 'error', 'escalation' ].map(definition => ({
    name: `${ definition } exit inside a tool sub-process suppresses missing result`,
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(`
      <bpmn:subProcess id="Tool_1">
        ${ potentialExitFlow('', 'endEvent', definition) }
        <bpmn:subProcess id="Handler" triggeredByEvent="true">
          <bpmn:startEvent id="Catch" isInterrupting="false">
            <bpmn:escalationEventDefinition />
          </bpmn:startEvent>
        </bpmn:subProcess>
      </bpmn:subProcess>
    `)
  })),
  {
    name: 'connecting the returning leaf to the shared exit removes its warning',
    config: { version: '8.8' },
    moddleElement: sharedExitFlow('', false, false, true)
  },
  {
    name: 'potential exit reached through a same-scope link still expresses intent',
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(`
      <bpmn:task id="Entry"><bpmn:outgoing>ToLink</bpmn:outgoing></bpmn:task>
      <bpmn:intermediateThrowEvent id="LinkThrow">
        <bpmn:incoming>ToLink</bpmn:incoming>
        <bpmn:linkEventDefinition name="exit" />
      </bpmn:intermediateThrowEvent>
      <bpmn:intermediateCatchEvent id="LinkCatch">
        <bpmn:linkEventDefinition name="exit" />
        <bpmn:outgoing>ToExit</bpmn:outgoing>
      </bpmn:intermediateCatchEvent>
      <bpmn:intermediateThrowEvent id="Exit">
        <bpmn:incoming>ToExit</bpmn:incoming>
        <bpmn:escalationEventDefinition />
      </bpmn:intermediateThrowEvent>
      <bpmn:sequenceFlow id="ToLink" sourceRef="Entry" targetRef="LinkThrow" />
      <bpmn:sequenceFlow id="ToExit" sourceRef="LinkCatch" targetRef="Exit" />
    `)
  },
  ...[
    [ 'unmatched boundary', '<bpmn:escalationEventDefinition escalationRef="OtherEscalation" />', '' ],
    [ 'non-interrupting catch-all boundary', '<bpmn:escalationEventDefinition />', 'cancelActivity="false"' ]
  ].map(([ name, definition, attributes ]) => ({
    name: `potential exit ignores ${ name }`,
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
        </bpmn:extensionElements>
        ${ potentialExitFlow() }
      </bpmn:adHocSubProcess>
      <bpmn:boundaryEvent id="Boundary" attachedToRef="AHSP_1" ${ attributes }>
        ${ definition }
      </bpmn:boundaryEvent>
    `).replace('</bpmn:definitions>', '<bpmn:escalation id="OtherEscalation" escalationCode="OTHER" /></bpmn:definitions>'))
  })),
  {
    name: 'dynamic escalation code still expresses potential exit intent',
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(
      potentialExitFlow().replace('<bpmn:escalationEventDefinition />', '<bpmn:escalationEventDefinition escalationRef="DynamicEscalation" />'),
      '<bpmn:escalation id="DynamicEscalation" escalationCode="=code" />'
    )
  },
  {
    name: 'upstream result suppresses returning leaf warning in a mixed flow',
    config: { version: '8.8' },
    moddleElement: sharedExitFlow('<zeebe:output source="=summary" target="toolCallResult" />')
  },
  {
    name: 'intermediate event tool maps toolCallResult',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolEvent(`
      <zeebe:output source="=reply" target="toolCallResult" />
    `))
  },
  {
    name: 'toolCallResult output present',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=taskResult" target="toolCallResult" />
    `))
  },
  {
    name: 'toolCallResult present among multiple outputs',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=taskResult" target="toolCallResult" />
      <zeebe:output source="=extra" target="extra" />
    `))
  },
  {
    name: 'task inside AHSP with no agentic marker — not agentic, skipped',
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
  },
  {
    name: 'period-target contribution (toolCallResult.statusCode)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=statusCode" target="toolCallResult.statusCode" />
    `))
  },
  {
    name: 'script task resultVariable is toolCallResult',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
        </bpmn:extensionElements>
        <bpmn:scriptTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:script expression="=result" resultVariable="toolCallResult" />
            <zeebe:ioMapping>
              <zeebe:input source="=toolCall.query" target="query" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:scriptTask>
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'connector resultExpression header contains toolCallResult',
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
            <zeebe:taskHeaders>
              <zeebe:header key="resultExpression" value="={toolCallResult: response.body}" />
            </zeebe:taskHeaders>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'connector resultVariable header is toolCallResult',
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
            <zeebe:taskHeaders>
              <zeebe:header key="resultVariable" value="toolCallResult" />
            </zeebe:taskHeaders>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'downstream element sets toolCallResult — entry activity stays silent',
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
              <zeebe:output source="=intermediate" target="lookupData" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_2">
          <bpmn:incoming>Flow_1</bpmn:incoming>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=lookupData" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2" />
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'non-entry activity with misdirected outputs — reported via its entry, not itself',
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
              <zeebe:output source="=result" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_2">
          <bpmn:incoming>Flow_1</bpmn:incoming>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=extra" target="sideChannel" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2" />
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'sub-process tool whose child sets toolCallResult',
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
                <zeebe:output source="=result" target="toolCallResult" />
              </zeebe:ioMapping>
            </bpmn:extensionElements>
          </bpmn:serviceTask>
        </bpmn:subProcess>
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'entry sets toolCallResult, downstream appends via context put(): no overwrite',
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
              <zeebe:output source="=a" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_2">
          <bpmn:incoming>Flow_1</bpmn:incoming>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=context put(toolCallResult, &quot;confirmation&quot;, b)" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2" />
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'entry and downstream write different toolCallResult parts: no overwrite',
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
              <zeebe:output source="=a" target="toolCallResult.statusCode" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_2">
          <bpmn:incoming>Flow_1</bpmn:incoming>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=b" target="toolCallResult.body" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2" />
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'toolCallResult written on two mutually exclusive branches: no overwrite (branches never both run)',
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
        <bpmn:exclusiveGateway id="Gateway_1">
          <bpmn:incoming>Flow_1</bpmn:incoming>
          <bpmn:outgoing>Flow_2</bpmn:outgoing>
          <bpmn:outgoing>Flow_3</bpmn:outgoing>
        </bpmn:exclusiveGateway>
        <bpmn:serviceTask id="Task_A">
          <bpmn:incoming>Flow_2</bpmn:incoming>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=a" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_B">
          <bpmn:incoming>Flow_3</bpmn:incoming>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=b" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Gateway_1" />
        <bpmn:sequenceFlow id="Flow_2" sourceRef="Gateway_1" targetRef="Task_A" />
        <bpmn:sequenceFlow id="Flow_3" sourceRef="Gateway_1" targetRef="Task_B" />
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'sub-process tool sets toolCallResult itself; inner task writes nothing — inner is not a separate tool',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
        </bpmn:extensionElements>
        <bpmn:subProcess id="Sub_1">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=result" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
          <bpmn:serviceTask id="Inner_1" />
        </bpmn:subProcess>
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'toolCallResult output present inside legacy AI Agent template AHSP — treated as agentic',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1" zeebe:modelerTemplate="io.camunda.connectors.agenticai.aiagent.jobworker.v1">
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:input source="=toolCall.url" target="url" />
              <zeebe:output source="=taskResult" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `))
  }
];

const invalid = [
  ...[
    [ 'task', '' ],
    [ 'subProcess', '<bpmn:task id="Inner" />' ],
    [ 'intermediateCatchEvent', '<bpmn:messageEventDefinition />' ],
    [ 'intermediateThrowEvent', '<bpmn:signalEventDefinition />' ]
  ].map(([ type, contents ]) => ({
    name: `returning ${ type } leaf is not excused by a sibling exit`,
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(`
      ${ potentialExitFlow().replace('<bpmn:outgoing>Flow_1</bpmn:outgoing>', '<bpmn:outgoing>Flow_1</bpmn:outgoing><bpmn:outgoing>Flow_2</bpmn:outgoing>') }
      <bpmn:${ type } id="Leaf">
        <bpmn:incoming>Flow_2</bpmn:incoming>
        ${ contents }
      </bpmn:${ type }>
      <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Leaf" />
    `),
    report: {
      id: 'Leaf',
      message: 'Tool returns nothing to the agent. Set a "toolCallResult" (at minimum, note the task completed).',
      data: { type: ERROR_TYPES.AGENT_TOOL_RESULT_MISSING },
      path: null
    }
  })),
  {
    name: 'catch-only event subprocess does not express throw intent',
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(`
      <bpmn:task id="Task_1" />
      <bpmn:subProcess id="Handler" triggeredByEvent="true">
        <bpmn:startEvent id="Catch">
          <bpmn:escalationEventDefinition />
        </bpmn:startEvent>
      </bpmn:subProcess>
    `),
    report: {
      id: 'Task_1',
      message: 'Tool returns nothing to the agent. Set a "toolCallResult" (at minimum, note the task completed).',
      data: { type: ERROR_TYPES.AGENT_TOOL_RESULT_MISSING },
      path: null
    }
  },
  {
    name: 'terminate inside a nested subprocess does not express agent exit intent',
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(`
      <bpmn:subProcess id="Tool">
        <bpmn:endEvent id="Terminate"><bpmn:terminateEventDefinition /></bpmn:endEvent>
      </bpmn:subProcess>
    `),
    report: {
      id: 'Tool',
      message: 'Tool returns nothing to the agent. Set a "toolCallResult" (at minimum, note the task completed).',
      data: { type: ERROR_TYPES.AGENT_TOOL_RESULT_MISSING },
      path: null
    }
  },
  ...[ [ false, false ], [ true, false ], [ false, true ] ].map(([ boundary, sharedLeaf ]) => ({
    name: `shared potential exit reports the returning leaf once (boundary=${ boundary }, sharedLeaf=${ sharedLeaf })`,
    config: { version: '8.8' },
    moddleElement: sharedExitFlow('', boundary, sharedLeaf),
    report: {
      id: 'Summarize',
      message: 'Tool returns nothing to the agent. Set a "toolCallResult" (at minimum, note the task completed).',
      data: { type: ERROR_TYPES.AGENT_TOOL_RESULT_MISSING },
      path: null,
      name: 'LLM Summarize'
    }
  })),
  {
    name: 'potential exit still reports wrong casing',
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(potentialExitFlow(`
      <zeebe:output source="=reason" target="reason" />
      <zeebe:output source="=reason" target="toolcallresult" />
    `)),
    report: {
      id: 'Task_1',
      message: 'Wrong casing "toolcallresult": use toolCallResult (case-sensitive).',
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
      path: [ 'extensionElements', 'values', 0, 'outputParameters', 1, 'target' ]
    }
  },
  {
    name: 'potential exit still reports linear overwrites',
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(`
      <bpmn:serviceTask id="Entry">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:output source="=first" target="toolCallResult" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
        <bpmn:outgoing>Flow_0</bpmn:outgoing>
      </bpmn:serviceTask>
      <bpmn:serviceTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:output source="=second" target="toolCallResult" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
        <bpmn:incoming>Flow_0</bpmn:incoming>
        <bpmn:outgoing>Flow_1</bpmn:outgoing>
      </bpmn:serviceTask>
      <bpmn:endEvent id="Throw_1">
        <bpmn:incoming>Flow_1</bpmn:incoming>
        <bpmn:escalationEventDefinition />
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_0" sourceRef="Entry" targetRef="Task_1" />
      <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Throw_1" />
    `),
    report: {
      id: 'Task_1',
      message: 'This overwrites the "toolCallResult" value set on "Entry".',
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_OVERWRITE },
      path: OUTPUT_TARGET_PATH
    }
  },
  {
    name: 'ordinary returning flow reports missing result on the entry',
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(`
      <bpmn:task id="Entry"><bpmn:outgoing>Flow_1</bpmn:outgoing></bpmn:task>
      <bpmn:task id="Leaf">
        <bpmn:incoming>Flow_1</bpmn:incoming>
        <bpmn:outgoing>Flow_2</bpmn:outgoing>
      </bpmn:task>
      <bpmn:endEvent id="End"><bpmn:incoming>Flow_2</bpmn:incoming></bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_1" sourceRef="Entry" targetRef="Leaf" />
      <bpmn:sequenceFlow id="Flow_2" sourceRef="Leaf" targetRef="End" />
    `),
    report: {
      id: 'Entry',
      message: 'Tool returns nothing to the agent. Set a "toolCallResult" (at minimum, note the task completed).',
      data: { type: ERROR_TYPES.AGENT_TOOL_RESULT_MISSING },
      path: null
    }
  },
  {
    name: 'potential exit in another tool does not exempt a returning tool',
    config: { version: '8.8' },
    moddleElement: agenticToolFlow(`
      ${ potentialExitFlow() }
      <bpmn:task id="Returning" />
    `),
    report: {
      id: 'Returning',
      message: 'Tool returns nothing to the agent. Set a "toolCallResult" (at minimum, note the task completed).',
      data: { type: ERROR_TYPES.AGENT_TOOL_RESULT_MISSING },
      path: null
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
      message: WARN_MESSAGE,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
      path: OUTPUT_TARGET_PATH
    }
  },
  {
    name: 'blank output target',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=taskResult" target="" />
    `)),
    report: {
      id: 'Task_1',
      message: WARN_MESSAGE,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
      path: OUTPUT_TARGET_PATH
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
      message: WARN_MESSAGE,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
      path: OUTPUT_TARGET_PATH
    }
  },
  {
    name: 'wrong casing in output target (toolcallresult)',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=taskResult" target="toolcallresult" />
    `)),
    report: {
      id: 'Task_1',
      message: 'Wrong casing "toolcallresult": use toolCallResult (case-sensitive).',
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
      path: OUTPUT_TARGET_PATH
    }
  },
  {
    name: 'wrong casing in connector resultExpression header (toolcallresult)',
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
            <zeebe:taskHeaders>
              <zeebe:header key="resultExpression" value="={toolcallresult: response.body}" />
            </zeebe:taskHeaders>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'Wrong casing "toolcallresult": use toolCallResult (case-sensitive).',
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
      path: HEADER_VALUE_PATH
    }
  },
  {
    name: 'multiple outputs, none is toolCallResult — each row reported',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=a" target="foo" />
      <zeebe:output source="=b" target="bar" />
    `)),
    report: [
      {
        id: 'Task_1',
        message: WARN_MESSAGE,
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
        path: [ 'extensionElements', 'values', 0, 'outputParameters', 0, 'target' ]
      },
      {
        id: 'Task_1',
        message: WARN_MESSAGE,
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
        path: [ 'extensionElements', 'values', 0, 'outputParameters', 1, 'target' ]
      }
    ]
  },
  {
    name: 'misdirected output and casing near-miss on sibling rows — each reported on its own row',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=a" target="someOtherVariable" />
      <zeebe:output source="=b" target="toolCallresult" />
    `)),
    report: [
      {
        id: 'Task_1',
        message: WARN_MESSAGE,
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
        path: [ 'extensionElements', 'values', 0, 'outputParameters', 0, 'target' ]
      },
      {
        id: 'Task_1',
        message: 'Wrong casing "toolCallresult": use toolCallResult (case-sensitive).',
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
        path: [ 'extensionElements', 'values', 0, 'outputParameters', 1, 'target' ]
      }
    ]
  },
  {
    name: 'two casing near-misses — each reported',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=a" target="toolcallresult" />
      <zeebe:output source="=b" target="TOOLCALLRESULT.statusCode" />
    `)),
    report: [
      {
        id: 'Task_1',
        message: 'Wrong casing "toolcallresult": use toolCallResult (case-sensitive).',
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
        path: [ 'extensionElements', 'values', 0, 'outputParameters', 0, 'target' ]
      },
      {
        id: 'Task_1',
        message: 'Wrong casing "TOOLCALLRESULT.statusCode": use toolCallResult (case-sensitive).',
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
        path: [ 'extensionElements', 'values', 0, 'outputParameters', 1, 'target' ]
      }
    ]
  },
  {
    name: 'casing near-misses alongside a correct toolCallResult write — still reported',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=a" target="toolcallresult" />
      <zeebe:output source="=b" target="toolCallresult" />
      <zeebe:output source="=c" target="toolCallResult" />
    `)),
    report: [
      {
        id: 'Task_1',
        message: 'Wrong casing "toolcallresult": use toolCallResult (case-sensitive).',
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
        path: [ 'extensionElements', 'values', 0, 'outputParameters', 0, 'target' ]
      },
      {
        id: 'Task_1',
        message: 'Wrong casing "toolCallresult": use toolCallResult (case-sensitive).',
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
        path: [ 'extensionElements', 'values', 0, 'outputParameters', 1, 'target' ]
      }
    ]
  },
  {
    name: 'miscased resultExpression alongside a correct toolCallResult write — still reported',
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
            <zeebe:taskHeaders>
              <zeebe:header key="resultExpression" value="={toolcallresult: response.body}" />
            </zeebe:taskHeaders>
            <zeebe:ioMapping>
              <zeebe:output source="=taskResult" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'Wrong casing "toolcallresult": use toolCallResult (case-sensitive).',
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
      path: HEADER_VALUE_PATH
    }
  },
  {
    name: 'miscased token inside a resultExpression that also sets toolCallResult — still reported',
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
            <zeebe:taskHeaders>
              <zeebe:header key="resultExpression" value="={toolcallresult: a, toolCallResult: b}" />
            </zeebe:taskHeaders>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'Wrong casing "toolcallresult": use toolCallResult (case-sensitive).',
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
      path: HEADER_VALUE_PATH
    }
  },
  {
    name: 'miscased token after a correctly cased one in the same resultExpression — miscased token named',
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
            <zeebe:taskHeaders>
              <zeebe:header key="resultExpression" value="={toolCallResult: a, TOOLCALLRESULT: b}" />
            </zeebe:taskHeaders>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: 'Wrong casing "TOOLCALLRESULT": use toolCallResult (case-sensitive).',
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
      path: HEADER_VALUE_PATH
    }
  },
  {
    name: 'misdirected writes on entry and downstream element — each reported where it was written',
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
              <zeebe:output source="=a" target="foo" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_2">
          <bpmn:incoming>Flow_1</bpmn:incoming>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=b" target="bar" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2" />
      </bpmn:adHocSubProcess>
    `)),
    report: [
      {
        id: 'Task_1',
        message: WARN_MESSAGE,
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
        path: OUTPUT_TARGET_PATH
      },
      {
        id: 'Task_2',
        message: WARN_MESSAGE,
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
        path: OUTPUT_TARGET_PATH
      }
    ]
  },
  {
    name: 'misdirected result across the tool flow: reported on the element that wrote it, not the entry',
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
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=result" target="toolCalResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2" />
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_2',
      message: WARN_MESSAGE,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
      path: OUTPUT_TARGET_PATH
    }
  },
  {
    name: 'wrong casing on a downstream element: reported there, not on the entry',
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
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=result" target="toolcallresult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2" />
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_2',
      message: 'Wrong casing "toolcallresult": use toolCallResult (case-sensitive).',
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
      path: OUTPUT_TARGET_PATH
    }
  },
  {
    name: 'tool with no result channel at all — returns nothing to the agent',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask()),
    report: {
      id: 'Task_1',
      message: 'Tool returns nothing to the agent. Set a "toolCallResult" (at minimum, note the task completed).',
      data: { type: ERROR_TYPES.AGENT_TOOL_RESULT_MISSING },
      path: OUTPUTS_ANCHOR_PATH
    }
  },
  {
    name: 'intermediate event tool with no result channel — returns nothing to the agent',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolEvent()),
    report: {
      id: 'Event_1',
      message: 'Tool returns nothing to the agent. Set a "toolCallResult" (at minimum, note the task completed).',
      data: { type: ERROR_TYPES.AGENT_TOOL_RESULT_MISSING },
      path: OUTPUTS_ANCHOR_PATH
    }
  },
  {
    name: 'script task resultVariable misdirected (toolResult)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
        </bpmn:extensionElements>
        <bpmn:scriptTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:script expression="=result" resultVariable="toolResult" />
          </bpmn:extensionElements>
        </bpmn:scriptTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: WARN_MESSAGE,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
      path: RESULT_VARIABLE_PATH
    }
  },
  {
    name: 'entry and downstream connector both set toolCallResult: downstream overwrites entry',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
          </zeebe:properties>
        </bpmn:extensionElements>
        <bpmn:serviceTask id="Task_1" name="Fetch data">
          <bpmn:outgoing>Flow_1</bpmn:outgoing>
          <bpmn:extensionElements>
            <zeebe:taskHeaders>
              <zeebe:header key="resultExpression" value="={toolCallResult: response.body}" />
            </zeebe:taskHeaders>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_2" name="Re-send">
          <bpmn:incoming>Flow_1</bpmn:incoming>
          <bpmn:extensionElements>
            <zeebe:taskHeaders>
              <zeebe:header key="resultExpression" value="={toolCallResult: response.body}" />
            </zeebe:taskHeaders>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2" />
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_2',
      message: 'This overwrites the "toolCallResult" value set on "Fetch data".',
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_OVERWRITE },
      path: HEADER_VALUE_PATH,
      name: 'Re-send'
    }
  },
  {
    name: 'wrong output target key inside legacy AI Agent template AHSP — treated as agentic, reported',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1" zeebe:modelerTemplate="io.camunda.connectors.agenticai.aiagent.jobworker.v1">
        <bpmn:serviceTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:input source="=toolCall.url" target="url" />
              <zeebe:output source="=taskResult" target="result" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'Task_1',
      message: WARN_MESSAGE,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
      path: OUTPUT_TARGET_PATH
    }
  },
  {
    name: 'three elements each overwrite toolCallResult: two warnings, each naming the one before it',
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
              <zeebe:output source="=a" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_2">
          <bpmn:incoming>Flow_1</bpmn:incoming>
          <bpmn:outgoing>Flow_2</bpmn:outgoing>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=b" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:serviceTask id="Task_3">
          <bpmn:incoming>Flow_2</bpmn:incoming>
          <bpmn:extensionElements>
            <zeebe:ioMapping>
              <zeebe:output source="=c" target="toolCallResult" />
            </zeebe:ioMapping>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="Task_1" targetRef="Task_2" />
        <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_2" targetRef="Task_3" />
      </bpmn:adHocSubProcess>
    `)),
    report: [
      {
        id: 'Task_2',
        message: 'This overwrites the "toolCallResult" value set on "Task_1".',
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_OVERWRITE },
        path: OUTPUT_TARGET_PATH
      },
      {
        id: 'Task_3',
        message: 'This overwrites the "toolCallResult" value set on "Task_2".',
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_OVERWRITE },
        path: OUTPUT_TARGET_PATH
      }
    ]
  }
];

RuleTester.verify('agent-tool-output-key', rule, {
  valid,
  invalid
});

describe('agent-tool-output-key repeated lint', function() {
  it('reports returning leaves again when linting the same definitions', async function() {

    // given
    const { root } = await sharedExitFlow();
    const linter = new Linter({
      config: { rules: { 'agent-tool-output-key': [ 'warn', { version: '8.8' } ] } },
      resolver: { resolveRule: () => rule }
    });

    // when
    const first = await linter.lint(root);
    const second = await linter.lint(root);

    // then
    expect(first['agent-tool-output-key']).to.have.length(1);
    expect(second).to.deep.equal(first);
  });
});
