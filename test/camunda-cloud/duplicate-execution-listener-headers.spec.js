const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/duplicate-execution-listener-headers');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'execution listener with unique header keys',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener">
              <zeebe:taskHeaders>
                <zeebe:header key="authToken" value="abc" />
                <zeebe:header key="endpoint" value="endpointValue" />
              </zeebe:taskHeaders>
            </zeebe:executionListener>
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'execution listener without headers',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener" />
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'no execution listeners',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1" />
    `))
  },
  {
    name: 'same header key across different listeners (allowed)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener">
              <zeebe:taskHeaders>
                <zeebe:header key="authToken" value="abc" />
              </zeebe:taskHeaders>
            </zeebe:executionListener>
            <zeebe:executionListener eventType="end" type="com.example.EndListener">
              <zeebe:taskHeaders>
                <zeebe:header key="authToken" value="def" />
              </zeebe:taskHeaders>
            </zeebe:executionListener>
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  }
];

const invalid = [
  {
    name: 'execution listener with duplicate header keys',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener">
              <zeebe:taskHeaders>
                <zeebe:header key="authToken" value="abc" />
                <zeebe:header key="authToken" value="def" />
              </zeebe:taskHeaders>
            </zeebe:executionListener>
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: {
      id: 'ServiceTask_1',
      message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <authToken>',
      path: null,
      data: {
        type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
        node: 'zeebe:TaskHeaders',
        parentNode: 'ServiceTask_1',
        duplicatedProperty: 'key',
        duplicatedPropertyValue: 'authToken',
        properties: [
          'zeebe:Header',
          'zeebe:Header'
        ],
        propertiesName: 'values'
      }
    }
  },
  {
    name: 'execution listener with multiple duplicate header keys',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:executionListeners>
            <zeebe:executionListener eventType="start" type="com.example.StartListener">
              <zeebe:taskHeaders>
                <zeebe:header key="authToken" value="abc" />
                <zeebe:header key="authToken" value="def" />
                <zeebe:header key="endpoint" value="endpointValue1" />
                <zeebe:header key="endpoint" value="endpointValue2" />
              </zeebe:taskHeaders>
            </zeebe:executionListener>
          </zeebe:executionListeners>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <authToken>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: 'zeebe:TaskHeaders',
          parentNode: 'ServiceTask_1',
          duplicatedProperty: 'key',
          duplicatedPropertyValue: 'authToken',
          properties: [
            'zeebe:Header',
            'zeebe:Header'
          ],
          propertiesName: 'values'
        }
      },
      {
        id: 'ServiceTask_1',
        message: 'Properties of type <zeebe:Header> have property <key> with duplicate value of <endpoint>',
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: 'zeebe:TaskHeaders',
          parentNode: 'ServiceTask_1',
          duplicatedProperty: 'key',
          duplicatedPropertyValue: 'endpoint',
          properties: [
            'zeebe:Header',
            'zeebe:Header'
          ],
          propertiesName: 'values'
        }
      }
    ]
  }
];

RuleTester.verify('duplicate-execution-listener-headers', rule, {
  valid,
  invalid
});
