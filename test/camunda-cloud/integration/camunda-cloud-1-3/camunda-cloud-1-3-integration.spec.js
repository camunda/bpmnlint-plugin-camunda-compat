const path = require('path');

const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const readModdle = require('../../../helper').readModdle('1.3.0');

const camundaCloud13Rule = require('../../../../rules/camunda-cloud-1-3');

// cf. https://github.com/camunda-cloud/zeebe/tree/1.3.0-alpha2/bpmn-model/src/test/java/io/camunda/zeebe/model/bpmn
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
    name: 'EventDefinitionsTest.xml',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'EventDefinitionsTest.xml')),
    report: {
      category: 'error',
      id: 'event',
      message: 'Element of type <bpmn:IntermediateThrowEvent (bpmn:CancelEventDefinition)> not supported by Zeebe 1.3'
    }
  },
  {
    name: 'GatewaysTest.xml',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'GatewaysTest.xml')),
    report: [
      {
        category: 'error',
        id: '',
        message: 'Element of type <bpmn:InclusiveGateway> not supported by Zeebe 1.3'
      },
      {
        category: 'error',
        id: '',
        message: 'Element of type <bpmn:ComplexGateway> not supported by Zeebe 1.3'
      }
    ]
  },
  {
    name: 'validation/collaboration-with-lanes.bpmn',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'validation/collaboration-with-lanes.bpmn')),
    report: {
      category: 'error',
      id: 'Process_0xhl9yb',
      message: 'Element of type <bpmn:Process (bpmn:LaneSet)> not supported by Zeebe 1.3'
    }
  }
];

RuleTester.verify('camunda-cloud-1-3-integration', camundaCloud13Rule, {
  valid,
  invalid
});