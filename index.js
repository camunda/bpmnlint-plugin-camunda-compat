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
  'no-multiple-none-start-events': 'error',
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
  'escalation-boundary-event-attached-to-ref': 'error',
  'escalation-reference': 'error',
  'no-signal-event-sub-process': 'error',
  'task-schedule': 'error'
}, { version: '8.2' });

const camundaCloud83Rules = withConfig({
  ...omit(camundaCloud82Rules, 'inclusive-gateway'),
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

const rules = {
  'element-type': './rules/camunda-cloud/element-type',
  'called-element': './rules/camunda-cloud/called-element',
  'collapsed-subprocess': './rules/camunda-cloud/collapsed-subprocess',
  'duplicate-task-headers': './rules/camunda-cloud/duplicate-task-headers',
  'error-reference': './rules/camunda-cloud/error-reference',
  'escalation-boundary-event-attached-to-ref': './rules/camunda-cloud/escalation-boundary-event-attached-to-ref',
  'escalation-reference': './rules/camunda-cloud/escalation-reference',
  'event-based-gateway-target': './rules/camunda-cloud/event-based-gateway-target',
  'executable-process': './rules/camunda-cloud/executable-process',
  'feel': './rules/camunda-cloud/feel',
  'history-time-to-live': './rules/camunda-platform/history-time-to-live',
  'implementation': './rules/camunda-cloud/implementation',
  'inclusive-gateway': './rules/camunda-cloud/inclusive-gateway',
  'loop-characteristics': './rules/camunda-cloud/loop-characteristics',
  'message-reference': './rules/camunda-cloud/message-reference',
  'no-candidate-users': './rules/camunda-cloud/no-candidate-users',
  'no-expression': './rules/camunda-cloud/no-expression',
  'no-multiple-none-start-events': './rules/camunda-cloud/no-multiple-none-start-events',
  'no-signal-event-sub-process': './rules/camunda-cloud/no-signal-event-sub-process',
  'no-task-schedule': './rules/camunda-cloud/no-task-schedule',
  'no-template': './rules/camunda-cloud/no-template',
  'no-zeebe-properties': './rules/camunda-cloud/no-zeebe-properties',
  'sequence-flow-condition': './rules/camunda-cloud/sequence-flow-condition',
  'signal-reference': './rules/camunda-cloud/signal-reference',
  'subscription': './rules/camunda-cloud/subscription',
  'task-schedule': './rules/camunda-cloud/task-schedule',
  'timer': './rules/camunda-cloud/timer',
  'user-task-form': './rules/camunda-cloud/user-task-form'
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
    },
    'camunda-cloud-8-3': {
      rules: camundaCloud83Rules
    },
    'camunda-platform-7-19': {
      rules: camundaPlatform719Rules
    },
    'camunda-platform-7-20': {
      rules: camundaPlatform720Rules
    },
    'all': {
      rules: Object.keys(rules).reduce((allRules, rule) => {
        return {
          ...allRules,
          [ rule ]: 'error'
        };
      }, {})
    }
  },
  rules
};

function withConfig(rules, config, type = 'error') {
  let rulesWithConfig = {};

  for (let name in rules) {
    rulesWithConfig[ name ] = [ type, config ];
  }

  return rulesWithConfig;
}