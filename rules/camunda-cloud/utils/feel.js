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

// ─── secret reference lezer helpers ─────────────────────────────────────────
// used by `unresolvable-secret-reference`; see
// https://docs.camunda.io/docs/next/components/concepts/variables/#secret-references-in-input-mappings

const camundaFeelParser = parser.configure({ dialect: 'camunda' });

// matches `camunda.secrets.<name>` anywhere in a string; not backtick-aware
const SECRET_REFERENCE_LITERAL_PATTERN = /camunda\.secrets\.[\w-]+/;

// whether `value` contains a `camunda.secrets.<name>` reference as plain text
function containsSecretReferenceLiteral(value) {
  return SECRET_REFERENCE_LITERAL_PATTERN.test(value);
}

function hasErrorNode(node) {
  if (node.type.isError) {
    return true;
  }
  let child = node.firstChild;
  while (child) {
    if (hasErrorNode(child)) {
      return true;
    }
    child = child.nextSibling;
  }
  return false;
}

function getChildren(node) {
  const children = [];
  let child = node.firstChild;

  while (child) {
    children.push(child);
    child = child.nextSibling;
  }

  return children;
}

// whether `node` is exactly the path `camunda.secrets.<name>`, not a longer path
function isSecretReferenceNode(node, expr) {
  if (node.type.name !== 'PathExpression') {
    return false;
  }

  if (node.parent && node.parent.type.name === 'PathExpression' && node.parent.firstChild === node) {
    return false;
  }

  const children = getChildren(node);

  if (children.length !== 2 || children[ 1 ].type.name !== 'VariableName') {
    return false;
  }

  const [ base ] = children;

  if (base.type.name !== 'PathExpression') {
    return false;
  }

  const baseChildren = getChildren(base);

  if (
    baseChildren.length !== 2 ||
    baseChildren[ 0 ].type.name !== 'VariableName' ||
    baseChildren[ 1 ].type.name !== 'VariableName'
  ) {
    return false;
  }

  return expr.slice(baseChildren[ 0 ].from, baseChildren[ 0 ].to) === 'camunda' &&
    expr.slice(baseChildren[ 1 ].from, baseChildren[ 1 ].to) === 'secrets';
}

// whether a reference exists anywhere in `node`'s subtree
function containsSecretReference(node, expr) {
  if (isSecretReferenceNode(node, expr)) {
    return true;
  }

  let child = node.firstChild;
  while (child) {
    if (containsSecretReference(child, expr)) {
      return true;
    }
    child = child.nextSibling;
  }

  return false;
}

// the value expression of each direct `ContextEntry` inside a `Context`
function getContextEntryValues(node) {
  return getChildren(node)
    .filter(child => child.type.name === 'ContextEntry')
    .map(entry => getChildren(entry).pop())
    .filter(Boolean);
}

// the `then` and `else` branch expressions of an `IfExpression`
function getIfBranches(node) {
  const children = getChildren(node);

  const thenIndex = children.findIndex(c => c.type.name === 'then');
  const elseIndex = children.findIndex(c => c.type.name === 'else');

  return [
    thenIndex >= 0 ? children[ thenIndex + 1 ] : null,
    elseIndex >= 0 ? children[ elseIndex + 1 ] : null
  ];
}

// root-down, transparent only through `Context` entries and `If` branches
// (mirrors SecretReference#isImprecise)
//
// @return { 'list' | 'context' | null }
function findImpreciseContainerKind(node, expr) {
  if (!node) {
    return null;
  }

  if (node.type.name === 'List') {
    return containsSecretReference(node, expr) ? 'list' : null;
  }

  if (node.type.name === 'Context') {
    return containsSecretReference(node, expr) ? 'context' : null;
  }

  if (node.type.name === 'IfExpression') {
    const [ thenNode, elseNode ] = getIfBranches(node);

    return findImpreciseContainerKind(thenNode, expr) || findImpreciseContainerKind(elseNode, expr);
  }

  return null;
}

function findImpreciseReferenceKind(node, expr) {
  if (node.type.name === 'Context') {
    for (const value of getContextEntryValues(node)) {
      const kind = findImpreciseReferenceKind(value, expr);

      if (kind) {
        return kind;
      }
    }

    return null;
  }

  return findImpreciseContainerKind(node, expr);
}

/**
 * Find ways a `camunda.secrets.<name>` reference is written in a FEEL
 * expression that the engine rejects at deployment.
 *
 * @param { string } expr - the FEEL expression, without the leading `=`
 *
 * @return { { stringLiteral: boolean, insideList: boolean, insideIfBranchContext: boolean } }
 */
function findSecretReferenceViolations(expr) {
  const violations = {
    stringLiteral: false,
    insideList: false,
    insideIfBranchContext: false
  };

  const tree = camundaFeelParser.parse(expr);
  const topNode = tree.topNode;

  if (hasErrorNode(topNode)) {
    return violations;
  }

  function visit(node) {

    // a `StringLiteral` embeds the reference as inert text
    if (node.type.name === 'StringLiteral') {
      const content = expr.slice(node.from + 1, node.to - 1);

      if (containsSecretReferenceLiteral(content)) {
        violations.stringLiteral = true;
      }
    }

    let child = node.firstChild;
    while (child) {
      visit(child);
      child = child.nextSibling;
    }
  }

  visit(topNode);

  const impreciseKind = findImpreciseReferenceKind(topNode.firstChild, expr);

  if (impreciseKind === 'list') {
    violations.insideList = true;
  } else if (impreciseKind === 'context') {
    violations.insideIfBranchContext = true;
  }

  return violations;
}

module.exports = {
  isFeelProperty,
  findSecretReferenceViolations,
  containsSecretReferenceLiteral,
  CORRECT_NAME,
  NAME_ALIASES,
  findFunctionInvocations,
  getArgs
};
