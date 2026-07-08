const { is } = require('bpmnlint-utils');

const { findAncestorAdHocSubProcess, isAgenticAdHocSubProcess } = require('../utils/element');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

/**
 * The AI agent reads a tool's element documentation to decide which tool to
 * call; without it the LLM falls back to the element name, which is
 * underspecified. This rule warns when a tool entry activity (no incoming
 * sequence flows, not an event sub-process) inside an agentic ad-hoc
 * sub-process has no documentation text.
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

    const incoming = node.get('incoming') || [];
    if (incoming.length > 0) {
      return;
    }

    const ahsp = findAncestorAdHocSubProcess(node);
    if (!ahsp || !isAgenticAdHocSubProcess(ahsp, version)) {
      return;
    }

    const docs = node.get('documentation') || [];
    const text = docs.map(d => d.get('text') || '').join('').trim();

    if (!text) {
      reportErrors(node, reporter, [
        {
          message: 'Tool documentation is missing.',
          data: { type: ERROR_TYPES.AGENT_TOOL_DOCUMENTATION_MISSING },
          propertiesPanel: { entryIds: [ 'documentation' ] },
        },
      ]);
    }
  }

  return annotateRule('agent-tool-documentation', {
    check
  });
});
