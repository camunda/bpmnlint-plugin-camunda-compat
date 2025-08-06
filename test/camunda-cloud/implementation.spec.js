const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/implementation');

const {
  createDefinitions,
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
    name: 'intermediate link throw event (Camunda Cloud 8.2)',
    config: { version: '8.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateThrowEvent id="IntermediateThrowEvent_1">
        <bpmn:linkEventDefinition id="LinkEventDefinition_1" name="foo" />
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
    name: 'message end event (Camunda Cloud 1.2)',
    config: { version: '1.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
        </bpmn:extensionElements>
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
      </bpmn:endEvent>
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
  },
  {
    name: 'script task (task definition) (Camunda Cloud 8.2)',
    config: { version: '8.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:scriptTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
        </bpmn:extensionElements>
      </bpmn:scriptTask>
    `))
  },
  {
    name: 'script task (script) (Camunda Cloud 8.2)',
    config: { version: '8.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:scriptTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:script expression="=foo()" resultVariable="bar" />
        </bpmn:extensionElements>
      </bpmn:scriptTask>
    `))
  },
  {
    name: 'service task (no task definition) (non-executable process)',
    config: { version: '8.2' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:serviceTask id="ServiceTask_1" />
      </bpmn:process>
    `))
  },
  {
    name: 'ad-hoc subprocess (job worker) (Camunda 8.8)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Task_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
        </bpmn:extensionElements>
      </bpmn:adHocSubProcess>
    `))
  },
  {
    name: 'ad-hoc subprocess (BPMN) (Camunda 8.7)',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Task_1" />
    `))
  },
  {
    name: 'ad-hoc subprocess (BPMN) (Camunda 8.8)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="Task_1" />
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
      message: 'Extension element of type <zeebe:CalledDecision> only allowed by Camunda 1.3 or newer',
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
    name: 'message end event (no task definition) (Camunda Cloud 1.2)',
    config: { version: '1.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:endEvent id="EndEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
      </bpmn:endEvent>
    `)),
    report: {
      id: 'EndEvent_1',
      message: 'Element of type <bpmn:EndEvent> must have one extension element of type <zeebe:TaskDefinition>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'EndEvent_1',
        parentNode: null,
        requiredExtensionElement: 'zeebe:TaskDefinition'
      }
    }
  },
  {
    name: 'message end event (no task definition type) (Camunda Cloud 1.2)',
    config: { version: '1.2' },
    moddleElement: createModdle(createProcess(`
        <bpmn:endEvent id="EndEvent_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition />
          </bpmn:extensionElements>
          <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        </bpmn:endEvent>
      `)),
    report: {
      id: 'EndEvent_1',
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
        parentNode: 'EndEvent_1',
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
  },
  {
    name: 'script task (script) (Camunda Cloud 8.1)',
    config: { version: '8.1' },
    moddleElement: createModdle(createProcess(`
        <bpmn:scriptTask id="Task_1">
          <bpmn:extensionElements>
            <zeebe:script />
          </bpmn:extensionElements>
        </bpmn:scriptTask>
      `)),
    report: {
      id: 'Task_1',
      message: 'Extension element of type <zeebe:Script> only allowed by Camunda 8.2 or newer',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
        node: 'Task_1',
        parentNode: null,
        extensionElement: 'zeebe:Script',
        allowedVersion: '8.2'
      }
    }
  },
  {
    name: 'script task (no script or task definition) (Camunda Cloud 8.2)',
    config: { version: '8.2' },
    moddleElement: createModdle(createProcess('<bpmn:scriptTask id="Task_1" />')),
    report: {
      id: 'Task_1',
      message: 'Element of type <bpmn:ScriptTask> must have one extension element of type <zeebe:Script> or <zeebe:TaskDefinition>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'Task_1',
        parentNode: null,
        requiredExtensionElement: [
          'zeebe:Script',
          'zeebe:TaskDefinition'
        ]
      }
    }
  },
  {
    name: 'script task (script and task definition) (Camunda Cloud 8.2)',
    config: { version: '8.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:scriptTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:script expression="=foo()" resultVariable="bar" />
          <zeebe:taskDefinition />
        </bpmn:extensionElements>
      </bpmn:scriptTask>
    `)),
    report: {
      id: 'Task_1',
      message: 'Element of type <bpmn:ScriptTask> must have one extension element of type <zeebe:Script> or <zeebe:TaskDefinition>',
      path: [],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
        node: 'Task_1',
        parentNode: null,
        requiredExtensionElement: [
          'zeebe:Script',
          'zeebe:TaskDefinition'
        ]
      }
    }
  },
  {
    name: 'script task (no expression) (Camunda Cloud 8.2)',
    config: { version: '8.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:scriptTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:script resultVariable="foo" />
        </bpmn:extensionElements>
      </bpmn:scriptTask>
    `)),
    report: {
      id: 'Task_1',
      message: 'Element of type <zeebe:Script> must have property <expression>',
      path: [
        'extensionElements',
        'values',
        0,
        'expression'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:Script',
        parentNode: 'Task_1',
        requiredProperty: 'expression'
      }
    }
  },
  {
    name: 'script task (no script result variable) (Camunda Cloud 8.2)',
    config: { version: '8.2' },
    moddleElement: createModdle(createProcess(`
      <bpmn:scriptTask id="Task_1">
        <bpmn:extensionElements>
          <zeebe:script expression="=foo()" />
        </bpmn:extensionElements>
      </bpmn:scriptTask>
    `)),
    report: {
      id: 'Task_1',
      message: 'Element of type <zeebe:Script> must have property <resultVariable>',
      path: [
        'extensionElements',
        'values',
        0,
        'resultVariable'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:Script',
        parentNode: 'Task_1',
        requiredProperty: 'resultVariable'
      }
    }
  },
  {
    name: 'ad-hoc subprocess (no task definition type) (Camunda 8.8)',
    config: { version: '8.8' },
    moddleElement: createModdle(createProcess(`
      <bpmn:adHocSubProcess id="AdHocSubProcess_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition />
        </bpmn:extensionElements>
      </bpmn:adHocSubProcess>
    `)),
    report: {
      id: 'AdHocSubProcess_1',
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
        parentNode: 'AdHocSubProcess_1',
        requiredProperty: 'type'
      }
    }
  },
  {
    name: 'ad-hoc subprocess (task definition) (Camunda 8.7)',
    config: { version: '8.7' },
    moddleElement: createModdle(createProcess(`
        <bpmn:adHocSubProcess id="AdHocSubProcess_1">
          <bpmn:extensionElements>
            <zeebe:taskDefinition type="job-worker" />
          </bpmn:extensionElements>
        </bpmn:adHocSubProcess>
      `)),
    report: {
      id: 'AdHocSubProcess_1',
      message: 'Extension element of type <zeebe:TaskDefinition> only allowed by Camunda 8.8 or newer',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
        node: 'AdHocSubProcess_1',
        parentNode: null,
        extensionElement: 'zeebe:TaskDefinition',
        allowedVersion: '8.8'
      }
    }
  },
];

RuleTester.verify('implementation', rule, {
  valid,
  invalid
});