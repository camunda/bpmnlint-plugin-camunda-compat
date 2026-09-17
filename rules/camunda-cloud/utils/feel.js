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
// Used by the `secret-reference` rule to find `camunda.secrets.<name>`
// references written in ways the engine rejects at deployment (see
// https://docs.camunda.io/docs/next/components/concepts/variables/#secret-references-in-input-mappings).
// The plain `parser` mis-parses backtick-escaped names, so this uses the
// `camunda` dialect, matching what `FeelAnalyzer` configures internally.

const camundaFeelParser = parser.configure({ dialect: 'camunda' });

// Matches a `camunda.secrets.<name>` reference occurring anywhere in a piece
// of text, `<name>` being a plain FEEL identifier or a backtick-escaped one.
// Deliberately unanchored, mirroring `secrets.js`'s `isValidSecret` pattern:
// per the docs, "writing the reference as a plain string, or quoting it
// inside an expression, is rejected ... rather than passed through as
// literal text" -- e.g. both `source="camunda.secrets.API_TOKEN"` (a plain,
// non-FEEL value) and `source="Bearer camunda.secrets.API_TOKEN"` embed the
// reference as inert text the engine never evaluates.
const SECRET_REFERENCE_LITERAL_PATTERN = /camunda\.secrets\.(?:[\w-]+|`[^`]+`)/;

// Whether `value` contains a `camunda.secrets.<name>` reference written as
// plain (non-FEEL) text, e.g. a `zeebe:Input` `source` written without the
// leading `=` -- the engine never evaluates it as an expression, so the
// reference is captured as literal text rather than resolved, same as
// wrapping it in a FEEL string literal.
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

// Matches a `PathExpression` node that is exactly the three-segment path
// `camunda.secrets.<name>`, and is not itself the base of a longer path (e.g.
// `camunda.secrets.NAME.length` is a *different*, four-segment path that the
// engine already treats as ordinary FEEL property access, not a reference).
function isSecretReferenceNode(node, expr) {
  if (node.type.name !== 'PathExpression') {
    return false;
  }

  if (node.parent && node.parent.type.name === 'PathExpression' && node.parent.firstChild === node) {
    return false;
  }

  const children = [];
  let child = node.firstChild;
  while (child) {
    children.push(child);
    child = child.nextSibling;
  }

  if (children.length !== 2 || children[ 1 ].type.name !== 'VariableName') {
    return false;
  }

  const [ base ] = children;

  if (base.type.name !== 'PathExpression') {
    return false;
  }

  const baseChildren = [];
  child = base.firstChild;
  while (child) {
    baseChildren.push(child);
    child = child.nextSibling;
  }

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

// A reference inside a `Context` is still statically resolvable (the engine
// replaces it in place), so only a `List` breaks static extraction.
function isInsideList(node) {
  let ancestor = node.parent;

  while (ancestor) {
    if (ancestor.type.name === 'List') {
      return true;
    }
    ancestor = ancestor.parent;
  }

  return false;
}

// A `Context` the reference sits in is still statically resolvable *unless*
// that very `Context` is itself the value produced by an `if` branch (e.g.
// `if cond then {x: camunda.secrets.NAME} else null`) -- the engine only
// evaluates the branch, rather than pattern-matching it, so the reference is
// no longer a value the mapping assigns directly. A reference that is a
// direct (unwrapped) `if` branch result is unaffected and remains valid.
function isInsideIfBranchContext(node) {
  let ancestor = node.parent;
  let sawContext = false;

  while (ancestor) {
    if (ancestor.type.name === 'IfExpression') {
      return sawContext;
    }

    if (ancestor.type.name === 'Context') {
      sawContext = true;
    }

    ancestor = ancestor.parent;
  }

  return false;
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

    // e.g. `="camunda.secrets.NAME"` (whole expression) or
    // `=["camunda.secrets.NAME"]` (nested in a list) -- a `StringLiteral`
    // anywhere in the tree embeds the reference as inert text, never a
    // `PathExpression` the engine can resolve
    if (node.type.name === 'StringLiteral') {
      const content = expr.slice(node.from + 1, node.to - 1);

      if (containsSecretReferenceLiteral(content)) {
        violations.stringLiteral = true;
      }
    }

    if (isSecretReferenceNode(node, expr)) {
      if (isInsideList(node)) {
        violations.insideList = true;
      }

      if (isInsideIfBranchContext(node)) {
        violations.insideIfBranchContext = true;
      }
    }

    let child = node.firstChild;
    while (child) {
      visit(child);
      child = child.nextSibling;
    }
  }

  visit(topNode);

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
