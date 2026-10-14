const { is } = require('bpmnlint-utils');

const { getPath, pathConcat } = require('@bpmn-io/moddle-utils');

const { getEventDefinition } = require('../utils/element');

const { ERROR_TYPES } = require('../utils/error-types');

const {
  getCycleStartDate,
  parseDate
} = require('../utils/iso8601');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const MESSAGES = {
  timeDate: 'Time date is in the past. Note that the timer will fire right after the deployment. Consider using a future date to start in the future.',
  timeCycle: 'Start date of time cycle is in the past. Note that the timer will fire right after the deployment, and the cycle continues from the deployment time. Consider using a future start date or a cron expression to run on a fixed schedule.'
};

/**
 * Warns about process-level timer start events with a literal date in the past.
 *
 * A `timeDate` or `timeCycle` start date in the past makes the timer fire right
 * after deployment; a cycle then continues from the deployment time.
 *
 * @see https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/#timers
 */
module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:StartEvent') || !is(node.$parent, 'bpmn:Process')) {
      return;
    }

    const eventDefinition = getEventDefinition(node);

    if (!eventDefinition || !is(eventDefinition, 'bpmn:TimerEventDefinition')) {
      return;
    }

    const property = [ 'timeDate', 'timeCycle' ].find(property => eventDefinition.get(property));

    if (!property) {
      return;
    }

    const expression = eventDefinition.get(property),
          value = expression.get('body');

    if (!value) {
      return;
    }

    const date = property === 'timeDate'
      ? parseDate(value)
      : parseDate(getCycleStartDate(value));

    if (!date || date.getTime() >= Date.now()) {
      return;
    }

    reportErrors(node, reporter, {
      message: MESSAGES[ property ],
      path: pathConcat(getPath(eventDefinition, node), property),
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: expression,
        parentNode: node,
        property
      }
    });
  }

  return {
    meta: {
      documentation: {
        url: 'https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/#timers'
      }
    },
    check
  };
});
