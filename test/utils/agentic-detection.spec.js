const chai = require('chai');

const { expect } = chai;

const { createProcess, createModdle } = require('../helper');

const {
  hasAgenticRoleProperty,
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

  describe('#hasAgenticRoleProperty', function() {

    it('detects role=agent', async function() {
      expect(hasAgenticRoleProperty(await getAHSP(ROLE_AGENT))).to.be.true;
    });


    it('detects role=toolContainer', async function() {
      expect(hasAgenticRoleProperty(await getAHSP(ROLE_TOOL_CONTAINER))).to.be.true;
    });


    it('ignores an unrelated property name', async function() {
      const ahsp = await getAHSP(`
        <zeebe:properties>
          <zeebe:property name="some.other.property" value="agent" />
        </zeebe:properties>
      `);

      expect(hasAgenticRoleProperty(ahsp)).to.be.false;
    });


    it('ignores an unknown role value', async function() {
      const ahsp = await getAHSP(`
        <zeebe:properties>
          <zeebe:property name="io.camunda.agenticai.role" value="banana" />
        </zeebe:properties>
      `);

      expect(hasAgenticRoleProperty(ahsp)).to.be.false;
    });


    it('is false without extension elements', async function() {
      const { root } = await createModdle(createProcess('<bpmn:adHocSubProcess id="AHSP_1" />'));

      expect(hasAgenticRoleProperty(root.rootElements[0].flowElements[0])).to.be.false;
    });

  });


  describe('#isAgenticAdHocSubProcess', function() {

    describe('property marker (all versions)', function() {

      it('is true via role=agent at 8.8', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(ROLE_AGENT), '8.8')).to.be.true;
      });


      it('is true via role=agent at 8.10', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(ROLE_AGENT), '8.10')).to.be.true;
      });


      it('is true via role=toolContainer at 8.10', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP(ROLE_TOOL_CONTAINER), '8.10')).to.be.true;
      });

    });


    describe('interim zeebe:AdHoc gate (version-forked)', function() {

      it('is true via zeebe:AdHoc at 8.8', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP('<zeebe:adHoc />'), '8.8')).to.be.true;
      });


      it('is true via zeebe:AdHoc at 8.9', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP('<zeebe:adHoc />'), '8.9')).to.be.true;
      });


      it('is FALSE via zeebe:AdHoc at 8.10 (marker required)', async function() {
        expect(isAgenticAdHocSubProcess(await getAHSP('<zeebe:adHoc />'), '8.10')).to.be.false;
      });


      it('still true at 8.10 when the role marker is also present', async function() {
        const ahsp = await getAHSP(`<zeebe:adHoc />${ROLE_TOOL_CONTAINER}`);

        expect(isAgenticAdHocSubProcess(ahsp, '8.10')).to.be.true;
      });

    });


    it('is false when neither marker is present', async function() {
      const { root } = await createModdle(createProcess('<bpmn:adHocSubProcess id="AHSP_1" />'));

      expect(isAgenticAdHocSubProcess(root.rootElements[0].flowElements[0], '8.8')).to.be.false;
    });

  });

});
