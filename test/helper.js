const BpmnModdle = require('bpmn-moddle');

const modelerModdleSchema = require('modeler-moddle/resources/modeler.json'),
      zeebeModdleSchema = require('zeebe-bpmn-moddle/resources/zeebe.json');

const readFileSync = require('fs').readFileSync;

module.exports.createCollaboration = function(version) {
  return function(bpmn = '', bpmndi = '') {
    return createDefinitions(`
      <bpmn:collaboration id="Collaboration_1">
        <bpmn:participant id="Participant_1" processRef="Process_1">
          ${ bpmn }
        </bpmn:participant>
      </bpmn:collaboration>
      <bpmn:process id="Process_1"/>
      ${ bpmndi }
    `, version);
  };
};

function createDefinitions(xml = '', version = '1.0.0') {
  return `
    <bpmn:definitions
      xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
      xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
      xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
      xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
      xmlns:modeler="http://camunda.org/schema/modeler/1.0"
      id="Definitions_1"
      modeler:executionPlatform="Camunda Cloud"
      modeler:executionPlatformVersion="${ version }">
      ${ xml }
    </bpmn:definitions>
  `;
}

module.exports.createDefinitions = createDefinitions;

module.exports.createProcess = function(version) {
  return function(bpmn = '', bpmndi = '') {
    return createDefinitions(`
      <bpmn:process id="Process_1">
        ${ bpmn }
      </bpmn:process>
      ${ bpmndi }
    `, version);
  };
};

module.exports.readModdle = function(version) {
  return function(filePath) {
    const contents = readFileSync(filePath, 'utf8');
  
    return createModdle(contents, version);
  };
}

async function createModdle(xml, version = '1.0.0') {
  const moddle = new BpmnModdle({
    modeler: modelerModdleSchema,
    zeebe: zeebeModdleSchema
  });

  const {
    rootElement: root,
    warnings = []
  } = await moddle.fromXML(xml, 'bpmn:Definitions', { lax: true });

  root.set('modeler:executionPlatform', 'Camunda Cloud');
  root.set('modeler:executionPlatformVersion', version);

  return {
    root,
    moddle,
    context: {
      warnings
    },
    warnings
  };
}