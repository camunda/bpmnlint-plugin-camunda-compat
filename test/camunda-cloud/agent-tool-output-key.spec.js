const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/agent-tool-output-key');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/error-types');

const WARN_MESSAGE = '"toolCallResult" output is not mapped.';

function agenticToolTask(outputXml = '') {
  return createProcess(`
    <bpmn:adHocSubProcess id="AHSP_1">
      <bpmn:extensionElements>
        <zeebe:properties>
          <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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

const valid = [
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
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
  }
];

const invalid = [
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
      propertiesPanel: { entryIds: [ 'outputs' ] }
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
      propertiesPanel: { entryIds: [ 'outputs' ] }
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
      propertiesPanel: { entryIds: [ 'outputs' ] }
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
      propertiesPanel: { entryIds: [ 'outputs' ] }
    }
  },
  {
    name: 'wrong casing in connector resultExpression header (toolcallresult)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
      propertiesPanel: { entryIds: [ 'outputs' ] }
    }
  },
  {
    name: 'multiple outputs, none is toolCallResult',
    config: { version: '8.8' },
    moddleElement: createModdle(agenticToolTask(`
      <zeebe:output source="=a" target="foo" />
      <zeebe:output source="=b" target="bar" />
    `)),
    report: {
      id: 'Task_1',
      message: WARN_MESSAGE,
      data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
      propertiesPanel: { entryIds: [ 'outputs' ] }
    }
  },
  {
    name: 'misdirected result across the tool flow: reported on the element that wrote it, not the entry',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
      propertiesPanel: { entryIds: [ 'outputs' ] }
    }
  },
  {
    name: 'wrong casing on a downstream element: reported there, not on the entry',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
      propertiesPanel: { entryIds: [ 'outputs' ] }
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
      propertiesPanel: { entryIds: [ 'outputs' ] }
    }
  },
  {
    name: 'script task resultVariable misdirected (toolResult)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
      propertiesPanel: { entryIds: [ 'outputs' ] }
    }
  },
  {
    name: 'entry and downstream connector both set toolCallResult: downstream overwrites entry',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
      propertiesPanel: { entryIds: [ 'outputs' ] },
      name: 'Re-send'
    }
  },
  {
    name: 'three elements each overwrite toolCallResult: two warnings, each naming the one before it',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AHSP_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
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
        propertiesPanel: { entryIds: [ 'outputs' ] }
      },
      {
        id: 'Task_3',
        message: 'This overwrites the "toolCallResult" value set on "Task_2".',
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_OVERWRITE },
        propertiesPanel: { entryIds: [ 'outputs' ] }
      }
    ]
  }
];

RuleTester.verify('agent-tool-output-key', rule, {
  valid,
  invalid
});
