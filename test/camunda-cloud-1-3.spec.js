const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaCloud13Rule = require('../rules/camunda-cloud-1-3');

const {
  createDefinitions,
  createModdle
} = require('./helper');

const createProcess = require('./helper').createProcess('1.3.0');

const { valid: camundaCloud12Valid } = require('./camunda-cloud-1-2.spec');

const valid = [
  ...camundaCloud12Valid
];

module.exports.valid = valid;

const invalid = [
  {
    name: 'complex gateway',
    moddleElement: createModdle(createProcess('<bpmn:complexGateway id="ComplexGateway_1" />')),
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
    `, '1.3.0')),
    report: {
      id: 'Process_1',
      message: 'Element of type <bpmn:Process (bpmn:LaneSet)> not supported by Camunda Cloud 1.3'
    }
  },
  {
    name: 'signal start event',
    moddleElement: createModdle(createProcess(`
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