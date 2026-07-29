const chai = require('chai');

const { expect } = chai;

const { createProcess, createModdle } = require('../helper');

const {
  hasToolContainerProperty,
  isAgenticAdHocSubProcess
} = require('../../rules/utils/element');

function ahsp(extensionXml = '') {
  return createProcess(`
    <bpmn:adHocSubProcess id="AHSP_1">
      <bpmn:extensionElements>
        ${extensionXml}
      </bpmn:extensionElements>
    </bpmn:adHocSubProcess>
  `);
}

async function getAHSP(extensionXml) {
  const { root } = await createModdle(ahsp(extensionXml));

  return root.rootElements[0].flowElements[0];
}

const AGENT_MARKER = `
  <zeebe:properties>
    <zeebe:property name="io.camunda.agenticai.agent" value="true" />
  </zeebe:properties>
`;

const TOOL_CONTAINER_MARKER = `
  <zeebe:properties>
    <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
  </zeebe:properties>
`;

const BOTH_MARKERS = `
  <zeebe:properties>
    <zeebe:property name="io.camunda.agenticai.agent" value="true" />
    <zeebe:property name="io.camunda.agenticai.toolContainer" value="true" />
  </zeebe:properties>
`;

describe('utils/element - agentic detection', function() {

  describe('#hasToolContainerProperty', function() {

    it('detects toolContainer=true', async function() {
      expect(hasToolContainerProperty(await getAHSP(TOOL_CONTAINER_MARKER))).to.be.true;
    });


    it('ignores the agent marker alone (reserved for other, non-linting uses)', async function() {
      expect(hasToolContainerProperty(await getAHSP(AGENT_MARKER))).to.be.false;
    });


    it('detects toolContainer=true when the agent marker is also present', async function() {
      expect(hasToolContainerProperty(await getAHSP(BOTH_MARKERS))).to.be.true;
    });


    it('ignores an unrelated property name', async function() {
      const ahsp = await getAHSP(`
        <zeebe:properties>
          <zeebe:property name="some.other.property" value="true" />
        </zeebe:properties>
      `);

      expect(hasToolContainerProperty(ahsp)).to.be.false;
    });


    it('ignores an unexpected value', async function() {
      const ahsp = await getAHSP(`
        <zeebe:properties>
          <zeebe:property name="io.camunda.agenticai.toolContainer" value="false" />
        </zeebe:properties>
      `);

      expect(hasToolContainerProperty(ahsp)).to.be.false;
    });


    it('is false without extension elements', async function() {
      const { root } = await createModdle(createProcess('<bpmn:adHocSubProcess id="AHSP_1" />'));

      expect(hasToolContainerProperty(root.rootElements[0].flowElements[0])).to.be.false;
    });

  });


  describe('#isAgenticAdHocSubProcess', function() {

    describe('toolContainer=true property marker (all versions)', function() {

      it('is true at 8.8', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(TOOL_CONTAINER_MARKER), '8.8')).to.be.true;
      });


      it('is true at 8.10', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(TOOL_CONTAINER_MARKER), '8.10')).to.be.true;
      });


      it('is true with no version given', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(TOOL_CONTAINER_MARKER))).to.be.true;
      });


      it('is true when both markers are present on the same element', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(BOTH_MARKERS), '8.8')).to.be.true;
      });

    });


    describe('agent=true property marker alone (not consulted by these rules)', function() {

      it('is false at 8.8', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(AGENT_MARKER), '8.8')).to.be.false;
      });


      it('is false at 8.10', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(AGENT_MARKER), '8.10')).to.be.false;
      });

    });


    describe('zeebe:agentDefinition marker (8.10+, forward-looking)', function() {

      // zeebe:agentDefinition doesn't exist in this plugin's pinned
      // zeebe-bpmn-moddle yet (connectors#7842, open), so lax parsing drops it
      // silently and there is no way to construct a fixture where it's
      // actually present. These cases only guard the version gate and the
      // no-crash behavior; the true branch activates once the moddle ships
      // the element.

      it('is false below 8.10 even if the (unparsed) XML is present', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP('<zeebe:agentDefinition />'), '8.9')).to.be.false;
      });


      it('is false at 8.10 today, since the marker does not parse yet', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP('<zeebe:agentDefinition />'), '8.10')).to.be.false;
      });

    });


    it('is false when no marker is present', async function() {
      const { root } = await createModdle(createProcess('<bpmn:adHocSubProcess id="AHSP_1" />'));

      expect(isAgenticAdHocSubProcess(root.rootElements[0].flowElements[0], '8.8')).to.be.false;
    });


    it('is false when no marker is present and no version is given', async function() {
      const { root } = await createModdle(createProcess('<bpmn:adHocSubProcess id="AHSP_1" />'));

      expect(isAgenticAdHocSubProcess(root.rootElements[0].flowElements[0])).to.be.false;
    });

  });

});
