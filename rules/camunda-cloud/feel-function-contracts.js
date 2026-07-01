const { is } = require('bpmnlint-utils');

const { parser } = require('@bpmn-io/lezer-feel');

const { findExtensionElement, findAncestorAdHocSubProcess } = require('../utils/element');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

const DOCS_URL = 'https://docs.camunda.io/docs/components/modeler/bpmn/agent-tools/';
const CORRECT_NAME = 'fromAi';

// Descriptions shorter than this are flagged as too weak for model guidance.
const MIN_DESCRIPTION_WORDS = 5;

// Patterns that match descriptions too generic to guide the model.
const WEAK_DESCRIPTION_PATTERNS = [
  /^gets?\s+data$/i,
  /^calls?\s+api$/i,
  /^calls?\s+rest\s+api$/i,
  /^makes?\s+(a\s+)?request$/i,
  /^returns?\s+(a\s+)?value$/i,
  /^fetches?\s+(the\s+)?result$/i,
];

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
      message: 'fromAi() key must be a FEEL path starting with toolCall., not null.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  case 'NumericLiteral':
    return {
      message: 'fromAi() key must be a FEEL path starting with toolCall., not a number.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  case 'ArithmeticExpression':
    return {
      message: 'fromAi() key must be a FEEL path starting with toolCall., not an arithmetic expression.',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  case 'FilterExpression':
    return {
      message: 'fromAi() key must use dot notation, not bracket notation. Use toolCall.name instead of toolCall["name"].',
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID },
    };
  case 'VariableName':
    return {
      message: `fromAi() key must start with toolCall.. Use toolCall.${arg.text} instead of a bare name.`,
      data: { type: ERROR_TYPES.AGENT_FEEL_KEY_PREFIX_MISSING },
    };
  case 'PathExpression':
    if (!arg.text.startsWith('toolCall.')) {
      return {
        message: `fromAi() key must start with toolCall.. Got ${arg.text}.`,
        data: { type: ERROR_TYPES.AGENT_FEEL_KEY_PREFIX_MISSING },
      };
    }
    return null;
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

  // Check weak patterns first — a 2-word generic phrase is primarily too generic.
  if (WEAK_DESCRIPTION_PATTERNS.some(p => p.test(content))) {
    return {
      message: `fromAi() description "${content}" is too generic — describe specifically what data the agent should supply for this field. See ${DOCS_URL}`,
      data: { type: ERROR_TYPES.AGENT_FEEL_DESCRIPTION_TOO_WEAK },
    };
  }

  const words = content.trim().split(/\s+/).filter(Boolean);
  if (words.length < MIN_DESCRIPTION_WORDS) {
    return {
      message: `fromAi() description "${content}" is too short — add at least ${MIN_DESCRIPTION_WORDS} words so the model understands what to provide. See ${DOCS_URL}`,
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

    if (!ahsp) {
      reportErrors(task, reporter, invocations.map(() => ({
        message: 'fromAi() should only be used inside an agentic sub-process.',
        data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
      })));
      return;
    }

    if (!findExtensionElement(ahsp, 'zeebe:AdHoc')) {
      reportErrors(task, reporter, invocations.map(() => ({
        message: 'This sub-process is not configured as agentic. Add zeebe:AdHoc to use agent tool contracts.',
        data: { type: ERROR_TYPES.AGENT_FEEL_WRONG_CONTEXT },
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
          message: `fromAi() description is missing. Add a string describing what the agent should provide for this parameter. See ${DOCS_URL}`,
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
      reportErrors(task, reporter, errors);
    }
  }

  return annotateRule('feel-function-contracts', {
    check
  });
});
