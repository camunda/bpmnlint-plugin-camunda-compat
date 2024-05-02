const { expect } = require('chai');

const Linter = require('bpmnlint/lib/linter');

const NodeResolver = require('bpmnlint/lib/resolver/node-resolver');

const { readModdle } = require('../../helper');

const versionsExpectingWarnings = [
  '8.0',
  '8.1',
  '8.2',
  '8.3',
  '8.4',
  '8.5'
];
const versionsExpectingNoWarnings = [
  '8.6'
];

describe('integration - version-compatibility-validator', function() {

  versionsExpectingNoWarnings.forEach(function(version) {

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
          const { root } = await readModdle('test/camunda-cloud/integration/version-compatibility-validator-errors-until-8-6-version.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/version-compatibility-validator' ]).not.to.exist;
        });

      });

    });

  });

  versionsExpectingWarnings.forEach(function(version) {

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

      describe('warnings', function() {

        it('should have warnings', async function() {

          // given
          const { root } = await readModdle('test/camunda-cloud/integration/version-compatibility-validator-errors-until-8-6-version.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/version-compatibility-validator' ]).to.exist;
        });

      });

    });

  });

});
