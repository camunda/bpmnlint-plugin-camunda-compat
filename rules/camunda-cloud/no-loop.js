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

    // Create subgraph of nodes that can be part of an infinite loop
    const relevantNodes = getFlowElements(node)
      .filter(flowElement => {
        return isAnyExactly(flowElement, LOOP_ELEMENT_TYPES);
      });

    // Use BFS to find loops
    const errors = findLoops(relevantNodes, node);

    if (errors) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});

function findLoops(flowElements, root) {
  const allFlowElements = new Set(flowElements);
  const unvisitedFlowElements = new Set(flowElements);

  const errors = [];

  // Use BFS until we visited all nodes
  while (unvisitedFlowElements.size) {
    const firstElement = unvisitedFlowElements.values().next().value;
    unvisitedFlowElements.delete(firstElement);

    // We can have multiple separate graphs, use first remaining node if we exhausted the current graph
    const elementsToVisit = [ {
      currentNode: firstElement,
      path: [ ]
    } ];

    while (elementsToVisit.length) {
      const { currentNode, path } = elementsToVisit.shift();
      const newPath = [ ...path, currentNode ];

      const nextFlowElements = getNextNodes(currentNode, allFlowElements);

      nextFlowElements.forEach(nextNode => {
        if (unvisitedFlowElements.has(nextNode))
        {
          unvisitedFlowElements.delete(nextNode);
          elementsToVisit.push({
            currentNode: nextNode,
            path: newPath
          });
        }

        // We already visited this node, we found a loop
        else if (newPath.includes(nextNode)) {
          errors.push(handleLoop(newPath, nextNode, root));
        }
      });

    }
  }

  return errors.filter(Boolean);
}

const handleLoop = (path, currentNode, root) => {
  const loop = path.slice(path.indexOf(currentNode));

  if (isIgnoredLoop(loop)) {
    return null;
  }

  return {
    message: `Loop detected: ${ loop.map(({ id }) => id).join(' -> ') } -> ${ currentNode.id }`,
    path: null,
    data: {
      type: ERROR_TYPES.LOOP_NOT_ALLOWED,
      node: root,
      parentNode: null,
      elements: loop.map(({ id }) => id)
    }
  };
};

const getNextNodes = (node, validNodes) => {

  // Get all outgoing nodes
  const allOutgoing = getNextFlowElements(node);

  // Filter out nodes that can't be part of an infinite loop
  return allOutgoing.filter(outgoing => validNodes.has(outgoing));
};


function getFlowElements(node) {
  return node.get('flowElements').reduce((flowElements, flowElement) => {
    if (is(flowElement, 'bpmn:FlowElementsContainer')) {
      return [ ...flowElements, flowElement, ...getFlowElements(flowElement) ];
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