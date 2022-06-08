const { expect } = require('chai');

const {
  ERROR_TYPES,
  formatTypes,
  hasExtensionElementOfType,
  hasExtensionElementsOfTypes,
  hasProperties,
  isAnyExactly,
  isExactly
} = require('../../rules/utils/element');

const { createElement } = require('../helper');

describe('utils/element', function() {

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

      // when
      const errors = hasExtensionElementOfType(serviceTask, 'zeebe:TaskDefinition');

      // then
      expect(errors).to.be.empty;
    });


    it('should return errors (no extension elements)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: []
        })
      });

      // when
      const errors = hasExtensionElementOfType(serviceTask, 'zeebe:TaskDefinition');

      // then
      expect(errors).to.eql([
        {
          message: 'Element of type <bpmn:ServiceTask> must have extension element of type <zeebe:TaskDefinition>',
          path: null,
          error: {
            type: 'extensionElementRequired',
            node: serviceTask,
            parentNode: null,
            requiredExtensionElement: 'zeebe:TaskDefinition'
          }
        }
      ]);
    });


    it('should return errors (no task definition)', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask');

      // when
      const errors = hasExtensionElementOfType(serviceTask, 'zeebe:TaskDefinition');

      // then
      expect(errors).to.eql([
        {
          message: 'Element of type <bpmn:ServiceTask> must have extension element of type <zeebe:TaskDefinition>',
          path: null,
          error: {
            type: 'extensionElementRequired',
            node: serviceTask,
            parentNode: null,
            requiredExtensionElement: 'zeebe:TaskDefinition'
          }
        }
      ]);
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

      // when
      const errors = hasExtensionElementsOfTypes(businessRuleTask, [
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ]);

      // then
      expect(errors).to.be.empty;
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

      // when
      const errors = hasExtensionElementsOfTypes(businessRuleTask, [
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ]);

      // then
      expect(errors).to.be.empty;
    });


    it('should return errors (no extension elements)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask');

      // when
      const errors = hasExtensionElementsOfTypes(businessRuleTask, [
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ]);

      // then
      expect(errors).to.eql([
        {
          message: 'Element of type <bpmn:BusinessRuleTask> must have one or many extension elements of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
          path: null,
          error: {
            type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
            node: businessRuleTask,
            parentNode: null,
            requiredExtensionElement: [
              'zeebe:CalledDecision',
              'zeebe:TaskDefinition'
            ],
            exclusive: false
          }
        }
      ]);
    });


    it('should return errors (no task definition)', function() {

      // given
      const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: []
        })
      });

      // when
      const result = hasExtensionElementsOfTypes(businessRuleTask, [
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ]);

      // then
      expect(result).to.eql([
        {
          message: 'Element of type <bpmn:BusinessRuleTask> must have one or many extension elements of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
          path: null,
          error: {
            type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
            node: businessRuleTask,
            parentNode: null,
            requiredExtensionElement: [
              'zeebe:CalledDecision',
              'zeebe:TaskDefinition'
            ],
            exclusive: false
          }
        }
      ]);
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

      // when
      const errors = hasExtensionElementsOfTypes(businessRuleTask, [
        'zeebe:CalledDecision',
        'zeebe:TaskDefinition'
      ], null, true);

      // then
      expect(errors).to.eql([
        {
          message: 'Element of type <bpmn:BusinessRuleTask> must have one extension element of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
          path: null,
          error: {
            type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
            node: businessRuleTask,
            parentNode: null,
            requiredExtensionElement: [
              'zeebe:CalledDecision',
              'zeebe:TaskDefinition'
            ],
            exclusive: true
          }
        }
      ]);
    });

  });


  describe('#hasProperties', function() {

    describe('required', function() {

      it('should not return errors', function() {

        // given
        const taskDefinition = createElement('zeebe:TaskDefinition', {
          type: 'foo'
        });

        // when
        const errors = hasProperties(taskDefinition, {
          type: {
            required: true
          }
        });

        // then
        expect(errors).to.be.empty;
      });


      it('should return errors', function() {

        // given
        const taskDefinition = createElement('zeebe:TaskDefinition');

        // when
        const errors = hasProperties(taskDefinition, {
          type: {
            required: true
          }
        });

        // then
        expect(errors).eql([
          {
            message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
            path: [
              'type'
            ],
            error: {
              type: ERROR_TYPES.PROPERTY_REQUIRED,
              node: taskDefinition,
              parentNode: null,
              requiredProperty: 'type'
            }
          }
        ]);
      });

    });


    describe('dependend required', function() {

      it('should not return errors', function() {

        // given
        const loopCharacteristics = createElement('zeebe:LoopCharacteristics', {
          outputCollection: 'foo',
          outputElement: 'bar'
        });

        // when
        const errors = hasProperties(loopCharacteristics, {
          outputElement: {
            dependendRequired: 'outputCollection'
          }
        });

        // then
        expect(errors).to.be.empty;
      });


      it('should return errors', function() {

        // given
        const loopCharacteristics = createElement('zeebe:LoopCharacteristics', {
          outputCollection: 'foo'
        });

        // when
        const errors = hasProperties(loopCharacteristics, {
          outputElement: {
            dependendRequired: 'outputCollection'
          }
        });

        // then
        expect(errors).eql([
          {
            message: 'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>',
            path: [
              'outputElement'
            ],
            error: {
              type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
              node: loopCharacteristics,
              parentNode: null,
              property: 'outputCollection',
              dependendRequiredProperty: 'outputElement'
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
        const errors = hasProperties(serviceTask, {
          loopCharacteristics: {
            type: 'bpmn:MultiInstanceLoopCharacteristics'
          }
        });

        // then
        expect(errors).to.be.empty;
      });


      it('should return errors', function() {

        // given
        const serviceTask = createElement('bpmn:ServiceTask', {
          loopCharacteristics: createElement('bpmn:StandardLoopCharacteristics')
        });

        // when
        const errors = hasProperties(serviceTask, {
          loopCharacteristics: {
            type: 'bpmn:MultiInstanceLoopCharacteristics'
          }
        });

        // then
        expect(errors).eql([
          {
            message: 'Property <loopCharacteristics> of type <bpmn:StandardLoopCharacteristics> not allowed',
            path: [
              'loopCharacteristics'
            ],
            error: {
              type: ERROR_TYPES.PROPERTY_TYPE_NOT_ALLOWED,
              node: serviceTask,
              parentNode: null,
              property: 'loopCharacteristics',
              allowedPropertyType: 'bpmn:MultiInstanceLoopCharacteristics'
            }
          }
        ]);
      });

    });


    describe('allowed', function() {

      it('should not return errors', function() {

        // given
        const serviceTask = createElement('bpmn:ServiceTask');

        // when
        const errors = hasProperties(serviceTask, {
          modelerTemplate: {
            allowed: false
          }
        });

        // then
        expect(errors).to.be.empty;
      });


      it('should return errors', function() {

        // given
        const serviceTask = createElement('bpmn:ServiceTask', {
          modelerTemplate: 'foo'
        });

        // when
        const errors = hasProperties(serviceTask, {
          modelerTemplate: {
            allowed: false
          }
        });

        // then
        expect(errors).eql([
          {
            message: 'Property <modelerTemplate> not allowed',
            path: [
              'modelerTemplate'
            ],
            error: {
              type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
              node: serviceTask,
              parentNode: null,
              property: 'modelerTemplate'
            }
          }
        ]);
      });

    });

  });


  describe('#isExactly', function() {

    it('should be true', function() {

      // given
      const task = createElement('bpmn:Task');

      // when
      expect(isExactly(task, 'bpmn:Task')).to.be.true;
    });


    it('should be false', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask');

      // when
      expect(isExactly(serviceTask, 'bpmn:Task')).to.be.false;
    });

  });


  describe('#isAnyExactly', function() {

    it('should be true', function() {

      // given
      const task = createElement('bpmn:Task');

      // when
      expect(isAnyExactly(task, [ 'bpmn:Task', 'bpmn:Gateway' ])).to.be.true;
    });


    it('should be false', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask');

      // when
      expect(isAnyExactly(serviceTask, [ 'bpmn:Task', 'bpmn:Gateway' ])).to.be.false;
    });

  });

});