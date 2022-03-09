const { expect } = require('chai');

const {
  hasZeebeCalledDecisionOrTaskDefinition,
  hasZeebeTaskDefinition,
  hasZeebeCalledElement,
  hasZeebeTaskDefinitionIfChild
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


describe('#hasZeebeCalledElement', function() {

  it('should return true', function() {

    // given
    const calledElement = createElement('zeebe:CalledElement');

    const extensionElements = createElement('bpmn:ExtensionElements', {
      values: [ calledElement ]
    });

    const node = createElement('bpmn:CallActivity', {
      extensionElements
    });

    // when
    const result = hasZeebeCalledElement(node);

    // then
    expect(result).to.be.true;
  });


  it('should return string', function() {

    // given
    const node = createElement('bpmn:CallActivity');

    // when
    const { message } = hasZeebeCalledElement(node);

    // then
    expect(message).to.eql('Element of type <bpmn:CallActivity> must have <zeebe:CalledElement> extension element');
  });

});


describe('#hasZeebeTaskDefinitionIfChild', function() {

  it('should return true', function() {

    // given
    const taskDefiniton = createElement('zeebe:TaskDefinition', {
      'zeebe:type': 'foo',
      'zeebe:retries': 'bar'
    });

    const extensionElements = createElement('bpmn:ExtensionElements', {
      values: [ taskDefiniton ]
    });

    const node = createElement('bpmn:IntermediateThrowEvent', {
      eventDefinitions:  [ createElement('bpmn:MessageEventDefinition') ],
      extensionElements
    });

    // when
    const result = hasZeebeTaskDefinitionIfChild('bpmn:MessageEventDefinition')(node);

    // then
    expect(result).to.be.true;
  });


  it('should return string', function() {

    // given

    const node = createElement('bpmn:IntermediateThrowEvent', {
      eventDefinitions:  [ createElement('bpmn:MessageEventDefinition') ]
    });

    // when
    const { message } = hasZeebeTaskDefinitionIfChild('bpmn:MessageEventDefinition')(node);

    // then
    expect(message).to.eql('Element of type <bpmn:IntermediateThrowEvent (bpmn:MessageEventDefinition)> must have <zeebe:TaskDefinition> extension element');
  });

});