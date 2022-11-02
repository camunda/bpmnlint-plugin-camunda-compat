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
    <bpmn:subProcess id="Activity_1ehskbd" />
    `,
    `
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
        <bpmndi:BPMNShape id="Activity_1ehskbd_di" bpmnElement="Activity_1ehskbd" isExpanded="true">
        <dc:Bounds x="160" y="120" width="350" height="200" />
        </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
    `))
  },
  {
    name: 'Expanded adHocSubProcess',
    moddleElement: createModdle(createProcess(`
    <bpmn:adHocSubProcess id="Activity_1ehskbd" />
    `,
    `
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
        <bpmndi:BPMNShape id="Activity_1ehskbd_di" bpmnElement="Activity_1ehskbd" isExpanded="true">
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
    <bpmn:subProcess id="Activity_1ehskbd" />
    `,
    `
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="Activity_1ehskbd_di" bpmnElement="Activity_1ehskbd" isExpanded="false">
        <dc:Bounds x="155" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
    <bpmndi:BPMNDiagram id="BPMNDiagram_08bzev3">
        <bpmndi:BPMNPlane id="BPMNPlane_0brduj8" bpmnElement="Activity_1ehskbd" />
    </bpmndi:BPMNDiagram>
    `)),
    report: {
      id: 'Activity_1ehskbd',
      message: 'A <bpmn:SubProcess> must be expanded.',
      error: {
        type: ERROR_TYPES.ELEMENT_COLLAPSED_NOT_ALLOWED,
        node: 'Activity_1ehskbd',
        parentNode: null
      }
    }
  },
  {
    name: 'Collapsed adHocSubProcess',
    moddleElement: createModdle(createProcess(`
    <bpmn:adHocSubProcess id="Activity_1ehskbd" />
    `,
    `
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="Activity_1ehskbd_di" bpmnElement="Activity_1ehskbd" isExpanded="false">
        <dc:Bounds x="155" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
    <bpmndi:BPMNDiagram id="BPMNDiagram_08bzev3">
        <bpmndi:BPMNPlane id="BPMNPlane_0brduj8" bpmnElement="Activity_1ehskbd" />
    </bpmndi:BPMNDiagram>
    `)),
    report: {
      id: 'Activity_1ehskbd',
      message: 'A <bpmn:AdHocSubProcess> must be expanded.',
      error: {
        type: ERROR_TYPES.ELEMENT_COLLAPSED_NOT_ALLOWED,
        node: 'Activity_1ehskbd',
        parentNode: null
      }
    }
  }
];

RuleTester.verify('subprocess', rule, {
  valid,
  invalid
});