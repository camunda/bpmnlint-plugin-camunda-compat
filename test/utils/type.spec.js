const { expect } = require('chai');

const { getTypeString } = require('../../rules/utils/type');

const { createElement } = require('../helper');

describe('util - type', function() {

  describe('#getTypeString', function() {

    it('association', function() {

      // given
      const association = createElement('bpmn:Association');

      // when
      const typeString = getTypeString(association);

      // then
      expect(typeString).to.equal('Association');
    });


    it('service task', function() {

      // given
      const serviceTask = createElement('bpmn:ServiceTask');

      // when
      const typeString = getTypeString(serviceTask);

      // then
      expect(typeString).to.equal('Service Task');
    });


    it('sub process', function() {

      // given
      const subProcess = createElement('bpmn:SubProcess');

      // when
      const typeString = getTypeString(subProcess);

      // then
      expect(typeString).to.equal('Sub Process');
    });


    describe('event definitions', function() {

      it('error end event', function() {

        // given
        const endEvent = createElement('bpmn:EndEvent', {
          eventDefinitions: [
            createElement('bpmn:ErrorEventDefinition')
          ]
        });

        // when
        const typeString = getTypeString(endEvent);

        // then
        expect(typeString).to.equal('Error End Event');
      });


      it('message end event', function() {

        // given
        const endEvent = createElement('bpmn:EndEvent', {
          eventDefinitions: [
            createElement('bpmn:MessageEventDefinition')
          ]
        });

        // when
        const typeString = getTypeString(endEvent);

        // then
        expect(typeString).to.equal('Message End Event');
      });

    });


    describe('undefined', function() {

      it('undefined task', function() {

        // given
        const task = createElement('bpmn:Task');

        // when
        const typeString = getTypeString(task);

        // then
        expect(typeString).to.equal('Undefined Task');
      });


      it('undefined start event', function() {

        // given
        const startEvent = createElement('bpmn:StartEvent');

        // when
        const typeString = getTypeString(startEvent);

        // then
        expect(typeString).to.equal('Undefined Start Event');
      });

    });

  });

});