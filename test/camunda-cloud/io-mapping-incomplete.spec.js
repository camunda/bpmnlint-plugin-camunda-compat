const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const { createModdle, createProcess } = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const rule = require('../../rules/camunda-cloud/io-mapping-incomplete');

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
            <zeebe:input target="hello" source="=world"/>
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
        message: 'Input mapping without <source> only allowed by Camunda 8.7 or newer.',
        path: [ 'extensionElements', 'values', 1, 'inputParameters', 0, 'source' ],
        data: {
          type: ERROR_TYPES.IO_MAPPING_INCOMPLETE,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask',
          property: 'source',
          allowedVersion: '8.7',
        },
        category: 'error',
      },
      {
        id: 'ServiceTask',
        message: 'Input mapping <target> must be defined.',
        path: [ 'extensionElements', 'values', 1, 'inputParameters', 0, 'target' ],
        data: {
          type: ERROR_TYPES.IO_MAPPING_INCOMPLETE,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask',
          property: 'target',
        },
        category: 'error',
      },
      {
        id: 'ServiceTask',
        message: 'Output mapping <source> must be defined.',
        path: [ 'extensionElements', 'values', 1, 'outputParameters', 0, 'source' ],
        data: {
          type: ERROR_TYPES.IO_MAPPING_INCOMPLETE,
          node: 'zeebe:Output',
          parentNode: 'ServiceTask',
          property: 'source',
        },
        category: 'error',
      },
      {
        id: 'ServiceTask',
        message: 'Output mapping <target> must be defined.',
        path: [ 'extensionElements', 'values', 1, 'outputParameters', 0, 'target' ],
        data: {
          type: ERROR_TYPES.IO_MAPPING_INCOMPLETE,
          node: 'zeebe:Output',
          parentNode: 'ServiceTask',
          property: 'target',
        },
        category: 'error',
      },
    ],
  },
];

RuleTester.verify('io-mapping-incomplete', rule, {
  valid,
  invalid,
});
