const { createRule } = require('./utils/rule');

const checks = require('./camunda-cloud-1-4-checks');

module.exports = createRule('Camunda Cloud', '1.4', checks);