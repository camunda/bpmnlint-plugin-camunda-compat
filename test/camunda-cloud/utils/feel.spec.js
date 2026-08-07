const { expect } = require('chai');

const {
  unwrapExpression,
  isFeelBearingProperty
} = require('../../../rules/camunda-cloud/utils/feel');

const { createElement } = require('../../helper');

describe('camunda-cloud/utils/feel', function() {

  describe('#unwrapExpression', function() {

    it('unwraps a bpmn:Expression to its body', function() {

      // given
      const expression = createElement('bpmn:FormalExpression', { body: '=1 + 1' });

      // then
      expect(unwrapExpression(expression)).to.eql('=1 + 1');
    });


    it('passes through a plain string', function() {
      expect(unwrapExpression('=1 + 1')).to.eql('=1 + 1');
    });


    it('passes through null and undefined', function() {
      expect(unwrapExpression(null)).to.eql(null);
      expect(unwrapExpression(undefined)).to.eql(undefined);
    });

  });


  describe('#isFeelBearingProperty', function() {

    it('accepts a FEEL-looking string', function() {

      // given
      const node = createElement('zeebe:TaskDefinition', { retries: '=fromAi(toolCall.retries)' });

      // then
      expect(isFeelBearingProperty(node, 'retries', '=fromAi(toolCall.retries)')).to.be.true;
    });


    it('rejects a non-string value', function() {

      // given
      const node = createElement('bpmn:SequenceFlow', {});

      // then
      expect(isFeelBearingProperty(node, 'incoming', [])).to.be.false;
    });


    it('rejects a string that is not a FEEL expression', function() {

      // given
      const node = createElement('zeebe:TaskDefinition', { type: 'search' });

      // then
      expect(isFeelBearingProperty(node, 'type', 'search')).to.be.false;
    });


    it('rejects the globally ignored "name" property', function() {

      // given
      const node = createElement('bpmn:AdHocSubProcess', { name: '=fromAi(toolCall.x)' });

      // then
      expect(isFeelBearingProperty(node, 'name', '=fromAi(toolCall.x)')).to.be.false;
    });


    it('rejects zeebe:Input target and zeebe:Output target', function() {

      // given
      const input = createElement('zeebe:Input', { target: '=fromAi(toolCall.x)' });
      const output = createElement('zeebe:Output', { target: '=fromAi(toolCall.x)' });

      // then
      expect(isFeelBearingProperty(input, 'target', '=fromAi(toolCall.x)')).to.be.false;
      expect(isFeelBearingProperty(output, 'target', '=fromAi(toolCall.x)')).to.be.false;
    });


    it('rejects zeebe:CalledDecision and zeebe:Script resultVariable', function() {

      // given
      const calledDecision = createElement('zeebe:CalledDecision', { resultVariable: '=fromAi(toolCall.x)' });
      const script = createElement('zeebe:Script', { resultVariable: '=fromAi(toolCall.x)' });

      // then
      expect(isFeelBearingProperty(calledDecision, 'resultVariable', '=fromAi(toolCall.x)')).to.be.false;
      expect(isFeelBearingProperty(script, 'resultVariable', '=fromAi(toolCall.x)')).to.be.false;
    });


    it('rejects bpmn:Documentation text', function() {

      // given
      const node = createElement('bpmn:Documentation', { text: '=fromAi(toolCall.x)' });

      // then
      expect(isFeelBearingProperty(node, 'text', '=fromAi(toolCall.x)')).to.be.false;
    });


    it('accepts zeebe:Header value, unlike the FEEL syntax rule', function() {

      // given
      const node = createElement('zeebe:Header', { key: 'resultExpression', value: '=fromAi(toolCall.x)' });

      // then
      expect(isFeelBearingProperty(node, 'value', '=fromAi(toolCall.x)')).to.be.true;
    });


    it('accepts zeebe:Property value, unlike the FEEL syntax rule', function() {

      // given
      const node = createElement('zeebe:Property', { name: 'custom', value: '=fromAi(toolCall.x)' });

      // then
      expect(isFeelBearingProperty(node, 'value', '=fromAi(toolCall.x)')).to.be.true;
    });

  });

});
