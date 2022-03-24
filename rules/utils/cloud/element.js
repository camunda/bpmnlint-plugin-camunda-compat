const { checkEvery } = require('../rule');

const {
  checkFlowNode,
  checkLoopCharacteristics,
  checkMessage,
  hasExtensionElementOfType,
  hasExtensionElementsOfTypes,
  checkIf,
  hasMultiInstanceLoopCharacteristics,
  hasLoopCharacteristics
} = require('../element');

module.exports.hasZeebeCalledDecisionOrTaskDefinition = checkFlowNode(
  hasExtensionElementsOfTypes([
    {
      type: 'zeebe:CalledDecision',
      properties: {
        decisionId: {
          required: true
        },
        resultVariable: {
          required: true
        }
      }
    },
    {
      type: 'zeebe:TaskDefinition',
      properties: {
        type: {
          required: true
        },
        retries: {
          required: true
        }
      }
    }
  ], true)
);

module.exports.hasZeebeCalledElement = checkFlowNode(
  hasExtensionElementOfType({
    type: 'zeebe:CalledElement',
    properties: {
      processId: {
        required: true
      }
    }
  })
);

/**
 * Check if one of the following is true:
 *
 * 1. no loop characteristics
 * 2. bpmn:MultiInstanceLoopCharacteristics with zeebe:LoopCharacteristics
 * extension element with zeebe:inputCollection
 */
module.exports.hasZeebeLoopCharacteristics = checkEvery(
  checkIf(
    hasMultiInstanceLoopCharacteristics,
    hasLoopCharacteristics
  ),
  checkIf(
    checkLoopCharacteristics(
      hasExtensionElementOfType({
        type: 'zeebe:LoopCharacteristics',
        properties: {
          inputCollection: {
            required: true
          },
          outputCollection: {
            dependendRequired: 'outputElement'
          },
          outputElement: {
            dependendRequired: 'outputCollection'
          }
        }
      })
    ),
    checkEvery(
      hasLoopCharacteristics,
      hasMultiInstanceLoopCharacteristics
    )
  )
);

module.exports.hasZeebeSubscription = checkMessage(
  hasExtensionElementOfType({
    type: 'zeebe:Subscription',
    properties: {
      correlationKey: {
        required: true
      }
    }
  })
);

module.exports.hasZeebeTaskDefinition = checkFlowNode(
  hasExtensionElementOfType({
    type: 'zeebe:TaskDefinition',
    properties: {
      type: {
        required: true
      },
      retries: {
        required: true
      }
    }
  })
);