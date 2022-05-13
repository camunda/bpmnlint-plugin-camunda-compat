const { expect } = require('chai');

const { configs } = require('../index');

describe('configs', function() {

  it('camunda-cloud-1-0', expectRules(configs, 'camunda-cloud-1-0', {
    'has-called-decision-or-task-definition': 'error',
    'has-called-element': 'error',
    'has-error-reference': 'error',
    'has-loop-characteristics': 'error',
    'has-message-reference': 'error',
    'has-subscription': 'error',
    'is-element': 'error'
  }));


  it('camunda-cloud-1-1', expectRules(configs, 'camunda-cloud-1-1', {
    'has-called-decision-or-task-definition': 'error',
    'has-called-element': 'error',
    'has-error-reference': 'error',
    'has-loop-characteristics': 'error',
    'has-message-reference': 'error',
    'has-subscription': 'error',
    'is-element': 'error'
  }));


  it('camunda-cloud-1-2', expectRules(configs, 'camunda-cloud-1-2', {
    'has-called-decision-or-task-definition': 'error',
    'has-called-element': 'error',
    'has-error-reference': 'error',
    'has-loop-characteristics': 'error',
    'has-message-reference': 'error',
    'has-subscription': 'error',
    'is-element': 'error'
  }));


  it('camunda-cloud-1-3', expectRules(configs, 'camunda-cloud-1-3', {
    'has-called-decision-or-task-definition': 'error',
    'has-called-element': 'error',
    'has-error-reference': 'error',
    'has-loop-characteristics': 'error',
    'has-message-reference': 'error',
    'has-subscription': 'error',
    'is-element': 'error'
  }));


  it('camunda-cloud-8-0', expectRules(configs, 'camunda-cloud-8-0', {
    'has-called-decision-or-task-definition': 'error',
    'has-called-element': 'error',
    'has-error-reference': 'error',
    'has-loop-characteristics': 'error',
    'has-message-reference': 'error',
    'has-subscription': 'error',
    'is-element': 'error'
  }));

});

function expectRules(configs, name, rules) {
  return function() {
    expect(configs).to.include.keys(name);

    expect(configs[ name ].rules).to.exist;

    expect(configs[ name ].rules).to.include.keys(Object.keys(rules));
  };
}