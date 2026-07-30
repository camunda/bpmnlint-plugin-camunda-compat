const { is } = require('bpmnlint-utils');

const { getPath, pathConcat } = require('@bpmn-io/moddle-utils');

const {
  findExtensionElement,
  findAncestorAdHocSubProcess,
  isAgenticAdHocSubProcess,
  findParentNode
} = require('../utils/element');
const {
  CORRECT_NAME,
  NAME_ALIASES,
  findFunctionInvocations,
  getPositionalArgs,
  isFeelBearingProperty,
  unwrapExpression
} = require('./utils/feel');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

/**
 * Validates the parts of fromAi() calls that have no legitimate reading: the
 * call silently resolves to nothing at runtime, with no error, and there is
 * no plausible intent behind the violation. Covers wrong key type (including
 * a conditional/if-expression key), missing/misplaced toolCall. prefix,
 * multi-segment keys, duplicate keys within one tool, function name casing,
 * a description argument that is not a string literal, and using fromAi()
 * where the connector never populates toolCall (non-entry elements, output
 * mappings, sequence flow conditions, non-agentic or non-AHSP contexts).
 * Reports once per violation.
 *
 * Both the key and description arguments are parsed to FEEL AST nodes at
 * tool-schema resolution time, from the deployed process definition, not
 * evaluated against a process instance's variables (confirmed against
 * FromAiTaggedParameterExtractor in camunda/camunda: `parameterName()`
 * requires a `Ref` node and `asString()` requires a `ConstString` node,
 * throwing otherwise; `throwsExceptionWhenValueIsNotAReference` in that
 * repo's test suite confirms this for every non-reference shape it exercises,
 * including a nested function call). A conditional key can never resolve
 * this way, regardless of which branch would be "correct" at runtime, so it
 * has no more legitimate reading than a bare number or null literal used as
 * the key or description.
 *
 * A description that is simply absent (no argument, or an empty string) is
 * valid: the fromAi() description is optional, so neither rule reports it.
 *
 * check() walks every FEEL-bearing property of every node (the same
 * mechanism as the `feel` syntax rule), not just the three surfaces this
 * rule currently reports on. That breadth is deliberate groundwork: the
 * property sweep already sees every candidate site, checkSite() below just
 * doesn't have a message for most of them yet.
 */
// ─── Constraint validators ────────────────────────────────────────────────────

