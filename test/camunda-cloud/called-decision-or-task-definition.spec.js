const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/called-decision-or-task-definition');

const calledDecisionOrTaskDefinitionConfig = require('../../rules/called-decision-or-task-definition/config');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/error-types');

const valid = [
  {
    name: 'service task (Camunda Cloud 1.0)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud10,
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'task (Camunda Cloud 1.0)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud10,
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  },
  {
    name: 'business rule task (Camunda Cloud 1.1)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud11,
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  },
  {
    name: 'task (Camunda Cloud 1.1)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud11,
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  },
  {
    name: 'intermediate throw event (Camunda Cloud 1.2)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud12,
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateThrowEvent id="IntermediateThrowEvent_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
        </bpmn:extensionElements>
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
      </bpmn:intermediateThrowEvent>
    `))
  },
  {
    name: 'task (Camunda Cloud 1.2)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud12,
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  },
  {
    name: 'service task (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'task (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  },
  {
    name: 'business rule task (called decision) (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision decisionId="foo" resultVariable="bar" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  },
  {
    name: 'business rule task (task definition) (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  }
];

const invalid = [
  {
    name: 'service task (no task definition) (Camunda Cloud 1.0)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud10,
    moddleElement: createModdle(createProcess('<bpmn:serviceTask id="ServiceTask_1" />')),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <bpmn:ServiceTask> must have extension element of type <zeebe:TaskDefinition>',
      path: [],
      error: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'ServiceTask_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:TaskDefinition'
      }
    }
  },
  {
    name: 'service task (no task definition type) (Camunda Cloud 1.0)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud10,
    moddleElement: createModdle(createProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
      path: [
        'extensionElements',
        'values',
        0,
        'type'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:TaskDefinition',
        parentNode: 'ServiceTask_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'business rule task (no task definition) (Camunda Cloud 1.1)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud11,
    moddleElement: createModdle(createProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />')),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <bpmn:BusinessRuleTask> must have extension element of type <zeebe:TaskDefinition>',
      path: [],
      error: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'BusinessRuleTask_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:TaskDefinition'
      }
    }
  },
  {
    name: 'business rule task (no task definition type) (Camunda Cloud 1.1)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud11,
    moddleElement: createModdle(createProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
      path: [
        'extensionElements',
        'values',
        0,
        'type'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:TaskDefinition',
        parentNode: 'BusinessRuleTask_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'business rule task (called decision) (Camunda Cloud 1.1)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud11,
    moddleElement: createModdle(createProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:extensionElements>
            <zeebe:calledDecision />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Extension element of type <zeebe:CalledDecision> not allowed',
      path: [
        'extensionElements',
        'values',
        0
      ],
      error: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
        node: 'BusinessRuleTask_1',
        parentNode: null,
        extensionElement: 'zeebe:CalledDecision'
      }
    }
  },
  {
    name: 'intermediate throw event (no task definition) (Camunda Cloud 1.2)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud12,
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateThrowEvent id="IntermediateThrowEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
      </bpmn:intermediateThrowEvent>
    `)),
    report: {
      id: 'IntermediateThrowEvent_1',
      message: 'Element of type <bpmn:IntermediateThrowEvent> must have extension element of type <zeebe:TaskDefinition>',
      path: [],
      error: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'IntermediateThrowEvent_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:TaskDefinition'
      }
    }
  },
  {
    name: 'intermediate throw event (no task definition type) (Camunda Cloud 1.2)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud12,
    moddleElement: createModdle(createProcess(`
        <bpmn:intermediateThrowEvent id="IntermediateThrowEvent_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition />
          </bpmn:extensionElements>
          <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        </bpmn:intermediateThrowEvent>
      `)),
    report: {
      id: 'IntermediateThrowEvent_1',
      message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
      path: [
        'extensionElements',
        'values',
        0,
        'type'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:TaskDefinition',
        parentNode: 'IntermediateThrowEvent_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'service task (no task definition) (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess('<bpmn:serviceTask id="ServiceTask_1" />')),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <bpmn:ServiceTask> must have extension element of type <zeebe:TaskDefinition>',
      path: [],
      error: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'ServiceTask_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:TaskDefinition'
      }
    }
  },
  {
    name: 'service task (no task definition type) (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess(`
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition />
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
      path: [
        'extensionElements',
        'values',
        0,
        'type'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:TaskDefinition',
        parentNode: 'ServiceTask_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'business rule task (no called decision or task definition) (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />')),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <bpmn:BusinessRuleTask> must have one extension element of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
      path: [],
      error: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'BusinessRuleTask_1',
        parentNode: null,
        requiredExtensionElement: [
          'zeebe:CalledDecision',
          'zeebe:TaskDefinition'
        ],
        exclusive: true
      }
    }
  },
  {
    name: 'business rule task (called decision and task definition) (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision />
          <zeebe:taskDefinition />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <bpmn:BusinessRuleTask> must have one extension element of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
      path: [],
      error: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'BusinessRuleTask_1',
        parentNode: null,
        requiredExtensionElement: [
          'zeebe:CalledDecision',
          'zeebe:TaskDefinition'
        ],
        exclusive: true
      }
    }
  },
  {
    name: 'business rule task (no called decision ID) (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision resultVariable="foo" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <zeebe:CalledDecision> must have property <decisionId>',
      path: [
        'extensionElements',
        'values',
        0,
        'decisionId'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:CalledDecision',
        parentNode: 'BusinessRuleTask_1',
        requiredProperty: 'decisionId'
      }
    }
  },
  {
    name: 'business rule task (no called decision result variable) (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision decisionId="foo" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <zeebe:CalledDecision> must have property <resultVariable>',
      path: [
        'extensionElements',
        'values',
        0,
        'resultVariable'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:CalledDecision',
        parentNode: 'BusinessRuleTask_1',
        requiredProperty: 'resultVariable'
      }
    }
  },
  {
    name: 'business rule task (no task definition type) (Camunda Cloud 1.3)',
    config: calledDecisionOrTaskDefinitionConfig.camundaCloud13,
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <zeebe:TaskDefinition> must have property <type>',
      path: [
        'extensionElements',
        'values',
        0,
        'type'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:TaskDefinition',
        parentNode: 'BusinessRuleTask_1',
        requiredProperty: 'type'
      }
    }
  }
];

RuleTester.verify('called-decision-or-task-definition', rule, {
  valid,
  invalid
});