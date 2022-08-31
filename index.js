const { omit } = require('min-dash');

const calledDecisionOrTaskDefinitionConfig = require('./rules/called-decision-or-task-definition/config'),
      elementTypeConfig = require('./rules/element-type/config');

const camundaCloud10Rules = {
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
};

const camundaCloud11Rules = {
  ...camundaCloud10Rules,
  'called-decision-or-task-definition': [ 'error', calledDecisionOrTaskDefinitionConfig.camundaCloud11 ],
  'element-type': [ 'error', elementTypeConfig.camundaCloud11 ]
};

const camundaCloud12Rules = {
  ...camundaCloud11Rules,
  'called-decision-or-task-definition': [ 'error', calledDecisionOrTaskDefinitionConfig.camundaCloud12 ],
  'element-type': [ 'error', elementTypeConfig.camundaCloud12 ]
};

const camundaCloud13Rules = {
  ...camundaCloud12Rules,
  'called-decision-or-task-definition': [ 'error', calledDecisionOrTaskDefinitionConfig.camundaCloud13 ]
};

const camundaCloud80Rules = omit(camundaCloud13Rules, 'no-template');

const camundaCloud81Rules = omit(camundaCloud13Rules, 'no-zeebe-properties');

module.exports = {
  configs: {
    'camunda-cloud-1-0': {
      rules: camundaCloud10Rules
    },
    'camunda-cloud-1-1': {
      rules: camundaCloud11Rules
    },
    'camunda-cloud-1-2': {
      rules: camundaCloud12Rules
    },
    'camunda-cloud-1-3': {
      rules: camundaCloud13Rules
    },
    'camunda-cloud-8-0': {
      rules: camundaCloud80Rules
    },
    'camunda-cloud-8-1': {
      rules: camundaCloud81Rules
    }
  }
};