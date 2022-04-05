const {
  isArray,
  isObject
} = require('min-dash');

const chai = require('chai'),
      { expect } = chai;

const { spy } = require('sinon');

const sinonChai = require('sinon-chai');

chai.should();

chai.use(sinonChai);

const {
  checkNode,
  createNoopRule,
  createRule,
  checkEvery,
  checkSome,
  replaceCheck,
  replaceChecks
} = require('../../rules/utils/rule');

const { ERROR_TYPES } = require('../../rules/utils/element');

const { createElement } = require('../helper');

describe('util - rule', function() {

  describe('#createRule', function() {

    it('should create rule', function() {

      // when
      const checks = [
        createCheck(() => false)
      ];

      const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
            rule = ruleFactory();

      // then
      expect(rule).to.exist;
    });


    describe('checks', function() {

      it('should run all checks', async function() {

        // given
        const check1Spy = spy(() => false);
        const check2Spy = spy(() => 'foo {{ executionPlatform }} bar');
        const check3Spy = spy(() => false);

        const checks = [
          createCheck(check1Spy),
          createCheck(check2Spy),
          createCheck(check3Spy)
        ];

        const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
              rule = ruleFactory();

        const node = createElement('bpmn:Definitions', {
          id: 'Definitions_1',
          'modeler:executionPlatform': 'Camunda Cloud',
          'modeler:executionPlatformVersion': '1.0.0'
        });

        const reporter = new MockReporter();

        // when
        rule.check(node, reporter);

        // then
        expect(reporter.getReports()).to.eql([
          {
            id: 'Definitions_1',
            message: 'foo Camunda Cloud 1.0 bar'
          }
        ]);

        expect(check1Spy).to.have.been.calledOnce;
        expect(check2Spy).to.have.been.calledOnce;
        expect(check3Spy).to.have.been.calledOnce;
      });


      it('should not run any checks (early return)', function() {

        // given
        const check1Spy = spy(() => false);
        const check2Spy = spy(() => 'foo {{ executionPlatform }} bar');
        const check3Spy = spy(() => false);

        const checks = [
          createCheck(check1Spy),
          createCheck(check2Spy),
          createCheck(check3Spy)
        ];

        const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
              rule = ruleFactory();

        const node = createElement('bpmn:Definitions', {
          id: 'Definitions_1',
          'modeler:executionPlatform': 'Camunda Cloud',
          'modeler:executionPlatformVersion': '1.1.0'
        });

        const reporter = new MockReporter();

        // when
        rule.check(node, reporter);

        // then
        expect(reporter.getReports()).to.be.empty;

        expect(check1Spy).not.to.have.been.called;
        expect(check2Spy).not.to.have.been.called;
        expect(check3Spy).not.to.have.been.called;
      });

    });


    describe('reports', function() {

      let node,
          reporter;

      beforeEach(function() {
        node = createElement('bpmn:Definitions', {
          id: 'Definitions_1',
          'modeler:executionPlatform': 'Camunda Cloud',
          'modeler:executionPlatformVersion': '1.0.0'
        });

        reporter = new MockReporter();
      });


      it('should report (results = false)', async function() {

        // given
        const checks = [
          createCheck(() => false)
        ];

        const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
              rule = ruleFactory();

        // when
        rule.check(node, reporter);

        // then
        expect(reporter.getReports()).to.eql([
          {
            id: 'Definitions_1',
            message: 'A <Definitions> is not supported by Camunda Cloud 1.0',
            error: {
              type: ERROR_TYPES.ELEMENT_TYPE,
              element: 'bpmn:Definitions'
            }
          }
        ]);
      });


      it('should report (results = string)', async function() {

        // given
        const checks = [
          createCheck(() => 'foo')
        ];

        const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
              rule = ruleFactory();

        // when
        rule.check(node, reporter);

        // then
        expect(reporter.getReports()).to.eql([
          {
            id: 'Definitions_1',
            message: 'foo'
          }
        ]);
      });


      it('should report (results = string[])', async function() {

        // given
        const checks = [
          createCheck(() => [
            'foo',
            'bar'
          ])
        ];

        const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
              rule = ruleFactory();

        // when
        rule.check(node, reporter);

        // then
        expect(reporter.getReports()).to.eql([
          {
            id: 'Definitions_1',
            message: 'foo'
          },
          {
            id: 'Definitions_1',
            message: 'bar'
          }
        ]);
      });


      it('should report (results = Object)', async function() {

        // given
        const checks = [
          createCheck(() => {
            return {
              message: 'foo',
              path: [ 'foo', 'bar', 'baz' ]
            };
          })
        ];

        const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
              rule = ruleFactory();

        // when
        rule.check(node, reporter);

        // then
        expect(reporter.getReports()).to.eql([
          {
            id: 'Definitions_1',
            message: 'foo',
            path: [ 'foo', 'bar', 'baz' ]
          }
        ]);
      });


      it('should report (results = Object[])', async function() {

        // given
        const checks = [
          createCheck(() => {
            return [
              {
                message: 'foo',
                path: [ 'foo', 'bar', 'baz' ]
              },
              {
                message: 'bar'
              }
            ];
          })
        ];

        const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
              rule = ruleFactory();

        // when
        rule.check(node, reporter);

        // then
        expect(reporter.getReports()).to.eql([
          {
            id: 'Definitions_1',
            message: 'foo',
            path: [ 'foo', 'bar', 'baz' ]
          },
          {
            id: 'Definitions_1',
            message: 'bar'
          }
        ]);
      });


      it('should add execution platform and version', async function() {

        // given
        const checks = [
          createCheck(() => 'foo {{ executionPlatform }} bar')
        ];

        const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
              rule = ruleFactory();

        // when
        rule.check(node, reporter);

        // then
        expect(reporter.getReports()).to.eql([
          {
            id: 'Definitions_1',
            message: 'foo Camunda Cloud 1.0 bar'
          }
        ]);
      });


      it('should add execution platform label', async function() {

        // given
        const checks = [
          createCheck(() => 'foo {{ executionPlatform }} bar')
        ];

        const ruleFactory = createRule('Camunda Cloud', '1.0', checks, 'Microsoft Paint 1.0'),
              rule = ruleFactory();

        // when
        rule.check(node, reporter);

        // then
        expect(reporter.getReports()).to.eql([
          {
            id: 'Definitions_1',
            message: 'foo Microsoft Paint 1.0 bar'
          }
        ]);
      });


      it('should add label', async function() {

        // given
        const checks = [
          createCheck(() => 'foo')
        ];

        const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
              rule = ruleFactory();

        node = createElement('bpmn:Definitions', {
          id: 'Definitions_1',
          name: 'Foo',
          'modeler:executionPlatform': 'Camunda Cloud',
          'modeler:executionPlatformVersion': '1.0.0'
        });

        // when
        rule.check(node, reporter);

        // then
        expect(reporter.getReports()).to.eql([
          {
            id: 'Definitions_1',
            label: 'Foo',
            message: 'foo'
          }
        ]);
      });

    });

  });


  describe('#createNoopRule', function() {

    it('should create', function() {

      // when
      const ruleFactory = createNoopRule(),
            rule = ruleFactory();

      // then
      expect(rule).to.exist;
    });


    it('should return false (early return)', function() {

      // when
      const ruleFactory = createNoopRule(),
            rule = ruleFactory();

      // then
      expect(rule.check()).to.be.false;
    });

  });


  describe('#checkNode', function() {

    const node = createElement('bpmn:Definitions', {
      'modeler:executionPlatform': 'Camunda Cloud',
      'modeler:executionPlatformVersion': '1.0.0'
    });


    it('should return true (type)', function() {

      // given
      const checks = [
        createCheck(() => false),
        'bpmn:Definitions',
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.true;
    });


    it('should return true (function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => true),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.true;
    });


    it('should return true (type and function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => true, 'bpmn:Definitions'),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.true;
    });


    it('should return false (type not equal)', function() {

      // given
      const checks = [
        createCheck(() => false),
        'bpmn:Task',
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.false;
    });


    it('should return false (type not exactly equal)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask');

      const checks = [
        createCheck(() => false),
        'bpmn:Task',
        createCheck(() => false)
      ];

      // when
      const result = checkNode(businessRuleTask, checks);

      // then
      expect(result).to.be.false;
    });


    it('should return false (function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => false),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.false;
    });


    it('should return false (type not equal and function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => false, 'bpmn:Definitions'),
        createCheck(() => true, 'bpmn:Task'),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.false;
    });


    it('should return false (type not exactly equal and function)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask');

      const checks = [
        createCheck(() => false),
        createCheck(() => false, 'bpmn:Definitions'),
        createCheck(() => true, 'bpmn:Task'),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(businessRuleTask, checks);

      // then
      expect(result).to.be.false;
    });


    it('should return string (function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => [ 'foo' ]),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.eql('foo');
    });


    it('should return string (type and function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => [ 'bar' ], 'bpmn:Task'),
        createCheck(() => [ 'foo' ], 'bpmn:Definitions'),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.eql('foo');
    });


    it('should return string[] (function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => [ 'foo', 'bar' ]),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.eql([ 'foo', 'bar' ]);
    });


    it('should return string[] (type and function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => [ 'baz' ], 'bpmn:Task'),
        createCheck(() => [ 'foo', 'bar' ], 'bpmn:Definitions'),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.eql([ 'foo', 'bar' ]);
    });


    it('should return object (function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => ({ message: 'foo' })),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.eql({ message: 'foo' });
    });


    it('should return object (type and function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => ({ message: 'bar' }), 'bpmn:Task'),
        createCheck(() => ({ message: 'foo' }), 'bpmn:Definitions'),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.eql({ message: 'foo' });
    });


    it('should return object (function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => [
          { message: 'foo' },
          { message: 'bar' }
        ]),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.eql([
        { message: 'foo' },
        { message: 'bar' }
      ]);
    });


    it('should return object[] (type and function)', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => ({ message: 'baz' }), 'bpmn:Task'),
        createCheck(() => [
          { message: 'foo' },
          { message: 'bar' }
        ], 'bpmn:Definitions'),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.eql([
        { message: 'foo' },
        { message: 'bar' }
      ]);
    });


    it('should return all', function() {

      // given
      const checks = [
        createCheck(() => false),
        createCheck(() => [ 'bar', 'baz' ], 'bpmn:Definitions'),
        createCheck(() => 'foo', 'bpmn:Definitions'),
        createCheck(() => false)
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.eql([
        'bar',
        'baz',
        'foo'
      ]);
    });

  });


  describe('#checkEvery', function() {

    it('should return true', function() {

      // given
      const checks = checkEvery(
        () => true,
        () => true,
        () => true
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.be.true;
    });


    it('should return false', function() {

      // given
      const checks = checkEvery(
        () => true,
        () => false,
        () => true
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.be.false;
    });


    it('should return string', function() {

      // given
      const checks = checkEvery(
        () => true,
        () => false,
        () => [ 'foo' ]
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.eql('foo');
    });


    it('should return string[]', function() {

      // given
      const checks = checkEvery(
        () => true,
        () => false,
        () => [ 'foo', 'bar' ]
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.eql([ 'foo', 'bar' ]);
    });


    it('should return object', function() {

      // given
      const checks = checkEvery(
        () => true,
        () => false,
        () => ({ message: 'foo' })
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.eql({ message: 'foo' });
    });


    it('should return object[]', function() {

      // given
      const checks = checkEvery(
        () => true,
        () => false,
        () => [
          { message: 'foo' },
          { message: 'bar' }
        ]
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.eql([
        { message: 'foo' },
        { message: 'bar' }
      ]);
    });


    it('should return all', function() {

      // given
      const checks = checkEvery(
        () => true,
        () => [ 'bar', 'baz' ],
        () => 'foo'
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.eql([
        'bar',
        'baz',
        'foo'
      ]);
    });

  });


  describe('#checkSome', function() {

    it('should return true', function() {

      // given
      const checks = checkSome(
        () => false,
        () => true,
        () => false
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.be.true;
    });


    it('should return false', function() {

      // given
      const checks = checkSome(
        () => false,
        () => false,
        () => false
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.be.false;
    });


    it('should return string', function() {

      // given
      const checks = checkSome(
        () => false,
        () => false,
        () => [ 'foo' ]
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.eql('foo');
    });


    it('should return string[]', function() {

      // given
      const checks = checkSome(
        () => false,
        () => false,
        () => [ 'foo', 'bar' ]
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.eql([ 'foo', 'bar' ]);
    });


    it('should return object', function() {

      // given
      const checks = checkSome(
        () => false,
        () => false,
        () => ({ message: 'foo' })
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.eql({ message: 'foo' });
    });


    it('should return object[]', function() {

      // given
      const checks = checkSome(
        () => false,
        () => false,
        () => [
          { message: 'foo' },
          { message: 'bar' }
        ]
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.eql([
        { message: 'foo' },
        { message: 'bar' }
      ]);
    });


    it('should return all', function() {

      // given
      const checks = checkSome(
        () => false,
        () => [ 'bar', 'baz' ],
        () => 'foo'
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.eql([
        'bar',
        'baz',
        'foo'
      ]);
    });

  });


  describe('#checkEvery and #checkSome combined', function() {

    describe('#checkEvery and #checkSome', function() {

      it('should compose #checkEvery and #checkSome', function() {

        // given
        const checks = checkEvery(
          () => true,
          checkSome(
            () => false,
            () => true
          ),
          () => true
        );

        const node = createElement('bpmn:Definitions');

        // when
        const result = checks(node);

        // then
        expect(result).to.be.true;
      });


      it('should return all', function() {

        // given
        const checks = checkEvery(
          () => 'foo',
          checkSome(
            checkEvery(
              () => 'foobar',
              () => 'barbaz'
            ),
            () => 'bar'
          ),
          () => 'baz'
        );

        const node = createElement('bpmn:Definitions');

        // when
        const result = checks(node);

        // then
        expect(result).to.eql([
          'foo',
          'foobar',
          'barbaz',
          'bar',
          'baz'
        ]);
      });

    });


    describe('#checkSome and #checkEvery', function() {

      it('should compose #checkSome and #checkEvery', function() {

        // given
        const checks = checkSome(
          () => false,
          checkEvery(
            () => true,
            () => true
          ),
          () => false
        );

        const node = createElement('bpmn:Definitions');

        // when
        const result = checks(node);

        // then
        expect(result).to.be.true;
      });


      it('should return all', function() {

        // given
        const checks = checkSome(
          () => 'foo',
          checkEvery(
            checkSome(
              () => 'foobar',
              () => 'barbaz'
            ),
            () => 'bar'
          ),
          () => 'baz'
        );

        const node = createElement('bpmn:Definitions');

        // when
        const result = checks(node);

        // then
        expect(result).to.eql([
          'foo',
          'foobar',
          'barbaz',
          'bar',
          'baz'
        ]);
      });

    });

  });


  describe('#replaceCheck', function() {

    it('should replace check (string)', function() {

      // given
      let checks = [
        createCheck(() => 'foo', 'bpmn:StartEvent'),
        'bpmn:Definitions',
        createCheck(() => 'baz', 'bpmn:EndEvent')
      ];

      // when
      checks = replaceCheck(checks, 'bpmn:Definitions', () => 'foobar');

      // then
      const results = checks.map(check => check.check());

      expect(results).to.eql([ 'foo', 'foobar', 'baz' ]);
    });


    it('should replace check (object)', function() {

      // given
      let checks = [
        createCheck(() => 'foo', 'bpmn:StartEvent'),
        createCheck(() => 'bar', 'bpmn:Definitions'),
        createCheck(() => 'baz', 'bpmn:EndEvent')
      ];

      // when
      checks = replaceCheck(checks, 'bpmn:Definitions', () => 'foobar');

      // then
      const results = checks.map(check => check.check());

      expect(results).to.eql([ 'foo', 'foobar', 'baz' ]);
    });

  });


  describe('#replaceChecks', function() {

    it('should replace checks', function() {

      // given
      let checks = [
        createCheck(() => 'foo', 'bpmn:StartEvent'),
        'bpmn:Definitions',
        createCheck(() => 'baz', 'bpmn:EndEvent')
      ];

      // when
      checks = replaceChecks(checks, [
        {
          type: 'bpmn:StartEvent',
          check: () => 'foobar'
        },
        {
          type: 'bpmn:Definitions',
          check: () => 'barbaz'
        }
      ]);

      // then
      const results = checks.map(check => check.check());

      expect(results).to.eql([ 'foobar', 'barbaz', 'baz' ]);
    });

  });

});

class MockReporter {
  reports = [];

  getReports() {
    return this.reports;
  }

  report(id, message, path) {
    let report = {
      id,
      message
    };

    if (path && isArray(path)) {
      report = {
        ...report,
        path
      };
    }

    if (path && isObject(path)) {
      report = {
        ...report,
        ...path
      };
    }

    this.reports.push(report);
  }
}

function createCheck(check = () => {}, type) {
  return {
    check,
    type
  };
}