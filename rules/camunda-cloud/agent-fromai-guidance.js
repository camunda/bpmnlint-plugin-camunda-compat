const { is } = require('bpmnlint-utils');

const { findAncestorAdHocSubProcess, isAgenticAdHocSubProcess } = require('../utils/element');
const { CORRECT_NAME, NAME_ALIASES, findFunctionInvocations, getPositionalArgs } = require('./utils/feel');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

/**
 * Advisory check on fromAi() calls inside agentic ad-hoc sub-processes: a
 * conditional key where at least one branch might resolve to a valid path.
 * The description argument is optional per the fromAi() signature, so an
 * omitted or empty description is valid and is not reported here; a tool's
 * own missing documentation is a separate concern owned by
 * agent-tool-documentation.
 *
 * The conditional-key case does not deterministically break, so it is a
 * Warning. Violations with no legitimate reading (wrong key type,
 * missing/misplaced toolCall. prefix, multi-segment keys, duplicate keys,
 * function name casing, a description that is not a string literal, wrong
 * context) live in agent-fromai-contract as errors. This rule silently defers
 * to that gating (an out-of-scope call is not double-reported here).
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
    }

    if (errors.length) {
      reportErrors(task, reporter, errors.map(error => ({ ...error, propertiesPanel })));
    }
  }

  return annotateRule('agent-fromai-guidance', {
    check
  });
});
