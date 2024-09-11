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
  'no-binding-type': 'error',
  'no-candidate-users': 'error',
  'no-execution-listeners': 'error',
  'no-expression': 'error',
  'no-loop': 'error',
  'no-multiple-none-start-events': 'error',
  'no-priority-definition': 'error',
  'no-propagate-all-parent-variables': 'error',
  'no-task-schedule': 'error',
  'no-template': 'error',
  'no-version-tag': 'error',
  'no-zeebe-properties': 'error',
  'no-zeebe-user-task': 'error',
  'sequence-flow-condition': 'error',
  'start-event-form': 'error',
  'subscription': 'error',
  'timer': 'error',
  'user-task-definition': 'warn',
  'user-task-form': 'error',
  'feel': 'error'
}, { version: '1.0' });

const camundaCloud11Rules = withConfig(camundaCloud10Rules, { version: '1.1' });

const camundaCloud12Rules = withConfig(camundaCloud11Rules, { version: '1.2' });

const camundaCloud13Rules = withConfig(camundaCloud12Rules, { version: '1.3' });

const camundaCloud80Rules = withConfig({
  ...omit(camundaCloud13Rules, 'no-template'),
  'connector-properties': 'warn'
}, { version: '8.0' });

const camundaCloud81Rules = withConfig({
  ...omit(camundaCloud80Rules, 'no-zeebe-properties'),
  'inclusive-gateway': 'error'
}, { version: '8.1' });

const camundaCloud82Rules = withConfig({
  ...omit(camundaCloud81Rules, [
    'no-candidate-users',
    'no-propagate-all-parent-variables',
    'no-task-schedule'
  ]),
  'escalation-boundary-event-attached-to-ref': 'error',
  'escalation-reference': 'error',
  'link-event': 'error',
  'no-signal-event-sub-process': 'error',
  'task-schedule': 'error'
}, { version: '8.2' });

const camundaCloud83Rules = withConfig({
  ...omit(camundaCloud82Rules, 'no-signal-event-sub-process'),
  'secrets': 'warn',
  'signal-reference': 'error'
}, { version: '8.3' });

const camundaCloud84Rules = withConfig(
  omit(camundaCloud83Rules, 'collapsed-subprocess'), { version: '8.4' });

const camundaCloud85Rules = withConfig({
  ...omit(camundaCloud83Rules, [
    'collapsed-subprocess',
    'no-zeebe-user-task'
  ]),
  'wait-for-completion': 'error'
}, { version: '8.5' });

const camundaCloud86Rules = withConfig({
  ...omit(camundaCloud85Rules, [
    'inclusive-gateway',
    'no-binding-type',
    'no-execution-listeners',
    'no-priority-definition',
    'no-version-tag'
  ]),
  'duplicate-execution-listeners': 'error',
  'execution-listener': 'error',
  'priority-definition': 'error',
  'version-tag': 'error'
}, { version: '8.6' });

const camundaPlatform719Rules = withConfig({
  'history-time-to-live': 'info'
}, {
  platform: 'camunda-platform',
  version: '7.19'
});

const camundaPlatform720Rules = withConfig(camundaPlatform719Rules, {
  platform: 'camunda-platform',
  version: '7.20'
});

const camundaPlatform721Rules = withConfig(camundaPlatform720Rules, {
  platform: 'camunda-platform',
  version: '7.21'
});

const camundaPlatform722Rules = withConfig(camundaPlatform721Rules, {
  platform: 'camunda-platform',
  version: '7.22'
});

