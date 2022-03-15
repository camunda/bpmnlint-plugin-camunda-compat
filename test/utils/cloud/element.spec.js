const { expect } = require('chai');

const {
  hasZeebeCalledDecisionOrTaskDefinition,
  hasZeebeTaskDefinition,
  hasZeebeCalledElement,
  hasZeebeTaskDefinitionIfChild,
  hasSubscriptionIfInSubProcess
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


describe('#hasSubscriptionIfInSubProcess', function() {

  it('should return true', function() {

    // given
    const subProcess = createElement('bpmn:SubProcess', {
      'triggeredByEvent': 'true',
    });

    const receiveTask = createReceiveTask(true);

    receiveTask.$parent = subProcess;

    // when
    const result = hasSubscriptionIfInSubProcess()(receiveTask);

    // then
    expect(result).to.be.true;
  });


  it('should return string', function() {

    // given
    const subProcess = createElement('bpmn:SubProcess', {
      'triggeredByEvent': 'true',
    });

    const receiveTask = createReceiveTask(false);

    receiveTask.$parent = subProcess;

    // when
    const { message } = hasSubscriptionIfInSubProcess()(receiveTask);

    // then
    expect(message).to.eql('Element of type <bpmn:ReceiveTask> must have <zeebe:Subscription> extension element');
  });

});


describe('#hasSubscriptionIfMessageCatchInSubProcess', function() {

  it('should return true', function() {

    // given
    const subProcess = createElement('bpmn:SubProcess', {
      'triggeredByEvent': 'true',
    });

    const { messageDefinition, messageCatchEvent } = createMessageIntermediateCatchEvent(true);

    messageCatchEvent.$parent = subProcess;

    // when
    const result = hasSubscriptionIfInSubProcess(messageDefinition)(messageCatchEvent);

    // then
    expect(result).to.be.true;
  });


  it('should return string', function() {

    // given
    const subProcess = createElement('bpmn:SubProcess', {
      'triggeredByEvent': 'true',
    });

    const { messageDefinition, messageCatchEvent } = createMessageIntermediateCatchEvent(false);

    messageCatchEvent.$parent = subProcess;

    // when
    const { message } = hasSubscriptionIfInSubProcess(messageDefinition)(messageCatchEvent);

    // then
    expect(message).to.eql('Element of type <bpmn:IntermediateCatchEvent> must have <zeebe:Subscription> extension element');
  });

});


function createReceiveTask(hasSubscription) {
  return createElement('bpmn:ReceiveTask', {
    messageRef: createMessage(hasSubscription)
  });
}

function createMessageIntermediateCatchEvent(hasSubscription) {
  const messageDefinition = createElement('bpmn:MessageEventDefinition', {
    messageRef: createMessage(hasSubscription)
  });

  const messageCatchEvent = createElement('bpmn:IntermediateCatchEvent', {
    eventDefinitions: [ messageDefinition ]
  });

  return { messageDefinition, messageCatchEvent };
}


function createMessage(hasSubscription) {
  const extensionElements = createElement('bpmn:ExtensionElements', {
    values: [ createElement('zeebe:Subscription') ]
  });

  if (hasSubscription) {
    return createElement('bpmn:Message', {
      extensionElements
    });
  } else {
    return createElement('bpmn:Message');
  }
}