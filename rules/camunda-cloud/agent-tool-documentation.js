const { is } = require('bpmnlint-utils');

const { findExtensionElement, findAncestorAdHocSubProcess } = require('../utils/element');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

const DOCS_URL = 'https://docs.camunda.io/docs/components/modeler/bpmn/agent-tools/';

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:FlowNode')) {
      return;
    }

    const ahsp = findAncestorAdHocSubProcess(node);
    if (!ahsp || !findExtensionElement(ahsp, 'zeebe:AdHoc')) {
      return;
    }

    const docs = node.get('documentation') || [];
    const text = docs.map(d => d.get('text') || '').join('').trim();

    if (!text) {
      reportErrors(node, reporter, [
        {
          message: `Tool documentation is missing. Describe what this tool does so the agent knows when to use it. See ${DOCS_URL}`,
          data: { type: ERROR_TYPES.AGENT_TOOL_DOCUMENTATION_MISSING },
        },
      ]);
    }
  }

  return annotateRule('agent-tool-documentation', {
    check
  });
});
