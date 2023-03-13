const BpmnModdle = require('bpmn-moddle');

const { isArray } = require('min-dash');

const camundaModdleSchema = require('camunda-bpmn-moddle/resources/camunda.json'),
      modelerModdleSchema = require('modeler-moddle/resources/modeler.json'),
      zeebeModdleSchema = require('zeebe-bpmn-moddle/resources/zeebe.json');

const { readFileSync } = require('fs');

module.exports.createCollaboration = function(bpmn = '', bpmndi = '') {
  return createDefinitions(`
    <bpmn:collaboration id="Collaboration_1">
      <bpmn:participant id="Participant_1" processRef="Process_1">
        ${ bpmn }
      </bpmn:participant>
    </bpmn:collaboration>
    <bpmn:process id="Process_1" isExecutable="true" />
    ${ bpmndi }
  `);
};

function createDefinitions(xml = '') {
  return `
    <bpmn:definitions
      xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
      xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
      xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
      xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
      xmlns:modeler="http://camunda.org/schema/modeler/1.0"
      xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
      id="Definitions_1">
      ${ xml }
    </bpmn:definitions>
  `;
}

module.exports.createDefinitions = createDefinitions;

module.exports.createProcess = function(bpmn = '', bpmndi = '') {
  return createDefinitions(`
    <bpmn:process id="Process_1" isExecutable="true">
      ${ bpmn }
    </bpmn:process>
    ${ bpmndi }
  `);
};

module.exports.readModdle = function(filePath) {
  const contents = readFileSync(filePath, 'utf8');

  const executionPlatform = filePath.includes('camunda-cloud') ? 'camunda-cloud' : 'camunda-platform';

  return createModdle(contents, executionPlatform);
};

async function createModdle(xml, executionPlatform = 'camunda-cloud') {
  const moddleSchema = executionPlatform === 'camunda-cloud'
    ? { zeebe: zeebeModdleSchema }
    : { camunda: camundaModdleSchema };

  const moddle = new BpmnModdle({
    modeler: modelerModdleSchema,
    ...moddleSchema
  });

  let root, warnings;

  try {
    ({
      rootElement: root,
      warnings = []
    } = await moddle.fromXML(xml, 'bpmn:Definitions', { lax: true }));
  } catch (err) {
    console.log(err);
  }

  return {
    root,
    moddle,
    context: {
      warnings
    },
    warnings
  };
}

module.exports.createModdle = createModdle;

function createElement(type, properties) {
  const moddle = new BpmnModdle({
    modeler: modelerModdleSchema,
    zeebe: zeebeModdleSchema
  });

  const moddleElement = moddle.create(type, properties);

  const isReference = (propertyName, moddleElement) => {
    const { $descriptor } = moddleElement;

    const { propertiesByName } = $descriptor;

    const property = propertiesByName[ propertyName ];

    return property.isReference;
  };

  const setParent = (property) => {
    if (property && property.$type) {
      const childModdleElement = property;

      childModdleElement.$parent = moddleElement;
    }
  };

  if (properties) {
    Object.entries(properties).forEach(([ propertyName, property ]) => {
      if (isReference(propertyName, moddleElement)) {
        return;
      }

      setParent(property);

      if (isArray(property)) {
        property.forEach(setParent);
      }
    });
  }

  return moddleElement;
}

module.exports.createElement = createElement;

module.exports.withConfig = function(tests, config) {
  return tests.map(test => ({ ...test, config }));
};