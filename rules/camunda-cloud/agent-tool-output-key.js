const { is } = require('bpmnlint-utils');

const { findAncestorAdHocSubProcess, isAgenticAdHocSubProcess } = require('../utils/element');
const { reportErrors, getName } = require('../utils/reporter');
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
 * The rule warns once per tool: on the element that actually miswrote a
 * result-shaped variable, when the tool flow writes some but none of them is
 * `toolCallResult` (misdirection or wrong casing); on the entry activity when
 * the flow writes none at all, since there's no single offending element to
 * point to (the agent gets no completion signal and may retry or hallucinate
 * an outcome). Results written from arbitrary FEEL expressions are not
 * statically detectable.
 */
module.exports = skipInNonExecutableProcess(function(config = {}) {
  const { version } = config;
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
    if (!ahsp || !isAgenticAdHocSubProcess(ahsp, version)) {
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
      const casingMismatch = channels.find(isToolCallResultCasingMismatch);

      if (casingMismatch) {
        reportErrors(casingMismatch.element, reporter, {
          message: `Wrong casing "${getCasingMismatchText(casingMismatch)}": use toolCallResult (case-sensitive).`,
          data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID },
          propertiesPanel: { entryIds: [ 'outputs' ] },
        });
        return;
      }

      // Every channel here is a miswrite (none matched toolCallResult), so
      // the first one is a real misdirected write; report on the element
      // that actually wrote it, not the tool's entry.
      const misdirected = channels[ 0 ];
      reportErrors(misdirected.element, reporter, {
        message: '"toolCallResult" output is not mapped.',
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
        propertiesPanel: { entryIds: [ 'outputs' ] },
      });
      return;
    }

    // toolCallResult is set somewhere, but assigning it more than once
    // overwrites the earlier value. Part contributions (toolCallResult.part)
    // and the context put(toolCallResult, ...) accumulation pattern are
    // exempt; every other full write after the first one is flagged.
    const fullWrites = channels.filter(isToolCallResultChannel).filter(isFullOverwriteChannel);

    for (let i = 1; i < fullWrites.length; i++) {
      const overwriter = fullWrites[ i ];
      const overwritten = fullWrites[ i - 1 ];
      const overwrittenLabel = getName(overwritten.element) || overwritten.element.get('id');

      reportErrors(overwriter.element, reporter, {
        message: `This overwrites the "toolCallResult" value set on "${overwrittenLabel}".`,
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_OVERWRITE },
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
 * @returns {Object[]} channels as { kind, value, element }, element being
 * whichever element in the flow actually wrote this channel
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

    // Boundary events can define alternate tool paths that still contribute outputs.
    const parent = element.$parent;
    const siblings = parent && parent.get && parent.get('flowElements');
    for (const boundary of siblings || []) {
      if (is(boundary, 'bpmn:BoundaryEvent') && boundary.get('attachedToRef') === element) {
        queue.push(boundary);
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
        channels.push({ kind: 'output', value: output.get('target') || '', source: output.get('source'), element });
      }
    }

    if (is(value, 'zeebe:Script') || is(value, 'zeebe:CalledDecision')) {
      const resultVariable = value.get('resultVariable');
      if (resultVariable) {
        channels.push({ kind: 'resultVariable', value: resultVariable, element });
      }
    }

    if (is(value, 'zeebe:TaskHeaders')) {
      for (const header of value.get('values') || []) {
        const key = header.get('key');
        if (key === 'resultVariable') {
          channels.push({ kind: 'resultVariable', value: header.get('value') || '', element });
        }
        if (key === 'resultExpression') {
          channels.push({ kind: 'resultExpression', value: header.get('value') || '', element });
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

// A same-letters, wrong-case variant of toolCallResult (e.g. toolcallresult,
// TOOLCALLRESULT), not any other typo. Mirrors agent-fromai-contract's
// case-insensitive name matching for fromAi().
function isToolCallResultCasingMismatch({ kind, value }) {
  if (kind === 'resultExpression') {
    return /\btoolcallresult\b/i.test(value) && !/\btoolCallResult\b/.test(value);
  }

  const lower = value.toLowerCase();
  const isCasingVariant = lower === 'toolcallresult' || lower.startsWith('toolcallresult.');

  return isCasingVariant && !isToolCallResultChannel({ kind, value });
}

// The mismatched word itself, not the whole expression, for resultExpression
// channels (a connector header value is a full FEEL expression, e.g.
// `={toolcallresult: response.body}`).
function getCasingMismatchText({ kind, value }) {
  if (kind === 'resultExpression') {
    const match = value.match(/\btoolcallresult\b/i);
    return match ? match[0] : value;
  }

  return value;
}

// The documented safe-accumulation pattern for combining several elements'
// contributions into one toolCallResult: `context put(toolCallResult, ...)`.
// Only meaningful for output mappings; connectors and script/decision result
// variables can't read the prior value, so they can never accumulate this way.
const CONTEXT_PUT_TOOL_CALL_RESULT = /^=?\s*context\s+put\s*\(\s*toolCallResult\s*,/;

// Whether this channel fully replaces toolCallResult, as opposed to
// contributing one field (toolCallResult.part) or safely appending to the
// existing value via context put(). Only meaningful for channels that
// already passed isToolCallResultChannel.
function isFullOverwriteChannel({ kind, value, source }) {
  if (kind === 'resultExpression' || kind === 'resultVariable') {
    return true;
  }

  if (value !== 'toolCallResult') {
    return false;
  }

  return !CONTEXT_PUT_TOOL_CALL_RESULT.test(source || '');
}
