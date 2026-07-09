const chai = require('chai');

const { expect } = chai;

const { createProcess, createModdle } = require('../helper');

const {
  hasToolContainerRoleProperty,
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

const ROLE_AGENT = `
  <zeebe:properties>
    <zeebe:property name="io.camunda.agenticai.role" value="agent" />
  </zeebe:properties>
`;

const ROLE_TOOL_CONTAINER = `
  <zeebe:properties>
    <zeebe:property name="io.camunda.agenticai.role" value="toolContainer" />
  </zeebe:properties>
`;

describe('utils/element - agentic detection', function() {

  describe('#hasToolContainerRoleProperty', function() {

    it('detects role=toolContainer', async function() {
      expect(hasToolContainerRoleProperty(await getAHSP(ROLE_TOOL_CONTAINER))).to.be.true;
    });


    it('ignores role=agent (reserved for other, non-linting uses)', async function() {
      expect(hasToolContainerRoleProperty(await getAHSP(ROLE_AGENT))).to.be.false;
    });


    it('ignores an unrelated property name', async function() {
      const ahsp = await getAHSP(`
        <zeebe:properties>
          <zeebe:property name="some.other.property" value="toolContainer" />
        </zeebe:properties>
      `);

      expect(hasToolContainerRoleProperty(ahsp)).to.be.false;
    });


    it('ignores an unknown role value', async function() {
      const ahsp = await getAHSP(`
        <zeebe:properties>
          <zeebe:property name="io.camunda.agenticai.role" value="banana" />
        </zeebe:properties>
      `);

      expect(hasToolContainerRoleProperty(ahsp)).to.be.false;
    });


    it('is false without extension elements', async function() {
      const { root } = await createModdle(createProcess('<bpmn:adHocSubProcess id="AHSP_1" />'));

      expect(hasToolContainerRoleProperty(root.rootElements[0].flowElements[0])).to.be.false;
    });

  });


  describe('#isAgenticAdHocSubProcess', function() {

    describe('role=toolContainer property marker (all versions)', function() {

      it('is true at 8.8', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(ROLE_TOOL_CONTAINER), '8.8')).to.be.true;
      });


      it('is true at 8.10', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(ROLE_TOOL_CONTAINER), '8.10')).to.be.true;
      });


      it('is true with no version given', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(ROLE_TOOL_CONTAINER))).to.be.true;
      });

    });


    describe('role=agent property marker (not consulted by these rules)', function() {

      it('is false at 8.8', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(ROLE_AGENT), '8.8')).to.be.false;
      });


      it('is false at 8.10', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(ROLE_AGENT), '8.10')).to.be.false;
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
