const { expect } = require('chai');

const { configs } = require('../..');

describe('configs', function() {

  it('camunda-cloud-1-0', expectRules(configs, 'camunda-cloud-1-0', {
    'called-decision-or-task-definition': [ 'error', { version: '1.0' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '1.0' } ],
    'error-reference': 'error',
    'feel': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '1.0' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-1', expectRules(configs, 'camunda-cloud-1-1', {
    'called-decision-or-task-definition': [ 'error', { version: '1.1' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '1.1' } ],
    'error-reference': 'error',
    'feel': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '1.1' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-2', expectRules(configs, 'camunda-cloud-1-2', {
    'called-decision-or-task-definition': [ 'error', { version: '1.2' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '1.2' } ],
    'error-reference': 'error',
    'feel': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '1.2' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-3', expectRules(configs, 'camunda-cloud-1-3', {
    'called-decision-or-task-definition': [ 'error', { version: '1.3' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '1.3' } ],
    'error-reference': 'error',
    'feel': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '1.3' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-8-0', expectRules(configs, 'camunda-cloud-8-0', {
    'called-decision-or-task-definition': [ 'error', { version: '8.0' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '8.0' } ],
    'error-reference': 'error',
    'feel': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '8.0' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-8-1', expectRules(configs, 'camunda-cloud-8-1', {
    'called-decision-or-task-definition': [ 'error', { version: '8.1' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '8.1' } ],
    'error-reference': 'error',
    'feel': 'error',
    'inclusive-gateway': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '8.1' } ],
    'user-task-form': 'error'
  }));

});

function expectRules(configs, name, rules) {
  return function() {
    expect(configs).to.include.keys(name);

    expect(configs[ name ].rules).to.exist;

    expect(configs[ name ].rules).to.eql(rules);
  };
}