const { expect } = require('chai');

const Linter = require('bpmnlint/lib/linter');

const NodeResolver = require('bpmnlint/lib/resolver/node-resolver');

const { readModdle } = require('../../helper');

const config = {
  extends: 'plugin:camunda-compat/camunda-cloud-8-1'
};

describe('integration - camunda-cloud-8-1', function() {

  let linter;

  beforeEach(function() {
    linter = new Linter({
      config,
      resolver: new NodeResolver()
    });
  });


  describe('valid', function() {

    it('should be valid (1.0)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-1-0-valid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.be.empty;
    });


    it('should be valid (1.1)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-1-1-valid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.be.empty;
    });


    it('should be valid (1.2)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-1-2-valid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.be.empty;
    });


    it('should be valid (1.3)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-1-3-valid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.be.empty;
    });


    it('should be valid (8.0)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-8-0-valid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.be.empty;
    });


    it('should be valid (8.1)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-8-1-valid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.be.empty;
    });

  });


  describe('invalid', function() {

    it('should be invalid (1.0)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-1-0-invalid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).not.to.be.empty;
    });


    it('should be invalid (1.1)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-1-1-invalid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).not.to.be.empty;
    });


    it('should be invalid (1.2)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-1-2-invalid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).not.to.be.empty;
    });


    it('should be invalid (1.3)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-1-3-invalid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).not.to.be.empty;
    });


    it('should be invalid (8.0)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-8-0-invalid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).not.to.be.empty;
    });


    it('should be invalid (8.1)', async function() {

      // given
      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-8-1-invalid.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).not.to.be.empty;

      expect(reports[ 'camunda-compat/called-decision-or-task-definition' ]).to.exist;
      expect(reports[ 'camunda-compat/called-decision-or-task-definition' ]).to.have.length(3);

      expect(reports[ 'camunda-compat/called-element' ]).to.exist;
      expect(reports[ 'camunda-compat/called-element' ]).to.have.length(1);

      expect(reports[ 'camunda-compat/element-type' ]).to.exist;
      expect(reports[ 'camunda-compat/element-type' ]).to.have.length(1);

      expect(reports[ 'camunda-compat/error-reference' ]).to.exist;
      expect(reports[ 'camunda-compat/error-reference' ]).to.have.length(1);

      expect(reports[ 'camunda-compat/inclusive-gateway' ]).to.exist;
      expect(reports[ 'camunda-compat/inclusive-gateway' ]).to.have.length(3);

      expect(reports[ 'camunda-compat/loop-characteristics' ]).to.exist;
      expect(reports[ 'camunda-compat/loop-characteristics' ]).to.have.length(1);

      expect(reports[ 'camunda-compat/message-reference' ]).to.exist;
      expect(reports[ 'camunda-compat/message-reference' ]).to.have.length(2);

      expect(reports[ 'camunda-compat/subscription' ]).to.exist;
      expect(reports[ 'camunda-compat/subscription' ]).to.have.length(1);

      expect(reports[ 'camunda-compat/timer' ]).to.exist;
      expect(reports[ 'camunda-compat/timer' ]).to.have.length(1);

      expect(reports[ 'camunda-compat/user-task-form' ]).to.exist;
      expect(reports[ 'camunda-compat/user-task-form' ]).to.have.length(2);
    });

  });

});