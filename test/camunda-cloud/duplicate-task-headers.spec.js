const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/duplicate-task-headers');

const {
  createDefinitions,
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'service task',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="key1" />
            <zeebe:header key="key2" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'send task',
    moddleElement: createModdle(createProcess(`
      <bpmn:sendTask id="SendTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="key1" />
            <zeebe:header key="key2" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:sendTask>
    `))
  },
  {
    name: 'user task',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="key1" />
            <zeebe:header key="key2" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:userTask>
    `))
  },
  {
    name: 'business rule task',
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
          <zeebe:taskHeaders>
            <zeebe:header key="key1" />
            <zeebe:header key="key2" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `))
  },
  {
    name: 'script task',
    moddleElement: createModdle(createProcess(`
      <bpmn:scriptTask id="ScriptTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="key1" />
            <zeebe:header key="key2" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:scriptTask>
    `))
  },
  {
    name: 'message throw event',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateThrowEvent id="MessageEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="key1" />
            <zeebe:header key="key2" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:intermediateThrowEvent>
    `))
  },
  {
    name: 'service task (non-executable process)',
    config: { version: '8.2' },
    moddleElement: createModdle(createDefinitions(`
      <bpmn:process id="Process_1">
        <bpmn:serviceTask id="ServiceTask_1">
          <bpmn:extensionElements>
            <zeebe:taskHeaders>
              <zeebe:header key="foo" />
              <zeebe:header key="foo" />
            </zeebe:taskHeaders>
          </bpmn:extensionElements>
        </bpmn:serviceTask>
      </bpmn:process>
    `))
  }
];

const invalid = [
  {
    name: 'service task',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="foo" />
            <zeebe:header key="foo" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <foo>',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
        node: 'zeebe:TaskHeaders',
        parentNode: 'ServiceTask_1',
        duplicatedProperty: 'key',
        duplicatedPropertyValue: 'foo',
        properties: [
          'zeebe:Header',
          'zeebe:Header'
        ],
        propertiesName: 'values'
      }
    }
  },
  {
    name: 'service task (multiple duplicates)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="foo" />
            <zeebe:header key="foo" />
            <zeebe:header key="foo" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <foo>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: 'zeebe:TaskHeaders',
          parentNode: 'ServiceTask_1',
          duplicatedProperty: 'key',
          duplicatedPropertyValue: 'foo',
          properties: [
            'zeebe:Header',
            'zeebe:Header',
            'zeebe:Header'
          ],
          propertiesName: 'values'
        }
      }
    ]
  },
  {
    name: 'service task (multiple duplicates)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="foo" />
            <zeebe:header key="foo" />
            <zeebe:header key="bar" />
            <zeebe:header key="bar" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <foo>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: 'zeebe:TaskHeaders',
          parentNode: 'ServiceTask_1',
          duplicatedProperty: 'key',
          duplicatedPropertyValue: 'foo',
          properties: [
            'zeebe:Header',
            'zeebe:Header'
          ],
          propertiesName: 'values'
        }
      },
      {
        id: 'ServiceTask_1',
        message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <bar>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: 'zeebe:TaskHeaders',
          parentNode: 'ServiceTask_1',
          duplicatedProperty: 'key',
          duplicatedPropertyValue: 'bar',
          properties: [
            'zeebe:Header',
            'zeebe:Header'
          ],
          propertiesName: 'values'
        }
      }
    ]
  },
  {
    name: 'service task (no key)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header />
            <zeebe:header />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <undefined>',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
        node: 'zeebe:TaskHeaders',
        parentNode: 'ServiceTask_1',
        duplicatedProperty: 'key',
        duplicatedPropertyValue: undefined,
        properties: [
          'zeebe:Header',
          'zeebe:Header'
        ],
        propertiesName: 'values'
      }
    }
  },
  {
    name: 'send task',
    moddleElement: createModdle(createProcess(`
      <bpmn:sendTask id="SendTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="foo" />
            <zeebe:header key="foo" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:sendTask>
    `)),
    report: {
      id: 'SendTask_1',
      message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <foo>',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
        node: 'zeebe:TaskHeaders',
        parentNode: 'SendTask_1',
        duplicatedProperty: 'key',
        duplicatedPropertyValue: 'foo',
        properties: [
          'zeebe:Header',
          'zeebe:Header'
        ],
        propertiesName: 'values'
      }
    }
  },
  {
    name: 'user task',
    moddleElement: createModdle(createProcess(`
      <bpmn:userTask id="UserTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="foo" />
            <zeebe:header key="foo" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:userTask>
    `)),
    report: {
      id: 'UserTask_1',
      message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <foo>',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
        node: 'zeebe:TaskHeaders',
        parentNode: 'UserTask_1',
        duplicatedProperty: 'key',
        duplicatedPropertyValue: 'foo',
        properties: [
          'zeebe:Header',
          'zeebe:Header'
        ],
        propertiesName: 'values'
      }
    }
  },
  {
    name: 'business rule task',
    moddleElement: createModdle(createProcess(`
      <bpmn:businessRuleTask id="BusinessRuleTask_1">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="foo" />
          <zeebe:taskHeaders>
            <zeebe:header key="foo" />
            <zeebe:header key="foo" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:businessRuleTask>
    `)),
    report: {
      id: 'BusinessRuleTask_1',
      message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <foo>',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
        node: 'zeebe:TaskHeaders',
        parentNode: 'BusinessRuleTask_1',
        duplicatedProperty: 'key',
        duplicatedPropertyValue: 'foo',
        properties: [
          'zeebe:Header',
          'zeebe:Header'
        ],
        propertiesName: 'values'
      }
    }
  },
  {
    name: 'script task',
    moddleElement: createModdle(createProcess(`
      <bpmn:scriptTask id="ScriptTask_1">
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="foo" />
            <zeebe:header key="foo" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:scriptTask>
    `)),
    report: {
      id: 'ScriptTask_1',
      message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <foo>',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
        node: 'zeebe:TaskHeaders',
        parentNode: 'ScriptTask_1',
        duplicatedProperty: 'key',
        duplicatedPropertyValue: 'foo',
        properties: [
          'zeebe:Header',
          'zeebe:Header'
        ],
        propertiesName: 'values'
      }
    }
  },
  {
    name: 'message throw event',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateThrowEvent id="MessageEvent_1">
        <bpmn:messageEventDefinition id="MessageEventDefinition_1" />
        <bpmn:extensionElements>
          <zeebe:taskHeaders>
            <zeebe:header key="foo" />
            <zeebe:header key="foo" />
          </zeebe:taskHeaders>
        </bpmn:extensionElements>
      </bpmn:intermediateThrowEvent>
    `)),
    report: {
      id: 'MessageEvent_1',
      message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <foo>',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
        node: 'zeebe:TaskHeaders',
        parentNode: 'MessageEvent_1',
        duplicatedProperty: 'key',
        duplicatedPropertyValue: 'foo',
        properties: [
          'zeebe:Header',
          'zeebe:Header'
        ],
        propertiesName: 'values'
      }
    }
  }
];

RuleTester.verify('task-headers', rule, {
  valid,
  invalid
});