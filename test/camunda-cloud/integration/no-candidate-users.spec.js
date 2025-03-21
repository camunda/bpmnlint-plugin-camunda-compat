const { expect } = require('chai');

const Linter = require('bpmnlint/lib/linter');

const NodeResolver = require('bpmnlint/lib/resolver/node-resolver');

const { readModdle } = require('../../helper');

describe('integration - no-candidate-users', function() {

  [
    '1.0',
    '1.1',
    '1.2',
    '1.3',
    '8.0',
    '8.1'
  ].forEach(function(version) {

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

      describe('no errors', function() {

        it('should not have errors', async function() {

          // given
          const { root } = await readModdle('test/camunda-cloud/integration/no-candidate-users.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/no-candidate-users' ]).not.to.exist;
        });

      });


      describe('errors', function() {

        it('should have errors', async function() {

          // given
          const { root } = await readModdle('test/camunda-cloud/integration/no-candidate-users-errors.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/no-candidate-users' ]).to.exist;
        });

      });

    });

  });


  [
    '8.2'
  ].forEach(function(version) {

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

      describe('no errors', function() {

        it('should not have errors', async function() {

          // given
          const { root } = await readModdle('test/camunda-cloud/integration/no-candidate-users.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/no-candidate-users' ]).not.to.exist;
        });


        it(`should not have errors on ${version}`, async function() {

          // given
          const { root } = await readModdle('test/camunda-cloud/integration/no-candidate-users-errors.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/no-candidate-users' ]).not.to.exist;
        });

      });

    });

  });

});