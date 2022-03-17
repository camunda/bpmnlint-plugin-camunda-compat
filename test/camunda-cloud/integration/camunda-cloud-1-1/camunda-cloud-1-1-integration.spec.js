const path = require('path');

const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const readModdle = require('../../../helper').readModdle('1.1.0');

const camundaCloud11Rule = require('../../../../rules/camunda-cloud-1-1');

// cf. https://github.com/camunda-cloud/zeebe/tree/1.1.6/bpmn-model/src/test/java/io/camunda/zeebe/model/bpmn
const valid = [
  'BpmnDiTest.xml',
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
    name: 'CamundaExtensionsCompatabilityTest.xml',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'CamundaExtensionsCompatabilityTest.xml')),
    report: [
      {
        category: 'error',
        id: 'endEvent',
        message: 'Element of type <bpmn:EndEvent (bpmn:MessageEventDefinition)> not supported by Zeebe 1.1'
      }
    ]
  },
  {
    name: 'CamundaExtensionsTest.xml',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'CamundaExtensionsTest.xml')),
    report: [
      {
        category: "error",
        id: "endEvent",
        message: "Element of type <bpmn:EndEvent (bpmn:MessageEventDefinition)> not supported by Zeebe 1.1"
      }
    ]
  },
  {
    name: 'EventDefinitionsTest.xml',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'EventDefinitionsTest.xml')),
    report: {
      category: 'error',
      id: 'event',
      message: 'Element of type <bpmn:IntermediateThrowEvent (bpmn:CancelEventDefinition)> not supported by Zeebe 1.1'
    }
  },
  {
    name: 'GatewaysTest.xml',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'GatewaysTest.xml')),
    report: [
      {
        category: 'error',
        id: '',
        message: 'Element of type <bpmn:InclusiveGateway> not supported by Zeebe 1.1'
      },
      {
        category: 'error',
        id: '',
        message: 'Element of type <bpmn:ComplexGateway> not supported by Zeebe 1.1'
      }
    ]
  },
  {
    name: 'validation/collaboration-with-lanes.bpmn',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'validation/collaboration-with-lanes.bpmn')),
    report: {
      category: 'error',
      id: 'Process_0xhl9yb',
      message: 'Element of type <bpmn:Process (bpmn:LaneSet)> not supported by Zeebe 1.1'
    }
  }
];

RuleTester.verify('camunda-cloud-1-1-integration', camundaCloud11Rule, {
  valid,
  invalid
});