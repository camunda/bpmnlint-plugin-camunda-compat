const { expect } = require('chai');

const Linter = require('bpmnlint/lib/linter');

const NodeResolver = require('bpmnlint/lib/resolver/node-resolver');

const { readModdle } = require('../../helper');

const versions = [
  '1.0',
  '1.1',
  '1.2',
  '1.3',
  '8.0',
  '8.1'
];

describe('integration - element-type', function() {

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

      describe('no errors', function() {

        it('should not have errors', async function() {

          // given
          const { root } = await readModdle(`test/camunda-cloud/integration/camunda-cloud-${ version.replace('.', '-') }-element-type.bpmn`);

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/element-type' ]).not.to.exist;
        });

      });


      describe('errors', function() {

        it('should have errors', async function() {

          // given
          const { root } = await readModdle(`test/camunda-cloud/integration/camunda-cloud-${ version.replace('.', '-') }-element-type-errors.bpmn`);

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/element-type' ]).to.exist;
        });

      });

    });

  });

});