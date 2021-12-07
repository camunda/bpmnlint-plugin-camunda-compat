const { createRule } = require('./utils/rule');

const checks = require('./camunda-cloud-1-2-checks');

module.exports = createRule('1.2', checks);