function validateKeyArg(arg) {
  switch (arg.type) {
  case 'StringLiteral':
    return {
      message: `fromAi() key must be a FEEL path, not a string literal. Remove the quotes around ${arg.text}.`,
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  case 'null':
    return {
      message: 'fromAi() key must be a FEEL path starting with "toolCall.", not null.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  case 'NumericLiteral':
    return {
      message: 'fromAi() key must be a FEEL path starting with "toolCall.", not a number.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  case 'ArithmeticExpression':
    return {
      message: 'fromAi() key must be a FEEL path starting with "toolCall.", not an arithmetic expression.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  case 'FilterExpression':
    return {
      message: 'fromAi() key must use dot notation, not bracket notation. Use toolCall.name instead of toolCall["name"].',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  case 'VariableName':
    return {
      message: `fromAi() key must start with "toolCall.". Use toolCall.${arg.text} instead of a bare name.`,
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_PREFIX_MISSING },
    };
  case 'PathExpression': {
    if (!arg.text.startsWith('toolCall.')) {
      return {
        message: `fromAi() key must start with "toolCall.". Got ${arg.text}.`,
        data: { type: ERROR_TYPES.AGENT_FEEL_KEY_PREFIX_MISSING },
      };
    }

    // The connector uses the LAST path segment as the parameter name, so a
    // nested key like toolCall.input.filter reads a path it never populates.
    const segments = arg.text.split('.');
    if (segments.length > 2) {
      return {
        message: `fromAi() key must be a single name under toolCall. Use toolCall.${ segments[ segments.length - 1 ] } instead of ${ arg.text }.`,
        data: { type: ERROR_TYPES.AGENT_FEEL_KEY_SEGMENTS_INVALID },
      };
    }
    return null;
  }
  case 'IfExpression':
    return {
      message: 'fromAi() key must be a FEEL path starting with "toolCall.", not a conditional expression. The connector requires a plain reference regardless of which branch would apply at runtime.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  default:
    return {
      message: `fromAi() key must be a FEEL path starting with "toolCall.", not a ${arg.type}.`,
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  }
}

/**
 * Any non-string-literal description (a bare number, null, a variable
 * reference, or any other expression) has no legitimate reading: the
 * connector requires a literal string to build the tool schema and throws
 * otherwise, so there is no case where a non-literal description works.
 */
function validateDescriptionTypeInvalid(arg) {
  if (arg.type !== 'StringLiteral') {
    return {
      message: 'fromAi() description must be a string literal: a quoted string describing what the agent should provide.',
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TYPE_INVALID },
    };
  }
  return null;
}

// ─── Rule ─────────────────────────────────────────────────────────────────────

module.exports = skipInNonExecutableProcess(function(config = {}) {
  const { version } = config;

  function check(node, reporter) {

    // Expression wrappers (conditionExpression, completionCondition, timer
    // definitions) are swept from their owner via unwrapExpression instead;
    // visiting them again here would double-report the same call.
    if (is(node, 'bpmn:Expression')) {
      return;
    }

    if (is(node, 'bpmn:Activity')) {

      // No early return: an activity (e.g. an ad-hoc sub-process with a
      // completionCondition) can also carry FEEL-bearing properties of its
      // own, which the sweep below still needs to see.
      checkDuplicateKeys(node, reporter);
    }

    const owner = findParentNode(node);
    if (!owner) {
      return;
    }

    const errors = [];

    for (const site of collectFromAiSites(node, owner)) {
      errors.push(...checkSite(site, owner));
    }

    if (errors.length) {
      reportErrors(owner, reporter, errors);
    }
  }

  return annotateRule('agent-fromai-contract', {
    check
  });

  /**
   * Every own property of `node` that carries a parseable fromAi()
   * invocation, with the moddle path to report it against already resolved.
   */
  function collectFromAiSites(node, owner) {
    const sites = [];

    Object.entries(node).forEach(([ propertyName, rawValue ]) => {
      const value = unwrapExpression(rawValue);

      if (!isFeelBearingProperty(node, propertyName, value)) {
        return;
      }

      const expr = value.substring(1).trim();
      const invocations = findFunctionInvocations(expr);
      if (!invocations.length) {
        return;
      }

      sites.push({
        node,
        propertyName,
        expr,
        invocations,
        path: pathConcat(getPath(node, owner) || [], propertyName)
      });
    });

    return sites;
  }

  /**
   * Dispatches a site to its surface-specific check. This PR only recognizes
   * the three surfaces the rule already reports on; every other site the
   * sweep finds (e.g. a fromAi() in a task's Retries field) is silently
   * ignored for now. See the module docblock.
   */
  function checkSite(site, owner) {
    if (is(site.node, 'zeebe:Input') && site.propertyName === 'source') {
      return checkInputSite(site, owner);
    }

    if (is(site.node, 'zeebe:Output') && site.propertyName === 'source') {
      return checkOutputSite(site, owner);
    }

    if (is(site.node, 'bpmn:SequenceFlow') && site.propertyName === 'conditionExpression') {
      return checkConditionSite(site, owner);
    }

    return [];
  }

  function checkInputSite(site, task) {
    const { invocations, expr, path } = site;

    const ahsp = findAncestorAdHocSubProcess(task);

    if (!ahsp) {
      return invocations.map(() => ({
        message: 'fromAi() should only be used inside an agentic sub-process.',
        data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
        path,
      }));
    }

    if (!isAgenticAdHocSubProcess(ahsp, version)) {
      const ahspLabel = ahsp.get('name') || ahsp.get('id');
      return invocations.map(() => ({
        message: `The "${ahspLabel}" sub-process is not marked as agentic, so fromAi() has no effect.`,
        data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
        path,
      }));
    }

    // The connector resolves fromAi() only on the tool's entry element: the
    // root node sitting DIRECTLY inside the AHSP. A call is ignored at runtime
    // either when the element has an incoming flow (it is downstream of the
    // root) or when it is nested below the AHSP (e.g. a task inside a
    // sub-process tool, whose parent is the sub-process, not the AHSP).
    const incoming = task.get('incoming') || [];
    if (incoming.length > 0 || task.$parent !== ahsp) {
      return invocations.map(() => ({
        message: 'fromAi() is ignored here: only the tool\'s entry element defines AI inputs. Define it there and read the toolCall variable directly.',
        data: { type: ERROR_TYPES.AGENT_FEEL_NON_ENTRY_ELEMENT },
        path,
      }));
    }

    // Inside agentic AHSP, on the entry element: run structural checks.
    const errors = [];

    for (const inv of invocations) {

      // Check for casing typo in function name.
      if (inv.name !== CORRECT_NAME && NAME_ALIASES.includes(inv.name.toLowerCase())) {
        errors.push({
          message: `Wrong function name "${inv.name}". Use ${CORRECT_NAME} (case-sensitive).`,
          data: { type: ERROR_TYPES.AGENT_FEEL_FUNCTION_NAME_INVALID },
        });
        continue;
      }

      const args = getPositionalArgs(inv.node, expr);

      if (args.length === 0) {
        errors.push({
          message: 'fromAi() requires a key argument: a FEEL path like toolCall.url.',
          data: { type: ERROR_TYPES.AGENT_FEEL_KEY_MISSING },
        });
        continue;
      }

      const keyError = validateKeyArg(args[0]);
      if (keyError) {
        errors.push(keyError);
      }

      if (args.length >= 2) {
        const descriptionError = validateDescriptionTypeInvalid(args[1]);
        if (descriptionError) {
          errors.push(descriptionError);
        }
      }
    }

    return errors.map(error => ({ ...error, path }));
  }

  /**
   * fromAi() only defines tool inputs; the connector reads it from input
   * mappings and never populates toolCall on the output side, so a fromAi()
   * call in an output source silently resolves to null. Scoped to agentic
   * ad-hoc sub-processes to avoid firing on unrelated diagrams.
   */
  function checkOutputSite(site, task) {
    const { invocations, path } = site;

    const ahsp = findAncestorAdHocSubProcess(task);
    if (!ahsp || !isAgenticAdHocSubProcess(ahsp, version)) {
      return [];
    }

    return invocations.map(() => ({
      message: 'fromAi() defines a tool input and has no effect in an output mapping. Define it in an input mapping on the tool\'s entry element.',
      data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
      path,
    }));
  }

  /**
   * The toolCall context is only populated for a tool's inputs, so fromAi() in
   * a sequence flow condition resolves to null and the branch never behaves as
   * intended. Scoped to agentic ad-hoc sub-processes.
   */
  function checkConditionSite(site, flow) {
    const { invocations, path } = site;

    const ahsp = findAncestorAdHocSubProcess(flow);
    if (!ahsp || !isAgenticAdHocSubProcess(ahsp, version)) {
      return [];
    }

    return invocations.map(() => ({
      message: 'fromAi() defines a tool input and cannot be used in a sequence flow condition. Define it in an input mapping on the tool\'s entry element.',
      data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
      path,
    }));
  }

  /**
   * The connector combines all fromAi() definitions of the tool's entry
   * element into one input schema, so a key declared twice collides. Reports
   * once per duplicated key on the entry activity.
   */
  function checkDuplicateKeys(task, reporter) {
    const incoming = task.get('incoming') || [];
    if (incoming.length > 0) {
      return;
    }

    const ahsp = findAncestorAdHocSubProcess(task);
    if (!ahsp || !isAgenticAdHocSubProcess(ahsp, version)) {
      return;
    }

    // Only the tool's entry element (directly inside the AHSP) defines inputs;
    // a nested task's fromAi() is ignored at runtime, so its keys are moot and
    // the main check already reports it as a non-entry call.
    if (task.$parent !== ahsp) {
      return;
    }

    const ioMapping = findExtensionElement(task, 'zeebe:IoMapping');
    if (!ioMapping) {
      return;
    }

    const keyOccurrences = {};

    for (const input of ioMapping.get('inputParameters') || []) {
      const source = input.get('source');
      if (!source || !source.startsWith('=')) {
        continue;
      }

      const expr = source.substring(1).trim();
      for (const inv of findFunctionInvocations(expr)) {
        const args = getPositionalArgs(inv.node, expr);
        const key = args[ 0 ];
        if (key && key.type === 'PathExpression' && key.text.startsWith('toolCall.')) {
          (keyOccurrences[ key.text ] = keyOccurrences[ key.text ] || []).push(input);
        }
      }
    }

    const duplicates = Object.keys(keyOccurrences).filter(key => keyOccurrences[ key ].length > 1);

    if (duplicates.length) {
      reportErrors(task, reporter, duplicates.map(key => ({
        message: `fromAi() key ${ key } is declared more than once in this tool. Declare it once and reference it directly elsewhere.`,
        data: { type: ERROR_TYPES.AGENT_FEEL_KEY_DUPLICATE },
        paths: keyOccurrences[ key ].map(input => pathConcat(getPath(input, task), 'source')),
      })));
    }
  }
});
