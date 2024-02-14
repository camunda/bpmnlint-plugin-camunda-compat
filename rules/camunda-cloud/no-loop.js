const { isString } = require('min-dash');

const { is } = require('bpmnlint-utils');

const {
  findExtensionElement,
  findParent,
  isAnyExactly
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { ERROR_TYPES } = require('../utils/error-types');

const { skipInNonExecutableProcess } = require('../utils/rule');

const LOOP_REQUIRED_ELEMENT_TYPES = [
  'bpmn:CallActivity',
  'bpmn:ManualTask',
  'bpmn:Task'
];

const LOOP_ELEMENT_TYPES = [
  ...LOOP_REQUIRED_ELEMENT_TYPES,
  'bpmn:StartEvent',
  'bpmn:EndEvent',
  'bpmn:ManualTask',
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ParallelGateway',
  'bpmn:SubProcess',
  'bpmn:Task'
];

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:Process')) {
      return;
    }

    const error = getFlowElements(node)
      .filter(flowElement => {
        return isAnyExactly(flowElement, LOOP_ELEMENT_TYPES);
      })
      .reduce((error, flowElement) => {
        return error || findLoop(flowElement, node);
      }, null);

    if (error) {
      reportErrors(node, reporter, error);
    }
  }

  return {
    check
  };
});

function findLoop(flowElement, parentElement, visitedFlowElements = []) {

  // (1.1) is not a loop
  if (!isAnyExactly(flowElement, LOOP_ELEMENT_TYPES)) {
    return null;
  }

  const nextFlowElements = getNextFlowElements(flowElement);

  // (1.2) is not a loop
  if (!nextFlowElements.length) {
    return null;
  }

  // (2) may be a loop
  if (!visitedFlowElements.includes(flowElement)) {
    return nextFlowElements.reduce((error, nextFlowElement) => {
      return error || findLoop(nextFlowElement, parentElement, [ ...visitedFlowElements, flowElement ]);
    }, null);
  }

  // (3) is a loop but ignored
  if (isIgnoredLoop(visitedFlowElements)) {
    return null;
  }

  const elements = visitedFlowElements.slice(visitedFlowElements.indexOf(flowElement));

  // (4) is a loop
  return {
    message: `Loop detected: ${ elements.map(({ id }) => id).join(' -> ') } -> ${ flowElement.id }`,
    path: null,
    data: {
      type: ERROR_TYPES.LOOP_NOT_ALLOWED,
      node: parentElement,
      parentNode: null,
      elements: elements.map(({ id }) => id)
    }
  };
}

function getFlowElements(node) {
  return node.get('flowElements').reduce((flowElements, flowElement) => {
    if (is(flowElement, 'bpmn:FlowElementsContainer')) {
      return [ ...flowElements, ...getFlowElements(flowElement) ];
    }

    return [ ...flowElements, flowElement ];
  }, []);
}

function getNextFlowElements(flowElement) {
  if (is(flowElement, 'bpmn:CallActivity')) {
    const calledElement = findExtensionElement(flowElement, 'zeebe:CalledElement');

    if (calledElement) {
      const processId = calledElement.get('processId');

      if (isString(processId) && !isFeel(processId)) {
        const process = findParent(flowElement, 'bpmn:Process');

        if (process && process.get('id') === processId) {
          return process.get('flowElements').filter(flowElement => is(flowElement, 'bpmn:StartEvent'));
        }
      }
    }

    return [];
  } else if (is(flowElement, 'bpmn:SubProcess')) {
    return flowElement
      .get('flowElements').filter(flowElement => is(flowElement, 'bpmn:StartEvent'));
  } else if (is(flowElement, 'bpmn:EndEvent')) {
    const parent = flowElement.$parent;

    if (is(parent, 'bpmn:SubProcess')) {
      flowElement = parent;
    }
  }

  return flowElement
    .get('outgoing').filter(outgoing => is(outgoing, 'bpmn:SequenceFlow')).map(sequenceFlow => sequenceFlow.get('targetRef'));
}

function isIgnoredLoop(elements) {
  return !elements.some(element => isAnyExactly(element, LOOP_REQUIRED_ELEMENT_TYPES));
}

function isFeel(value) {
  return isString(value) && value.startsWith('=');
}