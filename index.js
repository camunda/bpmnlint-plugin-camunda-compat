const { omit } = require('min-dash');

const camundaCloud10Rules = {
  'called-decision-or-task-definition': [ 'error', { version: '1.0' } ],
  'called-element': 'error',
  'collapsed-subprocess': 'error',
  'duplicate-task-headers': 'error',
  'element-type': [ 'error', { version: '1.0' } ],
  'error-reference': 'error',
  'executable-process': 'error',
  'loop-characteristics': 'error',
  'message-reference': 'error',
  'no-template': 'error',
  'no-zeebe-properties': 'error',
  'sequence-flow-condition': 'error',
  'subscription': 'error',
  'timer': [ 'error', { version: '1.0' } ],
  'user-task-form': 'error',
  'feel': 'error'
};

const camundaCloud11Rules = {
  ...camundaCloud10Rules,
  'called-decision-or-task-definition': [ 'error', { version: '1.1' } ],
  'element-type': [ 'error', { version: '1.1' } ],
  'timer': [ 'error', { version: '1.1' } ]
};

const camundaCloud12Rules = {
  ...camundaCloud11Rules,
  'called-decision-or-task-definition': [ 'error', { version: '1.2' } ],
  'element-type': [ 'error', { version: '1.2' } ],
  'timer': [ 'error', { version: '1.2' } ]
};

const camundaCloud13Rules = {
  ...camundaCloud12Rules,
  'called-decision-or-task-definition': [ 'error', { version: '1.3' } ],
  'element-type': [ 'error', { version: '1.3' } ],
  'timer': [ 'error', { version: '1.3' } ]
};

const camundaCloud80Rules = {
  ...omit(camundaCloud13Rules, 'no-template'),
  'called-decision-or-task-definition': [ 'error', { version: '8.0' } ],
  'element-type': [ 'error', { version: '8.0' } ],
  'timer': [ 'error', { version: '8.0' } ]
};

const camundaCloud81Rules = {
  ...omit(camundaCloud80Rules, 'no-zeebe-properties'),
  'called-decision-or-task-definition': [ 'error', { version: '8.1' } ],
  'element-type': [ 'error', { version: '8.1' } ],
  'inclusive-gateway': 'error',
  'timer': [ 'error', { version: '8.1' } ]
};

const camundaCloud82Rules = {
  ...camundaCloud81Rules,
  'called-decision-or-task-definition': [ 'error', { version: '8.2' } ],
  'element-type': [ 'error', { version: '8.2' } ],
  'timer': [ 'error', { version: '8.2' } ]
};

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
    },
    'camunda-cloud-8-2': {
      rules: camundaCloud82Rules
    }
  }
};