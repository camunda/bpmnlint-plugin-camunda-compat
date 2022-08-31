const { expect } = require('chai');

const { configs } = require('../index');

describe('configs', function() {

  it('camunda-cloud-1-0', expectRules(configs, 'camunda-cloud-1-0', {
    'called-decision-or-task-definition': 'error',
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': 'error',
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-1', expectRules(configs, 'camunda-cloud-1-1', {
    'called-decision-or-task-definition': 'error',
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': 'error',
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-2', expectRules(configs, 'camunda-cloud-1-2', {
    'called-decision-or-task-definition': 'error',
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': 'error',
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-3', expectRules(configs, 'camunda-cloud-1-3', {
    'called-decision-or-task-definition': 'error',
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': 'error',
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'user-task-form': 'error'
  }));


  it('camunda-cloud-8-0', expectRules(configs, 'camunda-cloud-8-0', {
    'called-decision-or-task-definition': 'error',
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': 'error',
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'user-task-form': 'error'
  }));


  it('camunda-cloud-8-1', expectRules(configs, 'camunda-cloud-8-1', {
    'called-decision-or-task-definition': 'error',
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': 'error',
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'subscription': 'error',
    'user-task-form': 'error'
  }));

});

function expectRules(configs, name, rules) {
  return function() {
    expect(configs).to.include.keys(name);

    expect(configs[ name ].rules).to.exist;

    expect(configs[ name ].rules).to.include.keys(Object.keys(rules));
  };
}