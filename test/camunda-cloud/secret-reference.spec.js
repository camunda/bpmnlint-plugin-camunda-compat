const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/secret-reference');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'input with valid source (secret reference expression)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=camunda.secrets.API_TOKEN" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'input with valid source (secret reference concatenation)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=&quot;Bearer &quot; + camunda.secrets.API_TOKEN" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'input with valid source (backtick-escaped name)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=camunda.secrets.\`db-password\`" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'input with valid source (trailing path is not a reference)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=camunda.secrets.API_TOKEN.length" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'input with valid source (no secret reference)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=foo" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'input with valid source (legacy wrapped format is not a FEEL expression)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="{{secrets.API_TOKEN}}" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'input with valid source (secret reference inside a context)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="={token: camunda.secrets.API_TOKEN}" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'input with valid source (string literal not shaped like a secret name)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=&quot;camunda.secrets./&quot;" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'input with valid source (secret reference as a direct if-branch result)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=if true then camunda.secrets.API_TOKEN else null" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  },
  {
    name: 'input with valid source (unrelated string literal mentioning "secrets.")',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=&quot;my secrets.txt file&quot;" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `))
  }
];

const invalid = [
  {
    name: 'input with invalid source (secret reference written as a string literal)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=&quot;camunda.secrets.API_TOKEN&quot;" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Property <source> must use a secret reference as an expression (e.g. =camunda.secrets.NAME), not as a string literal',
        path: [
          'extensionElements',
          'values',
          0,
          'inputParameters',
          0,
          'source'
        ],
        data: {
          type: ERROR_TYPES.SECRET_REFERENCE_STRING_LITERAL_NOT_ALLOWED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask_1',
          property: 'source'
        }
      }
    ]
  },
  {
    name: 'input with invalid source (secret reference written as a static, non-FEEL value)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="camunda.secrets.API_TOKEN" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Property <source> must use a secret reference as an expression (e.g. =camunda.secrets.NAME), not as a string literal',
        path: [
          'extensionElements',
          'values',
          0,
          'inputParameters',
          0,
          'source'
        ],
        data: {
          type: ERROR_TYPES.SECRET_REFERENCE_STRING_LITERAL_NOT_ALLOWED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask_1',
          property: 'source'
        }
      }
    ]
  },
  {
    name: 'input with invalid source (secret reference embedded in a static value)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="Bearer camunda.secrets.API_TOKEN" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Property <source> must use a secret reference as an expression (e.g. =camunda.secrets.NAME), not as a string literal',
        path: [
          'extensionElements',
          'values',
          0,
          'inputParameters',
          0,
          'source'
        ],
        data: {
          type: ERROR_TYPES.SECRET_REFERENCE_STRING_LITERAL_NOT_ALLOWED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask_1',
          property: 'source'
        }
      }
    ]
  },
  {
    name: 'input with invalid source (secret reference embedded in a FEEL string literal)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=&quot;Bearer camunda.secrets.API_TOKEN&quot;" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Property <source> must use a secret reference as an expression (e.g. =camunda.secrets.NAME), not as a string literal',
        path: [
          'extensionElements',
          'values',
          0,
          'inputParameters',
          0,
          'source'
        ],
        data: {
          type: ERROR_TYPES.SECRET_REFERENCE_STRING_LITERAL_NOT_ALLOWED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask_1',
          property: 'source'
        }
      }
    ]
  },
  {
    name: 'input with invalid source (secret reference written as a string literal nested in a list)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=[&quot;camunda.secrets.API_TOKEN&quot;]" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Property <source> must use a secret reference as an expression (e.g. =camunda.secrets.NAME), not as a string literal',
        path: [
          'extensionElements',
          'values',
          0,
          'inputParameters',
          0,
          'source'
        ],
        data: {
          type: ERROR_TYPES.SECRET_REFERENCE_STRING_LITERAL_NOT_ALLOWED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask_1',
          property: 'source'
        }
      }
    ]
  },
  {
    name: 'input with invalid source (secret reference written as a backtick-escaped string literal)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=&quot;camunda.secrets.\`db-password\`&quot;" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Property <source> must use a secret reference as an expression (e.g. =camunda.secrets.NAME), not as a string literal',
        path: [
          'extensionElements',
          'values',
          0,
          'inputParameters',
          0,
          'source'
        ],
        data: {
          type: ERROR_TYPES.SECRET_REFERENCE_STRING_LITERAL_NOT_ALLOWED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask_1',
          property: 'source'
        }
      }
    ]
  },
  {
    name: 'input with invalid source (secret reference inside a list)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=[camunda.secrets.API_TOKEN]" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Property <source> must not assign a secret reference inside a list',
        path: [
          'extensionElements',
          'values',
          0,
          'inputParameters',
          0,
          'source'
        ],
        data: {
          type: ERROR_TYPES.SECRET_REFERENCE_INSIDE_LIST_NOT_ALLOWED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask_1',
          property: 'source'
        }
      }
    ]
  },
  {
    name: 'input with invalid source (secret reference inside a context returned by an if branch)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=if true then {x: camunda.secrets.API_TOKEN} else null" target="bar" />
          </zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>
    `)),
    report: [
      {
        id: 'ServiceTask_1',
        message: 'Property <source> must not assign a secret reference inside a context returned by an if expression branch',
        path: [
          'extensionElements',
          'values',
          0,
          'inputParameters',
          0,
          'source'
        ],
        data: {
          type: ERROR_TYPES.SECRET_REFERENCE_INSIDE_IF_BRANCH_CONTEXT_NOT_ALLOWED,
          node: 'zeebe:Input',
          parentNode: 'ServiceTask_1',
          property: 'source'
        }
      }
    ]
  }
];

RuleTester.verify('secret-reference', rule, {
  valid,
  invalid
});
