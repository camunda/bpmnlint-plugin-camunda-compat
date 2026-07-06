const { is } = require('bpmnlint-utils');

const { parser } = require('@bpmn-io/lezer-feel');

const { findExtensionElement, findAncestorAdHocSubProcess } = require('../utils/element');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

/**
 * Validates the judgment-call parts of fromAi() calls inside agentic
 * ad-hoc sub-processes: description quality (the LLM uses the description to
 * decide what value to supply, so a missing or weak one degrades accuracy
 * without breaking anything), and the ambiguous conditional-key case. Extra
 * arguments (type, schema, options) are part of the documented signature and
 * are not validated.
 *
 * Structural breaks (wrong key type, missing/misplaced toolCall. prefix,
 * multi-segment keys, duplicate keys, function name casing, wrong context)
 * are deterministic silent-failure cases and live in agent-fromai-contract
 * as errors. This rule silently defers to that gating (an out-of-scope call
 * is not double-reported here).
 */
const CORRECT_NAME = 'fromAi';
const NAME_ALIASES = [ 'fromai', 'fromAI' ];

// ─── Lezer helpers ───────────────────────────────────────────────────────────

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

// ─── Constraint validators ────────────────────────────────────────────────────

function validateConditionalKey(arg) {
  if (arg.type !== 'IfExpression') {
    return null;
  }

  // Conditional key — ambiguous; explain-only warning.
  return {
    message: 'fromAi() key uses a conditional expression. Ensure at least one branch resolves to a toolCall.* path.',
    data: { type: ERROR_TYPES.AGENT_FEEL_KEY_CONDITIONAL },
  };
}

function validateDescriptionArg(arg) {
  if (arg.type !== 'StringLiteral') {
    if (arg.type === 'NumericLiteral' || arg.type === 'null') {
      return {
        message: 'fromAi() description must be a string literal — a quoted string describing what the agent should provide.',
        data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID },
      };
    }
    return {
      message: 'fromAi() description should be a string literal — use a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID },
    };
  }

  // Strip the surrounding quotes to inspect the content.
  const content = arg.text.slice(1, -1);

  if (!content.trim()) {
    return {
      message: 'fromAi() description is blank.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TOO_WEAK },
    };
  }

  return null;
}

// ─── Rule ─────────────────────────────────────────────────────────────────────

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'zeebe:Input')) {
      return;
    }

    const source = node.get('source');
    if (!source || !source.startsWith('=')) {
      return;
    }

    const expr = source.substring(1).trim();
    const invocations = findFunctionInvocations(expr);
    if (invocations.length === 0) {
      return;
    }

    // Walk from zeebe:Input → zeebe:IoMapping → bpmn:ExtensionElements → task
    const task = node.$parent && node.$parent.$parent && node.$parent.$parent.$parent;
    if (!task || !is(task, 'bpmn:FlowNode')) {
      return;
    }

    const ahsp = findAncestorAdHocSubProcess(task);
    if (!ahsp || !findExtensionElement(ahsp, 'zeebe:AdHoc')) {

      // Wrong context is agent-fromai-contract's concern; don't double-report.
      return;
    }

    // The connector resolves fromAi() only on the tool's entry element.
    const incoming = task.get('incoming') || [];
    if (incoming.length > 0) {
      return;
    }

    // Properties-panel entry for this input parameter, so clicking the report
    // opens the right mapping (id convention: {elementId}-input-{index}-source).
    const inputIndex = (node.$parent.get('inputParameters') || []).indexOf(node);
    const propertiesPanel = {
      entryIds: [ `${ task.get('id') }-input-${ inputIndex }-source` ]
    };

    const errors = [];

    for (const inv of invocations) {

      // A casing typo isn't a recognized fromAi() call yet; agent-fromai-contract
      // reports the typo itself, skip judgment-call checks for it here.
      if (inv.name !== CORRECT_NAME && NAME_ALIASES.includes(inv.name.toLowerCase())) {
        continue;
      }

      const args = getPositionalArgs(inv.node, expr);

      if (args.length === 0) {

        // Missing key argument is a structural break; agent-fromai-contract's job.
        continue;
      }

      const conditionalError = validateConditionalKey(args[0]);
      if (conditionalError) {
        errors.push(conditionalError);
      }

      if (args.length < 2) {
        errors.push({
          message: 'fromAi() description is missing.',
          data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_MISSING },
        });
      } else {
        const descError = validateDescriptionArg(args[1]);
        if (descError) {
          errors.push(descError);
        }
      }
    }

    if (errors.length) {
      reportErrors(task, reporter, errors.map(error => ({ ...error, propertiesPanel })));
    }
  }

  return annotateRule('feel-function-contracts', {
    check
  });
});
