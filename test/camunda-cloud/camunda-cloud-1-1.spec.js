const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaCloud11Rule = require('../../rules/camunda-cloud-1-1');

const {
  createDefinitions,
  createModdle
} = require('../helper');

const createCloudProcess = require('../helper').createCloudProcess('1.1.0');

const { valid: camundaCloud10Valid } = require('./camunda-cloud-1-0.spec');

const valid = [
  ...camundaCloud10Valid,
  {
    name: 'business rule task',
    moddleElement: createModdle(createCloudProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" retries="bar" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  },
  {
    name: 'intermediate throw event',
    moddleElement: createModdle(createCloudProcess('<bpmn:intermediateThrowEvent id="IntermediateThrowEvent_1" />'))
  },
  {
    name: 'manual task',
    moddleElement: createModdle(createCloudProcess('<bpmn:manualTask id="ManualTask_1" />'))
  },
  {
    name: 'script task',
    moddleElement: createModdle(createCloudProcess(`
      <bpmn:scriptTask id="ScriptTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" retries="bar" />
        </bpmn:extensionElements>
      </bpmn:scriptTask>
    `))
  },
  {
    name: 'send task',
    moddleElement: createModdle(createCloudProcess('<bpmn:sendTask id="SendTask_1" />'))
  }
];

module.exports.valid = valid;

const invalid = [
  {
    name: 'business rule task',
    moddleElement: createModdle(createCloudProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />')),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <bpmn:BusinessRuleTask> must have <zeebe:TaskDefinition> extension element'
    }
  },
  {
    name: 'complex gateway',
    moddleElement: createModdle(createCloudProcess('<bpmn:complexGateway id="ComplexGateway_1" />')),
    report: {
      id: 'ComplexGateway_1',
      message: 'Element of type <bpmn:ComplexGateway> not supported by Camunda Cloud 1.1'
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
      executionPlatformVersion: '1.1.0'
    })),
    report: {
      id: 'Process_1',
      message: 'Element of type <bpmn:Process (bpmn:LaneSet)> not supported by Camunda Cloud 1.1'
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
      message: 'Element of type <bpmn:StartEvent (bpmn:SignalEventDefinition)> not supported by Camunda Cloud 1.1'
    }
  },
  {
    name: 'scrpipt task',
    moddleElement: createModdle(createCloudProcess('<bpmn:scriptTask id="ScriptTask_1"/>')),
    report: {
      id: 'ScriptTask_1',
      message: 'Element of type <bpmn:ScriptTask> must have <zeebe:TaskDefinition> extension element'
    }
  },
  }
];

RuleTester.verify('camunda-cloud-1-1', camundaCloud11Rule, {
  valid,
  invalid
});