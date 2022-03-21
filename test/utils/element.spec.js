const chai = require('chai'),
      { expect } = chai;

const { spy } = require('sinon');

const sinonChai = require('sinon-chai');

chai.should();

chai.use(sinonChai);

const {
  checkError,
  checkFlowNode,
  checkIf,
  checkLoopCharacteristics,
  checkMessage,
  checkProperties,
  ERROR_TYPES,
  formatTypes,
  hasErrorReference,
  hasEventDefinitionOfType,
  hasEventDefinitionOfTypeOrNone,
  hasExtensionElementOfType,
  hasExtensionElementsOfTypes,
  hasLoopCharacteristicsOfTypeOrNone,
  hasMultiInstanceLoopCharacteristics,
  hasNoEventDefinition,
  hasNoLanes,
  withTranslations
} = require('../../rules/utils/element');

const { createElement } = require('../helper');

const noop = () => {};

describe('util - element', function() {

  describe('#checkError', function() {

    it('should not provide flow node as parent node', function() {

      // given
      const error = createElement('bpmn:Error');

      const errorEventDefinition = createElement('bpmn:ErrorEventDefinition', {
        errorRef: error
      });

      const checkSpy = spy();

      const check = checkError(checkSpy);

      // when
      check(errorEventDefinition);

      // then
      expect(checkSpy).to.have.been.calledWithExactly(error);
    });


    it('should return error', function() {

      // given
      const errorEventDefinition = createElement('bpmn:ErrorEventDefinition');

      const boundaryEvent = createElement('bpmn:BoundaryEvent', {
        eventDefinitions: [
          errorEventDefinition
        ]
      });

      const check = checkError(noop);

      // when
      const results = check(errorEventDefinition, boundaryEvent);

      // then
      expect(results).to.eql({
        message: 'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>',
        path: [
          'eventDefinitions',
          0,
          'errorRef'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'errorRef'
        }
      });
    });

  });


  describe('#checkFlowNode', function() {

    it('should provide flow node as parent node', function() {

      // given
      const task = createElement('bpmn:Task');

      const checkSpy = spy();

      const check = checkFlowNode(checkSpy);

      // when
      check(task);

      // then
      expect(checkSpy).to.have.been.calledWith(task, task);
    });

  });


  describe('#checkIf', function() {

    it('should check', function() {

      // given
      const check = checkIf(
        () => 'bar',
        ({ foo }) => foo === 'foo'
      );

      // when
      const result = check({ foo: 'foo' });

      // then
      expect(result).to.eql('bar');
    });


    it('should not check (default return value)', function() {

      // given
      const check = checkIf(
        () => 'bar',
        ({ foo }) => foo === 'bar'
      );

      // when
      const result = check({ foo: 'foo' });

      // then
      expect(result).to.be.true;
    });


    it('should not check (custom return value)', function() {

      // given
      const check = checkIf(
        () => 'bar',
        ({ foo }) => foo === 'bar',
        'baz'
      );

      // when
      const result = check({ foo: 'foo' });

      // then
      expect(result).to.eql('baz');
    });

  });


  describe('#checkLoopCharacteristics', function() {

    it('should provide flow node as parent node', function() {

      // given
      const loopCharacteristics = createElement('bpmn:MultiInstanceLoopCharacteristics');

      const task = createElement('bpmn:Task', {
        loopCharacteristics
      });

      const checkSpy = spy();

      const check = checkLoopCharacteristics(checkSpy);

      // when
      check(task);

      // then
      expect(checkSpy).to.have.been.calledWith(loopCharacteristics, task);
    });


    it('should return error', function() {

      // given
      const task = createElement('bpmn:Task');

      const check = checkLoopCharacteristics(noop);

      // when
      const results = check(task);

      // then
      expect(results).to.eql({
        message: 'Element of type <bpmn:Task> must have property <loopCharacteristics>',
        path: [ 'loopCharacteristics' ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'loopCharacteristics'
        }
      });
    });

  });


  describe('#checkMessage', function() {

    it('should not provide flow node as parent node', function() {

      // given
      const message = createElement('bpmn:Message');

      const receiveTask = createElement('bpmn:ReceiveTask', {
        messageRef: message
      });

      const checkSpy = spy();

      const check = checkMessage(checkSpy);

      // when
      check(receiveTask);

      // then
      expect(checkSpy).to.have.been.calledWithExactly(message);
    });


    it('should return error', function() {

      // given
      const messageEventDefinition = createElement('bpmn:MessageEventDefinition');

      const boundaryEvent = createElement('bpmn:BoundaryEvent', {
        eventDefinitions: [
          messageEventDefinition
        ]
      });

      const check = checkMessage(noop);

      // when
      const results = check(messageEventDefinition, boundaryEvent);

      // then
      expect(results).to.eql({
        message: 'Element of type <bpmn:MessageEventDefinition> must have property <messageRef>',
        path: [
          'eventDefinitions',
          0,
          'messageRef'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'messageRef'
        }
      });
    });

  });


  describe('#checkProperties', function() {

    describe('dependend required', function() {

      it('should not return errors', function() {

        // given
        const taskDefinition = createElement('zeebe:TaskDefinition', {
          type: 'foo',
          retries: 'bar'
        });

        // when
        const results = checkProperties(taskDefinition, {
          type: {
            dependendRequired: 'retries'
          }
        });

        // then
        expect(results).to.be.empty;
      });


      it('should return errors (parentNode === node)', function() {

        // given
        const taskDefinition = createElement('zeebe:TaskDefinition', {
          retries: 'bar'
        });

        // when
        const results = checkProperties(taskDefinition, {
          type: {
            dependendRequired: 'retries'
          }
        });

        // then
        expect(results).to.eql([
          {
            message: 'Element of type <zeebe:TaskDefinition> must have property <type> if property <retries> is set',
            path: [ 'type' ],
            error: {
              type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
              dependendRequiredProperty: 'type'
            }
          }
        ]);
      });


      it('should return errors (parentNode !== node)', function() {

        // given
        const taskDefinition = createElement('zeebe:TaskDefinition', {
          retries: 'bar'
        });

        const serviceTask = createElement('bpmn:ServiceTask', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              taskDefinition
            ]
          })
        });

        // when
        const results = checkProperties(taskDefinition, {
          type: {
            dependendRequired: 'retries'
          }
        }, serviceTask);

        // then
        expect(results).to.eql([
          {
            message: 'Element of type <zeebe:TaskDefinition> must have property <type> if property <retries> is set',
            path: [ 'extensionElements', 'values', 0, 'type' ],
            error: {
              type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
              dependendRequiredProperty: 'type'
            }
          }
        ]);
      });

    });


    describe('required', function() {

      it('should not return errors', function() {

        // given
        const taskDefinition = createElement('zeebe:TaskDefinition', {
          type: 'foo'
        });

        // when
        const results = checkProperties(taskDefinition, {
          type: {
            required: true
          }
        });

        // then
        expect(results).to.be.empty;
      });


      it('should return errors (parentNode === node)', function() {

        // given
        const taskDefinition = createElement('zeebe:TaskDefinition');

        // when
        const results = checkProperties(taskDefinition, {
          type: {
            required: true
          }
        });

        // then
        expect(results).to.eql([
          {
            message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
            path: [ 'type' ],
            error: {
              type: ERROR_TYPES.PROPERTY_REQUIRED,
              requiredProperty: 'type'
            }
          }
        ]);
      });


      it('should return errors (parentNode !== node)', function() {

        // given
        const taskDefinition = createElement('zeebe:TaskDefinition'),
              serviceTask = createElement('bpmn:ServiceTask', {
                extensionElements: createElement('bpmn:ExtensionElements', {
                  values: [
                    taskDefinition
                  ]
                })
              });

        // when
        const results = checkProperties(taskDefinition, {
          type: {
            required: true
          }
        }, serviceTask);

        // then
        expect(results).to.eql([
          {
            message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
            path: [ 'extensionElements', 'values', 0, 'type' ],
            error: {
              type: ERROR_TYPES.PROPERTY_REQUIRED,
              requiredProperty: 'type'
            }
          }
        ]);
      });

    });


    describe('type', function() {

      it('should not return errors', function() {

        // given
        const serviceTask = createElement('bpmn:ServiceTask', {
          loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics')
        });

        // when
        const results = checkProperties(serviceTask, {
          name: {
            type: 'bpmn:MultiInstanceLoopCharacteristics'
          }
        });

        // then
        expect(results).to.be.empty;
      });


      it('should return errors (parentNode === node)', function() {

        // given
        const serviceTask = createElement('bpmn:ServiceTask', {
          loopCharacteristics: createElement('bpmn:StandardLoopCharacteristics')
        });

        // when
        const results = checkProperties(serviceTask, {
          loopCharacteristics: {
            type: 'bpmn:MultiInstanceLoopCharacteristics'
          }
        });

        // then
        expect(results).to.eql([
          {
            message: 'Element of type <bpmn:ServiceTask> must have property <loopCharacteristics> of type <bpmn:MultiInstanceLoopCharacteristics>',
            path: [ 'loopCharacteristics' ],
            error: {
              type: ERROR_TYPES.PROPERTY_TYPE,
              propertyType: 'bpmn:MultiInstanceLoopCharacteristics'
            }
          }
        ]);
      });


      it('should return errors (parentNode !== node)', function() {

        // given
        const serviceTask = createElement('bpmn:ServiceTask', {
          loopCharacteristics: createElement('bpmn:StandardLoopCharacteristics')
        });

        const definitions = createElement('bpmn:Definitions', {
          rootElements: [
            createElement('bpmn:Process', {
              flowElements: [
                serviceTask
              ]
            })
          ]
        });

        // when
        const results = checkProperties(serviceTask, {
          loopCharacteristics: {
            type: 'bpmn:MultiInstanceLoopCharacteristics'
          }
        }, definitions);

        // then
        expect(results).to.eql([
          {
            message: 'Element of type <bpmn:ServiceTask> must have property <loopCharacteristics> of type <bpmn:MultiInstanceLoopCharacteristics>',
            path: [
              'rootElements',
              0,
              'flowElements',
              0,
              'loopCharacteristics'
            ],
            error: {
              type: ERROR_TYPES.PROPERTY_TYPE,
              propertyType: 'bpmn:MultiInstanceLoopCharacteristics'
            }
          }
        ]);
      });

    });

  });


  describe('#formatTypes', function() {

    it('one', function() {

      // given
      const types = [ 'foo' ];

      // then
      expect(formatTypes(types)).to.eql('<foo>');
    });


    it('two (inclusive)', function() {

      // given
      const types = [ 'foo', 'bar' ];

      // then
      expect(formatTypes(types)).to.eql('<foo> and <bar>');
    });


    it('two (exclusive)', function() {

      // given
      const types = [ 'foo', 'bar' ];

      // then
      expect(formatTypes(types, true)).to.eql('<foo> or <bar>');
    });


    it('three', function() {

      // given
      const types = [ 'foo', 'bar', 'baz' ];

      // then
      expect(formatTypes(types)).to.eql('<foo>, <bar> and <baz>');
    });


    it('should get types', function() {

      // given
      const types = [
        { type: 'foo' },
        'bar',
        { type: 'baz' }
      ];

      // then
      expect(formatTypes(types)).to.eql('<foo>, <bar> and <baz>');
    });

  });


  describe('#hasErrorReference', function() {

    it('should not return error', function() {

      // given
      const error = createElement('bpmn:Error');

      const errorEventDefinition = createElement('bpmn:ErrorEventDefinition', {
        errorRef: error
      });

      // when
      const results = hasErrorReference(errorEventDefinition);

      // then
      expect(results).to.be.true;
    });


    it('should return error', function() {

      // given
      const errorEventDefinition = createElement('bpmn:ErrorEventDefinition');

      // when
      const results = hasErrorReference(errorEventDefinition);

      // then
      expect(results).to.eql({
        message: 'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>',
        path: [ 'errorRef' ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'errorRef'
        }
      });
    });

  });


  describe('#hasEventDefinitionOfType', function() {

    it('should not return error', function() {

      // given
      const node = createElement('bpmn:StartEvent', {
        eventDefinitions: [ createElement('bpmn:ErrorEventDefinition') ]
      });

      // when
      const result = hasEventDefinitionOfType('bpmn:ErrorEventDefinition')(node);

      // then
      expect(result).to.be.true;
    });


    it('should return error', function() {

      // given
      const node = createElement('bpmn:StartEvent', {
        eventDefinitions: [ createElement('bpmn:ErrorEventDefinition') ]
      });

      // when
      const result = hasEventDefinitionOfType('bpmn:MessageEventDefinition')(node);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:StartEvent> (<bpmn:ErrorEventDefinition>) not supported by {{ executionPlatform }} {{ executionPlatformVersion }}',
        path: [
          'eventDefinitions',
          0
        ],
        error: {
          type: 'elementType',
          elementType: 'bpmn:StartEvent',
          propertyType: 'bpmn:ErrorEventDefinition'
        }
      });
    });

  });


  describe('#hasEventDefinitionOfTypeOrNone', function() {

    it('should not return error', function() {

      // given
      const node = createElement('bpmn:StartEvent', {
        eventDefinitions: [ createElement('bpmn:ErrorEventDefinition') ]
      });

      // when
      const result = hasEventDefinitionOfTypeOrNone('bpmn:ErrorEventDefinition')(node);

      // then
      expect(result).to.be.true;
    });


    it('should not return error', function() {

      // given
      const node = createElement('bpmn:StartEvent');

      // when
      const result = hasEventDefinitionOfTypeOrNone('bpmn:ErrorEventDefinition')(node);

      // then
      expect(result).to.be.true;
    });


    it('should return error', function() {

      // given
      const node = createElement('bpmn:StartEvent', {
        eventDefinitions: [ createElement('bpmn:ErrorEventDefinition') ]
      });

      // when
      const result = hasEventDefinitionOfTypeOrNone('bpmn:SignalEventDefinition')(node);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:StartEvent> (<bpmn:ErrorEventDefinition>) not supported by {{ executionPlatform }} {{ executionPlatformVersion }}',
        path: [
          'eventDefinitions',
          0
        ],
        error: {
          type: 'elementType',
          elementType: 'bpmn:StartEvent',
          propertyType: 'bpmn:ErrorEventDefinition'
        }
      });
    });

  });


  describe('#hasExtensionElementOfType', function() {

    it('should not return errors', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:TaskDefinition')
          ]
        })
      });

      const check = hasExtensionElementOfType('zeebe:TaskDefinition');

      // when
      const result = check(serviceTask, serviceTask);

      // then
      expect(result).to.be.true;
    });


    it('should return errors (no extension elements)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: []
        })
      });

      const check = hasExtensionElementOfType('zeebe:TaskDefinition');

      // when
      const result = check(serviceTask, serviceTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:ServiceTask> must have <zeebe:TaskDefinition> extension element',
        path: null,
        error: {
          type: 'extensionElementRequired',
          requiredExtensionElement: 'zeebe:TaskDefinition'
        }
      });
    });


    it('should return errors (no task definition)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask');

      const check = hasExtensionElementOfType('zeebe:TaskDefinition');

      // when
      const result = check(serviceTask, serviceTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:ServiceTask> must have <zeebe:TaskDefinition> extension element',
        path: null,
        error: {
          type: 'extensionElementRequired',
          requiredExtensionElement: 'zeebe:TaskDefinition'
        }
      });
    });


    it('should return errors (properties)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:TaskDefinition', {
              retries: 'bar'
            })
          ]
        })
      });

      const check = hasExtensionElementOfType({
        type: 'zeebe:TaskDefinition',
        properties: {
          type: {
            required: true
          }
        }
      });

      // when
      const result = check(serviceTask, serviceTask);

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


  describe('#hasExtensionElementsOfTypes', function() {

    it('should not return errors', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:TaskDefinition')
          ]
        })
      });

      const check = hasExtensionElementsOfTypes([
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ]);

      // when
      const result = check(businessRuleTask, businessRuleTask);

      // then
      expect(result).to.be.true;
    });


    it('should not return errors (not exclusive)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledDecision'),
            createElement('zeebe:TaskDefinition')
          ]
        })
      });

      const check = hasExtensionElementsOfTypes([
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ]);

      // when
      const result = check(businessRuleTask, businessRuleTask);

      // then
      expect(result).to.be.true;
    });


    it('should return errors (no extension elements)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask');

      const check = hasExtensionElementsOfTypes([
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ]);

      // when
      const result = check(businessRuleTask, businessRuleTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:BusinessRuleTask> must have have at least one <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element',
        path: null,
        error: {
          type: 'extensionElementRequired',
          requiredExtensionElement: 'zeebe:CalledDecision'
        }
      });
    });


    it('should return errors (no task definition)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: []
        })
      });

      const check = hasExtensionElementsOfTypes([
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ]);

      // when
      const result = check(businessRuleTask, businessRuleTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:BusinessRuleTask> must have have at least one <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element',
        path: null,
        error: {
          type: 'extensionElementRequired',
          requiredExtensionElement: 'zeebe:CalledDecision'
        }
      });
    });


    it('should return errors (exlusive)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledDecision'),
            createElement('zeebe:TaskDefinition')
          ]
        })
      });

      const check = hasExtensionElementsOfTypes([
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ], true);

      // when
      const result = check(businessRuleTask, businessRuleTask);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:BusinessRuleTask> must have have either one <zeebe:CalledDecision> or <zeebe:TaskDefinition> extension element',
        path: null
      });
    });


    it('should return errors (properties)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledDecision'),
            createElement('zeebe:TaskDefinition')
          ]
        })
      });

      const check = hasExtensionElementsOfTypes([
        {
          type: 'zeebe:CalledDecision',
          properties: {
            decisionId: {
              required: true
            }
          }
        },
        {
          type: 'zeebe:TaskDefinition',
          properties: {
            type: {
              required: true
            }
          }
        }
      ]);

      // when
      const result = check(businessRuleTask, businessRuleTask);

      // then
      expect(result).to.eql([
        {
          message: 'Element of type <zeebe:CalledDecision> must have property <decisionId>',
          path: [ 'extensionElements', 'values', 0, 'decisionId' ],
          error: {
            type: 'propertyRequired',
            requiredProperty: 'decisionId'
          }
        },
        {
          message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
          path: [ 'extensionElements', 'values', 1, 'type' ],
          error: {
            type: 'propertyRequired',
            requiredProperty: 'type'
          }
        }
      ]);
    });

  });


  describe('#hasLoopCharacteristicsOfTypeOrNone', function() {

    it('should not return error', function() {

      // given
      const zeebeLoopCharacteristics = createElement('zeebe:LoopCharacteristics');

      const extensionElements = createElement('bpmn:ExtensionElements', {
        values: [ zeebeLoopCharacteristics ]
      });

      const loopCharacteristics = createElement('bpmn:MultiInstanceLoopCharacteristics', {
        extensionElements
      });

      const node = createElement('bpmn:ServiceTask', {
        loopCharacteristics
      });

      // when
      const result = hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')(node);

      // then
      expect(result).to.be.true;
    });


    it('should not return error', function() {

      // given
      const node = createElement('bpmn:ServiceTask');

      // when
      const result = hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')(node);

      // then
      expect(result).to.be.true;
    });


    it('should return error', function() {

      // given
      const node = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:StandardLoopCharacteristics')
      });

      // when
      const result = hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')(node);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:ServiceTask> (<bpmn:StandardLoopCharacteristics>) not supported by {{ executionPlatform }} {{ executionPlatformVersion }}',
        path: [
          'loopCharacteristics'
        ],
        error: {
          type: 'elementType',
          elementType: 'bpmn:ServiceTask',
          propertyType: 'bpmn:StandardLoopCharacteristics'
        }
      });
    });

  });


  describe('#hasMultiInstanceLoopCharacteristics', function() {

    it('should not return error', function() {

      // given
      const node = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics')
      });

      // when
      const result = hasMultiInstanceLoopCharacteristics(node);

      // then
      expect(result).to.be.true;
    });


    it('should return error', function() {

      // given
      const node = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:StandardLoopCharacteristics')
      });

      // when
      const result = hasMultiInstanceLoopCharacteristics(node);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:ServiceTask> must have property <loopCharacteristics> of type <bpmn:MultiInstanceLoopCharacteristics>',
        path: [ 'loopCharacteristics' ],
        error: {
          type: ERROR_TYPES.PROPERTY_TYPE,
          propertyType: 'bpmn:MultiInstanceLoopCharacteristics'
        }
      });
    });

  });


  describe('#hasNoEventDefinition', function() {

    it('should not return error', function() {

      // given
      const node = createElement('bpmn:StartEvent');

      // when
      const result = hasNoEventDefinition(node);

      // then
      expect(result).to.be.true;
    });


    it('should return error', function() {

      // given
      const node = createElement('bpmn:StartEvent', {
        eventDefinitions: [ createElement('bpmn:ErrorEventDefinition') ]
      });

      // when
      const result = hasNoEventDefinition(node);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:StartEvent> (<bpmn:ErrorEventDefinition>) not supported by {{ executionPlatform }} {{ executionPlatformVersion }}',
        path: [
          'eventDefinitions',
          0
        ],
        error: {
          type: 'elementType',
          elementType: 'bpmn:StartEvent',
          propertyType: 'bpmn:ErrorEventDefinition'
        }
      });
    });

  });


  describe('#hasNoLanes', function() {

    it('should not return error', function() {

      // given
      const node = createElement('bpmn:Process');

      // when
      const result = hasNoLanes(node);

      // then
      expect(result).to.be.true;
    });


    it('should return error', function() {

      // given
      const node = createElement('bpmn:Process', {
        laneSets: [
          createElement('bpmn:LaneSet', {
            lanes: [
              createElement('bpmn:Lane'),
              createElement('bpmn:Lane')
            ]
          })
        ]
      });

      // when
      const result = hasNoLanes(node);

      // then
      expect(result).to.eql({
        message: 'Element of type <bpmn:Process> (<bpmn:LaneSet>) not supported by {{ executionPlatform }} {{ executionPlatformVersion }}',
        path: [
          'laneSets'
        ],
        error: {
          type: 'elementType',
          elementType: 'bpmn:Process',
          propertyType: 'bpmn:LaneSet'
        }
      });
    });

  });


  describe('withTranslations', function() {

    it('should translate (string)', function() {

      // given
      const check = withTranslations(() => 'foo', {
        'foo': 'bar'
      });

      // when
      const results = check();

      // then
      expect(results).to.eql('bar');
    });


    it('should translate (object)', function() {

      // given
      const check = withTranslations(() => ({
        message: 'foo'
      }), {
        'foo': 'bar'
      });

      // when
      const results = check();

      // then
      expect(results).to.eql({ message: 'bar' });
    });


    it('should translate (string[])', function() {

      // given
      const check = withTranslations(() => [
        'foo',
        'bar'
      ], {
        'foo': 'baz'
      });

      // when
      const results = check();

      // then
      expect(results).to.eql([
        'baz',
        'bar'
      ]);
    });


    it('should translate (object[])', function() {

      // given
      const check = withTranslations(() => [
        { message: 'foo' },
        { message: 'bar' }
      ], {
        'foo': 'baz'
      });

      // when
      const results = check();

      // then
      expect(results).to.eql([
        { message: 'baz' },
        { message: 'bar' }
      ]);
    });

  });

});