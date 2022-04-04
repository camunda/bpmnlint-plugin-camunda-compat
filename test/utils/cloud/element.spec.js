const { expect } = require('chai');

const { ERROR_TYPES } = require('../../../rules/utils/element');

const {
  hasZeebeCalledDecisionOrTaskDefinition,
  hasZeebeCalledElement,
  hasZeebeLoopCharacteristics,
  hasZeebeSubscription,
  hasZeebeTaskDefinition
} = require('../../../rules/utils/cloud/element');

const { createElement } = require('../../helper');

describe('util - cloud - element', function() {

  describe('#hasZeebeCalledDecisionOrTaskDefinition', function() {

    it('should not return errors', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledDecision', {
              decisionId: 'foo',
              resultVariable: 'bar'
            })
          ]
        })
      });

      // when
      const result = hasZeebeCalledDecisionOrTaskDefinition(businessRuleTask);

      // then
      expect(result).to.be.true;
    });


    it('should return errors (no called decision or task definition)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask');

      // when
      const result = hasZeebeCalledDecisionOrTaskDefinition(businessRuleTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:BusinessRuleTask> must have one or many extension elements of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
        path: null,
        error: {
          type: 'extensionElementRequired',
          requiredExtensionElement: 'zeebe:CalledDecision'
        }
      });
    });


    it('should return errors (called decision and task definition)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledDecision'),
            createElement('zeebe:TaskDefinition')
          ]
        })
      });

      // when
      const result = hasZeebeCalledDecisionOrTaskDefinition(businessRuleTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:BusinessRuleTask> must have one extension element of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
        path: null
      });
    });


    it('should return errors (no decision ID)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledDecision', {
              resultVariable: 'bar'
            })
          ]
        })
      });

      // when
      const result = hasZeebeCalledDecisionOrTaskDefinition(businessRuleTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <zeebe:CalledDecision> must have property <decisionId>',
        path: [ 'extensionElements', 'values', 0, 'decisionId' ],
        error: {
          type: 'propertyRequired',
          requiredProperty: 'decisionId'
        }
      });
    });


    it('should return errors (no result variable)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledDecision', {
              decisionId: 'foo'
            })
          ]
        })
      });

      // when
      const result = hasZeebeCalledDecisionOrTaskDefinition(businessRuleTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <zeebe:CalledDecision> must have property <resultVariable>',
        path: [ 'extensionElements', 'values', 0, 'resultVariable' ],
        error: {
          type: 'propertyRequired',
          requiredProperty: 'resultVariable'
        }
      });
    });


    it('should return errors (no type)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:TaskDefinition')
          ]
        })
      });

      // when
      const result = hasZeebeCalledDecisionOrTaskDefinition(businessRuleTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
        path: [ 'extensionElements', 'values', 0, 'type' ],
        error: {
          type: 'propertyRequired',
          requiredProperty: 'type'
        }
      });
    });

  });


  describe('#hasZeebeCalledElement', function() {

    it('should not return errors', function() {

      // given
      const callActivity = createElement('bpmn:CallActivity', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledElement', {
              processId: 'foo'
            })
          ]
        })
      });

      // when
      const result = hasZeebeCalledElement(callActivity);

      // then
      expect(result).to.be.true;
    });


    it('should return errors (no called element)', function() {

      // given
      const callActivity = createElement('bpmn:CallActivity');

      // when
      const result = hasZeebeCalledElement(callActivity);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:CallActivity> must have extension element of type <zeebe:CalledElement>',
        path: null,
        error: {
          type: 'extensionElementRequired',
          requiredExtensionElement: 'zeebe:CalledElement'
        }
      });
    });


    it('should return errors (no process ID)', function() {

      // given
      const callActivity = createElement('bpmn:CallActivity', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledElement')
          ]
        })
      });

      // when
      const result = hasZeebeCalledElement(callActivity);

      // then
      expect(result).to.eql({
        message: 'Element of type <zeebe:CalledElement> must have property <processId>',
        path: [ 'extensionElements', 'values', 0, 'processId' ],
        error: {
          type: 'propertyRequired',
          requiredProperty: 'processId'
        }
      });
    });

  });


  describe('#hasZeebeLoopCharacteristics', function() {

    it('should not return errors', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:LoopCharacteristics', {
                inputCollection: 'foo'
              })
            ]
          })
        })
      });

      // when
      const result = hasZeebeLoopCharacteristics(serviceTask);

      // then
      expect(result).to.be.true;
    });


    it('should not return errors (no multi instance loop characteristics)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask');

      // when
      const result = hasZeebeLoopCharacteristics(serviceTask);

      // then
      expect(result).to.be.true;
    });


    it('should return errors (no loop characteristics)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics')
      });

      // when
      const result = hasZeebeLoopCharacteristics(serviceTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:MultiInstanceLoopCharacteristics> must have extension element of type <zeebe:LoopCharacteristics>',
        error: {
          type: 'extensionElementRequired',
          requiredExtensionElement: 'zeebe:LoopCharacteristics'
        },
        path: [
          'loopCharacteristics'
        ]
      });
    });


    it('should return errors (no input collection)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:LoopCharacteristics')
            ]
          })
        })
      });

      // when
      const result = hasZeebeLoopCharacteristics(serviceTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <zeebe:LoopCharacteristics> must have property <inputCollection>',
        path: [
          'loopCharacteristics',
          'extensionElements',
          'values',
          0,
          'inputCollection'
        ],
        error: {
          type: 'propertyRequired',
          requiredProperty: 'inputCollection'
        }
      });
    });


    it('should return errors (no output collection)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:LoopCharacteristics', {
                inputCollection: 'foo',
                outputElement: 'bar'
              })
            ]
          })
        })
      });

      // when
      const result = hasZeebeLoopCharacteristics(serviceTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>',
        path: [
          'loopCharacteristics',
          'extensionElements',
          'values',
          0,
          'outputCollection'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
          dependendRequiredProperty: 'outputCollection'
        }
      });
    });


    it('should return errors (no output element)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:LoopCharacteristics', {
                inputCollection: 'foo',
                outputCollection: 'bar'
              })
            ]
          })
        })
      });

      // when
      const result = hasZeebeLoopCharacteristics(serviceTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>',
        path: [
          'loopCharacteristics',
          'extensionElements',
          'values',
          0,
          'outputElement'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
          dependendRequiredProperty: 'outputElement'
        }
      });
    });

  });


  describe('#hasZeebeSubscription', function() {

    it('should not return errors', function() {

      // given
      const receiveTask = createElement('bpmn:ReceiveTask', {
        messageRef: createElement('bpmn:Message', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:Subscription', {
                correlationKey: 'foo'
              })
            ]
          })
        })
      });

      // when
      const result = hasZeebeSubscription(receiveTask);

      // then
      expect(result).to.be.true;
    });


    it('should return errors (no message)', function() {

      // given
      const receiveTask = createElement('bpmn:ReceiveTask');

      // when
      const result = hasZeebeSubscription(receiveTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:ReceiveTask> must have property <messageRef>',
        path: [ 'messageRef' ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'messageRef'
        }
      });
    });


    it('should return errors (no subscription)', function() {

      // given
      const message = createElement('bpmn:Message');

      const receiveTask = createElement('bpmn:ReceiveTask', {
        messageRef: message
      });

      createElement('bpmn:Definitions', {
        rootElements: [
          createElement('bpmn:Process', {
            flowElements: [
              receiveTask
            ]
          }),
          message
        ]
      });

      // when
      const result = hasZeebeSubscription(receiveTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:Message> must have extension element of type <zeebe:Subscription>',
        error: {
          type: 'extensionElementRequired',
          requiredExtensionElement: 'zeebe:Subscription'
        },
        path: [
          'rootElements',
          1
        ]
      });
    });


    it('should return errors (no subscription correlation key)', function() {

      // given
      const message = createElement('bpmn:Message', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:Subscription')
          ]
        })
      });

      const receiveTask = createElement('bpmn:ReceiveTask', {
        messageRef: message
      });

      createElement('bpmn:Definitions', {
        rootElements: [
          createElement('bpmn:Process', {
            flowElements: [
              receiveTask
            ]
          }),
          message
        ]
      });

      // when
      const result = hasZeebeSubscription(receiveTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <zeebe:Subscription> must have property <correlationKey>',
        path: [
          'rootElements',
          1,
          'extensionElements',
          'values',
          0,
          'correlationKey'
        ],
        error: {
          type: 'propertyRequired',
          requiredProperty: 'correlationKey'
        }
      });
    });

  });


  describe('#hasZeebeTaskDefinition', function() {

    it('should not return errors', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:TaskDefinition', {
              type: 'foo'
            })
          ]
        })
      });

      // when
      const result = hasZeebeTaskDefinition(serviceTask);

      // then
      expect(result).to.be.true;
    });


    it('should return errors (no task definition)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask');

      // when
      const result = hasZeebeTaskDefinition(serviceTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:ServiceTask> must have extension element of type <zeebe:TaskDefinition>',
        path: null,
        error: {
          type: 'extensionElementRequired',
          requiredExtensionElement: 'zeebe:TaskDefinition'
        }
      });
    });


    it('should return errors (no type)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:TaskDefinition')
          ]
        })
      });

      // when
      const result = hasZeebeTaskDefinition(serviceTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
        path: [ 'extensionElements', 'values', 0, 'type' ],
        error: {
          type: 'propertyRequired',
          requiredProperty: 'type'
        }
      });
    });

  });

});