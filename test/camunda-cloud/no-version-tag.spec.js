const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/no-version-tag');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'process',
    config: { version: '8.5' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true" />
    `))
  },
  {
    name: 'business rule task',
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision bindingType="deployment" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  },
  {
    name: 'business rule task (version tag) (non-executable process)',
    config: { version: '8.5' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:businessRuleTask id="BusinessRuleTask_1">
          <bpmn:extensionElements>
            <zeebe:calledDecision bindingType="versionTag" versionTag="v1.0.0" />
          </bpmn:extensionElements>
        </bpmn:businessRuleTask>
      </bpmn:process>
    `))
  },
  {
    name: 'call activity',
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement bindingType="deployment" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `))
  },
  {
    name: 'call activity (version tag) (non-executable process)',
    config: { version: '8.5' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:callActivity id="CallActivity_1">
          <bpmn:extensionElements>
            <zeebe:calledElement bindingType="versionTag" versionTag="v1.0.0" />
          </bpmn:extensionElements>
        </bpmn:callActivity>
      </bpmn:process>
    `))
  },
  {
    name: 'user task',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition bindingType="deployment" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  },
  {
    name: 'user task (version tag) (non-executable process)',
    config: { version: '8.5' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:userTask id="UserTask_1">
          <bpmn:extensionElements>
            <zeebe:formDefinition bindingType="versionTag" versionTag="v1.0.0" />
          </bpmn:extensionElements>
        </bpmn:userTask>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'process (version tag)',
    config: { version: '8.5' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:extensionElements>
          <zeebe:versionTag value="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:process>
    `)),
    report: {
      id: 'Process_1',
      message: 'Extension element of type <zeebe:VersionTag> only allowed by Camunda 8.6',
      path: [
        'extensionElements',
        'values',
        0
      ],
      data: {
        type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
        node: 'Process_1',
        parentNode: null,
        extensionElement: 'zeebe:VersionTag',
        allowedVersion: '8.6'
      }
    }
  },
  {
    name: 'business rule task (binding type)',
    config: { version: '8.5' },
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision bindingType="versionTag" versionTag="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Property value of <versionTag> only allowed by Camunda 8.6 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'bindingType'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'zeebe:CalledDecision',
        parentNode: 'BusinessRuleTask_1',
        property: 'bindingType',
        allowedVersion: '8.6'
      }
    }
  },
  {
    name: 'business rule task (version tag)',
    config: { version: '8.5' },
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:calledDecision versionTag="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Property <versionTag> only allowed by Camunda 8.6 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'versionTag'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
        node: 'zeebe:CalledDecision',
        parentNode: 'BusinessRuleTask_1',
        property: 'versionTag',
        allowedVersion: '8.6'
      }
    }
  },
  {
    name: 'call activity (binding type)',
    config: { version: '8.5' },
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement bindingType="versionTag" versionTag="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `)),
    report: {
      id: 'CallActivity_1',
      message: 'Property value of <versionTag> only allowed by Camunda 8.6 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'bindingType'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'zeebe:CalledElement',
        parentNode: 'CallActivity_1',
        property: 'bindingType',
        allowedVersion: '8.6'
      }
    }
  },
  {
    name: 'call activity (version tag)',
    config: { version: '8.5' },
    moddleElement: createModdle(createProcess(`
      <bpmn:callActivity id="CallActivity_1">
        <bpmn:extensionElements>
          <zeebe:calledElement versionTag="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:callActivity>
    `)),
    report: {
      id: 'CallActivity_1',
      message: 'Property <versionTag> only allowed by Camunda 8.6 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'versionTag'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
        node: 'zeebe:CalledElement',
        parentNode: 'CallActivity_1',
        property: 'versionTag',
        allowedVersion: '8.6'
      }
    }
  },
  {
    name: 'user task (binding type)',
    config: { version: '8.5' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition bindingType="versionTag" versionTag="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Property value of <versionTag> only allowed by Camunda 8.6 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'bindingType'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        property: 'bindingType',
        allowedVersion: '8.6'
      }
    }
  },
  {
    name: 'user task (version tag)',
    config: { version: '8.5' },
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:formDefinition versionTag="v1.0.0" />
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Property <versionTag> only allowed by Camunda 8.6 or newer',
      path: [
        'extensionElements',
        'values',
        0,
        'versionTag'
      ],
      data: {
        type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
        node: 'zeebe:FormDefinition',
        parentNode: 'UserTask_1',
        property: 'versionTag',
        allowedVersion: '8.6'
      }
    }
  }
];

RuleTester.verify('no-version-tag', rule, {
  valid,
  invalid
});