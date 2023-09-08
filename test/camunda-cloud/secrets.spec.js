const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/secrets');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'subscription with valid correlation key',
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
          <zeebe:subscription correlationKey="{{secrets.FOO}}" />
        </bpmn:extensionElements>
      </bpmn:message>
    `))
  },
  {
    name: 'input with valid source',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="{{secrets.FOO}}" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'property with valid value',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="bar" value="{{secrets.FOO}}" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:intermediateCatchEvent>
    `))
  }
];

const invalid = [
  {
    name: 'subscription with invalid correlation key',
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
          <zeebe:subscription correlationKey="=secrets.FOO" />
        </bpmn:extensionElements>
      </bpmn:message>
    `)),
    report: [
      {
        id: 'StartEvent_1',
        message: 'Property <correlationKey> uses deprecated secret expression format',
        path: [
          'rootElements',
          1,
          'extensionElements',
          'values',
          0,
          'correlationKey'
        ],
        data: {
          type: ERROR_TYPES.SECRET_EXPRESSION_FORMAT_DEPRECATED,
          node: 'zeebe:Subscription',
          parentNode: 'StartEvent_1',
          property: 'correlationKey'
        }
      }
    ]
  },
  {
    name: 'input with invalid source',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="{secrets.FOO}" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Property <source> uses deprecated secret expression format',
        path: [
          'extensionElements',
          'values',
          0,
          'inputParameters',
          0,
          'source'
        ],
        data: {
          type: ERROR_TYPES.SECRET_EXPRESSION_FORMAT_DEPRECATED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask_1',
          property: 'source'
        }
      }
    ]
  },
  {
    name: 'property with invalid value',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="bar" value="secrets.FOO" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:intermediateCatchEvent>
    `)),
    report: [
      {
        id: 'IntermediateCatchEvent_1',
        message: 'Property <value> uses deprecated secret expression format',
        path: [
          'extensionElements',
          'values',
          0,
          'properties',
          0,
          'value'
        ],
        data: {
          type: ERROR_TYPES.SECRET_EXPRESSION_FORMAT_DEPRECATED,
          node: 'zeebe:Property',
          parentNode: 'IntermediateCatchEvent_1',
          property: 'value'
        }
      }
    ]
  }
];

RuleTester.verify('secrets', rule, {
  valid,
  invalid
});
