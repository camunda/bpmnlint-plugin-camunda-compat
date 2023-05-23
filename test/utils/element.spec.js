const { expect } = require('chai');

const {
  ERROR_TYPES,
  formatNames,
  hasDuplicatedPropertyValues,
  hasExpression,
  hasExtensionElement,
  hasNoExtensionElement,
  hasProperties,
  hasProperty,
  isAnyExactly,
  isExactly
} = require('../../rules/utils/element');

const { createElement } = require('../helper');

describe('utils/element', function() {

  describe('#formatNames', function() {

    it('one', function() {

      // given
      const types = [ 'foo' ];

      // then
      expect(formatNames(types)).to.eql('<foo>');
    });


    it('two (inclusive)', function() {

      // given
      const types = [ 'foo', 'bar' ];

      // then
      expect(formatNames(types)).to.eql('<foo> and <bar>');
    });


    it('two (exclusive)', function() {

      // given
      const types = [ 'foo', 'bar' ];

      // then
      expect(formatNames(types, true)).to.eql('<foo> or <bar>');
    });


    it('three', function() {

      // given
      const types = [ 'foo', 'bar', 'baz' ];

      // then
      expect(formatNames(types)).to.eql('<foo>, <bar> and <baz>');
    });

  });


  describe('#hasExtensionElement', function() {

    describe('one type', function() {

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
        const errors = hasExtensionElement(serviceTask, 'zeebe:TaskDefinition');

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
        const errors = hasExtensionElement(serviceTask, 'zeebe:TaskDefinition');

        // then
        expect(errors).to.eql([
          {
            message: 'Element of type <bpmn:ServiceTask> must have one extension element of type <zeebe:TaskDefinition>',
            path: null,
            data: {
              type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
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
        const errors = hasExtensionElement(serviceTask, 'zeebe:TaskDefinition');

        // then
        expect(errors).to.eql([
          {
            message: 'Element of type <bpmn:ServiceTask> must have one extension element of type <zeebe:TaskDefinition>',
            path: null,
            data: {
              type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
              node: serviceTask,
              parentNode: null,
              requiredExtensionElement: 'zeebe:TaskDefinition'
            }
          }
        ]);
      });

    });


    describe('many types', function() {

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
        const errors = hasExtensionElement(businessRuleTask, [
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
        const errors = hasExtensionElement(businessRuleTask, [
          'zeebe:CalledDecision',
          'zeebe:TaskDefinition'
        ]);

        // then
        expect(errors).to.eql([
          {
            message: 'Element of type <bpmn:BusinessRuleTask> must have one extension element of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
            path: null,
            data: {
              type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
              node: businessRuleTask,
              parentNode: null,
              requiredExtensionElement: [
                'zeebe:CalledDecision',
                'zeebe:TaskDefinition'
              ]
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
        const result = hasExtensionElement(businessRuleTask, [
          'zeebe:CalledDecision',
          'zeebe:TaskDefinition'
        ]);

        // then
        expect(result).to.eql([
          {
            message: 'Element of type <bpmn:BusinessRuleTask> must have one extension element of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
            path: null,
            data: {
              type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
              node: businessRuleTask,
              parentNode: null,
              requiredExtensionElement: [
                'zeebe:CalledDecision',
                'zeebe:TaskDefinition'
              ]
            }
          }
        ]);
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
        const errors = hasExtensionElement(businessRuleTask, [
          'zeebe:CalledDecision',
          'zeebe:TaskDefinition'
        ], null);

        // then
        expect(errors).to.eql([
          {
            message: 'Element of type <bpmn:BusinessRuleTask> must have one extension element of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
            path: null,
            data: {
              type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
              node: businessRuleTask,
              parentNode: null,
              requiredExtensionElement: [
                'zeebe:CalledDecision',
                'zeebe:TaskDefinition'
              ]
            }
          }
        ]);
      });

    });

  });


  describe('#hasNoExtensionElement', function() {

    it('should not return errors', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask');

      // when
      const errors = hasNoExtensionElement(serviceTask, 'zeebe:Property');

      // then
      expect(errors).to.be.empty;
    });


    it('should return errors', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:Properties', {
              properties: [
                createElement('zeebe:Property')
              ]
            })
          ]
        })
      });

      // when
      const errors = hasNoExtensionElement(serviceTask, 'zeebe:Properties');

      // then
      expect(errors).to.eql([
        {
          message: 'Extension element of type <zeebe:Properties> not allowed',
          path: null,
          data: {
            type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
            node: serviceTask,
            parentNode: null,
            extensionElement: serviceTask.get('extensionElements').get('values')[ 0 ]
          }
        }
      ]);
    });

  });


  describe('#hasDuplicatedPropertyValues', function() {

    it('should not return errors', function() {

      // given
      const taskHeaders = createElement('zeebe:TaskHeaders', {
        values: [
          createElement('zeebe:Header', {
            key: 'foo'
          }),
          createElement('zeebe:Header', {
            key: 'bar'
          }),
          createElement('zeebe:Header', {
            key: 'baz'
          })
        ]
      });

      // when
      const errors = hasDuplicatedPropertyValues(taskHeaders, 'values', 'key');

      // then
      expect(errors).to.be.empty;
    });


    it('should return error', function() {

      // given
      const taskHeaders = createElement('zeebe:TaskHeaders', {
        values: [
          createElement('zeebe:Header', {
            key: 'foo'
          }),
          createElement('zeebe:Header', {
            key: 'foo'
          }),
          createElement('zeebe:Header', {
            key: 'bar'
          }),
          createElement('zeebe:Header', {
            key: 'baz'
          })
        ]
      });

      // when
      const errors = hasDuplicatedPropertyValues(taskHeaders, 'values', 'key');

      // then
      expect(errors).to.exist;
      expect(errors).to.have.length(1);

      expect(errors[ 0 ]).eql({
        message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <foo>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: taskHeaders,
          parentNode: null,
          duplicatedProperty: 'key',
          duplicatedPropertyValue: 'foo',
          properties: taskHeaders.get('values').filter(header => header.get('key') === 'foo'),
          propertiesName: 'values'
        }
      });
    });


    it('should return errors', function() {

      // given
      const taskHeaders = createElement('zeebe:TaskHeaders', {
        values: [
          createElement('zeebe:Header', {
            key: 'foo'
          }),
          createElement('zeebe:Header', {
            key: 'foo'
          }),
          createElement('zeebe:Header', {
            key: 'bar'
          }),
          createElement('zeebe:Header', {
            key: 'bar'
          }),
          createElement('zeebe:Header', {
            key: 'baz'
          })
        ]
      });

      // when
      const errors = hasDuplicatedPropertyValues(taskHeaders, 'values', 'key');

      // then
      expect(errors).to.exist;
      expect(errors).to.have.length(2);

      expect(errors[ 0 ]).eql({
        message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <foo>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: taskHeaders,
          parentNode: null,
          duplicatedProperty: 'key',
          duplicatedPropertyValue: 'foo',
          properties: taskHeaders.get('values').filter(header => header.get('key') === 'foo'),
          propertiesName: 'values'
        }
      });

      expect(errors[ 1 ]).eql({
        message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <bar>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: taskHeaders,
          parentNode: null,
          duplicatedProperty: 'key',
          duplicatedPropertyValue: 'bar',
          properties: taskHeaders.get('values').filter(header => header.get('key') === 'bar'),
          propertiesName: 'values'
        }
      });
    });

  });


  describe('#hasProperty', function() {

    it('should not return errors (single property)', function() {

      // given
      const timerEventDefition = createElement('bpmn:TimerEventDefinition', {
        timeCycle: createElement('bpmn:FormalExpression', {})
      });

      // when
      const errors = hasProperty(timerEventDefition, 'timeCycle');

      // then
      expect(errors).to.be.empty;
    });


    it('should not return errors (one property array)', function() {

      // given
      const timerEventDefition = createElement('bpmn:TimerEventDefinition', {
        timeCycle: createElement('bpmn:FormalExpression', {})
      });

      // when
      const errors = hasProperty(timerEventDefition, [ 'timeCycle' ]);

      // then
      expect(errors).to.be.empty;
    });


    it('should not return errors (more properties array)', function() {

      // given
      const timerEventDefition = createElement('bpmn:TimerEventDefinition', {
        timeCycle: createElement('bpmn:FormalExpression', {})
      });

      // when
      const errors = hasProperty(timerEventDefition, [ 'timeCycle', 'timeDuration' ]);

      // then
      expect(errors).to.be.empty;
    });


    it('should return errors (no properties set)', function() {

      // given
      const timerEventDefition = createElement('bpmn:TimerEventDefinition', {});

      // when
      const errors = hasProperty(timerEventDefition, [ 'timeCycle', 'timeDuration' ]);

      // then
      expect(errors).to.eql([
        {
          message: 'Element of type <bpmn:TimerEventDefinition> must have property <timeCycle> or <timeDuration>',
          path: null,
          data: {
            type: ERROR_TYPES.PROPERTY_REQUIRED,
            node: timerEventDefition,
            parentNode: null,
            requiredProperty: [
              'timeCycle',
              'timeDuration'
            ]
          }
        }
      ]);
    });


    it('should return errors (both properties set)', function() {

      // given
      const timerEventDefition = createElement('bpmn:TimerEventDefinition', {
        timeCycle: createElement('bpmn:FormalExpression', {}),
        timeDuration: createElement('bpmn:FormalExpression', {})
      });

      // when
      const errors = hasProperty(timerEventDefition, [ 'timeCycle', 'timeDuration' ]);

      // then
      expect(errors).to.eql([
        {
          message: 'Element of type <bpmn:TimerEventDefinition> must have property <timeCycle> or <timeDuration>',
          path: null,
          data: {
            type: ERROR_TYPES.PROPERTY_REQUIRED,
            node: timerEventDefition,
            parentNode: null,
            requiredProperty: [
              'timeCycle',
              'timeDuration'
            ]
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
            data: {
              type: ERROR_TYPES.PROPERTY_REQUIRED,
              node: taskDefinition,
              parentNode: null,
              requiredProperty: 'type'
            }
          }
        ]);
      });

    });


    describe('dependent required', function() {

      it('should not return errors', function() {

        // given
        const loopCharacteristics = createElement('zeebe:LoopCharacteristics', {
          outputCollection: 'foo',
          outputElement: 'bar'
        });

        // when
        const errors = hasProperties(loopCharacteristics, {
          outputElement: {
            dependentRequired: 'outputCollection'
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
            dependentRequired: 'outputCollection'
          }
        });

        // then
        expect(errors).eql([
          {
            message: 'Element of type <zeebe:LoopCharacteristics> must have property <outputElement> if it has property <outputCollection>',
            path: [
              'outputElement'
            ],
            data: {
              type: ERROR_TYPES.PROPERTY_DEPENDENT_REQUIRED,
              node: loopCharacteristics,
              parentNode: null,
              property: 'outputCollection',
              dependentRequiredProperty: 'outputElement'
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
            data: {
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

      describe('boolean', function() {

        it('should not return errors (undefined)', function() {

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


        it('should not return errors (null)', function() {

          // given
          const serviceTask = createElement('bpmn:ServiceTask', {
            modelerTemplate: null
          });

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
              data: {
                type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
                node: serviceTask,
                parentNode: null,
                property: 'modelerTemplate'
              }
            }
          ]);
        });

      });


      describe('function', function() {

        it('should not return errors (() => true)', function() {

          // given
          const serviceTask = createElement('bpmn:ServiceTask', {
            modelerTemplate: null
          });

          // when
          const errors = hasProperties(serviceTask, {
            modelerTemplate: {
              allowed: () => true
            }
          });

          // then
          expect(errors).to.be.empty;
        });


        it('should return errors (() => false)', function() {

          // given
          const serviceTask = createElement('bpmn:ServiceTask', {
            modelerTemplate: null
          });

          // when
          const errors = hasProperties(serviceTask, {
            modelerTemplate: {
              allowed: () => false
            }
          });

          // then
          expect(errors).eql([
            {
              message: 'Property value of <null> not allowed',
              path: [
                'modelerTemplate'
              ],
              data: {
                type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
                node: serviceTask,
                parentNode: null,
                property: 'modelerTemplate'
              }
            }
          ]);
        });


        it('should truncate', function() {

          // given
          const serviceTask = createElement('bpmn:ServiceTask', {
            modelerTemplate: 'fooBarBazFooBarBazFooBarBaz'
          });

          // when
          const errors = hasProperties(serviceTask, {
            modelerTemplate: {
              allowed: () => false
            }
          });

          // then
          expect(errors).eql([
            {
              message: 'Property value of <fooBarBazF...> not allowed',
              path: [
                'modelerTemplate'
              ],
              data: {
                type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
                node: serviceTask,
                parentNode: null,
                property: 'modelerTemplate'
              }
            }
          ]);
        });

      });


    });

  });


  describe('#hasExpression', function() {

    it('should not return errors (required)', function() {

      // given
      const timerEventDefinition = createElement('bpmn:TimerEventDefinition', {
        timeCycle: createElement('bpmn:FormalExpression', {
          body: 'R/P1D'
        })
      });

      // when
      const errors = hasExpression(timerEventDefinition, 'timeCycle', {
        allowed: () => true
      });

      // then
      expect(errors).to.be.empty;
    });


    it('should not return errors (not required)', function() {

      // given
      const timerEventDefinition = createElement('bpmn:TimerEventDefinition', {
        timeCycle: createElement('bpmn:FormalExpression')
      });

      // when
      const errors = hasExpression(timerEventDefinition, 'timeCycle', {
        allowed: () => true,
        required: false
      });

      // then
      expect(errors).to.be.empty;
    });


    it('should throw (no expression)', function() {

      // given
      const endEvent = createElement('bpmn:EndEvent', {
        eventDefinitions: [
          createElement('bpmn:TimerEventDefinition')
        ]
      });

      // when
      // then
      expect(() => hasExpression(endEvent.get('eventDefinitions')[ 0 ], 'timeCycle', {
        allowed: () => true
      }, endEvent)).to.throw('Expression not found');
    });


    it('should return errors (no body)', function() {

      // given
      const endEvent = createElement('bpmn:EndEvent', {
        eventDefinitions: [
          createElement('bpmn:TimerEventDefinition', {
            timeCycle: createElement('bpmn:FormalExpression')
          })
        ]
      });

      // when
      const errors = hasExpression(endEvent.get('eventDefinitions')[ 0 ], 'timeCycle', {
        allowed: () => true
      }, endEvent);

      // then
      expect(errors).to.eql([
        {
          message: 'Property <timeCycle> must have expression value',
          path: [
            'eventDefinitions',
            0,
            'timeCycle'
          ],
          data: {
            type: ERROR_TYPES.EXPRESSION_REQUIRED,
            node: endEvent.get('eventDefinitions')[ 0 ].get('timeCycle'),
            parentNode: endEvent,
            property: 'timeCycle'
          }
        }
      ]);
    });


    it('should return errors (invalid)', function() {

      // given
      const endEvent = createElement('bpmn:EndEvent', {
        eventDefinitions: [
          createElement('bpmn:TimerEventDefinition', {
            timeCycle: createElement('bpmn:FormalExpression', {
              body: 'foo'
            })
          })
        ]
      });

      // when
      const errors = hasExpression(endEvent.get('eventDefinitions')[ 0 ], 'timeCycle', {
        allowed: () => false
      }, endEvent);

      // then
      expect(errors).to.eql([
        {
          message: 'Expression value of <foo> not allowed',
          path: [
            'eventDefinitions',
            0,
            'timeCycle'
          ],
          data: {
            type: ERROR_TYPES.EXPRESSION_VALUE_NOT_ALLOWED,
            node: endEvent.get('eventDefinitions')[ 0 ].get('timeCycle'),
            parentNode: endEvent,
            property: 'timeCycle'
          }
        }
      ]);
    });


    it('should return allowed version (invalid)', function() {

      // given
      const endEvent = createElement('bpmn:EndEvent', {
        eventDefinitions: [
          createElement('bpmn:TimerEventDefinition', {
            timeCycle: createElement('bpmn:FormalExpression', {
              body: 'foo'
            })
          })
        ]
      });

      // when
      const errors = hasExpression(endEvent.get('eventDefinitions')[ 0 ], 'timeCycle', {
        allowed: () => {
          return {
            allowedVersion: '1.0'
          };
        }
      }, endEvent);

      // then
      expect(errors).to.eql([
        {
          message: 'Expression value of <foo> only allowed by Camunda Platform 1.0',
          path: [
            'eventDefinitions',
            0,
            'timeCycle'
          ],
          data: {
            type: ERROR_TYPES.EXPRESSION_VALUE_NOT_ALLOWED,
            node: endEvent.get('eventDefinitions')[ 0 ].get('timeCycle'),
            parentNode: endEvent,
            property: 'timeCycle',
            allowedVersion: '1.0'
          }
        }
      ]);
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