const { is } = require('bpmnlint-utils');

const { getPath, pathConcat } = require('@bpmn-io/moddle-utils');

const {
  findExtensionElement,
  findAncestorAdHocSubProcess,
  isAgenticAdHocSubProcess,
  isAgenticToolElement,
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
 * mechanism as the `feel` syntax rule), not just an input mapping source.
 * This is deliberate: fromAi() is only ever DECLARED as a tool parameter in
 * an input mapping on the tool's entry element (AdHocSubProcessTransformer
 * in camunda/camunda extracts tagged parameters only from
 * `adHocActivity.getInputMappings()`), but the resulting `toolCall` variable
 * is READABLE anywhere in that tool's sub-flow once activated
 * (BpmnAdHocSubProcessBehavior#activateElement merges it as a local variable
 * on the ad-hoc sub-process's inner instance). So a fromAi() call outside an
 * input mapping is not automatically dead: `fromAi(toolCall.retries)` in a
 * task's Retries field is genuinely correct if `toolCall.retries` was
 * declared by a fromAi() call in an input mapping on the same tool. What is
 * always broken is a fromAi(toolCall.KEY, ...) whose KEY was declared
 * nowhere: the schema never gets that parameter, so the call always
 * resolves to null. checkSite() below is key-aware for exactly this reason.
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
   * Dispatches a site to its surface-specific check, first rung wins:
   *
   *   1. the owner is the agent itself (not a tool): toolCall lives on the
   *      tool's inner instance, a child scope the agent's own properties
   *      never see, regardless of which property this is.
   *   2. an input mapping source: the existing context-then-structure ladder.
   *   3. anything else: key-aware, see checkNonInputSite.
   */
  function checkSite(site, owner) {
    if (isAgentItself(owner, version)) {
      return site.invocations.map(() => ({
        message: 'fromAi() defines a tool input and has no effect on the agent sub-process itself. Define it on a tool inside this sub-process.',
        data: {
          type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
          node: site.node,
          parentNode: owner,
          property: site.propertyName
        },
        path: site.path,
      }));
    }

    if (is(site.node, 'zeebe:Input') && site.propertyName === 'source') {
      return checkInputSite(site, owner);
    }

    return checkNonInputSite(site, owner);
  }

  /**
   * `owner` is the agent's own ad-hoc sub-process, not a tool inside it: an
   * agentic AHSP that is not itself a tool of some outer agent. A nested
   * agentic AHSP that IS a tool of an outer agent is excluded here: it is an
   * ad-hoc activity of that outer agent, so fromAi() in its own input
   * mappings is a live tool-input declaration, handled by checkInputSite.
   */
  function isAgentItself(owner, version) {
    return is(owner, 'bpmn:AdHocSubProcess')
      && isAgenticAdHocSubProcess(owner, version)
      && !isAgenticToolElement(owner, version);
  }

  /**
   * A human label for where this site sits, used only to phrase the
   * undeclared-key message. Falls back to naming the raw property.
   */
  function getSurfaceLabel(node, propertyName) {
    if (is(node, 'zeebe:Output') && propertyName === 'source') {
      return 'this output mapping';
    }

    if (is(node, 'bpmn:SequenceFlow') && propertyName === 'conditionExpression') {
      return 'this sequence flow condition';
    }

    return `the <${propertyName}> property`;
  }

  /**
   * Any property other than an input mapping source. fromAi(toolCall.KEY, ...)
   * here is valid only if KEY was already declared by a fromAi() call in an
   * input mapping on the same tool; declaration is looked up per-element when
   * `owner` is itself a tool's entry element (exact: that element's own input
   * mappings are the only source `AdHocSubProcessTransformer` would ever
   * read for it), and as a union across every tool entry in the ad-hoc
   * sub-process otherwise (an approximation: finding the true owning tool
   * for a downstream element or a sequence flow would need a backward walk
   * over sequence flows, which agent-tool-output-key.js already documents as
   * unsolved for splits and joins; the union only under-reports, it never
   * over-reports, which is the right side to err on for a fixed-error rule).
   */
  function checkNonInputSite(site, owner) {
    const { node, propertyName, expr, invocations, path } = site;

    const surfaceLabel = getSurfaceLabel(node, propertyName);
    const ahsp = findAncestorAdHocSubProcess(owner);
    const declaredKeys = (ahsp && isAgenticAdHocSubProcess(ahsp, version))
      ? (isAgenticToolElement(owner, version)
        ? getOwnDeclaredKeys(owner)
        : getAhspDeclaredKeys(ahsp))
      : null;

    const errors = [];

    for (const inv of invocations) {
      const args = getPositionalArgs(inv.node, expr);
      const keyArg = args[0];
      const keyText = (keyArg && keyArg.type === 'PathExpression' && keyArg.text.startsWith('toolCall.'))
        ? keyArg.text
        : null;

      if (keyText && declaredKeys && declaredKeys.has(keyText)) {
        continue;
      }

      const subject = keyText || 'this value';

      errors.push({
        message: `fromAi() only defines a tool input in an input mapping, so ${subject} is never provided and ${surfaceLabel} resolves to null. Declare it in an input mapping on the tool's entry element, then read ${subject} here.`,
        data: {
          type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT,
          node,
          parentNode: owner,
          property: propertyName
        },
        path,
      });
    }

    return errors;
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
   * fromAi() key paths declared by input-mapping sources directly on this
   * activity, grouped by key with every declaring input, regardless of
   * whether this activity is the tool's entry element. Shared by
   * checkDuplicateKeys, which cares about repeats, and getOwnDeclaredKeys,
   * which cares only about membership.
   */
  function collectOwnDeclaredKeyOccurrences(activity) {
    const ioMapping = findExtensionElement(activity, 'zeebe:IoMapping');
    if (!ioMapping) {
      return {};
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

    return keyOccurrences;
  }

  /**
   * The exact declaration set for one activity: every fromAi() key its own
   * input mappings declare, regardless of whether it is a tool's entry
   * element. Used as-is when the site being checked lives directly on that
   * activity (no approximation needed there).
   */
  function getOwnDeclaredKeys(activity) {
    return new Set(Object.keys(collectOwnDeclaredKeyOccurrences(activity)));
  }

  /**
   * The union of declared keys across every tool entry element directly
   * inside this ad-hoc sub-process. Used for a site that is not itself a
   * tool's entry element (a downstream element, or a sequence flow), where
   * the true owning tool would need a backward walk over sequence flows to
   * find precisely; see checkNonInputSite for why the union is the right
   * approximation.
   */
  function getAhspDeclaredKeys(ahsp) {
    const keys = new Set();

    for (const child of ahsp.get('flowElements') || []) {
      if (!isAgenticToolElement(child, version)) {
        continue;
      }

      for (const key of getOwnDeclaredKeys(child)) {
        keys.add(key);
      }
    }

    return keys;
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

    const keyOccurrences = collectOwnDeclaredKeyOccurrences(task);
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
