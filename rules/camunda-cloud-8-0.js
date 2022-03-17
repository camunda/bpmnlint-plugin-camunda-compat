const { createRule } = require('./utils/rule');

const checks = require('./camunda-cloud-8-0-checks');

module.exports = createRule('Camunda Cloud', '8.0', checks, 'Camunda Platform');