const { expect } = require('chai');

const { configs } = require('../..');

describe('configs', function() {

  it('camunda-cloud-1-0', expectRules(configs, 'camunda-cloud-1-0', {
    'implementation': [ 'error', { version: '1.0' } ],
    'called-element': [ 'error', { version: '1.0' } ],
    'collapsed-subprocess': [ 'error', { version: '1.0' } ],
    'duplicate-task-headers': [ 'error', { version: '1.0' } ],
    'element-type': [ 'error', { version: '1.0' } ],
    'error-reference': [ 'error', { version: '1.0' } ],
    'event-based-gateway-target': [ 'error', { version: '1.0' } ],
    'executable-process': [ 'error', { version: '1.0' } ],
    'feel': [ 'error', { version: '1.0' } ],
    'loop-characteristics': [ 'error', { version: '1.0' } ],
    'message-reference': [ 'error', { version: '1.0' } ],
    'no-candidate-users': [ 'error', { version: '1.0' } ],
    'no-expression': [ 'error', { version: '1.0' } ],
    'no-loop': [ 'error', { version: '1.0' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '1.0' } ],
    'no-propagate-all-parent-variables' : [ 'error', { version: '1.0' } ],
    'no-task-schedule': [ 'error', { version: '1.0' } ],
    'no-template': [ 'error', { version: '1.0' } ],
    'no-zeebe-properties': [ 'error', { version: '1.0' } ],
    'no-zeebe-user-task': [ 'error', { version: '1.0' } ],
    'sequence-flow-condition': [ 'error', { version: '1.0' } ],
    'subscription': [ 'error', { version: '1.0' } ],
    'start-event-form': [ 'error', { version: '1.0' } ],
    'timer': [ 'error', { version: '1.0' } ],
    'user-task-definition': [ 'warn', { version: '1.0' } ],
    'user-task-form': [ 'error', { version: '1.0' } ]
  }));


  it('camunda-cloud-1-1', expectRules(configs, 'camunda-cloud-1-1', {
    'implementation': [ 'error', { version: '1.1' } ],
    'called-element': [ 'error', { version: '1.1' } ],
    'collapsed-subprocess': [ 'error', { version: '1.1' } ],
    'duplicate-task-headers': [ 'error', { version: '1.1' } ],
    'element-type': [ 'error', { version: '1.1' } ],
    'error-reference': [ 'error', { version: '1.1' } ],
    'event-based-gateway-target': [ 'error', { version: '1.1' } ],
    'executable-process': [ 'error', { version: '1.1' } ],
    'feel': [ 'error', { version: '1.1' } ],
    'loop-characteristics': [ 'error', { version: '1.1' } ],
    'message-reference': [ 'error', { version: '1.1' } ],
    'no-candidate-users': [ 'error', { version: '1.1' } ],
    'no-expression': [ 'error', { version: '1.1' } ],
    'no-loop': [ 'error', { version: '1.1' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '1.1' } ],
    'no-propagate-all-parent-variables' : [ 'error', { version: '1.1' } ],
    'no-task-schedule': [ 'error', { version: '1.1' } ],
    'no-template': [ 'error', { version: '1.1' } ],
    'no-zeebe-properties': [ 'error', { version: '1.1' } ],
    'no-zeebe-user-task': [ 'error', { version: '1.1' } ],
    'sequence-flow-condition': [ 'error', { version: '1.1' } ],
    'subscription': [ 'error', { version: '1.1' } ],
    'start-event-form': [ 'error', { version: '1.1' } ],
    'timer': [ 'error', { version: '1.1' } ],
    'user-task-definition': [ 'warn', { version: '1.1' } ],
    'user-task-form': [ 'error', { version: '1.1' } ]
  }));


  it('camunda-cloud-1-2', expectRules(configs, 'camunda-cloud-1-2', {
    'implementation': [ 'error', { version: '1.2' } ],
    'called-element': [ 'error', { version: '1.2' } ],
    'collapsed-subprocess': [ 'error', { version: '1.2' } ],
    'duplicate-task-headers': [ 'error', { version: '1.2' } ],
    'element-type': [ 'error', { version: '1.2' } ],
    'error-reference': [ 'error', { version: '1.2' } ],
    'event-based-gateway-target': [ 'error', { version: '1.2' } ],
    'executable-process': [ 'error', { version: '1.2' } ],
    'feel': [ 'error', { version: '1.2' } ],
    'loop-characteristics': [ 'error', { version: '1.2' } ],
    'message-reference': [ 'error', { version: '1.2' } ],
    'no-candidate-users': [ 'error', { version: '1.2' } ],
    'no-expression': [ 'error', { version: '1.2' } ],
    'no-loop': [ 'error', { version: '1.2' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '1.2' } ],
    'no-propagate-all-parent-variables' : [ 'error', { version: '1.2' } ],
    'no-task-schedule': [ 'error', { version: '1.2' } ],
    'no-template': [ 'error', { version: '1.2' } ],
    'no-zeebe-properties': [ 'error', { version: '1.2' } ],
    'no-zeebe-user-task': [ 'error', { version: '1.2' } ],
    'sequence-flow-condition': [ 'error', { version: '1.2' } ],
    'subscription': [ 'error', { version: '1.2' } ],
    'start-event-form': [ 'error', { version: '1.2' } ],
    'timer': [ 'error', { version: '1.2' } ],
    'user-task-definition': [ 'warn', { version: '1.2' } ],
    'user-task-form': [ 'error', { version: '1.2' } ]
  }));


  it('camunda-cloud-1-3', expectRules(configs, 'camunda-cloud-1-3', {
    'implementation': [ 'error', { version: '1.3' } ],
    'called-element': [ 'error', { version: '1.3' } ],
    'collapsed-subprocess': [ 'error', { version: '1.3' } ],
    'duplicate-task-headers': [ 'error', { version: '1.3' } ],
    'element-type': [ 'error', { version: '1.3' } ],
    'error-reference': [ 'error', { version: '1.3' } ],
    'event-based-gateway-target': [ 'error', { version: '1.3' } ],
    'executable-process': [ 'error', { version: '1.3' } ],
    'feel': [ 'error', { version: '1.3' } ],
    'loop-characteristics': [ 'error', { version: '1.3' } ],
    'message-reference': [ 'error', { version: '1.3' } ],
    'no-candidate-users': [ 'error', { version: '1.3' } ],
    'no-expression': [ 'error', { version: '1.3' } ],
    'no-loop': [ 'error', { version: '1.3' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '1.3' } ],
    'no-propagate-all-parent-variables' : [ 'error', { version: '1.3' } ],
    'no-task-schedule': [ 'error', { version: '1.3' } ],
    'no-template': [ 'error', { version: '1.3' } ],
    'no-zeebe-properties': [ 'error', { version: '1.3' } ],
    'no-zeebe-user-task': [ 'error', { version: '1.3' } ],
    'sequence-flow-condition': [ 'error', { version: '1.3' } ],
    'subscription': [ 'error', { version: '1.3' } ],
    'start-event-form': [ 'error', { version: '1.3' } ],
    'timer': [ 'error', { version: '1.3' } ],
    'user-task-definition': [ 'warn', { version: '1.3' } ],
    'user-task-form': [ 'error', { version: '1.3' } ]
  }));


  it('camunda-cloud-8-0', expectRules(configs, 'camunda-cloud-8-0', {
    'implementation': [ 'error', { version: '8.0' } ],
    'called-element': [ 'error', { version: '8.0' } ],
    'collapsed-subprocess': [ 'error', { version: '8.0' } ],
    'duplicate-task-headers': [ 'error', { version: '8.0' } ],
    'element-type': [ 'error', { version: '8.0' } ],
    'error-reference': [ 'error', { version: '8.0' } ],
    'event-based-gateway-target': [ 'error', { version: '8.0' } ],
    'executable-process': [ 'error', { version: '8.0' } ],
    'feel': [ 'error', { version: '8.0' } ],
    'loop-characteristics': [ 'error', { version: '8.0' } ],
    'message-reference': [ 'error', { version: '8.0' } ],
    'no-candidate-users': [ 'error', { version: '8.0' } ],
    'no-expression': [ 'error', { version: '8.0' } ],
    'no-loop': [ 'error', { version: '8.0' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '8.0' } ],
    'no-propagate-all-parent-variables' : [ 'error', { version: '8.0' } ],
    'no-task-schedule': [ 'error', { version: '8.0' } ],
    'no-zeebe-properties': [ 'error', { version: '8.0' } ],
    'no-zeebe-user-task': [ 'error', { version: '8.0' } ],
    'sequence-flow-condition': [ 'error', { version: '8.0' } ],
    'subscription': [ 'error', { version: '8.0' } ],
    'start-event-form': [ 'error', { version: '8.0' } ],
    'timer': [ 'error', { version: '8.0' } ],
    'user-task-definition': [ 'warn', { version: '8.0' } ],
    'user-task-form': [ 'error', { version: '8.0' } ]
  }));


  it('camunda-cloud-8-1', expectRules(configs, 'camunda-cloud-8-1', {
    'implementation': [ 'error', { version: '8.1' } ],
    'called-element': [ 'error', { version: '8.1' } ],
    'collapsed-subprocess': [ 'error', { version: '8.1' } ],
    'duplicate-task-headers': [ 'error', { version: '8.1' } ],
    'element-type': [ 'error', { version: '8.1' } ],
    'error-reference': [ 'error', { version: '8.1' } ],
    'event-based-gateway-target': [ 'error', { version: '8.1' } ],
    'executable-process': [ 'error', { version: '8.1' } ],
    'feel': [ 'error', { version: '8.1' } ],
    'inclusive-gateway': [ 'error', { version: '8.1' } ],
    'loop-characteristics': [ 'error', { version: '8.1' } ],
    'message-reference': [ 'error', { version: '8.1' } ],
    'no-candidate-users': [ 'error', { version: '8.1' } ],
    'no-expression': [ 'error', { version: '8.1' } ],
    'no-loop': [ 'error', { version: '8.1' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '8.1' } ],
    'no-propagate-all-parent-variables' : [ 'error', { version: '8.1' } ],
    'no-task-schedule': [ 'error', { version: '8.1' } ],
    'no-zeebe-user-task': [ 'error', { version: '8.1' } ],
    'sequence-flow-condition': [ 'error', { version: '8.1' } ],
    'subscription': [ 'error', { version: '8.1' } ],
    'start-event-form': [ 'error', { version: '8.1' } ],
    'timer': [ 'error', { version: '8.1' } ],
    'user-task-definition': [ 'warn', { version: '8.1' } ],
    'user-task-form': [ 'error', { version: '8.1' } ]
  }));


  it('camunda-cloud-8-2', expectRules(configs, 'camunda-cloud-8-2', {
    'implementation': [ 'error', { version: '8.2' } ],
    'called-element': [ 'error', { version: '8.2' } ],
    'collapsed-subprocess': [ 'error', { version: '8.2' } ],
    'duplicate-task-headers': [ 'error', { version: '8.2' } ],
    'element-type': [ 'error', { version: '8.2' } ],
    'error-reference': [ 'error', { version: '8.2' } ],
    'escalation-boundary-event-attached-to-ref': [ 'error', { version: '8.2' } ],
    'escalation-reference': [ 'error', { version: '8.2' } ],
    'event-based-gateway-target': [ 'error', { version: '8.2' } ],
    'executable-process': [ 'error', { version: '8.2' } ],
    'feel': [ 'error', { version: '8.2' } ],
    'inclusive-gateway': [ 'error', { version: '8.2' } ],
    'link-event': [ 'error', { version: '8.2' } ],
    'loop-characteristics': [ 'error', { version: '8.2' } ],
    'message-reference': [ 'error', { version: '8.2' } ],
    'no-expression': [ 'error', { version: '8.2' } ],
    'no-loop': [ 'error', { version: '8.2' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '8.2' } ],
    'no-signal-event-sub-process': [ 'error', { version: '8.2' } ],
    'no-zeebe-user-task': [ 'error', { version: '8.2' } ],
    'sequence-flow-condition': [ 'error', { version: '8.2' } ],
    'subscription': [ 'error', { version: '8.2' } ],
    'start-event-form': [ 'error', { version: '8.2' } ],
    'task-schedule': [ 'error', { version: '8.2' } ],
    'timer': [ 'error', { version: '8.2' } ],
    'user-task-definition': [ 'warn', { version: '8.2' } ],
    'user-task-form': [ 'error', { version: '8.2' } ]
  }));


  it('camunda-cloud-8-3', expectRules(configs, 'camunda-cloud-8-3', {
    'implementation': [ 'error', { version: '8.3' } ],
    'called-element': [ 'error', { version: '8.3' } ],
    'collapsed-subprocess': [ 'error', { version: '8.3' } ],
    'duplicate-task-headers': [ 'error', { version: '8.3' } ],
    'element-type': [ 'error', { version: '8.3' } ],
    'error-reference': [ 'error', { version: '8.3' } ],
    'escalation-boundary-event-attached-to-ref': [ 'error', { version: '8.3' } ],
    'escalation-reference': [ 'error', { version: '8.3' } ],
    'event-based-gateway-target': [ 'error', { version: '8.3' } ],
    'executable-process': [ 'error', { version: '8.3' } ],
    'feel': [ 'error', { version: '8.3' } ],
    'inclusive-gateway': [ 'error', { version: '8.3' } ],
    'link-event': [ 'error', { version: '8.3' } ],
    'loop-characteristics': [ 'error', { version: '8.3' } ],
    'message-reference': [ 'error', { version: '8.3' } ],
    'no-expression': [ 'error', { version: '8.3' } ],
    'no-loop': [ 'error', { version: '8.3' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '8.3' } ],
    'no-zeebe-user-task': [ 'error', { version: '8.3' } ],
    'secrets': [ 'warn', { version: '8.3' } ],
    'sequence-flow-condition': [ 'error', { version: '8.3' } ],
    'signal-reference': [ 'error', { version: '8.3' } ],
    'start-event-form': [ 'error', { version: '8.3' } ],
    'subscription': [ 'error', { version: '8.3' } ],
    'task-schedule': [ 'error', { version: '8.3' } ],
    'timer': [ 'error', { version: '8.3' } ],
    'user-task-definition': [ 'warn', { version: '8.3' } ],
    'user-task-form': [ 'error', { version: '8.3' } ]
  }));


  it('camunda-cloud-8-4', expectRules(configs, 'camunda-cloud-8-4', {
    'implementation': [ 'error', { version: '8.4' } ],
    'called-element': [ 'error', { version: '8.4' } ],
    'duplicate-task-headers': [ 'error', { version: '8.4' } ],
    'element-type': [ 'error', { version: '8.4' } ],
    'error-reference': [ 'error', { version: '8.4' } ],
    'escalation-boundary-event-attached-to-ref': [ 'error', { version: '8.4' } ],
    'escalation-reference': [ 'error', { version: '8.4' } ],
    'event-based-gateway-target': [ 'error', { version: '8.4' } ],
    'executable-process': [ 'error', { version: '8.4' } ],
    'feel': [ 'error', { version: '8.4' } ],
    'inclusive-gateway': [ 'error', { version: '8.4' } ],
    'link-event': [ 'error', { version: '8.4' } ],
    'loop-characteristics': [ 'error', { version: '8.4' } ],
    'message-reference': [ 'error', { version: '8.4' } ],
    'no-expression': [ 'error', { version: '8.4' } ],
    'no-loop': [ 'error', { version: '8.4' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '8.4' } ],
    'no-zeebe-user-task': [ 'error', { version: '8.4' } ],
    'secrets': [ 'warn', { version: '8.4' } ],
    'sequence-flow-condition': [ 'error', { version: '8.4' } ],
    'signal-reference': [ 'error', { version: '8.4' } ],
    'start-event-form': [ 'error', { version: '8.4' } ],
    'subscription': [ 'error', { version: '8.4' } ],
    'task-schedule': [ 'error', { version: '8.4' } ],
    'timer': [ 'error', { version: '8.4' } ],
    'user-task-definition': [ 'warn', { version: '8.4' } ],
    'user-task-form': [ 'error', { version: '8.4' } ]
  }));


  it('camunda-cloud-8-5', expectRules(configs, 'camunda-cloud-8-5', {
    'implementation': [ 'error', { version: '8.5' } ],
    'called-element': [ 'error', { version: '8.5' } ],
    'duplicate-task-headers': [ 'error', { version: '8.5' } ],
    'element-type': [ 'error', { version: '8.5' } ],
    'error-reference': [ 'error', { version: '8.5' } ],
    'escalation-boundary-event-attached-to-ref': [ 'error', { version: '8.5' } ],
    'escalation-reference': [ 'error', { version: '8.5' } ],
    'event-based-gateway-target': [ 'error', { version: '8.5' } ],
    'executable-process': [ 'error', { version: '8.5' } ],
    'feel': [ 'error', { version: '8.5' } ],
    'inclusive-gateway': [ 'error', { version: '8.5' } ],
    'link-event': [ 'error', { version: '8.5' } ],
    'loop-characteristics': [ 'error', { version: '8.5' } ],
    'message-reference': [ 'error', { version: '8.5' } ],
    'no-expression': [ 'error', { version: '8.5' } ],
    'no-loop': [ 'error', { version: '8.5' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '8.5' } ],
    'secrets': [ 'warn', { version: '8.5' } ],
    'sequence-flow-condition': [ 'error', { version: '8.5' } ],
    'signal-reference': [ 'error', { version: '8.5' } ],
    'start-event-form': [ 'error', { version: '8.5' } ],
    'subscription': [ 'error', { version: '8.5' } ],
    'task-schedule': [ 'error', { version: '8.5' } ],
    'timer': [ 'error', { version: '8.5' } ],
    'user-task-definition': [ 'warn', { version: '8.5' } ],
    'user-task-form': [ 'error', { version: '8.5' } ],
    'wait-for-completion': [ 'error', { version: '8.5' } ]
  }));


  it('camunda-cloud-8-6', expectRules(configs, 'camunda-cloud-8-6', {
    'implementation': [ 'error', { version: '8.6' } ],
    'called-element': [ 'error', { version: '8.6' } ],
    'duplicate-task-headers': [ 'error', { version: '8.6' } ],
    'element-type': [ 'error', { version: '8.6' } ],
    'error-reference': [ 'error', { version: '8.6' } ],
    'escalation-boundary-event-attached-to-ref': [ 'error', { version: '8.6' } ],
    'escalation-reference': [ 'error', { version: '8.6' } ],
    'event-based-gateway-target': [ 'error', { version: '8.6' } ],
    'executable-process': [ 'error', { version: '8.6' } ],
    'feel': [ 'error', { version: '8.6' } ],
    'inclusive-gateway': [ 'error', { version: '8.6' } ],
    'link-event': [ 'error', { version: '8.6' } ],
    'loop-characteristics': [ 'error', { version: '8.6' } ],
    'message-reference': [ 'error', { version: '8.6' } ],
    'no-expression': [ 'error', { version: '8.6' } ],
    'no-loop': [ 'error', { version: '8.6' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '8.6' } ],
    'secrets': [ 'warn', { version: '8.6' } ],
    'sequence-flow-condition': [ 'error', { version: '8.6' } ],
    'signal-reference': [ 'error', { version: '8.6' } ],
    'start-event-form': [ 'error', { version: '8.6' } ],
    'subscription': [ 'error', { version: '8.6' } ],
    'task-schedule': [ 'error', { version: '8.6' } ],
    'timer': [ 'error', { version: '8.6' } ],
    'user-task-definition': [ 'warn', { version: '8.6' } ],
    'user-task-form': [ 'error', { version: '8.6' } ],
    'wait-for-completion': [ 'error', { version: '8.6' } ]
  }));


  it('camunda-platform-7-19', expectRules(configs, 'camunda-platform-7-19', {
    'history-time-to-live': [ 'info', { platform: 'camunda-platform', version: '7.19' } ]
  }));


  it('camunda-platform-7-20', expectRules(configs, 'camunda-platform-7-20', {
    'history-time-to-live': [ 'info', { platform: 'camunda-platform', version: '7.20' } ]
  }));

  it('camunda-platform-7-21', expectRules(configs, 'camunda-platform-7-21', {
    'history-time-to-live': [ 'info', { platform: 'camunda-platform', version: '7.21' } ]
  }));


  it('camunda-platform-7-22', expectRules(configs, 'camunda-platform-7-22', {
    'history-time-to-live': [ 'info', { platform: 'camunda-platform', version: '7.22' } ]
  }));


  it('all', expectRules(configs, 'all', {
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
    'history-time-to-live': 'info',
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
    'no-zeebe-user-task': 'error',
    'secrets': 'warn',
    'sequence-flow-condition': 'error',
    'signal-reference': 'error',
    'subscription': 'error',
    'start-event-form': 'error',
    'task-schedule': 'error',
    'timer': 'error',
    'user-task-definition': 'warn',
    'user-task-form': 'error',
    'wait-for-completion': 'error'
  }));

});

function expectRules(configs, name, rules) {
  return function() {
    expect(configs).to.include.keys(name);

    expect(configs[ name ].rules).to.exist;

    expect(configs[ name ].rules).to.eql(rules);
  };
}
