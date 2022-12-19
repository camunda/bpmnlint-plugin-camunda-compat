const { expect } = require('chai');

const { configs } = require('../..');

describe('configs', function() {

  it('camunda-cloud-1-0', expectRules(configs, 'camunda-cloud-1-0', {
    'implementation': [ 'error', { version: '1.0' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '1.0' } ],
    'error-reference': 'error',
    'executable-process': 'error',
    'feel': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-expression': [ 'error', { version: '1.0' } ],
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'sequence-flow-condition': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '1.0' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-1', expectRules(configs, 'camunda-cloud-1-1', {
    'implementation': [ 'error', { version: '1.1' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '1.1' } ],
    'error-reference': 'error',
    'executable-process': 'error',
    'feel': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-expression': [ 'error', { version: '1.1' } ],
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'sequence-flow-condition': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '1.1' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-2', expectRules(configs, 'camunda-cloud-1-2', {
    'implementation': [ 'error', { version: '1.2' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '1.2' } ],
    'error-reference': 'error',
    'executable-process': 'error',
    'feel': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-expression': [ 'error', { version: '1.2' } ],
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'sequence-flow-condition': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '1.2' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-3', expectRules(configs, 'camunda-cloud-1-3', {
    'implementation': [ 'error', { version: '1.3' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '1.3' } ],
    'error-reference': 'error',
    'executable-process': 'error',
    'feel': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-expression': [ 'error', { version: '1.3' } ],
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'sequence-flow-condition': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '1.3' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-8-0', expectRules(configs, 'camunda-cloud-8-0', {
    'implementation': [ 'error', { version: '8.0' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '8.0' } ],
    'error-reference': 'error',
    'executable-process': 'error',
    'feel': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-expression': [ 'error', { version: '8.0' } ],
    'no-zeebe-properties': 'error',
    'sequence-flow-condition': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '8.0' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-8-1', expectRules(configs, 'camunda-cloud-8-1', {
    'implementation': [ 'error', { version: '8.1' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '8.1' } ],
    'error-reference': 'error',
    'executable-process': 'error',
    'feel': 'error',
    'inclusive-gateway': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-expression': [ 'error', { version: '8.1' } ],
    'sequence-flow-condition': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '8.1' } ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-8-2', expectRules(configs, 'camunda-cloud-8-2', {
    'implementation': [ 'error', { version: '8.2' } ],
    'called-element': 'error',
    'collapsed-subprocess': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', { version: '8.2' } ],
    'error-reference': 'error',
    'executable-process': 'error',
    'feel': 'error',
    'inclusive-gateway': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-expression': [ 'error', { version: '8.2' } ],
    'sequence-flow-condition': 'error',
    'subscription': 'error',
    'timer': [ 'error', { version: '8.2' } ],
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