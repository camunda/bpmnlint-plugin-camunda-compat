const {
  is
} = require('bpmnlint-utils');

const config = require('./config');

const { greaterOrEqual } = require('../utils/version');

const {
  getEventDefinition,
  hasProperties,
  hasProperty
} = require('../utils/element');

const { validateCronExpression } = require('../utils/cron');

const {
  validateCycle: validateISO8601Cycle,
  validateDate: validateISO8601Date,
  validateDuration: validateISO8601Duration
} = require('../utils/iso8601');

const { reportErrors } = require('../utils/reporter');

module.exports = function({ version }) {
  function check(node, reporter) {
    if (!is(node, 'bpmn:Event')) {
      return;
    }

    const eventDefinition = getEventDefinition(node);

    if (!eventDefinition || !is(eventDefinition, 'bpmn:TimerEventDefinition')) {
      return;
    }

    let errors = checkTimePropertyExists(eventDefinition, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }

    const timeProperty = getTimeProperty(eventDefinition);

    errors = checkTimePropertyNotEmpty(timeProperty, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }

    errors = checkTimePropertyCorrectFormat(eventDefinition, node, version);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
};

function checkTimePropertyExists(eventDefinition, event) {
  if (is(event, 'bpmn:StartEvent')) {
    return hasProperty(eventDefinition, [ 'timeCycle', 'timeDate' ], event);
  } else if (is(event, 'bpmn:IntermediateCatchEvent') || isInterruptingBoundaryEvent(event)) {
    return hasProperties(eventDefinition, {
      timeDuration: {
        required: true
      }
    }, event);
  } else if (is(event, 'bpmn:BoundaryEvent')) {
    return hasProperty(eventDefinition, [ 'timeCycle', 'timeDuration' ], event);
  }

  return [];
}

function checkTimePropertyNotEmpty(timeProperty, event) {
  return hasProperties(timeProperty, {
    body: {
      required: true,
    }
  }, event);
}

function checkTimePropertyCorrectFormat(eventDefinition, event, version) {
  const timeCycle = eventDefinition.get('timeCycle'),
        timeDate = eventDefinition.get('timeDate'),
        timeDuration = eventDefinition.get('timeDuration');

  if (timeCycle) {
    return hasProperties(timeCycle, {
      body: {
        allowed: cycle => validateCycle(cycle, version)
      }
    }, event);
  } else if (timeDate) {
    return hasProperties(timeDate, {
      body: {
        allowed: date => validateDate(date, version)
      }
    }, event);
  } else if (timeDuration) {
    return hasProperties(timeDuration, {
      body: {
        allowed: duration => validateDuration(duration, version)
      }
    }, event);
  }
}



// helper //////////////
function getTimeProperty(eventDefinition) {
  return eventDefinition.get('timeCycle') || eventDefinition.get('timeDate') || eventDefinition.get('timeDuration');
}

function isInterruptingBoundaryEvent(event) {
  return is(event, 'bpmn:BoundaryEvent') && event.get('cancelActivity') !== false;
}

function validateDate(date, version) {
  if (validateExpression(date)) {
    return true;
  }

  if (validateISO8601Date(date)) {
    return greaterOrEqual(version, config.iso8601);
  }
}

function validateCycle(cycle, version) {
  if (validateExpression(cycle)) {
    return true;
  }

  if (validateISO8601Cycle(cycle)) {
    return greaterOrEqual(version, config.iso8601);;
  }

  if (validateCronExpression(cycle)) {
    return greaterOrEqual(version, config.cron);
  }
}

function validateDuration(duration, version) {
  if (validateExpression(duration)) {
    return true;
  }

  if (validateISO8601Duration(duration)) {
    return greaterOrEqual(version, config.iso8601);
  }
}

function validateExpression(text) {
  if (text.startsWith('=')) {
    return true;
  }
}
