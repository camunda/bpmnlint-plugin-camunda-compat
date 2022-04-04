const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const camundaCloud11Rule = require('../../rules/camunda-cloud-1-1');

const { createModdle } = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const { createValid: createCamundaCloud10Valid } = require('./camunda-cloud-1-0.spec');

function createValid(executionPlatformVersion = '1.1.0') {
  const createCloudProcess = require('../helper').createCloudProcess(executionPlatformVersion);

  return [
    ...createCamundaCloud10Valid('1.1.0'),

    // bpmn:BusinessRuleTask
    {
      name: 'business rule task',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `))
    },
    {
      name: 'business rule task (multi-instance)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:multiInstanceLoopCharacteristics >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `))
    },
    {
      name: 'business rule task (multi-instance sequential)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:multiInstanceLoopCharacteristics isSequential="true" >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `))
    },

    // bpmn:IntermediateThrowEvent
    {
      name: 'intermediate throw event',
      moddleElement: createModdle(createCloudProcess('<bpmn:intermediateThrowEvent id="IntermediateThrowEvent_1" />'))
    },

    // bpmn:ManualTask
    {
      name: 'manual task',
      moddleElement: createModdle(createCloudProcess('<bpmn:manualTask id="ManualTask_1" />'))
    },
    {
      name: 'manual task (multi-instance)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:manualTask id="ManualTask_1">
          <bpmn:multiInstanceLoopCharacteristics >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
        </bpmn:manualTask>
      `))
    },
    {
      name: 'manual task (multi-instance sequential)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:manualTask id="ManualTask_1">
          <bpmn:multiInstanceLoopCharacteristics isSequential="true" >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
        </bpmn:manualTask>
      `))
    },

    // bpmn:ScriptTask
    {
      name: 'script task',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:scriptTask id="ScriptTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:scriptTask>
      `))
    },
    {
      name: 'script task (multi-instance)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:scriptTask id="ScriptTask_1">
          <bpmn:multiInstanceLoopCharacteristics >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:scriptTask>
      `))
    },
    {
      name: 'script task (multi-instance sequential)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:scriptTask id="ScriptTask_1">
          <bpmn:multiInstanceLoopCharacteristics isSequential="true" >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:scriptTask>
      `))
    },

    // bpmn:SendTask
    {
      name: 'send task',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:sendTask id="SendTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:sendTask>
      `))
    },
    {
      name: 'send task (multi-instance)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:sendTask id="SendTask_1">
          <bpmn:multiInstanceLoopCharacteristics >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:sendTask>
      `))
    },
    {
      name: 'send task (multi-instance sequential)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:sendTask id="SendTask_1">
          <bpmn:multiInstanceLoopCharacteristics isSequential="true" >
            <bpmn:extensionElements>
              <zeebe:loopCharacteristics inputCollection="foo" />
            </bpmn:extensionElements>
          </bpmn:multiInstanceLoopCharacteristics>
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:sendTask>
      `))
    }
  ];
}

module.exports.createValid = createValid;

