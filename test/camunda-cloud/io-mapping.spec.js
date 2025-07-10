const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const { createModdle, createProcess } = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const rule = require('../../rules/camunda-cloud/io-mapping');

const valid = [
  {
    name: 'complete io mapping',
    config: { version: '8.6' },
    moddleElement: createModdle(
      createProcess(`
      <bpmn:serviceTask id="ServiceTask">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="jobType" retries="" />
          <zeebe:ioMapping>
            <zeebe:input target="hello" source="=world" />
            <zeebe:output target="hello" source="=world" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)
    ),
  },
  {
    name: 'missing input source (allowed by Camunda >= 8.7)',
    config: { version: '8.7' },
    moddleElement: createModdle(
      createProcess(`
      <bpmn:serviceTask id="ServiceTask">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="jobType" retries="" />
          <zeebe:ioMapping>
            <zeebe:input target="hello" />
            <zeebe:output target="hello" source="=world" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)
    ),
  },
];

const invalid = [
  {
    name: 'missing all io mapping properties',
    config: { version: '8.6' },
    moddleElement: createModdle(
      createProcess(`
       <bpmn:serviceTask id="ServiceTask">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="jobType" retries="" />
          <zeebe:ioMapping>
            <zeebe:input target="" />
            <zeebe:output target="" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)
    ),
    report: [
      {
        id: 'ServiceTask',
        message: 'Element of type <zeebe:Input> without property <source> only allowed by Camunda 8.7 or newer',
        path: [ 'extensionElements', 'values', 1, 'inputParameters', 0, 'source' ],
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask',
          requiredProperty: 'source',
          allowedVersion: '8.7',
        },
        category: 'error',
      },
      {
        id: 'ServiceTask',
        message: 'Element of type <zeebe:Input> must have property <target>',
        path: [ 'extensionElements', 'values', 1, 'inputParameters', 0, 'target' ],
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask',
          requiredProperty: 'target',
        },
        category: 'error',
      },
      {
        id: 'ServiceTask',
        message: 'Element of type <zeebe:Output> must have property <source>',
        path: [ 'extensionElements', 'values', 1, 'outputParameters', 0, 'source' ],
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node: 'zeebe:Output',
          parentNode: 'ServiceTask',
          requiredProperty: 'source',
        },
        category: 'error',
      },
      {
        id: 'ServiceTask',
        message: 'Element of type <zeebe:Output> must have property <target>',
        path: [ 'extensionElements', 'values', 1, 'outputParameters', 0, 'target' ],
        data: {
          type: ERROR_TYPES.PROPERTY_REQUIRED,
          node: 'zeebe:Output',
          parentNode: 'ServiceTask',
          requiredProperty: 'target',
        },
        category: 'error',
      },
    ],
  },
];

RuleTester.verify('io-mapping', rule, {
  valid,
  invalid,
});
