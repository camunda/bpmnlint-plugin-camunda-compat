const path = require('path');

const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const readModdle = require('../../../helper').readModdle('1.0.0');

const camundaCloud10Rule = require('../../../../rules/camunda-cloud-1-0');

// cf. https://github.com/camunda-cloud/zeebe/tree/1.0.5/bpmn-model/src/test/java/io/camunda/zeebe/model/bpmn
const valid = [
  'BpmnDiTest.xml',
  'CollaborationParserTest.bpmn',
  'ConditionalSequenceFlowTest.xml',
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
        id: 'sendTask',
        message: 'Element of type <bpmn:SendTask> not supported by Zeebe 1.0'
      },
      {
        category: 'error',
        id: 'scriptTask',
        message: 'Element of type <bpmn:ScriptTask> not supported by Zeebe 1.0'
      },
      {
        category: 'error',
        id: 'businessRuleTask',
        message: 'Element of type <bpmn:BusinessRuleTask> not supported by Zeebe 1.0'
      },
      {
        category: 'error',
        id: 'endEvent',
        message: 'Element of type <bpmn:EndEvent (bpmn:MessageEventDefinition)> not supported by Zeebe 1.0'
      }
    ]
  },
  {
    name: 'CamundaExtensionsTest.xml',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'CamundaExtensionsTest.xml')),
    report: [
      {
        category: "error",
        id: "sendTask",
        message: "Element of type <bpmn:SendTask> not supported by Zeebe 1.0"
      },
      {
        category: "error",
        id: "scriptTask",
        message: "Element of type <bpmn:ScriptTask> not supported by Zeebe 1.0"
      },
      {
        category: "error",
        id: "businessRuleTask",
        message: "Element of type <bpmn:BusinessRuleTask> not supported by Zeebe 1.0"
      },
      {
        category: "error",
        id: "endEvent",
        message: "Element of type <bpmn:EndEvent (bpmn:MessageEventDefinition)> not supported by Zeebe 1.0"
      }
    ]
  },
  {
    name: 'DataObjectTest.bpmn',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'DataObjectTest.bpmn')),
    report: {
      category: 'error',
      id: '_3',
      message: 'Element of type <bpmn:ScriptTask> not supported by Zeebe 1.0'
    }
  },
  {
    name: 'EventDefinitionsTest.xml',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'EventDefinitionsTest.xml')),
    report: {
      category: 'error',
      id: 'event',
      message: 'Element of type <bpmn:IntermediateThrowEvent> not supported by Zeebe 1.0'
    }
  },
  {
    name: 'GatewaysTest.xml',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'GatewaysTest.xml')),
    report: [
      {
        category: 'error',
        id: '',
        message: 'Element of type <bpmn:InclusiveGateway> not supported by Zeebe 1.0'
      },
      {
        category: 'error',
        id: '',
        message: 'Element of type <bpmn:ComplexGateway> not supported by Zeebe 1.0'
      }
    ]
  },
  {
    name: 'validation/collaboration-with-lanes.bpmn',
    moddleElement: readModdle(path.join(__dirname, 'fixtures', 'validation/collaboration-with-lanes.bpmn')),
    report: {
      category: 'error',
      id: 'Process_0xhl9yb',
      message: 'Element of type <bpmn:Process (bpmn:LaneSet)> not supported by Zeebe 1.0'
    }
  }
];

RuleTester.verify('camunda-cloud-1-0-integration', camundaCloud10Rule, {
  valid,
  invalid
});