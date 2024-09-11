const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/version-tag');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'process (version tag)',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:extensionElements>
          <zeebe:versionTag value="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:process>
    `))
  },
  {
    name: 'process (no version tag) (non-executable process)',
    config: { version: '8.6' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:extensionElements>
          <zeebe:versionTag />
        </bpmn:extensionElements>
      </bpmn:process>
    `))
  },
  {
    name: 'business rule task (version tag)',
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision bindingType="versionTag" versionTag="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  },
  {
    name: 'business rule task (no version tag) (non-executable process)',
    config: { version: '8.6' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:extensionElements>
            <zeebe:calledDecision bindingType="versionTag" />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      </bpmn:process>
    `))
  },
  {
    name: 'call activity (version tag)',
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement bindingType="versionTag" versionTag="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `))
  },
  {
    name: 'call activity (no version tag) (non-executable process)',
    config: { version: '8.6' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:extensionElements>
            <zeebe:calledElement bindingType="versionTag" />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      </bpmn:process>
    `))
  },
  {
    name: 'user task (version tag)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition bindingType="deployment" versionTag="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  },
  {
    name: 'user task (no version tag) (non-executable process)',
    config: { version: '8.6' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:userTask id="UserTask_1">
          <bpmn:extensionElements>
            <zeebe:formDefinition bindingType="versionTag" />
          </bpmn:extensionElements>
        </bpmn:userTask>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'process (no version tag)',
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:extensionElements>
          <zeebe:versionTag />
        </bpmn:extensionElements>
      </bpmn:process>
    `)),
    report: {
      id: 'Process_1',
      message: 'Element of type <zeebe:VersionTag> must have property <value>',
      path: [
        'extensionElements',
        'values',
        0,
        'value'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:VersionTag',
        parentNode: 'Process_1',
        requiredProperty: 'value'
      }
    }
  },
  {
    name: 'business rule task (no version tag)',
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision bindingType="versionTag" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Element of type <zeebe:CalledDecision> must have property <versionTag>',
      path: [
        'extensionElements',
        'values',
        0,
        'versionTag'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:CalledDecision',
        parentNode: 'BusinessRuleTask_1',
        requiredProperty: 'versionTag'
      }
    }
  },
  {
    name: 'call activity (no version tag)',
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement bindingType="versionTag" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `)),
    report: {
      id: 'CallActivity_1',
      message: 'Element of type <zeebe:CalledElement> must have property <versionTag>',
      path: [
        'extensionElements',
        'values',
        0,
        'versionTag'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:CalledElement',
        parentNode: 'CallActivity_1',
        requiredProperty: 'versionTag'
      }
    }
  },
  {
    name: 'user task (no version tag)',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition bindingType="versionTag" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Element of type <zeebe:FormDefinition> must have property <versionTag>',
      path: [
        'extensionElements',
        'values',
        0,
        'versionTag'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        requiredProperty: 'versionTag'
      }
    }
  }
];

RuleTester.verify('version-tag', rule, {
  valid,
  invalid
});