const { expect } = require('chai');

const {
  checkNode,
  createNoopRule,
  createRule,
  checkEvery,
  checkSome
} = require('../../rules/utils/rule');

const { createElement } = require('../helper');

describe('rule', function() {

  describe('#createRule', function() {

    it('should create rule', function() {

      // when
      const checks = [
        { check: () => false }
      ];

      const ruleFactory = createRule('Camunda Cloud', '1.0', checks),
            rule = ruleFactory();

      // then
      expect(rule).to.exist;
    });


    it('should run all checks', async function() {

      // given
      const checks = [
        { check: () => false },
        { check: () => 'foo {{ executionPlatform }} bar {{ executionPlatformVersion }} baz' },
        { check: () => false }
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
          message: 'foo Camunda Cloud bar 1.0 baz'
        }
      ]);
    });


    it('should not run all checks (early return)', function() {

      // given
      const checks = [
        { check: () => false },
        { check: () => 'foo' },
        { check: () => false }
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
        { check: () => false },
        'bpmn:Definitions',
        { check: () => false }
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.true;
    });


    it('should return true (function)', function() {

      // given
      const checks = [
        { check: () => false },
        { check: () => true },
        { check: () => false }
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.true;
    });


    it('should return true (type and function)', function() {

      // given
      const checks = [
        { check: () => false },
        { type: 'bpmn:Definitions', check: () => true },
        { check: () => false }
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.true;
    });


    it('should return false (type)', function() {

      // given
      const checks = [
        { check: () => false },
        'bpmn:Task',
        { check: () => false }
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.false;
    });


    it('should return false (function)', function() {

      // given
      const checks = [
        { check: () => false },
        { check: () => false },
        { check: () => false }
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.false;
    });


    it('should return false (type and function)', function() {

      // given
      const checks = [
        { check: () => false },
        { type: 'bpmn:Definitions', check: () => false },
        { type: 'bpmn:Task', check: () => true },
        { check: () => false }
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.be.false;
    });


    it('should return string (function)', function() {

      // given
      const checks = [
        { check: () => false },
        { check: () => 'foo' },
        { check: () => false }
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.equal('foo');
    });


    it('should return string (type and function)', function() {

      // given
      const checks = [
        { check: () => false },
        { type: 'bpmn:task', check: () => 'bar' },
        { type: 'bpmn:Definitions', check: () => 'foo' },
        { check: () => false }
      ];

      // when
      const result = checkNode(node, checks);

      // then
      expect(result).to.equal('foo');
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
        () => 'foo'
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.equal('foo');
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
        () => 'foo'
      );

      const node = createElement('bpmn:Definitions');

      // when
      const result = checks(node);

      // then
      expect(result).to.equal('foo');
    });

  });


  describe('#checkEvery and #checkSome combined', function() {

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

  });

});

class MockReporter {
  reports = [];

  getReports() {
    return this.reports;
  }

  report(id, message) {
    this.reports.push({ id, message });
  }
}