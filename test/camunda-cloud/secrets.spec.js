const RuleTester = require('bpmnlint/lib/testers/rule-tester');
const rule = require('../../rules/camunda-cloud/secrets');
const { createDefinitions, createModdle } = require('../helper');
const { ERROR_TYPES } = require('../../rules/utils/element');


const valid = [
  {
    name: 'task with valid zeebe:properties',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:task id="Task_1" />
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="validName" value="{{secrets.VALID_SECRET}}" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'invalid secrets format in correlation key',
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
          <zeebe:subscription correlationKey="=secrets.KEY}" />
        </bpmn:extensionElements>
      </bpmn:message>
    `)),
    report: [
      {
        id: 'Message_1',
        message: 'Element of type <zeebe:Subscription> contains an invalid secret format in property \'correlationKey\'. Must be {{secrets.YOUR_SECRET}}',
        path: null,
        data: {
          type: ERROR_TYPES.INVALID_SECRET_FORMAT,
          node: 'zeebe:Subscription',
          parentNode: 'Message_1',
          invalidProperty: 'correlationKey'
        },
        name: 'Message_1'
      }
    ]
  },
  {
    name: 'invalid secrets format in zeebe:input',
    moddleElement: createModdle(createDefinitions(`
    <bpmn:process id="Process_1yug3vp" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_1a2mt2i</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_1a2mt2i" sourceRef="StartEvent_1" targetRef="Activity_0gcnr68" />
    <bpmn:endEvent id="Event_14xw0vt">
      <bpmn:incoming>Flow_1i92ojz</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1i92ojz" sourceRef="Activity_0gcnr68" targetRef="Event_14xw0vt" />
    <bpmn:serviceTask id="Activity_0gcnr68" zeebe:modelerTemplate="io.camunda.connectors.HttpJson.v2" zeebe:modelerTemplateVersion="1" zeebe:modelerTemplateIcon="data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M17.0335%208.99997C17.0335%2013.4475%2013.4281%2017.0529%208.98065%2017.0529C4.53316%2017.0529%200.927765%2013.4475%200.927765%208.99997C0.927765%204.55248%204.53316%200.947083%208.98065%200.947083C13.4281%200.947083%2017.0335%204.55248%2017.0335%208.99997Z%22%20fill%3D%22%23505562%22%2F%3E%0A%3Cpath%20d%3D%22M4.93126%2014.1571L6.78106%203.71471H10.1375C11.1917%203.71471%2011.9824%203.98323%2012.5095%204.52027C13.0465%205.04736%2013.315%205.73358%2013.315%206.57892C13.315%207.44414%2013.0714%208.15522%2012.5841%208.71215C12.1067%209.25913%2011.4553%209.63705%2010.6298%209.8459L12.0619%2014.1571H10.3315L9.03364%2010.0249H7.24351L6.51254%2014.1571H4.93126ZM7.49711%208.59281H9.24248C9.99832%208.59281%2010.5901%208.42374%2011.0177%208.08561C11.4553%207.73753%2011.6741%207.26513%2011.6741%206.66842C11.6741%206.19106%2011.5249%205.81811%2011.2265%205.54959C10.9282%205.27113%2010.4558%205.1319%209.80936%205.1319H8.10874L7.49711%208.59281Z%22%20fill%3D%22white%22%2F%3E%0A%3C%2Fsvg%3E%0A">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="io.camunda:http-json:1" />
        <zeebe:ioMapping>
          <zeebe:input source="get" target="method" />
          <zeebe:input source="{secrets.url}" target="url" />
        </zeebe:ioMapping>
        <zeebe:taskHeaders>
          <zeebe:header key="resultVariable" value="res" />
        </zeebe:taskHeaders>
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_1a2mt2i</bpmn:incoming>
      <bpmn:outgoing>Flow_1i92ojz</bpmn:outgoing>
    </bpmn:serviceTask>
  </bpmn:process>
    `)),
    report: [
      {
        id: 'Activity_0gcnr68',
        message: 'Element of type <zeebe:Input> contains an invalid secret format in property \'url\'. Must be {{secrets.YOUR_SECRET}}',
        path: null,
        data: {
          type: ERROR_TYPES.INVALID_SECRET_FORMAT,
          node: 'zeebe:Input',
          parentNode: 'Activity_0gcnr68',
          invalidProperty: 'url'
        }
      }
    ]
  },
  {
    name: 'invalid secrets format in zeebe:Properties',
    moddleElement: createModdle(createDefinitions(`
  <bpmn:process id="Process_0wiwn7y" isExecutable="true">
    <bpmn:startEvent id="Event_1xpo622">
      <bpmn:outgoing>Flow_1yuqdrv</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_1yuqdrv" sourceRef="Event_1xpo622" targetRef="Event_0e1cp3m" />
    <bpmn:endEvent id="Event_1ovheam">
      <bpmn:incoming>Flow_1aiiv9w</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1aiiv9w" sourceRef="Event_0e1cp3m" targetRef="Event_1ovheam" />
    <bpmn:intermediateCatchEvent id="Event_0e1cp3m" zeebe:modelerTemplate="io.camunda.connectors.AWSEventBridge.intermediate.v1" zeebe:modelerTemplateVersion="1">
      <bpmn:extensionElements>
        <zeebe:properties>
          <zeebe:property name="inbound.type" value="io.camunda:webhook:1" />
          <zeebe:property name="inbound.shouldValidateHmac" value="disabled" />
          <zeebe:property name="inbound.authorizationType" value="BASIC" />
          <zeebe:property name="inbound.basic.username" value="secrets.USERNAME" />
        </zeebe:properties>
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_1yuqdrv</bpmn:incoming>
      <bpmn:outgoing>Flow_1aiiv9w</bpmn:outgoing>
      <bpmn:messageEventDefinition id="MessageEventDefinition_0ux4vg3" messageRef="Message_0qsf7ae" />
    </bpmn:intermediateCatchEvent>
  </bpmn:process>
    `)),
    report: [
      {
        id: 'Event_0e1cp3m',
        message: 'Element of type <zeebe:Property> contains an invalid secret format in property \'inbound.basic.username\'. Must be {{secrets.YOUR_SECRET}}',
        path: null,
        data: {
          type: ERROR_TYPES.INVALID_SECRET_FORMAT,
          node: 'zeebe:Property',
          parentNode: 'Event_0e1cp3m',
          invalidProperty: 'inbound.basic.username'
        }
      }
    ]
  }
];

RuleTester.verify('secrets', rule, {
  valid,
  invalid
});
