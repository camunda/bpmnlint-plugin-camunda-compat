const { createRule } = require('./utils/rule');

const checks = require('./camunda-cloud-1-2-checks');

module.exports = createRule('Camunda Cloud', '1.2', checks, 'Zeebe');