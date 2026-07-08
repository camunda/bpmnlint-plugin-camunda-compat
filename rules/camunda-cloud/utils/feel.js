const { isString } = require('min-dash');

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
// Shared by agent-fromai-contract and feel-function-contracts: the former checks
// the structural (error) parts of a fromAi() call, the latter the judgment-call
// (warn) parts, but both first locate the calls and read their positional args.

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
  CORRECT_NAME,
  NAME_ALIASES,
  findFunctionInvocations,
  getPositionalArgs
};
