const {
  is,
  isAny
} = require('bpmnlint-utils');

const {
  getEventDefinition,
  hasProperties
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { greaterOrEqual } = require('../utils/version');
const { annotateRule } = require('../helper');

const NO_ERROR_REF_ALLOWED_VERSION = '8.2';

module.exports = skipInNonExecutableProcess(function({ version }) {
  function check(node, reporter) {
    if (!isAny(node, [ 'bpmn:CatchEvent', 'bpmn:ThrowEvent' ])) {
      return;
    }

    const eventDefinition = getEventDefinition(node);

    if (!eventDefinition || !is(eventDefinition, 'bpmn:ErrorEventDefinition')) {
      return;
    }

    let errors = [];

    if (!isNoErrorRefAllowed(node, version)) {
      errors = hasProperties(eventDefinition, {
        errorRef: {
          required: true,
          allowedVersion: '8.2'
        }
      }, node);

      if (errors.length) {
        reportErrors(node, reporter, errors);

        return;
      }
    }

    const errorRef = eventDefinition.get('errorRef');

    if (!errorRef) {
      return;
    }

    errors = hasProperties(errorRef, {
      errorCode: {
        required: true
      }
    }, node);

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return annotateRule('error-reference', {
    check
  });
});

function isNoErrorRefAllowed(node, version) {
  return is(node, 'bpmn:CatchEvent') && greaterOrEqual(version, NO_ERROR_REF_ALLOWED_VERSION);
}