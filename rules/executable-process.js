const { is } = require('bpmnlint-utils');

const { hasProperties } = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

module.exports = function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:Definitions')) {
      return;
    }

    const rootElements = node.get('rootElements'),
          processes = rootElements.filter(rootElement => is(rootElement, 'bpmn:Process'));

    let errors = [];

    for (const process of processes) {
      errors = [
        ...errors,
        ...hasProperties(process, {
          isExecutable: {
            value: true
          }
        }, process)
      ];
    }

    if (errors.length > processes.length - 1) {
      reportErrors(errors[ 0 ].data.node, reporter, errors[ 0 ]);
    }
  }

  return {
    check
  };
};