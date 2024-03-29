const { expect } = require('chai');

const Linter = require('bpmnlint/lib/linter');

const NodeResolver = require('bpmnlint/lib/resolver/node-resolver');

const { readModdle } = require('../../helper');

const versions = [
  '8.3'
];

describe('integration - secrets', function() {

  versions.forEach(function(version) {

    let linter;

    beforeEach(function() {
      linter = new Linter({
        config: {
          extends: `plugin:camunda-compat/camunda-cloud-${ version.replace('.', '-') }`
        },
        resolver: new NodeResolver()
      });
    });


    describe(`Camunda Cloud ${ version }`, function() {

      describe('no warnings', function() {

        it('should not have warnings', async function() {

          // given
          const { root } = await readModdle('test/camunda-cloud/integration/secrets.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/secrets' ]).not.to.exist;
        });

      });


      describe('warnings', function() {

        it('should have warnings', async function() {

          // given
          const { root } = await readModdle('test/camunda-cloud/integration/secrets-errors.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/secrets' ]).to.exist;
        });

      });

    });

  });

});
