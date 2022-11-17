const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/called-decision-or-task-definition');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/error-types');

const valid = [
  {
    name: 'service task (Camunda Cloud 1.0)',
    config: { version: '1.0' },
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
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  },
  {
    name: 'intermediate link throw event (Camunda Cloud 1.0)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateThrowEvent id="IntermediateThrowEvent_1">
        <bpmn:linkEventDefinition id="LinkEventDefinition_1kkrq09" name="Foobar" />
      </bpmn:intermediateThrowEvent>
    `))
  },
  {
    name: 'business rule task (Camunda Cloud 1.1)',
    config: { version: '1.1' },
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
    config: { version: '1.1' },
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  },
  {
    name: 'intermediate message throw event (Camunda Cloud 1.2)',
    config: { version: '1.2' },
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
    config: { version: '1.2' },
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  },
  {
    name: 'service task (Camunda Cloud 1.3)',
    config: { version: '1.3' },
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
    config: { version: '1.3' },
    moddleElement: createModdle(createProcess('<bpmn:task id="Task_1" />'))
  },
  {
    name: 'business rule task (called decision) (Camunda Cloud 1.3)',
    config: { version: '1.3' },
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
    config: { version: '1.3' },
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
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess('<bpmn:serviceTask id="ServiceTask_1" />')),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <bpmn:ServiceTask> must have one extension element of type <zeebe:TaskDefinition>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'ServiceTask_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:TaskDefinition'
      }
    }
  },
  {
    name: 'service task (no task definition type) (Camunda Cloud 1.0)',
    config: { version: '1.0' },
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
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:TaskDefinition',
        parentNode: 'ServiceTask_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'business rule task (no task definition) (Camunda Cloud 1.1)',
    config: { version: '1.1' },
    moddleElement: createModdle(createProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />')),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <bpmn:BusinessRuleTask> must have one extension element of type <zeebe:TaskDefinition>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'BusinessRuleTask_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:TaskDefinition'
      }
    }
  },
  {
    name: 'business rule task (no task definition type) (Camunda Cloud 1.1)',
    config: { version: '1.1' },
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
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:TaskDefinition',
        parentNode: 'BusinessRuleTask_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'business rule task (called decision) (Camunda Cloud 1.1)',
    config: { version: '1.1' },
    moddleElement: createModdle(createProcess(`
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:extensionElements>
            <zeebe:calledDecision />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Extension element of type <zeebe:CalledDecision> only allowed by Camunda Platform 1.3 or newer',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
        node: 'BusinessRuleTask_1',
        parentNode: null,
        extensionElement: 'zeebe:CalledDecision',
        allowedVersion: '1.3'
      }
    }
  },
  {
    name: 'intermediate throw event (no task definition) (Camunda Cloud 1.2)',
    config: { version: '1.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateThrowEvent id="IntermediateThrowEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
      </bpmn:intermediateThrowEvent>
    `)),
    report: {
      id: 'IntermediateThrowEvent_1',
      message: 'Element of type <bpmn:IntermediateThrowEvent> must have one extension element of type <zeebe:TaskDefinition>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'IntermediateThrowEvent_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:TaskDefinition'
      }
    }
  },
  {
    name: 'intermediate throw event (no task definition type) (Camunda Cloud 1.2)',
    config: { version: '1.2' },
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
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:TaskDefinition',
        parentNode: 'IntermediateThrowEvent_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'service task (no task definition) (Camunda Cloud 1.3)',
    config: { version: '1.3' },
    moddleElement: createModdle(createProcess('<bpmn:serviceTask id="ServiceTask_1" />')),
    report: {
      id: 'ServiceTask_1',
      message: 'Element of type <bpmn:ServiceTask> must have one extension element of type <zeebe:TaskDefinition>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'ServiceTask_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:TaskDefinition'
      }
    }
  },
  {
    name: 'service task (no task definition type) (Camunda Cloud 1.3)',
    config: { version: '1.3' },
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
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:TaskDefinition',
        parentNode: 'ServiceTask_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'business rule task (no called decision or task definition) (Camunda Cloud 1.3)',
    config: { version: '1.3' },
    moddleElement: createModdle(createProcess('<bpmn:businessRuleTask id="BusinessRuleTask_1" />')),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <bpmn:BusinessRuleTask> must have one extension element of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'BusinessRuleTask_1',
        parentNode: null,
        requiredExtensionElement: [
          'zeebe:CalledDecision',
          'zeebe:TaskDefinition'
        ]
      }
    }
  },
  {
    name: 'business rule task (called decision and task definition) (Camunda Cloud 1.3)',
    config: { version: '1.3' },
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
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'BusinessRuleTask_1',
        parentNode: null,
        requiredExtensionElement: [
          'zeebe:CalledDecision',
          'zeebe:TaskDefinition'
        ]
      }
    }
  },
  {
    name: 'business rule task (no called decision ID) (Camunda Cloud 1.3)',
    config: { version: '1.3' },
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
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:CalledDecision',
        parentNode: 'BusinessRuleTask_1',
        requiredProperty: 'decisionId'
      }
    }
  },
  {
    name: 'business rule task (no called decision result variable) (Camunda Cloud 1.3)',
    config: { version: '1.3' },
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
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:CalledDecision',
        parentNode: 'BusinessRuleTask_1',
        requiredProperty: 'resultVariable'
      }
    }
  },
  {
    name: 'business rule task (no task definition type) (Camunda Cloud 1.3)',
    config: { version: '1.3' },
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
      data: {
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