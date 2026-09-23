const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/camunda-cloud/unresolvable-secret-reference');

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

    // the engine's raw-text literal scanner (`SecretReference.REFERENCE_PATTERN`)
    // is not backtick-aware, unlike a live reference -- so a backtick-escaped
    // name inside a string literal isn't recognized as a reference at all
    name: 'input with valid source (backtick-escaped name inside a string literal)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=&quot;camunda.secrets.\`db-password\`&quot;" target="bar" />
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
  },
  {
    name: 'property with valid value (secret reference expression)',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="bar" value="=camunda.secrets.API_TOKEN" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:intermediateCatchEvent>
    `))
  },
  {

    // the misplaced-reference check (list / if-branch context) is scoped to
    // `zeebe:Input` only (`SecretReferenceLeafPrecisionValidator`), so a
    // `zeebe:Property` value is not checked for it, even though it would be
    // for a `zeebe:Input` source
    name: 'property with valid value (secret reference inside a list)',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="bar" value="=[camunda.secrets.API_TOKEN]" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:intermediateCatchEvent>
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
  },
  {

    // the reference sits inside the inner if's condition, itself inside a
    // context entry, itself inside the outer if's branch -- the engine
    // scans the whole context subtree once reached via the outer branch, so
    // this is rejected even though the reference isn't a value the context
    // assigns anywhere
    name: 'input with invalid source (secret reference nested in an if inside a context returned by an if branch)',
    moddleElement: createModdle(createProcess(`
      <bpmn:serviceTask id="ServiceTask_1">
        <bpmn:extensionElements>
          <zeebe:ioMapping>
            <zeebe:input source="=if true then {x: if camunda.secrets.flag = &quot;on&quot; then 1 else 2} else null" target="bar" />
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
  },
  {
    name: 'property with invalid value (secret reference written as a string literal)',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="bar" value="=&quot;camunda.secrets.API_TOKEN&quot;" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:intermediateCatchEvent>
    `)),
    report: [
      {
        id: 'IntermediateCatchEvent_1',
        message: 'Property <value> must use a secret reference as an expression (e.g. =camunda.secrets.NAME), not as a string literal',
        path: [
          'extensionElements',
          'values',
          0,
          'properties',
          0,
          'value'
        ],
        data: {
          type: ERROR_TYPES.SECRET_REFERENCE_STRING_LITERAL_NOT_ALLOWED,
          node: 'zeebe:Property',
          parentNode: 'IntermediateCatchEvent_1',
          property: 'value'
        }
      }
    ]
  },
  {
    name: 'property with invalid value (secret reference written as a static, non-FEEL value)',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="bar" value="camunda.secrets.API_TOKEN" />
          </zeebe:properties>
        </bpmn:extensionElements>
      </bpmn:intermediateCatchEvent>
    `)),
    report: [
      {
        id: 'IntermediateCatchEvent_1',
        message: 'Property <value> must use a secret reference as an expression (e.g. =camunda.secrets.NAME), not as a string literal',
        path: [
          'extensionElements',
          'values',
          0,
          'properties',
          0,
          'value'
        ],
        data: {
          type: ERROR_TYPES.SECRET_REFERENCE_STRING_LITERAL_NOT_ALLOWED,
          node: 'zeebe:Property',
          parentNode: 'IntermediateCatchEvent_1',
          property: 'value'
        }
      }
    ]
  }
];

RuleTester.verify('unresolvable-secret-reference', rule, {
  valid,
  invalid
});
