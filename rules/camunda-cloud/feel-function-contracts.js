const { is } = require('bpmnlint-utils');

const { parser } = require('@bpmn-io/lezer-feel');

const { findExtensionElement, findAncestorAdHocSubProcess } = require('../utils/element');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

/**
 * Validates agent FEEL function contracts on input mappings inside agentic
 * ad-hoc sub-processes. For fromAi(): the key must be a FEEL path starting
 * with `toolCall.`, the function name is case-sensitive, and a string-literal
 * description is expected (the LLM uses it to supply the value). Extra
 * arguments (type, schema, options) are part of the documented signature and
 * are not validated. Reports once per fromAi() invocation.
 */
const CORRECT_NAME = 'fromAi';


/**
 * Function registry — each agent FEEL function declares its parameter spec.
 * Adding a new function here makes the generic rule validate it automatically.
 */
const AGENT_FUNCTION_SPECS = {
  fromAi: {

    // Casing aliases detected as typos (name ≠ canonical → offer fix).
    aliases: [ 'fromai', 'fromAI' ],
    params: [
      {
        name: 'key',
        type: 'feel-path',
        required: true,
        constraints: [ 'no-string-literal', 'no-null', 'no-numeric', 'no-arithmetic', 'no-bracket', 'toolCall-prefix' ],
      },
      {
        name: 'description',
        type: 'string-literal',
        required: false,
        absentSeverity: 'warn',
        constraints: [ 'is-string-literal', 'min-words', 'not-weak' ],
      },
    ],
  },
};

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
        if (Object.keys(AGENT_FUNCTION_SPECS).some(fn => fn.toLowerCase() === nameLower)) {
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

function validateKeyArg(arg, taskId) {
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

    // Conditional key — ambiguous; explain-only warning.
    return {
      message: 'fromAi() key uses a conditional expression. Ensure at least one branch resolves to a toolCall.* path.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_CONDITIONAL },
    };
  default:
    return null;
  }
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
    if (is(node, 'bpmn:Activity')) {
      checkDuplicateKeys(node, reporter);
      return;
    }

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

    // Properties-panel entry for this input parameter, so clicking the report
    // opens the right mapping (id convention: {elementId}-input-{index}-source).
    const inputIndex = (node.$parent.get('inputParameters') || []).indexOf(node);
    const propertiesPanel = {
      entryIds: [ `${ task.get('id') }-input-${ inputIndex }-source` ]
    };

    const ahsp = findAncestorAdHocSubProcess(task);

    if (!ahsp) {
      reportErrors(task, reporter, invocations.map(() => ({
        message: 'fromAi() should only be used inside an agentic sub-process.',
        data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
        propertiesPanel,
      })));
      return;
    }

    if (!findExtensionElement(ahsp, 'zeebe:AdHoc')) {
      reportErrors(task, reporter, invocations.map(() => ({
        message: 'This sub-process is not configured as agentic. Add zeebe:AdHoc to use agent tool contracts.',
        data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
        propertiesPanel,
      })));
      return;
    }

    // The connector resolves fromAi() only on the tool's entry element (the
    // root node of the sub-flow); calls on downstream elements are ignored at
    // runtime.
    const incoming = task.get('incoming') || [];
    if (incoming.length > 0) {
      reportErrors(task, reporter, invocations.map(() => ({
        message: 'fromAi() is ignored here: only the tool\'s entry element defines AI inputs. Define it there and read the toolCall variable directly.',
        data: { type: ERROR_TYPES.AGENT_FEEL_NON_ENTRY_ELEMENT },
        propertiesPanel,
      })));
      return;
    }

    // Inside agentic AHSP — run full contract checks.
    const errors = [];

    for (const inv of invocations) {

      // Check for casing typo in function name.
      const spec = AGENT_FUNCTION_SPECS[CORRECT_NAME];
      if (inv.name !== CORRECT_NAME && spec.aliases.includes(inv.name.toLowerCase())) {
        errors.push({
          message: `Wrong function name "${inv.name}" — use ${CORRECT_NAME} (case-sensitive).`,
          data: { type: ERROR_TYPES.AGENT_FEEL_FUNCTION_NAME_INVALID },
        });
        continue;
      }

      const args = getPositionalArgs(inv.node, expr);

      if (args.length === 0) {
        errors.push({
          message: 'fromAi() requires a key argument — a FEEL path like toolCall.url.',
          data: { type: ERROR_TYPES.AGENT_FEEL_KEY_MISSING },
        });
        continue;
      }

      const keyError = validateKeyArg(args[0], task.id);
      if (keyError) {
        errors.push(keyError);
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
    if (!ahsp || !findExtensionElement(ahsp, 'zeebe:AdHoc')) {
      return;
    }

    const ioMapping = findExtensionElement(task, 'zeebe:IoMapping');
    if (!ioMapping) {
      return;
    }

    const keyCounts = {};

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
          keyCounts[ key.text ] = (keyCounts[ key.text ] || 0) + 1;
        }
      }
    }

    const duplicates = Object.keys(keyCounts).filter(key => keyCounts[ key ] > 1);

    if (duplicates.length) {
      reportErrors(task, reporter, duplicates.map(key => ({
        message: `fromAi() key ${ key } is declared more than once in this tool. Declare it once and reference it directly elsewhere.`,
        data: { type: ERROR_TYPES.AGENT_FEEL_KEY_DUPLICATE },
        propertiesPanel: { entryIds: [ 'inputs' ] },
      })));
    }
  }
});
