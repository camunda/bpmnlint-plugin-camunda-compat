const { expect } = require('chai');

const Linter = require('bpmnlint/lib/linter');

const NodeResolver = require('bpmnlint/lib/resolver/node-resolver');

const { readModdle } = require('../../helper');

const config = {
  extends: 'plugin:camunda-compat/camunda-cloud-8-1'
};

describe('integration - feel', function() {

  let linter;

  beforeEach(function() {
    linter = new Linter({
      config,
      resolver: new NodeResolver()
    });
  });


  describe('valid', function() {

    it('should be valid', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/feel-valid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.be.empty;
    });

  });


  describe('invalid', function() {

    it('should be invalid', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/feel-invalid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).not.to.be.empty;

    });

  });

});