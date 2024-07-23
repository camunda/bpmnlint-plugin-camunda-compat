const {
  ERROR_TYPES,
  findExtensionElement
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    const executionListeners = findExtensionElement(node, 'zeebe:ExecutionListeners');

    if (!executionListeners) {
      return;
    }

    const errors = hasDuplicatedExecutionListeners(executionListeners, node);

    if (errors && errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});

// helpers //////////
function hasDuplicatedExecutionListeners(executionListeners, parentNode = null) {
  const listeners = executionListeners.get('listeners');

  // (1) find duplicates
  const duplicates = [];
  const events = new Map();
  for (const listener of listeners) {
    const eventName = listener.get('eventType'),
          type = listener.get('type');

    if (!events.has(eventName)) {
      events.set(eventName, new Set([ type ]));
      continue;
    }

    const types = events.get(eventName);
    if (types.has(type)) {
      duplicates.push(listener);
    } else {
      types.add(type);
    }
  }

  // (2) report error for each duplicate
  if (duplicates.length) {
    return duplicates.map(duplicate => {
      const eventName = duplicate.get('eventType'),
            type = duplicate.get('type');

      // (3) find properties with duplicate
      const duplicateProperties = listeners.filter(listener => listener.get('eventType') === eventName && listener.get('type') === type);

      // (4) report error
      return {
        message: `Duplicate execution listener with event type <${eventName}> and job type <${type}>`,
        path: null,
        data: {
          type: ERROR_TYPES.PROPERTY_VALUE_DUPLICATED,
          node: executionListeners,
          parentNode: parentNode === executionListeners ? null : parentNode,
          duplicatedProperty: 'type',
          duplicatedPropertyValue: type,
          properties: duplicateProperties,
          propertiesName: 'listeners'
        }
      };
    });
  }

  return [];
}