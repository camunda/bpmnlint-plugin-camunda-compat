const { expect } = require('chai');

const { configs } = require('../..');

describe('configs', function() {

  it('camunda-cloud-1-0', expectRules(configs, 'camunda-cloud-1-0', {
    'called-decision-or-task-definition': [ 'error', require('../../rules/called-decision-or-task-definition/config').camundaCloud10 ],
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', require('../../rules/element-type/config').camundaCloud10 ],
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'timer': [ 'error', require('../../rules/timer/config').camundaCloud10 ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-1', expectRules(configs, 'camunda-cloud-1-1', {
    'called-decision-or-task-definition': [ 'error', require('../../rules/called-decision-or-task-definition/config').camundaCloud11 ],
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', require('../../rules/element-type/config').camundaCloud11 ],
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'timer': [ 'error', require('../../rules/timer/config').camundaCloud10 ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-2', expectRules(configs, 'camunda-cloud-1-2', {
    'called-decision-or-task-definition': [ 'error', require('../../rules/called-decision-or-task-definition/config').camundaCloud12 ],
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', require('../../rules/element-type/config').camundaCloud12 ],
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'timer': [ 'error', require('../../rules/timer/config').camundaCloud10 ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-1-3', expectRules(configs, 'camunda-cloud-1-3', {
    'called-decision-or-task-definition': [ 'error', require('../../rules/called-decision-or-task-definition/config').camundaCloud13 ],
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', require('../../rules/element-type/config').camundaCloud12 ],
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-template': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'timer': [ 'error', require('../../rules/timer/config').camundaCloud10 ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-8-0', expectRules(configs, 'camunda-cloud-8-0', {
    'called-decision-or-task-definition': [ 'error', require('../../rules/called-decision-or-task-definition/config').camundaCloud13 ],
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', require('../../rules/element-type/config').camundaCloud12 ],
    'error-reference': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'no-zeebe-properties': 'error',
    'subscription': 'error',
    'timer': [ 'error', require('../../rules/timer/config').camundaCloud10 ],
    'user-task-form': 'error'
  }));


  it('camunda-cloud-8-1', expectRules(configs, 'camunda-cloud-8-1', {
    'called-decision-or-task-definition': [ 'error', require('../../rules/called-decision-or-task-definition/config').camundaCloud13 ],
    'called-element': 'error',
    'duplicate-task-headers': 'error',
    'element-type': [ 'error', require('../../rules/element-type/config').camundaCloud81 ],
    'error-reference': 'error',
    'inclusive-gateway': 'error',
    'loop-characteristics': 'error',
    'message-reference': 'error',
    'subscription': 'error',
    'timer': [ 'error', require('../../rules/timer/config').camundaCloud81 ],
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