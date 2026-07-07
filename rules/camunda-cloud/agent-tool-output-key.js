const { is } = require('bpmnlint-utils');

const { findAncestorAdHocSubProcess, isAgenticAdHocSubProcess } = require('../utils/element');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

/**
 * A tool inside an agentic ad-hoc sub-process returns its result through the
 * `toolCallResult` variable. The result can be set at any point in the tool's
 * flow and through several channels: an output mapping (target `toolCallResult`
 * or a part like `toolCallResult.statusCode`), a script task or called decision
 * `resultVariable`, or a connector `resultVariable`/`resultExpression` header.
 *
 * The rule warns once per tool, on the entry activity: when the tool flow
 * writes result-shaped variables but none of them is `toolCallResult`
 * (misdirection), or when it writes none at all (the agent gets no completion
 * signal and may retry or hallucinate an outcome). Results written from
 * arbitrary FEEL expressions are not statically detectable.
 */
module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:Activity')) {
      return;
    }

    if (is(node, 'bpmn:SubProcess') && node.get('triggeredByEvent')) {
      return;
    }

    // Only evaluate tool entry points (no incoming sequence flows); the whole
    // tool flow is inspected from here.
    const incoming = node.get('incoming') || [];
    if (incoming.length > 0) {
      return;
    }

    const ahsp = findAncestorAdHocSubProcess(node);
    if (!ahsp || !isAgenticAdHocSubProcess(ahsp)) {
      return;
    }

    const channels = collectResultChannels(node);

    if (!channels.length) {
      reportErrors(node, reporter, {
        message: 'Tool returns nothing to the agent. Set a "toolCallResult" (at minimum, note the task completed).',
        data: { type: ERROR_TYPES.AGENT_TOOL_RESULT_MISSING },
        propertiesPanel: { entryIds: [ 'outputs' ] },
      });
      return;
    }

    const hasResult = channels.some(isToolCallResultChannel);
    if (!hasResult) {
      reportErrors(node, reporter, {
        message: '"toolCallResult" output is not mapped.',
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
        propertiesPanel: { entryIds: [ 'outputs' ] },
      });
    }
  }

  return annotateRule('agent-tool-output-key', {
    check
  });
});

/**
 * Collect all result-channel writes across the tool flow: the entry element,
 * everything reachable through outgoing sequence flows, and the contents of
 * embedded sub-processes.
 *
 * @param {ModdleElement} entry
 *
 * @returns {Object[]} channels as { kind, value }
 */
function collectResultChannels(entry) {
  const channels = [],
        visited = new Set(),
        queue = [ entry ];

  while (queue.length) {
    const element = queue.shift();

    const id = element.get('id');
    if (id && visited.has(id)) {
      continue;
    }
    visited.add(id);

    collectElementChannels(element, channels);

    for (const flow of element.get('outgoing') || []) {
      const target = flow.get('targetRef');
      if (target) {
        queue.push(target);
      }
    }

    if (is(element, 'bpmn:SubProcess')) {
      for (const child of element.get('flowElements') || []) {
        if (is(child, 'bpmn:FlowNode')) {
          queue.push(child);
        }
      }
    }
  }

  return channels;
}

function collectElementChannels(element, channels) {
  const extensionElements = element.get('extensionElements');
  if (!extensionElements) {
    return;
  }

  for (const value of extensionElements.get('values')) {
    if (is(value, 'zeebe:IoMapping')) {
      for (const output of value.get('outputParameters') || []) {
        channels.push({ kind: 'output', value: output.get('target') || '' });
      }
    }

    if (is(value, 'zeebe:Script') || is(value, 'zeebe:CalledDecision')) {
      const resultVariable = value.get('resultVariable');
      if (resultVariable) {
        channels.push({ kind: 'resultVariable', value: resultVariable });
      }
    }

    if (is(value, 'zeebe:TaskHeaders')) {
      for (const header of value.get('values') || []) {
        const key = header.get('key');
        if (key === 'resultVariable') {
          channels.push({ kind: 'resultVariable', value: header.get('value') || '' });
        }
        if (key === 'resultExpression') {
          channels.push({ kind: 'resultExpression', value: header.get('value') || '' });
        }
      }
    }
  }
}

function isToolCallResultChannel({ kind, value }) {
  if (kind === 'resultExpression') {
    return /\btoolCallResult\b/.test(value);
  }

  return value === 'toolCallResult' || value.startsWith('toolCallResult.');
}
