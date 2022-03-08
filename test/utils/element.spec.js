const { expect } = require('chai');

const {
  hasEventDefinitionOfType,
  hasLoopCharacteristicsOfTypeOrNone,
  hasNoEventDefinition,
  hasNoLanes,
  hasEventDefinitionOfTypeOrNone
} = require('../../rules/utils/element');

const { createElement } = require('../helper');

describe('util - element', function() {

  describe('#hasEventDefinitionOfType', function() {

    it('should return true', function() {

      // given
      const node = createElement('bpmn:StartEvent', {
        eventDefinitions: [ createElement('bpmn:ErrorEventDefinition') ]
      });

      // when
      const result = hasEventDefinitionOfType('bpmn:ErrorEventDefinition')(node);

      // then
      expect(result).to.be.true;
    });


    it('should return string', function() {

      // given
      const node = createElement('bpmn:StartEvent', {
        eventDefinitions: [ createElement('bpmn:ErrorEventDefinition') ]
      });

      // when
      const result = hasEventDefinitionOfType('bpmn:MessageEventDefinition')(node);

      // then
      expect(result).to.equal('Element of type <bpmn:StartEvent (bpmn:ErrorEventDefinition)> not supported by {{ executionPlatform }} {{ executionPlatformVersion }}');
    });

  });


  describe('#hasEventDefinitionOfTypeOrNone', function() {

    it('should return true', function() {

      // given
      const node = createElement('bpmn:StartEvent', {
        eventDefinitions: [ createElement('bpmn:ErrorEventDefinition') ]
      });

      // when
      const result = hasEventDefinitionOfTypeOrNone('bpmn:ErrorEventDefinition')(node);

      // then
      expect(result).to.be.true;
    });


    it('should return true', function() {

      // given
      const node = createElement('bpmn:StartEvent');

      // when
      const result = hasEventDefinitionOfTypeOrNone('bpmn:ErrorEventDefinition')(node);

      // then
      expect(result).to.be.true;
    });


    it('should return string', function() {

      // given
      const node = createElement('bpmn:StartEvent', {
        eventDefinitions: [ createElement('bpmn:ErrorEventDefinition') ]
      });

      // when
      const result = hasEventDefinitionOfTypeOrNone('bpmn:SignalEventDefinition')(node);

      // then
      expect(result).to.equal('Element of type <bpmn:StartEvent (bpmn:ErrorEventDefinition)> not supported by {{ executionPlatform }} {{ executionPlatformVersion }}');
    });

  });

  describe('#hasLoopCharacteristicsOfTypeOrNone', function() {

    it('should return true', function() {

      // given
      const node = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics')
      });

      // when
      const result = hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')(node);

      // then
      expect(result).to.be.true;
    });


    it('should return true', function() {

      // given
      const node = createElement('bpmn:ServiceTask');

      // when
      const result = hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')(node);

      // then
      expect(result).to.be.true;
    });


    it('should return string', function() {

      // given
      const node = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:StandardLoopCharacteristics')
      });

      // when
      const result = hasLoopCharacteristicsOfTypeOrNone('bpmn:MultiInstanceLoopCharacteristics')(node);

      // then
      expect(result).to.equal('Element of type <bpmn:ServiceTask (bpmn:StandardLoopCharacteristics)> not supported by {{ executionPlatform }} {{ executionPlatformVersion }}');
    });

  });


  describe('#hasNoEventDefinition', function() {

    it('should return true', function() {

      // given
      const node = createElement('bpmn:StartEvent');

      // when
      const result = hasNoEventDefinition(node);

      // then
      expect(result).to.be.true;
    });


    it('should return string', function() {

      // given
      const node = createElement('bpmn:StartEvent', {
        eventDefinitions: [ createElement('bpmn:ErrorEventDefinition') ]
      });

      // when
      const result = hasNoEventDefinition(node);

      // then
      expect(result).to.equal('Element of type <bpmn:StartEvent (bpmn:ErrorEventDefinition)> not supported by {{ executionPlatform }} {{ executionPlatformVersion }}');
    });

  });


  describe('#hasNoLanes', function() {

    it('should return true', function() {

      // given
      const node = createElement('bpmn:Participant');

      // when
      const result = hasNoLanes(node);

      // then
      expect(result).to.be.true;
    });


    it('should return string', function() {

      // given
      const node = createElement('bpmn:Participant', {
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
      expect(result).to.equal('Element of type <bpmn:Participant (bpmn:LaneSet)> not supported by {{ executionPlatform }} {{ executionPlatformVersion }}');
    });

  });

});