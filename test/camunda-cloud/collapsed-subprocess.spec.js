const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/collapsed-subprocess');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'Expanded Subprocess',
    moddleElement: createModdle(createProcess(`
      <bpmn:subProcess id="SubProcess_1" />
    `, `
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNShape id="SubProcess_1_di" bpmnElement="SubProcess_1" isExpanded="true">
          <dc:Bounds x="160" y="120" width="350" height="200" />
          </bpmndi:BPMNShape>
      </bpmndi:BPMNPlane>
    `))
  },
  {
    name: 'Expanded adHocSubProcess',
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="SubProcess_1" />
    `, `
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNShape id="SubProcess_1_di" bpmnElement="SubProcess_1" isExpanded="true">
          <dc:Bounds x="160" y="120" width="350" height="200" />
          </bpmndi:BPMNShape>
      </bpmndi:BPMNPlane>
    `))
  }
];

const invalid = [
  {
    name: 'Collapsed Subprocess',
    moddleElement: createModdle(createProcess(`
      <bpmn:subProcess id="SubProcess_1" />
    `, `
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNShape id="SubProcess_1_di" bpmnElement="SubProcess_1" isExpanded="false">
            <dc:Bounds x="155" y="80" width="100" height="80" />
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
      <bpmndi:BPMNDiagram id="BPMNDiagram_08bzev3">
          <bpmndi:BPMNPlane id="BPMNPlane_0brduj8" bpmnElement="SubProcess_1" />
      </bpmndi:BPMNDiagram>
    `)),
    report: {
      id: 'SubProcess_1',
      message: 'A <bpmn:SubProcess> must be expanded.',
      data: {
        type: ERROR_TYPES.ELEMENT_COLLAPSED_NOT_ALLOWED,
        node: 'SubProcess_1',
        parentNode: null
      }
    }
  },
  {
    name: 'legacy collapsed Subprocess',
    moddleElement: createModdle(createProcess(`
      <bpmn:subProcess id="SubProcess_1" />
    `, `
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNShape id="SubProcess_1_di" bpmnElement="SubProcess_1" isExpanded="false">
            <dc:Bounds x="155" y="80" width="100" height="80" />
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    `)),
    report: {
      id: 'SubProcess_1',
      message: 'A <bpmn:SubProcess> must be expanded.',
      data: {
        type: ERROR_TYPES.ELEMENT_COLLAPSED_NOT_ALLOWED,
        node: 'SubProcess_1',
        parentNode: null
      }
    }
  },
  {
    name: 'Collapsed adHocSubProcess',
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="SubProcess_1" />
    `, `
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
        <bpmndi:BPMNShape id="SubProcess_1_di" bpmnElement="SubProcess_1" isExpanded="false">
          <dc:Bounds x="155" y="80" width="100" height="80" />
        </bpmndi:BPMNShape>
      </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
      <bpmndi:BPMNDiagram id="BPMNDiagram_08bzev3">
          <bpmndi:BPMNPlane id="BPMNPlane_0brduj8" bpmnElement="SubProcess_1" />
      </bpmndi:BPMNDiagram>
    `)),
    report: {
      id: 'SubProcess_1',
      message: 'A <bpmn:AdHocSubProcess> must be expanded.',
      data: {
        type: ERROR_TYPES.ELEMENT_COLLAPSED_NOT_ALLOWED,
        node: 'SubProcess_1',
        parentNode: null
      }
    }
  }
];

RuleTester.verify('subprocess', rule, {
  valid,
  invalid
});