const path = require('path');

const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const readModdle = require('../../helper').readModdle('1.0.0');

const camundaCloud10Rule = require('../../../rules/camunda-cloud-1-0');


const valid = [
  'BpmnDiTest.xml',
  'CamundaExtensionsCompatabilityTest.xml',
  'CamundaExtensionsTest.xml',
  'CollaborationParserTest.bpmn',
  'ConditionalSequenceFlowTest.xml',
  'DataObjectTest.bpmn',
  'DataStoreTest.bpmn',
  'DefinitionsTest.shouldImportEmptyDefinitions.bpmn',
  'DefinitionsTest.shouldNotAffectComments.bpmn',
  // 'DefinitionsTest.shouldNotAffectCommentsResult.bpmn',
  'DefinitionsTest.shouldNotImportWrongOrderedSequence.bpmn',
  'EventDefinitionsTest.xml',
  'GenerateIdTest.bpmn',
  'ProcessTest.shouldImportProcess.bpmn',
  'ReferenceTest.shouldFindReferenceWithNamespace.bpmn',
  'ResourceRolesTest.bpmn',
  'TransactionTest.xml',
  'instance/TextAnnotationTest.bpmn',
  'validation/default-flow.bpmn',
  'validation/multiple-timer-start-event-sub-process.bpmn',
  'validation/no-start-event-sub-process.bpmn',
  'validation/non-executable-elements.bpmn'
].map((name) => {
  return {
    name,
    moddleElement: readModdle(path.join(__dirname, 'fixtures', name))
  };
});

const invalid = [
  {
    name: 'GatewaysTest.xml',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'GatewaysTest.xml')),
    report: [
      {
        category: 'error',
        id: '',
        message: 'Element of type <bpmn:InclusiveGateway> not supported by Camunda Cloud 1.0'
      },
      {
        category: 'error',
        id: '',
        message: 'Element of type <bpmn:ComplexGateway> not supported by Camunda Cloud 1.0'
      }
    ]
  },
  {
    name: 'validation/collaboration-with-lanes.bpmn',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'validation/collaboration-with-lanes.bpmn')),
    report: {
      category: 'error',
      id: 'Process_0xhl9yb',
      message: 'Element of type <bpmn:Process (bpmn:LaneSet)> not supported by Camunda Cloud 1.0'
    }
  }
];

RuleTester.verify('camunda-cloud-1-0-integration', camundaCloud10Rule, {
  valid,
  invalid
});