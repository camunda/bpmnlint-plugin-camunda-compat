const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/version-compatibility-validator');

const {
  createDefinitions,
  createModdle
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');


const valid = [
  {
    name: 'Process with version 8.6 meets all property version requirements',
    config: { version: '8.6' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:subProcess id="SubProcess_1" triggeredByEvent="true">
          <bpmn:startEvent id="StartEvent_1" isInterrupting="false">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:startEvent>
        </bpmn:subProcess>
      </bpmn:process>
      <bpmn:message id="Message_1" name="Message_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="inbound.type" value="io.camunda:connector-kafka-inbound:1" />
            <zeebe:property name="autoOffsetReset" value="latest" />
            <zeebe:property name="deduplicationModeManualFlag" value="true" />
            <zeebe:property name="deduplicationId" value="id" />
            <zeebe:property name="deduplicationMode" value="MANUAL" />
            <zeebe:property name="messageTtl" value="PT0S" />
            <zeebe:property name="consumeUnmatchedEvents" value="true" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:message>
    `))
  }
];

const invalid = [
  {
    name: 'DeduplicationModeManualFlag property is invalid under version 8.5',
    config: { version: '8.5' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:subProcess id="SubProcess_1" triggeredByEvent="true">
          <bpmn:startEvent id="StartEvent_1" isInterrupting="false">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:startEvent>
        </bpmn:subProcess>
      </bpmn:process>
      <bpmn:message id="Message_1" name="Message_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="inbound.type" value="io.camunda:connector-kafka-inbound:1" />
            <zeebe:property name="autoOffsetReset" value="latest" />
            <zeebe:property name="deduplicationModeManualFlag" value="true" />
            <zeebe:property name="deduplicationId" value="id" />
            <zeebe:property name="deduplicationMode" value="MANUAL" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:message>
    `)),
    report: [
      {
        id: 'Message_1',
        message: 'The property \'deduplicationModeManualFlag\' is only supported in Camunda Platform 8.6 or newer.',
        path: [
          'extensionElements',
          'values',
          0,
          'deduplicationModeManualFlag'
        ],
        data: {
          type: ERROR_TYPES.VERSION_INCOMPATIBILITY,
          node: 'zeebe:Properties',
          parentNode: 'Message_1',
          property: 'deduplicationModeManualFlag',
        },
        name: 'Message_1',
        category: 'error'
      }
    ]
  },
  {
    name: 'consumeUnmatchedEvents property is invalid under version 8.5',
    config: { version: '8.5' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:subProcess id="SubProcess_1" triggeredByEvent="true">
          <bpmn:startEvent id="StartEvent_1" isInterrupting="false">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:startEvent>
        </bpmn:subProcess>
      </bpmn:process>
      <bpmn:message id="Message_1" name="Message_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="inbound.type" value="io.camunda:connector-kafka-inbound:1" />
            <zeebe:property name="autoOffsetReset" value="latest" />
            <zeebe:property name="consumeUnmatchedEvents" value="true" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:message>
    `)),
    report: [
      {
        id: 'Message_1',
        message: 'The property \'consumeUnmatchedEvents\' is only supported in Camunda Platform 8.6 or newer.',
        path: [
          'extensionElements',
          'values',
          0,
          'consumeUnmatchedEvents'
        ],
        data: {
          type: ERROR_TYPES.VERSION_INCOMPATIBILITY,
          node: 'zeebe:Properties',
          parentNode: 'Message_1',
          property: 'consumeUnmatchedEvents',
        },
        name: 'Message_1',
        category: 'error'
      }
    ]
  },
  {
    name: 'messageTtl property is invalid under version 8.5',
    config: { version: '8.5' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:subProcess id="SubProcess_1" triggeredByEvent="true">
          <bpmn:startEvent id="StartEvent_1" isInterrupting="false">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:startEvent>
        </bpmn:subProcess>
      </bpmn:process>
      <bpmn:message id="Message_1" name="Message_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="inbound.type" value="io.camunda:connector-kafka-inbound:1" />
            <zeebe:property name="autoOffsetReset" value="latest" />
            <zeebe:property name="messageTtl" value="PT0S" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:message>
    `)),
    report: [
      {
        id: 'Message_1',
        message: 'The property \'messageTtl\' is only supported in Camunda Platform 8.6 or newer.',
        path: [
          'extensionElements',
          'values',
          0,
          'messageTtl'
        ],
        data: {
          type: ERROR_TYPES.VERSION_INCOMPATIBILITY,
          node: 'zeebe:Properties',
          parentNode: 'Message_1',
          property: 'messageTtl',
        },
        name: 'Message_1',
        category: 'error'
      }
    ]
  },
  {
    name: 'messageTtl property is invalid under version 8.3',
    config: { version: '8.3' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:subProcess id="SubProcess_1" triggeredByEvent="true">
          <bpmn:startEvent id="StartEvent_1" isInterrupting="false">
            <bpmn:messageEventDefinition id="MessageEventDefinition_1" messageRef="Message_1" />
          </bpmn:startEvent>
        </bpmn:subProcess>
      </bpmn:process>
      <bpmn:message id="Message_1" name="Message_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="inbound.type" value="io.camunda:connector-kafka-inbound:1" />
            <zeebe:property name="autoOffsetReset" value="latest" />
            <zeebe:property name="messageTtl" value="PT0S" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:message>
    `)),
    report: [
      {
        id: 'Message_1',
        message: 'The property \'messageTtl\' is only supported in Camunda Platform 8.6 or newer.',
        path: [
          'extensionElements',
          'values',
          0,
          'messageTtl'
        ],
        data: {
          type: ERROR_TYPES.VERSION_INCOMPATIBILITY,
          node: 'zeebe:Properties',
          parentNode: 'Message_1',
          property: 'messageTtl',
        },
        name: 'Message_1',
        category: 'error'
      }
    ]
  }
];

RuleTester.verify('version compatibility', rule, {
  valid,
  invalid
});
