const { is } = require('bpmnlint-utils');

const {
  findExtensionElement,
  hasProperties
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

module.exports = function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:UserTask')) {
      return;
    }

    const assignmentDefinition = findExtensionElement(node, 'zeebe:AssignmentDefinition');

    if (!assignmentDefinition) {
      return;
    }

    const errors = hasProperties(assignmentDefinition, {
      candidateUsers: {
        allowed: false,
        allowedVersion: '8.2'
      }
    }, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
};