const { is } = require('bpmnlint-utils');

const { hasProperties, ERROR_TYPES } = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

module.exports = function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:InclusiveGateway')) {
      return;
    }

    const incoming = node.get('incoming');

    if (incoming && incoming.length > 1) {
      const error = {
        message: `Element of type <${ node.$type }> must have one property <incoming> of type <bpmn:SequenceFlow>`,
        path: [ 'incoming' ],
        error: {
          type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
          node,
          parentNode: null,
          property: 'incoming'
        }
      };

      reportErrors(node, reporter, error);
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