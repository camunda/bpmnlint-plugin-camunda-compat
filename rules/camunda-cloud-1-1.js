const { createRule } = require('./utils/rule');

const checks = require('./camunda-cloud-1-1-checks');

module.exports = createRule('Camunda Cloud', '1.1', checks, 'Camunda Platform 8 (Zeebe 1.1)');
