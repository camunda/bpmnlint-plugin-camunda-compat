const { omit } = require('min-dash');

const camundaCloud10Rules = withConfig({
  'implementation': 'error',
  'called-element': 'error',
  'collapsed-subprocess': 'error',
  'duplicate-task-headers': 'error',
  'element-type': 'error',
  'error-reference': 'error',
  'event-based-gateway-target': 'error',
  'executable-process': 'error',
  'loop-characteristics': 'error',
  'message-reference': 'error',
  'no-candidate-users': 'error',
  'no-expression': 'error',
  'no-task-schedule': 'error',
  'no-template': 'error',
  'no-zeebe-properties': 'error',
  'sequence-flow-condition': 'error',
  'subscription': 'error',
  'timer': 'error',
  'user-task-form': 'error',
  'feel': 'error'
}, { version: '1.0' });

const camundaCloud11Rules = withConfig(camundaCloud10Rules, { version: '1.1' });

const camundaCloud12Rules = withConfig(camundaCloud11Rules, { version: '1.2' });

const camundaCloud13Rules = withConfig(camundaCloud12Rules, { version: '1.3' });

const camundaCloud80Rules = withConfig({
  ...omit(camundaCloud13Rules, 'no-template')
}, { version: '8.0' });

const camundaCloud81Rules = withConfig({
  ...omit(camundaCloud80Rules, 'no-zeebe-properties'),
  'inclusive-gateway': 'error'
}, { version: '8.1' });

const camundaCloud82Rules = withConfig({
  ...omit(camundaCloud81Rules, [
    'no-candidate-users',
    'no-task-schedule'
  ]),
  'escalation-reference': 'error',
  'no-signal-event-sub-process': 'error',
  'task-schedule': 'error'
}, { version: '8.2' });

const camundaCloud83Rules = withConfig({
  ...camundaCloud82Rules,
  'signal-reference': 'error'
}, { version: '8.3' });

const camundaPlatform719Rules = withConfig({
  'history-time-to-live': 'error'
}, {
  platform: 'camunda-platform',
  version: '7.19'
});

const camundaPlatform720Rules = withConfig(camundaPlatform719Rules, {
  platform: 'camunda-platform',
  version: '7.20'
});

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
    },
    'camunda-cloud-8-3': {
      rules: camundaCloud83Rules
    },
    'camunda-platform-7-19': {
      rules: camundaPlatform719Rules
    },
    'camunda-platform-7-20': {
      rules: camundaPlatform720Rules
    }
  }
};

function withConfig(rules, config, type = 'error') {
  let rulesWithConfig = {};

  for (let name in rules) {
    rulesWithConfig[ name ] = [ type, config ];
  }

  return rulesWithConfig;
}