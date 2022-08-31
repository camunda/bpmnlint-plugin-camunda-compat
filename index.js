const calledDecisionOrTaskDefinitionConfig = require('./rules/called-decision-or-task-definition/config'),
      elementTypeConfig = require('./rules/element-type/config');

module.exports = {
  configs: {
    'camunda-cloud-1-0': {
      rules: {
        'called-decision-or-task-definition': [ 'error', calledDecisionOrTaskDefinitionConfig.camundaCloud10 ],
        'called-element': 'error',
        'duplicate-task-headers': 'error',
        'element-type': [ 'error', elementTypeConfig.camundaCloud10 ],
        'error-reference': 'error',
        'loop-characteristics': 'error',
        'message-reference': 'error',
        'no-template': 'error',
        'no-zeebe-properties': 'error',
        'subscription': 'error',
        'user-task-form': 'error'
      }
    },
    'camunda-cloud-1-1': {
      rules: {
        'called-decision-or-task-definition': [ 'error', calledDecisionOrTaskDefinitionConfig.camundaCloud11 ],
        'called-element': 'error',
        'duplicate-task-headers': 'error',
        'element-type': [ 'error', elementTypeConfig.camundaCloud11 ],
        'error-reference': 'error',
        'loop-characteristics': 'error',
        'message-reference': 'error',
        'no-template': 'error',
        'no-zeebe-properties': 'error',
        'subscription': 'error',
        'user-task-form': 'error'
      }
    },
    'camunda-cloud-1-2': {
      rules: {
        'called-decision-or-task-definition': [ 'error', calledDecisionOrTaskDefinitionConfig.camundaCloud12 ],
        'called-element': 'error',
        'duplicate-task-headers': 'error',
        'element-type': [ 'error', elementTypeConfig.camundaCloud12 ],
        'error-reference': 'error',
        'loop-characteristics': 'error',
        'message-reference': 'error',
        'no-template': 'error',
        'no-zeebe-properties': 'error',
        'subscription': 'error',
        'user-task-form': 'error'
      }
    },
    'camunda-cloud-1-3': {
      rules: {
        'called-decision-or-task-definition': [ 'error', calledDecisionOrTaskDefinitionConfig.camundaCloud13 ],
        'called-element': 'error',
        'duplicate-task-headers': 'error',
        'element-type': [ 'error', elementTypeConfig.camundaCloud12 ],
        'error-reference': 'error',
        'loop-characteristics': 'error',
        'message-reference': 'error',
        'no-template': 'error',
        'no-zeebe-properties': 'error',
        'subscription': 'error',
        'user-task-form': 'error'
      }
    },
    'camunda-cloud-8-0': {
      rules: {
        'called-decision-or-task-definition': [ 'error', calledDecisionOrTaskDefinitionConfig.camundaCloud13 ],
        'called-element': 'error',
        'duplicate-task-headers': 'error',
        'element-type': [ 'error', elementTypeConfig.camundaCloud12 ],
        'error-reference': 'error',
        'loop-characteristics': 'error',
        'message-reference': 'error',
        'no-zeebe-properties': 'error',
        'subscription': 'error',
        'user-task-form': 'error'
      }
    },
    'camunda-cloud-8-1': {
      rules: {
        'called-decision-or-task-definition': [ 'error', calledDecisionOrTaskDefinitionConfig.camundaCloud13 ],
        'called-element': 'error',
        'duplicate-task-headers': 'error',
        'element-type': [ 'error', elementTypeConfig.camundaCloud12 ],
        'error-reference': 'error',
        'loop-characteristics': 'error',
        'message-reference': 'error',
        'subscription': 'error',
        'user-task-form': 'error'
      }
    }
  }
};