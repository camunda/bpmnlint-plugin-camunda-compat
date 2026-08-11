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
// Used by agent-fromai-contract to locate fromAi() calls and read their
// arguments, written either positionally or as named parameters.

const CORRECT_NAME = 'fromAi';
const NAME_ALIASES = [ 'fromai', 'fromAI' ];

// fromAi() signature, mirroring FromAiTaggedParameterExtractor in
// camunda/camunda: it normalizes positional and named calls onto these same
// five slots, so every downstream check reads one index for both call forms.
// The list is also what tells a name the engine recognizes from a typo like
// "valu", which the engine drops.
const PARAMETER_NAMES = [ 'value', 'description', 'type', 'schema', 'options' ];

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

// Comments and error nodes are siblings of the real arguments, so reading them
// as arguments would report a comment as the wrong key type, or an incomplete
// call as a "⚠" one.
const nextArgNode = node => {
  while (node && node.type.isSkipped) {
    node = node.nextSibling;
  }
  return node;
};

/**
 * Reads a fromAi() call's arguments into an array indexed by PARAMETER_NAMES.
 *
 * A named call fills only the slots it mentions, so the array is sparse: for
 * `fromAi(type: "number")` slot 2 is set while slot 0 is undefined. Callers
 * must test individual slots for presence rather than read `args.length`.
 */
function getArgs(invocationNode, expr) {
  const toArg = node => ({ type: node.type.name, text: expr.slice(node.from, node.to) });

  let child = invocationNode.firstChild;
  while (child) {
    if (child.type.name === 'PositionalParameters') {
      const args = [];
      let arg = nextArgNode(child.firstChild);
      while (arg) {
        args.push(toArg(arg));
        arg = nextArgNode(arg.nextSibling);
      }
      return args;
    }

    if (child.type.name === 'NamedParameters') {

      // Named arguments resolve by name, and their order in the call carries no
      // meaning, so each one goes to its own slot. A name outside the signature
      // is dropped, matching the engine, which reads the parameter map by name
      // and never sees it.
      const args = [];
      let param = child.firstChild;
      while (param) {
        if (param.type.name === 'NamedParameter') {
          const nameNode = param.firstChild;
          const valueNode = nameNode && nextArgNode(nameNode.nextSibling);

          if (nameNode && nameNode.type.name === 'ParameterName' && valueNode) {
            const index = PARAMETER_NAMES.indexOf(expr.slice(nameNode.from, nameNode.to));

            if (index !== -1) {
              args[ index ] = toArg(valueNode);
            }
          }
        }
        param = param.nextSibling;
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
  getArgs
};
