const { expect } = require('chai');

const { configs } = require('../index');

describe('configs', function() {

  it('should have all', expectRules(configs, 'all', {
    'camunda-cloud-1-0': 'error',
    'camunda-cloud-1-1': 'error',
    'camunda-cloud-1-2': 'error',
    'camunda-cloud-1-3': 'error',
    'camunda-cloud-8-0': 'error',
    'camunda-platform-7-15': 'error',
    'camunda-platform-7-16': 'error',
    'camunda-platform-7-17': 'error'
  }));


  it('should have recommended', expectRules(configs, 'recommended', {
    'camunda-cloud-1-0': 'error',
    'camunda-cloud-1-1': 'error',
    'camunda-cloud-1-2': 'error',
    'camunda-cloud-1-3': 'error',
    'camunda-cloud-8-0': 'error',
    'camunda-platform-7-15': 'error',
    'camunda-platform-7-16': 'error',
    'camunda-platform-7-17': 'error'
  }));


  it('should have cloud', expectRules(configs, 'cloud', {
    'camunda-cloud-1-0': 'error',
    'camunda-cloud-1-1': 'error',
    'camunda-cloud-1-2': 'error',
    'camunda-cloud-1-3': 'error',
    'camunda-cloud-8-0': 'error'
  }));


  it('should have platform', expectRules(configs, 'platform', {
    'camunda-platform-7-15': 'error',
    'camunda-platform-7-16': 'error',
    'camunda-platform-7-17': 'error'
  }));

});

function expectRules(configs, name, rules) {
  return function() {
    expect(configs).to.include.keys(name);

    expect(configs[ name ].rules).to.exist;

    expect(configs[ name ].rules).to.eql(rules);
  };
}