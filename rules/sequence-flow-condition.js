const { isAny } = require('bpmnlint-utils');

const { hasProperties } = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

module.exports = function() {
  function check(node, reporter) {
    if (!isAny(node, [ 'bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway' ])) {
      return;
    }

    const outgoing = node.get('outgoing');

    if (outgoing && outgoing.length > 1) {
      for (let sequenceFlow of outgoing) {
        if (node.get('default') !== sequenceFlow) {
          const errors = hasProperties(sequenceFlow, {
            conditionExpression: {
              required: true
            }
          }, sequenceFlow);

          if (errors.length) {
            reportErrors(sequenceFlow, reporter, errors);
          }
        }
      }
    }
  }

  return {
    check
  };
};