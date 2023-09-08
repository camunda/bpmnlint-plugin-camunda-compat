const { without } = require('min-dash');

const camundaCloud10Rules = [
  'implementation',
  'called-element',
  'collapsed-subprocess',
  'duplicate-task-headers',
  'element-type',
  'error-reference',
  'event-based-gateway-target',
  'executable-process',
  'loop-characteristics',
  'message-reference',
  'no-candidate-users',
  'no-expression',
  'no-loop',
  'no-multiple-none-start-events',
  'no-propagate-all-parent-variables',
  'no-task-schedule',
  'no-template',
  'no-zeebe-properties',
  'sequence-flow-condition',
  'start-form',
  'subscription',
  'timer',
  'user-task-form',
  'feel'
];

const camundaCloud11Rules = [ ...camundaCloud10Rules ];

const camundaCloud12Rules = [ ...camundaCloud11Rules ];

const camundaCloud13Rules = [ ...camundaCloud12Rules ];

const camundaCloud80Rules = without(camundaCloud13Rules, 'no-template');

const camundaCloud81Rules = [
  ...without(camundaCloud80Rules, 'no-zeebe-properties'),
  'inclusive-gateway'
];

const camundaCloud82Rules = [
  ...without(camundaCloud81Rules, rule => {
    return [
      'no-candidate-users',
      'no-propagate-all-parent-variables',
      'no-task-schedule'
    ].includes(rule);
  }),
  'escalation-boundary-event-attached-to-ref',
  'escalation-reference',
  'link-event',
  'no-signal-event-sub-process',
  'task-schedule'
];

const camundaCloud83Rules = [
  ...without(camundaCloud82Rules, 'start-form'),
  'signal-reference'
];

const camundaPlatform719Rules = [
  'history-time-to-live'
];

const camundaPlatform720Rules = [ ...camundaPlatform719Rules ];

const categories = {
  'element-type': 'error',
  'called-element': 'error',
  'collapsed-subprocess': 'error',
  'duplicate-task-headers': 'error',
  'error-reference': 'error',
  'escalation-boundary-event-attached-to-ref': 'error',
  'escalation-reference': 'error',
  'event-based-gateway-target': 'error',
  'executable-process': 'error',
  'feel': 'error',
  'history-time-to-live': 'error',
  'implementation': 'error',
  'inclusive-gateway': 'error',
  'link-event': 'error',
  'loop-characteristics': 'error',
  'message-reference': 'error',
  'no-candidate-users': 'error',
  'no-expression': 'error',
  'no-loop': 'error',
  'no-multiple-none-start-events': 'error',
  'no-propagate-all-parent-variables': 'error',
  'no-signal-event-sub-process': 'error',
  'no-task-schedule': 'error',
  'no-template': 'error',
  'no-zeebe-properties': 'error',
  'sequence-flow-condition': 'error',
  'signal-reference': 'error',
  'start-form': 'error',
  'subscription': 'error',
  'task-schedule': 'error',
  'timer': 'error',
  'user-task-form': 'error'
};

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
  'link-event': './rules/camunda-cloud/link-event',
  'loop-characteristics': './rules/camunda-cloud/loop-characteristics',
  'message-reference': './rules/camunda-cloud/message-reference',
  'no-candidate-users': './rules/camunda-cloud/no-candidate-users',
  'no-expression': './rules/camunda-cloud/no-expression',
  'no-loop': './rules/camunda-cloud/no-loop',
  'no-multiple-none-start-events': './rules/camunda-cloud/no-multiple-none-start-events',
  'no-propagate-all-parent-variables': './rules/camunda-cloud/no-propagate-all-parent-variables',
  'no-signal-event-sub-process': './rules/camunda-cloud/no-signal-event-sub-process',
  'no-task-schedule': './rules/camunda-cloud/no-task-schedule',
  'no-template': './rules/camunda-cloud/no-template',
  'no-zeebe-properties': './rules/camunda-cloud/no-zeebe-properties',
  'sequence-flow-condition': './rules/camunda-cloud/sequence-flow-condition',
  'signal-reference': './rules/camunda-cloud/signal-reference',
  'start-form': './rules/camunda-cloud/start-form',
  'subscription': './rules/camunda-cloud/subscription',
  'task-schedule': './rules/camunda-cloud/task-schedule',
  'timer': './rules/camunda-cloud/timer',
  'user-task-form': './rules/camunda-cloud/user-task-form'
};

module.exports = {
  configs: {
    'camunda-cloud-1-0': {
      rules: withConfig(camundaCloud10Rules, { version: '1.0' })
    },
    'camunda-cloud-1-1': {
      rules: withConfig(camundaCloud11Rules, { version: '1.1' })
    },
    'camunda-cloud-1-2': {
      rules: withConfig(camundaCloud12Rules, { version: '1.2' })
    },
    'camunda-cloud-1-3': {
      rules: withConfig(camundaCloud13Rules, { version: '1.3' })
    },
    'camunda-cloud-8-0': {
      rules: withConfig(camundaCloud80Rules, { version: '8.0' })
    },
    'camunda-cloud-8-1': {
      rules: withConfig(camundaCloud81Rules, { version: '8.1' })
    },
    'camunda-cloud-8-2': {
      rules: withConfig(camundaCloud82Rules, { version: '8.2' })
    },
    'camunda-cloud-8-3': {
      rules: withConfig(camundaCloud83Rules, { version: '8.3' })
    },
    'camunda-platform-7-19': {
      rules: withConfig(camundaPlatform719Rules, { platform: 'camunda-platform', version: '7.19' })
    },
    'camunda-platform-7-20': {
      rules: withConfig(camundaPlatform720Rules, { platform: 'camunda-platform', version: '7.20' })
    },
    'all': {
      rules: Object.keys(rules).reduce((allRules, rule) => {
        return {
          ...allRules,
          [ rule ]: categories[ rule ]
        };
      }, {})
    }
  },
  rules
};

function withConfig(rules, config) {
  return rules.reduce((rulesWithConfig, rule) => {
    return {
      ...rulesWithConfig,
      [ rule ]: [ categories[ rule ], config ]
    };
  }, {});

}