const { is } = require('bpmnlint-utils');

const { findAncestorAdHocSubProcess, isAgenticAdHocSubProcess } = require('../utils/element');
const { CORRECT_NAME, NAME_ALIASES, findFunctionInvocations, getPositionalArgs } = require('./utils/feel');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

/**
 * Advisory checks on fromAi() calls inside agentic ad-hoc sub-processes,
 * for cases that have a plausible, not-obviously-wrong reading and might
 * simply not work as the modeler expects: a description that is missing,
 * blank, or a non-string-literal expression (e.g. a variable reference
 * someone might use to build the text dynamically, which the connector does
 * not evaluate as documentation), and a conditional key where at least one
 * branch might resolve to a valid path. Extra arguments (type, schema,
 * options) are part of the documented signature and are not validated.
 *
 * Violations with no legitimate reading (wrong key type, missing/misplaced
 * toolCall. prefix, multi-segment keys, duplicate keys, function name
 * casing, a description that is a bare number or null literal, wrong
 * context) live in agent-fromai-contract as errors. This rule silently
 * defers to that gating (an out-of-scope call is not double-reported here).
 */
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

    // A bare number or null literal has no legitimate reading as a
    // description; agent-fromai-contract already reports it as an error,
    // skip it here to avoid double-reporting the same violation.
    if (arg.type === 'NumericLiteral' || arg.type === 'null') {
      return null;
    }

    return {
      message: 'fromAi() description is a FEEL expression, not a string literal. The connector may not evaluate it as documentation text, and the agent might not receive a usable description.',
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

module.exports = skipInNonExecutableProcess(function(config = {}) {
  const { version } = config;
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
    if (!ahsp || !isAgenticAdHocSubProcess(ahsp, version)) {

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

  return annotateRule('agent-fromai-guidance', {
    check
  });
});
