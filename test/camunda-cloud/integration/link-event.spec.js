const { expect } = require('chai');

const Linter = require('bpmnlint/lib/linter');

const NodeResolver = require('bpmnlint/lib/resolver/node-resolver');

const { readModdle } = require('../../helper');

const versions = [
  '8.2',
  '8.3'
];

describe('integration - link-event', function() {

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
          const { root } = await readModdle('test/camunda-cloud/integration/link-event.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/link-event' ]).not.to.exist;
        });

      });


      describe('errors', function() {

        it('should have errors', async function() {

          // given
          const { root } = await readModdle('test/camunda-cloud/integration/link-event-errors.bpmn');

          // when
          const reports = await linter.lint(root);

          // then
          expect(reports[ 'camunda-compat/link-event' ]).to.exist;
        });

      });

    });

  });

});