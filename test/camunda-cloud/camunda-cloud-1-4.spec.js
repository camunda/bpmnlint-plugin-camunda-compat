const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaCloud14Rule = require('../../rules/camunda-cloud-1-4');

const {
  createDefinitions,
  createModdle
} = require('../helper');

const createCloudProcess = require('../helper').createCloudProcess('1.4.0');

const { valid: camundaCloud13Valid } = require('./camunda-cloud-1-3.spec');

const valid = [
  ...camundaCloud13Valid
];

module.exports.valid = valid;

const invalid = [
  {
    name: 'complex gateway',
    moddleElement: createModdle(createCloudProcess('<bpmn:complexGateway id="ComplexGateway_1" />')),
    report: {
      id: 'ComplexGateway_1',
      message: 'Element of type <bpmn:ComplexGateway> not supported by Camunda Cloud 1.4'
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
      executionPlatform: 'Camunda Platform',
      executionPlatformVersion: '1.4.0'
    })),
    report: {
      id: 'Process_1',
      message: 'Element of type <bpmn:Process (bpmn:LaneSet)> not supported by Camunda Cloud 1.4'
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
      message: 'Element of type <bpmn:StartEvent (bpmn:SignalEventDefinition)> not supported by Camunda Cloud 1.4'
    }
  }
];

RuleTester.verify('camunda-cloud-1-4', camundaCloud14Rule, {
  valid,
  invalid
});