function createInvalid(executionPlatformVersion = '1.1.0') {
  const createCloudProcess = require('../helper').createCloudProcess(executionPlatformVersion);

  return [

    // bpmn:BusinessRuleTask
    {
      name: 'business rule task (no task definition)',
      moddleElement: createModdle(createCloudProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />')),
      report: {
        id: 'BusinessRuleTask_1',
        message: 'A <Business Rule Task> must have a <Task definition type>',
        path: null,
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:TaskDefinition'
        }
      }
    },
    {
      name: 'business rule task (no task definition type)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `)),
      report: {
        id: 'BusinessRuleTask_1',
        message: 'A <Business Rule Task> must have a <Task definition type>',
        path: [
          'extensionElements',
          'values',
          0,
          'type'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'type'
        }
      }
    },
    {
      name: 'business rule task (no loop characteristics)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:multiInstanceLoopCharacteristics />
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `)),
      report: {
        id: 'BusinessRuleTask_1',
        message: 'A <Business Rule Task> with <Multi-instance marker> must have a defined <Input collection>',
        path: [
          'loopCharacteristics'
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:LoopCharacteristics'
        }
      }
    },

    // bpmn:IntermediateThrowEvent
    {
      name: 'message intermediate throw event',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:intermediateThrowEvent id="IntermediateThrowEvent_1">
          <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        </bpmn:intermediateThrowEvent>
      `)),
      report: {
        id: 'IntermediateThrowEvent_1',
        message: 'A <Message Intermediate Throw Event> is not supported by Zeebe 1.1',
        path: [
          'eventDefinitions',
          0
        ],
        error: {
          type: 'elementType',
          elementType: 'bpmn:IntermediateThrowEvent',
          propertyType: 'bpmn:MessageEventDefinition'
        }
      }
    },

    // bpmn:ManualTask
    {
      name: 'manual task (no loop characteristics)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:manualTask id="ManualTask_1">
          <bpmn:multiInstanceLoopCharacteristics />
        </bpmn:manualTask>
      `)),
      report: {
        id: 'ManualTask_1',
        message: 'A <Manual Task> with <Multi-instance marker> must have a defined <Input collection>',
        path: [
          'loopCharacteristics'
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:LoopCharacteristics'
        }
      }
    },

    // bpmn:ScriptTask
    {
      name: 'script task (no task definition)',
      moddleElement: createModdle(createCloudProcess('<bpmn:scriptTask id="ScriptTask_1" />')),
      report: {
        id: 'ScriptTask_1',
        message: 'A <Script Task> must have a <Task definition type>',
        path: null,
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:TaskDefinition'
        }
      }
    },
    {
      name: 'script task (no task definition type)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:scriptTask id="ScriptTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition />
          </bpmn:extensionElements>
        </bpmn:scriptTask>
      `)),
      report: {
        id: 'ScriptTask_1',
        message: 'A <Script Task> must have a <Task definition type>',
        path: [
          'extensionElements',
          'values',
          0,
          'type'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'type'
        }
      }
    },
    {
      name: 'script task (no loop characteristics)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:scriptTask id="ScriptTask_1">
          <bpmn:multiInstanceLoopCharacteristics />
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:scriptTask>
      `)),
      report: {
        id: 'ScriptTask_1',
        message: 'A <Script Task> with <Multi-instance marker> must have a defined <Input collection>',
        path: [
          'loopCharacteristics'
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:LoopCharacteristics'
        }
      }
    },

    // bpmn:SendTask
    {
      name: 'send task (no task definition)',
      moddleElement: createModdle(createCloudProcess('<bpmn:sendTask id="SendTask_1" />')),
      report: {
        id: 'SendTask_1',
        message: 'A <Send Task> must have a <Task definition type>',
        path: null,
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:TaskDefinition'
        }
      }
    },
    {
      name: 'send task (no task definition type)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:sendTask id="SendTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition />
          </bpmn:extensionElements>
        </bpmn:sendTask>
      `)),
      report: {
        id: 'SendTask_1',
        message: 'A <Send Task> must have a <Task definition type>',
        path: [
          'extensionElements',
          'values',
          0,
          'type'
        ],
        error: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          requiredProperty: 'type'
        }
      }
    },
    {
      name: 'send task (no loop characteristics)',
      moddleElement: createModdle(createCloudProcess(`
        <bpmn:sendTask id="SendTask_1">
          <bpmn:multiInstanceLoopCharacteristics />
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="foo" />
          </bpmn:extensionElements>
        </bpmn:sendTask>
      `)),
      report: {
        id: 'SendTask_1',
        message: 'A <Send Task> with <Multi-instance marker> must have a defined <Input collection>',
        path: [
          'loopCharacteristics'
        ],
        error: {
          type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
          requiredExtensionElement: 'zeebe:LoopCharacteristics'
        }
      }
    }
  ];
}

RuleTester.verify('camunda-cloud-1-1', camundaCloud11Rule, {
  valid: createValid(),
  invalid: createInvalid()
});