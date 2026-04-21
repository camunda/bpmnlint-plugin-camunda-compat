const { expect } = require('chai');

const Linter = require('bpmnlint/lib/linter');

const NodeResolver = require('bpmnlint/lib/resolver/node-resolver');

const { readModdle } = require('../../helper');

describe('integration - custom config', function() {

  describe('without version config', function() {

    it('should report rule-error for rules that require version', async function() {

      // given
      const linter = new Linter({
        config: {
          extends: 'plugin:camunda-compat/camunda-cloud-8-0',
          rules: {
            'camunda-compat/timer': 'warn',
          }
        },
        resolver: new NodeResolver()
      });

      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-8-0-timer.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports[ 'camunda-compat/timer' ][0].category).to.equal('rule-error');
      expect(reports[ 'camunda-compat/timer' ][0].message).to.equal(
        'Rule requires { version } config, e.g. [ "warn", { "version": "8.0" } ]'
      );
    });


    it('should not affect rules that do not require version', async function() {

      // given
      const linter = new Linter({
        config: {
          extends: 'plugin:camunda-compat/camunda-cloud-8-0',
          rules: {
            'camunda-compat/called-element': 'warn'
          }
        },
        resolver: new NodeResolver()
      });

      const { root } = await readModdle('test/camunda-cloud/integration/called-element.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports[ 'camunda-compat/called-element' ]).not.to.exist;
    });

  });


  describe('with version config', function() {

    it('should work when severity is overridden with version', async function() {

      // given
      const linter = new Linter({
        config: {
          extends: 'plugin:camunda-compat/camunda-cloud-8-0',
          rules: {
            'camunda-compat/timer': [ 'warn', { version: '8.0' } ]
          }
        },
        resolver: new NodeResolver()
      });

      const { root } = await readModdle('test/camunda-cloud/integration/camunda-cloud-8-0-timer.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports[ 'camunda-compat/timer' ]).not.to.exist;
    });

  });

});
