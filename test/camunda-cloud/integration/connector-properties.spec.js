const { expect } = require('chai');

const Linter = require('bpmnlint/lib/linter');

const NodeResolver = require('bpmnlint/lib/resolver/node-resolver');

const { readModdle } = require('../../helper');

describe('integration - connector-properties', function() {

  [
    '8.0',
    '8.1',
    '8.2',
    '8.3',
    '8.4',
    '8.5'
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
          const { root } = await readModdle('test/camunda-cloud/integration/connector-properties.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/connector-properties' ]).not.to.exist;
        });

      });


      describe('errors', function() {

        it('should have errors', async function() {

          // given
          const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-8-6-connector-properties.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/connector-properties' ]).to.exist;
        });

      });

    });

  });


  [
    '8.6'
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
          const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-8-6-connector-properties.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/connector-properties' ]).not.to.exist;
        });

      });

    });

  });

});