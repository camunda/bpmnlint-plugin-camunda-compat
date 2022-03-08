const { expect } = require('chai');

const {
  hasZeebeCalledDecisionOrTaskDefinition,
  hasZeebeTaskDefinition
} = require('../../../rules/utils/cloud/element');

const { createElement } = require('../../helper');

describe('util - cloud - element', function() {

  describe('#hasZeebeCalledDecisionOrTaskDefinition', function() {

    it('should return true (called element)', function() {

      // given
      const calledDecision = createElement('zeebe:CalledDecision', {
        'zeebe:decisionId': 'foo',
        'zeebe:resultVariable': 'bar'
      });

      const extensionElements = createElement('bpmn:ExtensionElements', {
        values: [ calledDecision ]
      });

      calledDecision.$parent = extensionElements;

      const node = createElement('bpmn:ServiceTask', {
        extensionElements
      });

      extensionElements.$parent = node;

      // when
      const result = hasZeebeCalledDecisionOrTaskDefinition(node);

      // then
      expect(result).to.be.true;
    });


    it('should return true (task definition)', function() {

      // given
      const calledDecision = createElement('zeebe:TaskDefinition', {
        'zeebe:type': 'foo',
        'zeebe:retries': 'bar'
      });

      const extensionElements = createElement('bpmn:ExtensionElements', {
        values: [ calledDecision ]
      });

      calledDecision.$parent = extensionElements;

      const node = createElement('bpmn:ServiceTask', {
        extensionElements
      });

      extensionElements.$parent = node;

      // when
      const result = hasZeebeCalledDecisionOrTaskDefinition(node);

      // then
      expect(result).to.be.true;
    });


    it('should return false', function() {

      // given
      const node = createElement('bpmn:ServiceTask');

      // when
      const result = hasZeebeCalledDecisionOrTaskDefinition(node);

      // then
      expect(result).to.eql('Element of type <bpmn:ServiceTask> must have either <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element');
    });

  });


  describe('#hasZeebeTaskDefinition', function() {

    it('should return true (task definition)', function() {

      // given
      const calledDecision = createElement('zeebe:TaskDefinition', {
        'zeebe:type': 'foo',
        'zeebe:retries': 'bar'
      });

      const extensionElements = createElement('bpmn:ExtensionElements', {
        values: [ calledDecision ]
      });

      calledDecision.$parent = extensionElements;

      const node = createElement('bpmn:ServiceTask', {
        extensionElements
      });

      extensionElements.$parent = node;

      // when
      const result = hasZeebeTaskDefinition(node);

      // then
      expect(result).to.be.true;
    });


    it('should return false', function() {

      // given
      const node = createElement('bpmn:ServiceTask');

      // when
      const result = hasZeebeTaskDefinition(node);

      // then
      expect(result).to.eql('Element of type <bpmn:ServiceTask> must have <zeebe:TaskDefinition> extension element');
    });

  });

});