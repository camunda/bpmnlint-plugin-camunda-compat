const BpmnModdle = require('bpmn-moddle');

const { isArray } = require('min-dash');

const camundaModdleSchema = require('camunda-bpmn-moddle/resources/camunda.json'),
      modelerModdleSchema = require('modeler-moddle/resources/modeler.json'),
      zeebeModdleSchema = require('zeebe-bpmn-moddle/resources/zeebe.json');

const readFileSync = require('fs').readFileSync;

module.exports.createPlaformCollaboration = function(executionPlatformVersion) {
  return function(bpmn = '', bpmndi = '') {
    return createCollaboration({
      bpmn,
      bpmndi,
      namespaces: `
        xmlns:modeler="http://camunda.org/schema/modeler/1.0"
        xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
      `,
      executionPlatform: 'Camunda Platform',
      executionPlatformVersion
    });
  };
};

module.exports.createCloudCollaboration = function(executionPlatformVersion) {
  return function(bpmn = '', bpmndi = '') {
    return createCollaboration({
      bpmn,
      bpmndi,
      namespaces: `
        xmlns:modeler="http://camunda.org/schema/modeler/1.0"
        xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
      `,
      executionPlatform: 'Camunda Cloud',
      executionPlatformVersion
    });
  };
};

module.exports.createPlaformProcess = function(executionPlatformVersion) {
  return function(bpmn = '', bpmndi = '') {
    return createProcess({
      bpmn,
      bpmndi,
      namespaces: `
        xmlns:modeler="http://camunda.org/schema/modeler/1.0"
        xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
      `,
      executionPlatform: 'Camunda Platform',
      executionPlatformVersion
    });
  };
};

module.exports.createCloudProcess = function(executionPlatformVersion) {
  return function(bpmn = '', bpmndi = '') {
    return createProcess({
      bpmn,
      bpmndi,
      namespaces: `
        xmlns:modeler="http://camunda.org/schema/modeler/1.0"
        xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
      `,
      executionPlatform: 'Camunda Cloud',
      executionPlatformVersion
    });
  };
};

module.exports.createPlatformDefinitions = function(executionPlatformVersion) {
  return function(xml) {
    return createDefinitions(xml, {
      namespaces: `
        xmlns:modeler="http://camunda.org/schema/modeler/1.0"
        xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
      `,
      executionPlatform: 'Camunda Platform',
      executionPlatformVersion
    });
  };
};

module.exports.createCloudDefinitions = function(executionPlatformVersion) {
  return function(xml) {
    return createDefinitions(xml, {
      namespaces: `
        xmlns:modeler="http://camunda.org/schema/modeler/1.0"
        xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
      `,
      executionPlatform: 'Camunda Cloud',
      executionPlatformVersion
    });
  };
};

function createCollaboration(options) {
  const {
    bpmn = '',
    bpmndi = '',
    ...rest
  } = options;

  return createDefinitions(`
    <bpmn:collaboration id="Collaboration_1">
      <bpmn:participant id="Participant_1" processRef="Process_1">
        ${ bpmn }
      </bpmn:participant>
    </bpmn:collaboration>
    <bpmn:process id="Process_1" />
    ${ bpmndi }
  `, rest);
}

function createProcess(options) {
  const {
    bpmn = '',
    bpmndi = '',
    ...rest
  } = options;

  return createDefinitions(`
    <bpmn:process id="Process_1">
      ${ bpmn }
    </bpmn:process>
    ${ bpmndi }
  `, rest);
}

function createDefinitions(xml = '', options = {}) {
  const {
    namespaces = '',
    executionPlatform = 'Camunda Platform',
    executionPlatformVersion = '7.15'
  } = options;

  return `
    <bpmn:definitions
      xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
      xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
      xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
      xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
      xmlns:modeler="http://camunda.org/schema/modeler/1.0"
      ${ namespaces }
      id="Definitions_1"
      modeler:executionPlatform="${ executionPlatform }"
      modeler:executionPlatformVersion="${ executionPlatformVersion }">
      ${ xml }
    </bpmn:definitions>
  `;
}

module.exports.createDefinitions = createDefinitions;

module.exports.readModdle = function(version = '1.0.0') {
  return function(filePath) {
    const contents = readFileSync(filePath, 'utf8');

    return createModdle(contents, version);
  };
};

async function createModdle(xml, version) {
  const moddle = new BpmnModdle({
    modeler: modelerModdleSchema,
    zeebe: zeebeModdleSchema
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

  if (version) {
    root.set('modeler:executionPlatform', 'Camunda Cloud');
    root.set('modeler:executionPlatformVersion', version);
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
    camunda: camundaModdleSchema,
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
    if (property.$type) {
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