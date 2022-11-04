const { is } = require('bpmnlint-utils');

const { ERROR_TYPES } = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

module.exports = function() {
  function check(di, reporter) {

    if (!isCollapsedSubProcess(di)) {
      return;
    }

    const node = di.bpmnElement;

    const error = {
      message: `A <${ node.$type }> must be expanded.`,
      data: {
        type: ERROR_TYPES.ELEMENT_COLLAPSED_NOT_ALLOWED,
        node: node,
        parentNode: null
      }
    };

    reportErrors(node, reporter, error);
  }

  return {
    check
  };
};


function isCollapsedSubProcess(di) {
  return is(di, 'bpmndi:BPMNShape') &&
         is(di.bpmnElement, 'bpmn:SubProcess') &&
         di.get('isExpanded') !== true;
}
