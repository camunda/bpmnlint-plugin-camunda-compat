const { is } = require('bpmnlint-utils');

const { findExtensionElement } = require('../utils/element');
const { reportErrors } = require('../utils/reporter');
const { ERROR_TYPES } = require('../utils/error-types');
const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

const CORRECT_TARGET = 'toolCallResult';
const DOCS_URL = 'https://docs.camunda.io/docs/components/modeler/bpmn/agent-tools/';

// Known close typos with an unambiguous fix.
const TYPOS_WITH_FIX = {
  'toolcallresult': CORRECT_TARGET,
  'toolcalresult': CORRECT_TARGET,
};

function findAncestorAHSP(node) {
  let el = node.$parent;
  while (el) {
    if (is(el, 'bpmn:AdHocSubProcess')) {
      return el;
    }
    el = el.$parent;
  }
  return null;
}

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:FlowNode')) {
      return;
    }

    const ahsp = findAncestorAHSP(node);
    if (!ahsp || !findExtensionElement(ahsp, 'zeebe:AdHoc')) {
      return;
    }

    const extensionElements = node.get('extensionElements');
    if (!extensionElements) {
      return;
    }

    const ioMapping = extensionElements.get('values').find(v => is(v, 'zeebe:IoMapping'));
    if (!ioMapping) {
      return;
    }

    const outputs = ioMapping.get('outputParameters') || [];
    const errors = [];

    for (const output of outputs) {
      const target = output.get('target');
      if (!target && target !== '') {
        continue;
      }

      if (target === CORRECT_TARGET) {
        continue;
      }

      if (target === '') {
        errors.push({
          message: `Output mapping target must be "${CORRECT_TARGET}". The target is blank — the agent will not receive the tool result. See ${DOCS_URL}`,
          data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
        });
        continue;
      }

      // FEEL-prefixed: "= toolCallResult" — strip the prefix as the fix.
      if (target.startsWith('=') && target.slice(1).trim() === CORRECT_TARGET) {
        errors.push({
          message: `Output mapping target "${target}" should be a plain string, not a FEEL expression. Remove the "=" prefix.`,
          data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
        });
        continue;
      }

      // Known typo with unambiguous fix.
      const fix = TYPOS_WITH_FIX[target.toLowerCase()];
      if (fix) {
        errors.push({
          message: `Output mapping target "${target}" looks like a typo. Did you mean "${CORRECT_TARGET}"?`,
          data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
        });
        continue;
      }

      // Any other wrong key — no fix offered.
      errors.push({
        message: `Output mapping target must be "${CORRECT_TARGET}" so the agent can receive the tool result. Got "${target}". See ${DOCS_URL}`,
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_INVALID },
      });
    }

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return annotateRule('agent-tool-output-key', {
    check
  });
});
