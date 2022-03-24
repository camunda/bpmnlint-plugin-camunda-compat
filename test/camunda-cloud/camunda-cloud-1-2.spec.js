const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaCloud12Rule = require('../../rules/camunda-cloud-1-2');

const { createModdle } = require('../helper');

const { createValid: createCamundaCloud11Valid } = require('./camunda-cloud-1-1.spec');

function createValid(executionPlatformVersion = '1.2.0') {
  const createCloudProcess = require('../helper').createCloudProcess(executionPlatformVersion);

  return [
    ...createCamundaCloud11Valid(executionPlatformVersion),

    // bpmn:EndEvent
    {
      name: 'message end event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        </bpmn:endEvent>
      `))
    },

    // bpmn:IntermediateThrowEvent
    {
      name: 'message intermediate throw event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:intermediateThrowEvent id="EndEvent_1">
          <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" retries="bar" />
          </bpmn:extensionElements>
        </bpmn:intermediateThrowEvent>
      `))
    }
  ];
}

module.exports.createValid = createValid;

function createInvalid(executionPlatformVersion = '1.2.0') {
  const createCloudProcess = require('../helper').createCloudProcess(executionPlatformVersion);

  return [

    // bpmn:IntermediateThrowEvent
    {
      name: 'signal intermediate throw event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:intermediateThrowEvent id="IntermediateThrowEvent_1">
          <bpmn:signalEventDefinition id="SignalEventDefinition_1" />
        </bpmn:intermediateThrowEvent>
      `)),
      report: {
        id: 'IntermediateThrowEvent_1',
        message: 'Element of type <bpmn:IntermediateThrowEvent> (<bpmn:SignalEventDefinition>) not supported by Zeebe 1.2',
        path: [
          'eventDefinitions',
          0
        ],
        error: {
          type: 'elementType',
          elementType: 'bpmn:IntermediateThrowEvent',
          propertyType: 'bpmn:SignalEventDefinition'
        }
      }
    }
  ];
}

RuleTester.verify('camunda-cloud-1-2', camundaCloud12Rule, {
  valid: createValid(),
  invalid: createInvalid()
});