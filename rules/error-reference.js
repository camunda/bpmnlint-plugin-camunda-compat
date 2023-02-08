const {
  is,
  isAny
} = require('bpmnlint-utils');

const {
  getEventDefinition,
  hasProperties
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

const { skipInNonExecutableProcess } = require('./utils/rule');

const { greaterOrEqual } = require('./utils/version');

module.exports = skipInNonExecutableProcess(function({ version }) {
  function check(node, reporter) {
    if (!isAny(node, [ 'bpmn:CatchEvent', 'bpmn:ThrowEvent' ])) {
      return;
    }

    if (is(node, 'bpmn:CatchEvent') && greaterOrEqual(version, '8.2')) {
      return;
    }

    const eventDefinition = getEventDefinition(node);

    if (!eventDefinition || !is(eventDefinition, 'bpmn:ErrorEventDefinition')) {
      return;
    }

    let errors = hasProperties(eventDefinition, {
      errorRef: {
        required: true,
        allowedVersion: '8.2'
      }
    }, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }

    const errorRef = eventDefinition.get('errorRef');

    errors = hasProperties(errorRef, {
      errorCode: {
        required: true,
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
});