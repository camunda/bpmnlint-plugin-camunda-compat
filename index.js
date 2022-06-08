const hasCalledDecisionOrTaskDefinitionConfig = require('./rules/has-called-decision-or-task-definition/config'),
      isElementConfig = require('./rules/is-element/config');

module.exports = {
  configs: {
    'camunda-cloud-1-0': {
      rules: {
        'has-called-decision-or-task-definition': [ 'error', hasCalledDecisionOrTaskDefinitionConfig.camundaCloud10 ],
        'has-called-element': 'error',
        'has-error-reference': 'error',
        'has-loop-characteristics': 'error',
        'has-message-reference': 'error',
        'has-no-template': 'error',
        'has-subscription': 'error',
        'is-element': [ 'error', isElementConfig.camundaCloud10 ]
      }
    },
    'camunda-cloud-1-1': {
      rules: {
        'has-called-decision-or-task-definition': [ 'error', hasCalledDecisionOrTaskDefinitionConfig.camundaCloud11 ],
        'has-called-element': 'error',
        'has-error-reference': 'error',
        'has-loop-characteristics': 'error',
        'has-message-reference': 'error',
        'has-no-template': 'error',
        'has-subscription': 'error',
        'is-element': [ 'error', isElementConfig.camundaCloud11 ]
      }
    },
    'camunda-cloud-1-2': {
      rules: {
        'has-called-decision-or-task-definition': [ 'error', hasCalledDecisionOrTaskDefinitionConfig.camundaCloud12 ],
        'has-called-element': 'error',
        'has-error-reference': 'error',
        'has-loop-characteristics': 'error',
        'has-message-reference': 'error',
        'has-no-template': 'error',
        'has-subscription': 'error',
        'is-element': [ 'error', isElementConfig.camundaCloud12 ]
      }
    },
    'camunda-cloud-1-3': {
      rules: {
        'has-called-decision-or-task-definition': [ 'error', hasCalledDecisionOrTaskDefinitionConfig.camundaCloud13 ],
        'has-called-element': 'error',
        'has-error-reference': 'error',
        'has-loop-characteristics': 'error',
        'has-message-reference': 'error',
        'has-no-template': 'error',
        'has-subscription': 'error',
        'is-element': [ 'error', isElementConfig.camundaCloud12 ]
      }
    },
    'camunda-cloud-8-0': {
      rules: {
        'has-called-decision-or-task-definition': [ 'error', hasCalledDecisionOrTaskDefinitionConfig.camundaCloud13 ],
        'has-called-element': 'error',
        'has-error-reference': 'error',
        'has-loop-characteristics': 'error',
        'has-message-reference': 'error',
        'has-subscription': 'error',
        'is-element': [ 'error', isElementConfig.camundaCloud12 ]
      }
    }
  }
};