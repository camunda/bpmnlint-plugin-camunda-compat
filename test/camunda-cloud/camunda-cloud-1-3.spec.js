const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaCloud13Rule = require('../../rules/camunda-cloud-1-3');

const {
  createDefinitions,
  createModdle
} = require('../helper');

const createCloudProcess = require('../helper').createCloudProcess('1.3.0');

const { valid: camundaCloud12Valid } = require('./camunda-cloud-1-2.spec');

const valid = [
  ...camundaCloud12Valid,
  {
    name: 'business rule task (called decision)',
    moddleElement: createModdle(createCloudProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision decisionId="foo" resultVariable="bar"/>
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  },
];

module.exports.valid = valid;

const invalid = [
  {
    name: 'business rule task (no task definition)',
    moddleElement: createModdle(createCloudProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />')),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <bpmn:BusinessRuleTask> must have either <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element'
    }
  },
  {
    name: 'business rule task (no task definition type)',
    moddleElement: createModdle(createCloudProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: [
      {
        id: 'BusinessRuleTask_1',
        message: 'Element of type <zeebe:TaskDefinition> must have <zeebe:type> property',
        path: [ 'extensionElements', 'values', 0, 'type' ]
      },
      {
        id: 'BusinessRuleTask_1',
        message: 'Element of type <zeebe:TaskDefinition> must have <zeebe:retries> property',
        path: [ 'extensionElements', 'values', 0, 'retries' ]
      }
    ]
  },
  {
    name: 'business rule task (task definition and called decision)',
    moddleElement: createModdle(createCloudProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision />
          <zeebe:taskDefinition />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <bpmn:BusinessRuleTask> must have either <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element'
    }
  },
  {
    name: 'complex gateway',
    moddleElement: createModdle(createCloudProcess('<bpmn:complexGateway id="ComplexGateway_1" />')),
    report: {
      id: 'ComplexGateway_1',
      message: 'Element of type <bpmn:ComplexGateway> not supported by Camunda Cloud 1.3'
    }
  },
  {
    name: 'lane',
    moddleElement: createModdle(createDefinitions(`
    <bpmn:collaboration id="Collaboration_1">
      <bpmn:participant id="Participant_1" processRef="Process_1" />
    </bpmn:collaboration>
    <bpmn:process id="Process_1">
      <bpmn:laneSet id="LaneSet_1">
        <bpmn:lane id="Lane_1" />
      </bpmn:laneSet>
    </bpmn:process>
  `, {
      namespaces: `
        xmlns:modeler="http://camunda.org/schema/modeler/1.0"
        xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
      `,
      executionPlatform: 'Camunda Cloud',
      executionPlatformVersion: '1.3.0'
    })),
    report: {
      id: 'Process_1',
      message: 'Element of type <bpmn:Process (bpmn:LaneSet)> not supported by Camunda Cloud 1.3'
    }
  },
  {
    name: 'signal start event',
    moddleElement: createModdle(createCloudProcess(`
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:signalEventDefinition id="SignalEventDefinition_1" />
    </bpmn:startEvent>
    `)),
    report: {
      id: 'StartEvent_1',
      message: 'Element of type <bpmn:StartEvent (bpmn:SignalEventDefinition)> not supported by Camunda Cloud 1.3'
    }
  }
];

RuleTester.verify('camunda-cloud-1-3', camundaCloud13Rule, {
  valid,
  invalid
});