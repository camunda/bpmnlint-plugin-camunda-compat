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

    it('is true via zeebe:AdHoc (interim gate)', async function() {
      expect(isAgenticAdHocSubProcess(await getAHSP('<zeebe:adHoc />'))).to.be.true;
    });


    it('is true via role=agent property', async function() {
      expect(isAgenticAdHocSubProcess(await getAHSP(ROLE_AGENT))).to.be.true;
    });


    it('is true via role=toolContainer property', async function() {
      expect(isAgenticAdHocSubProcess(await getAHSP(ROLE_TOOL_CONTAINER))).to.be.true;
    });


    it('is false when neither marker is present', async function() {
      const { root } = await createModdle(createProcess('<bpmn:adHocSubProcess id="AHSP_1" />'));

      expect(isAgenticAdHocSubProcess(root.rootElements[0].flowElements[0])).to.be.false;
    });

  });

});
