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
    'no-multiple-none-start-events' : [ 'error', { version: '1.0' } ],
    'no-task-schedule': [ 'error', { version: '1.0' } ],
    'no-template': [ 'error', { version: '1.0' } ],
    'no-zeebe-properties': [ 'error', { version: '1.0' } ],
    'sequence-flow-condition': [ 'error', { version: '1.0' } ],
    'subscription': [ 'error', { version: '1.0' } ],
    'timer': [ 'error', { version: '1.0' } ],
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
    'no-multiple-none-start-events' : [ 'error', { version: '1.1' } ],
    'no-task-schedule': [ 'error', { version: '1.1' } ],
    'no-template': [ 'error', { version: '1.1' } ],
    'no-zeebe-properties': [ 'error', { version: '1.1' } ],
    'sequence-flow-condition': [ 'error', { version: '1.1' } ],
    'subscription': [ 'error', { version: '1.1' } ],
    'timer': [ 'error', { version: '1.1' } ],
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
    'no-multiple-none-start-events' : [ 'error', { version: '1.2' } ],
    'no-task-schedule': [ 'error', { version: '1.2' } ],
    'no-template': [ 'error', { version: '1.2' } ],
    'no-zeebe-properties': [ 'error', { version: '1.2' } ],
    'sequence-flow-condition': [ 'error', { version: '1.2' } ],
    'subscription': [ 'error', { version: '1.2' } ],
    'timer': [ 'error', { version: '1.2' } ],
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
    'no-multiple-none-start-events' : [ 'error', { version: '1.3' } ],
    'no-task-schedule': [ 'error', { version: '1.3' } ],
    'no-template': [ 'error', { version: '1.3' } ],
    'no-zeebe-properties': [ 'error', { version: '1.3' } ],
    'sequence-flow-condition': [ 'error', { version: '1.3' } ],
    'subscription': [ 'error', { version: '1.3' } ],
    'timer': [ 'error', { version: '1.3' } ],
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
    'no-multiple-none-start-events' : [ 'error', { version: '8.0' } ],
    'no-task-schedule': [ 'error', { version: '8.0' } ],
    'no-zeebe-properties': [ 'error', { version: '8.0' } ],
    'sequence-flow-condition': [ 'error', { version: '8.0' } ],
    'subscription': [ 'error', { version: '8.0' } ],
    'timer': [ 'error', { version: '8.0' } ],
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
    'no-multiple-none-start-events' : [ 'error', { version: '8.1' } ],
    'no-task-schedule': [ 'error', { version: '8.1' } ],
    'sequence-flow-condition': [ 'error', { version: '8.1' } ],
    'subscription': [ 'error', { version: '8.1' } ],
    'timer': [ 'error', { version: '8.1' } ],
    'user-task-form': [ 'error', { version: '8.1' } ]
  }));


  it('camunda-cloud-8-2', expectRules(configs, 'camunda-cloud-8-2', {
    'implementation': [ 'error', { version: '8.2' } ],
    'called-element': [ 'error', { version: '8.2' } ],
    'collapsed-subprocess': [ 'error', { version: '8.2' } ],
    'duplicate-task-headers': [ 'error', { version: '8.2' } ],
    'element-type': [ 'error', { version: '8.2' } ],
    'error-reference': [ 'error', { version: '8.2' } ],
    'escalation-reference': [ 'error', { version: '8.2' } ],
    'event-based-gateway-target': [ 'error', { version: '8.2' } ],
    'executable-process': [ 'error', { version: '8.2' } ],
    'feel': [ 'error', { version: '8.2' } ],
    'inclusive-gateway': [ 'error', { version: '8.2' } ],
    'loop-characteristics': [ 'error', { version: '8.2' } ],
    'message-reference': [ 'error', { version: '8.2' } ],
    'no-expression': [ 'error', { version: '8.2' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '8.2' } ],
    'no-signal-event-sub-process': [ 'error', { version: '8.2' } ],
    'sequence-flow-condition': [ 'error', { version: '8.2' } ],
    'subscription': [ 'error', { version: '8.2' } ],
    'task-schedule': [ 'error', { version: '8.2' } ],
    'timer': [ 'error', { version: '8.2' } ],
    'user-task-form': [ 'error', { version: '8.2' } ]
  }));


  it('camunda-cloud-8-3', expectRules(configs, 'camunda-cloud-8-3', {
    'implementation': [ 'error', { version: '8.3' } ],
    'called-element': [ 'error', { version: '8.3' } ],
    'collapsed-subprocess': [ 'error', { version: '8.3' } ],
    'duplicate-task-headers': [ 'error', { version: '8.3' } ],
    'element-type': [ 'error', { version: '8.3' } ],
    'error-reference': [ 'error', { version: '8.3' } ],
    'escalation-reference': [ 'error', { version: '8.3' } ],
    'event-based-gateway-target': [ 'error', { version: '8.3' } ],
    'executable-process': [ 'error', { version: '8.3' } ],
    'feel': [ 'error', { version: '8.3' } ],
    'inclusive-gateway': [ 'error', { version: '8.3' } ],
    'loop-characteristics': [ 'error', { version: '8.3' } ],
    'message-reference': [ 'error', { version: '8.3' } ],
    'no-expression': [ 'error', { version: '8.3' } ],
    'no-multiple-none-start-events' : [ 'error', { version: '8.3' } ],
    'no-signal-event-sub-process': [ 'error', { version: '8.3' } ],
    'sequence-flow-condition': [ 'error', { version: '8.3' } ],
    'signal-reference': [ 'error', { version: '8.3' } ],
    'subscription': [ 'error', { version: '8.3' } ],
    'task-schedule': [ 'error', { version: '8.3' } ],
    'timer': [ 'error', { version: '8.3' } ],
    'user-task-form': [ 'error', { version: '8.3' } ]
  }));


  it('camunda-platform-7-19', expectRules(configs, 'camunda-platform-7-19', {
    'history-time-to-live': [ 'error', { platform: 'camunda-platform', version: '7.19' } ]
  }));


  it('camunda-platform-7-20', expectRules(configs, 'camunda-platform-7-20', {
    'history-time-to-live': [ 'error', { platform: 'camunda-platform', version: '7.20' } ]
  }));

});

function expectRules(configs, name, rules) {
  return function() {
    expect(configs).to.include.keys(name);

    expect(configs[ name ].rules).to.exist;

    expect(configs[ name ].rules).to.eql(rules);
  };
}