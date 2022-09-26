const {
  is
} = require('bpmnlint-utils');

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

module.exports = function(config = {}) {
  const { formats = [] } = config;

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

    errors = checkTimePropertyCorrectFormat(eventDefinition, node, formats);
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

function checkTimePropertyCorrectFormat(eventDefinition, event, formats) {
  const timeCycle = eventDefinition.get('timeCycle'),
        timeDate = eventDefinition.get('timeDate'),
        timeDuration = eventDefinition.get('timeDuration');

  if (timeCycle) {
    return hasProperties(timeCycle, {
      body: {
        allowed: cycle => validateCycle(cycle, formats)
      }
    }, event);
  } else if (timeDate) {
    return hasProperties(timeDate, {
      body: {
        allowed: date => validateDate(date, formats)
      }
    }, event);
  } else if (timeDuration) {
    return hasProperties(timeDuration, {
      body: {
        allowed: duration => validateDuration(duration, formats)
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

function validateDate(date, formats) {
  if (validateExpression(date)) {
    return true;
  }

  if (formats.includes('iso8601') && validateISO8601Date(date)) {
    return true;
  }
}

function validateCycle(cycle, formats) {
  if (validateExpression(cycle)) {
    return true;
  }

  if (formats.includes('iso8601') && validateISO8601Cycle(cycle)) {
    return true;
  }

  if (formats.includes('cron') && validateCronExpression(cycle)) {
    return true;
  }
}

function validateDuration(duration, formats) {
  if (validateExpression(duration)) {
    return true;
  }

  if (formats.includes('iso8601') && validateISO8601Duration(duration)) {
    return true;
  }
}

function validateExpression(text) {
  if (text.startsWith('=')) {
    return true;
  }
}
