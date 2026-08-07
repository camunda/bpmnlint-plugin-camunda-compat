const { isString } = require('min-dash');

const { is } = require('bpmnlint-utils');

const { parser } = require('@bpmn-io/lezer-feel');

// Properties ignored globally
const IGNORED_PROPERTIES = [
  'name'
];

// Properties ignored only for specific element types
const IGNORED_PROPERTIES_BY_TYPE = {
  'zeebe:Input': [ 'target' ],
  'zeebe:Output': [ 'target' ],
  'zeebe:Header': [ 'key', 'value' ],
  'zeebe:Property': [ 'name', 'value' ],
  'zeebe:CalledDecision': [ 'resultVariable' ],
  'zeebe:Script': [ 'resultVariable' ]
};

const isIgnoredProperty = (node, propertyName) => {
  if (propertyName.startsWith('$') || IGNORED_PROPERTIES.includes(propertyName)) {
    return true;
  }

  const nodeType = node.$type;
  const ignoredForType = IGNORED_PROPERTIES_BY_TYPE[nodeType];

  return ignoredForType && ignoredForType.includes(propertyName);
};

const isFeelProperty = (node, propertyName, value) => {
  return !isIgnoredProperty(node, propertyName) && isString(value) && value.startsWith('=');
};

// ─── fromAi() lezer helpers ─────────────────────────────────────────────────
// Used by agent-fromai-contract to locate fromAi() calls and read their
// positional arguments.

/**
 * Unwrap a bpmn:Expression-valued property (conditionExpression,
 * completionCondition, timer definitions, loopCardinality) to its FEEL body,
 * so a semantic sweep can treat it the same as a plain string attribute.
 */
function unwrapExpression(value) {
  if (value && is(value, 'bpmn:Expression')) {
    return value.get('body');
  }
  return value;
}

// Properties ignored for the SEMANTIC sweep (agent-fromai-contract), as
// opposed to IGNORED_PROPERTIES_BY_TYPE above, which is tuned for the FEEL
// SYNTAX rule. Deliberate differences:
//
// - zeebe:Header key/value and zeebe:Property name/value are NOT ignored
//   here. Connector templates put resultExpression/errorExpression in
//   zeebe:taskHeader, and zeebe:property is a first-class element-template
//   binding, so a fromAi() call there is a real (and broken) surface. The
//   syntax rule skips them to avoid flagging non-FEEL strings that happen to
//   start with "=", a concern that does not apply here: the caller
//   additionally requires a parsed fromAi() invocation before reporting.
// - bpmn:Documentation text IS ignored here: tool documentation legitimately
//   discusses fromAi() in prose.
const SEMANTIC_IGNORED_PROPERTIES_BY_TYPE = {
  'zeebe:Input': [ 'target' ],
  'zeebe:Output': [ 'target' ],
  'zeebe:CalledDecision': [ 'resultVariable' ],
  'zeebe:Script': [ 'resultVariable' ],
  'bpmn:Documentation': [ 'text' ]
};

const isSemanticIgnoredProperty = (node, propertyName) => {
  if (propertyName.startsWith('$') || IGNORED_PROPERTIES.includes(propertyName)) {
    return true;
  }

  const ignoredForType = SEMANTIC_IGNORED_PROPERTIES_BY_TYPE[node.$type];

  return ignoredForType && ignoredForType.includes(propertyName);
};

/**
 * A FEEL-bearing property for the agent-fromai-contract sweep. `value` must
 * already be unwrapped via unwrapExpression.
 */
const isFeelBearingProperty = (node, propertyName, value) => {
  return !isSemanticIgnoredProperty(node, propertyName) && isString(value) && value.startsWith('=');
};

const CORRECT_NAME = 'fromAi';
const NAME_ALIASES = [ 'fromai', 'fromAI' ];

function findFunctionInvocations(expr) {
  const tree = parser.parse(expr);
  const result = [];

  function visit(node) {
    if (node.type.name === 'FunctionInvocation') {
      const nameNode = node.firstChild;
      if (nameNode && nameNode.type.name === 'VariableName') {
        const name = expr.slice(nameNode.from, nameNode.to);
        const nameLower = name.toLowerCase();
        if (nameLower === CORRECT_NAME.toLowerCase()) {
          result.push({ name, node });
        }
      }
    }
    let child = node.firstChild;
    while (child) {
      visit(child);
      child = child.nextSibling;
    }
  }

  visit(tree.topNode);
  return result;
}

function getPositionalArgs(invocationNode, expr) {
  let child = invocationNode.firstChild;
  while (child) {
    if (child.type.name === 'PositionalParameters') {
      const args = [];
      let arg = child.firstChild;
      while (arg) {
        args.push({ type: arg.type.name, text: expr.slice(arg.from, arg.to) });
        arg = arg.nextSibling;
      }
      return args;
    }
    child = child.nextSibling;
  }
  return [];
}

module.exports = {
  isFeelProperty,
  unwrapExpression,
  isFeelBearingProperty,
  CORRECT_NAME,
  NAME_ALIASES,
  findFunctionInvocations,
  getPositionalArgs
};
