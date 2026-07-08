const { is } = require('bpmnlint-utils');

const { findAncestorAdHocSubProcess, isAgenticAdHocSubProcess } = require('../utils/element');
const { CORRECT_NAME, NAME_ALIASES, findFunctionInvocations, getPositionalArgs } = require('./utils/feel');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

/**
 * Advisory checks on fromAi() calls inside agentic ad-hoc sub-processes for
 * valid but not-recommended patterns: a tool input with no description (the
 * argument omitted, or an empty string), and a conditional key where at least
 * one branch might resolve to a valid path. Extra arguments (type, schema,
 * options) are part of the documented signature and are not validated.
 *
 * These do not break the tool, so they are Warnings, not Errors. Violations
 * with no legitimate reading (wrong key type, missing/misplaced toolCall.
 * prefix, multi-segment keys, duplicate keys, function name casing, a
 * description that is not a string literal at all, wrong context) live in
 * agent-fromai-contract as errors. This rule silently defers to that gating
 * (an out-of-scope call is not double-reported here).
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

// A tool input with no description content is a valid but not-recommended
// pattern: the LLM has only the parameter name to work from. Missing (no
// second argument) and blank (an empty string literal) are the same case. A
// description that is a non-string-literal expression has no legitimate reading
// at all and is agent-fromai-contract's error, so it is skipped here.
function validateDescription(args) {
  if (args.length >= 2 && args[1].type !== 'StringLiteral') {
    return null;
  }

  const hasContent = args.length >= 2 && args[1].text.slice(1, -1).trim();

  if (hasContent) {
    return null;
  }

  return {
    message: 'fromAi() has no description. Add a quoted string describing what the agent should provide.',
    data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_MISSING },
  };
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

      const descriptionError = validateDescription(args);
      if (descriptionError) {
        errors.push(descriptionError);
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