const rules = {
  'element-type': './rules/camunda-cloud/element-type',
  'called-element': './rules/camunda-cloud/called-element',
  'collapsed-subprocess': './rules/camunda-cloud/collapsed-subprocess',
  'connector-properties': './rules/camunda-cloud/connector-properties',
  'duplicate-execution-listeners': './rules/camunda-cloud/duplicate-execution-listeners',
  'duplicate-task-headers': './rules/camunda-cloud/duplicate-task-headers',
  'error-reference': './rules/camunda-cloud/error-reference',
  'escalation-boundary-event-attached-to-ref': './rules/camunda-cloud/escalation-boundary-event-attached-to-ref',
  'escalation-reference': './rules/camunda-cloud/escalation-reference',
  'event-based-gateway-target': './rules/camunda-cloud/event-based-gateway-target',
  'executable-process': './rules/camunda-cloud/executable-process',
  'execution-listener': './rules/camunda-cloud/execution-listener',
  'feel': './rules/camunda-cloud/feel',
  'history-time-to-live': './rules/camunda-platform/history-time-to-live',
  'implementation': './rules/camunda-cloud/implementation',
  'inclusive-gateway': './rules/camunda-cloud/inclusive-gateway',
  'link-event': './rules/camunda-cloud/link-event',
  'loop-characteristics': './rules/camunda-cloud/loop-characteristics',
  'message-reference': './rules/camunda-cloud/message-reference',
  'no-binding-type': './rules/camunda-cloud/no-binding-type',
  'no-candidate-users': './rules/camunda-cloud/no-candidate-users',
  'no-execution-listeners': './rules/camunda-cloud/no-execution-listeners',
  'no-expression': './rules/camunda-cloud/no-expression',
  'no-loop': './rules/camunda-cloud/no-loop',
  'no-multiple-none-start-events': './rules/camunda-cloud/no-multiple-none-start-events',
  'no-priority-definition': './rules/camunda-cloud/no-priority-definition',
  'no-propagate-all-parent-variables': './rules/camunda-cloud/no-propagate-all-parent-variables',
  'no-signal-event-sub-process': './rules/camunda-cloud/no-signal-event-sub-process',
  'no-task-schedule': './rules/camunda-cloud/no-task-schedule',
  'no-template': './rules/camunda-cloud/no-template',
  'no-version-tag': './rules/camunda-cloud/no-version-tag',
  'no-zeebe-properties': './rules/camunda-cloud/no-zeebe-properties',
  'no-zeebe-user-task': './rules/camunda-cloud/no-zeebe-user-task',
  'priority-definition': './rules/camunda-cloud/priority-definition',
  'secrets': './rules/camunda-cloud/secrets',
  'sequence-flow-condition': './rules/camunda-cloud/sequence-flow-condition',
  'signal-reference': './rules/camunda-cloud/signal-reference',
  'start-event-form': './rules/camunda-cloud/start-event-form',
  'subscription': './rules/camunda-cloud/subscription',
  'task-schedule': './rules/camunda-cloud/task-schedule',
  'timer': './rules/camunda-cloud/timer',
  'user-task-definition': './rules/camunda-cloud/user-task-definition',
  'user-task-form': './rules/camunda-cloud/user-task-form',
  'version-tag': './rules/camunda-cloud/version-tag',
  'wait-for-completion': './rules/camunda-cloud/wait-for-completion'
};

const configs = {
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
  'camunda-cloud-8-4': {
    rules: camundaCloud84Rules
  },
  'camunda-cloud-8-5': {
    rules: camundaCloud85Rules
  },
  'camunda-cloud-8-6': {
    rules: camundaCloud86Rules
  },
  'camunda-platform-7-19': {
    rules: camundaPlatform719Rules
  },
  'camunda-platform-7-20': {
    rules: camundaPlatform720Rules
  },
  'camunda-platform-7-21': {
    rules: camundaPlatform721Rules
  },
  'camunda-platform-7-22': {
    rules: camundaPlatform722Rules
  }
};

module.exports = {
  configs: {
    ...configs,
    'all': {
      rules: Object.keys(rules).reduce((allRules, rule) => {
        return {
          ...allRules,
          [ rule ]: Object.values(configs).reduce((type, { rules }) => {
            if (type) {
              return type;
            }

            if (rules[ rule ]) {
              return Array.isArray(rules[ rule ]) ? rules[ rule ][0] : rules[ rule ];
            }

            return type;
          }, null)
        };
      }, {})
    }
  },
  rules
};

function withConfig(rules, config) {
  let rulesWithConfig = {};

  for (let name in rules) {
    const type = Array.isArray(rules[ name ]) ? rules[ name ][0] : rules[ name ];
    rulesWithConfig[ name ] = [ type, config ];
  }

  return rulesWithConfig;
}