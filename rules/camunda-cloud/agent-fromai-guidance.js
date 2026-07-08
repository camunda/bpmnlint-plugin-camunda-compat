const { skipInNonExecutableProcess } = require('../utils/rule');
const { annotateRule } = require('../helper');

/**
 * Placeholder: no advisory case currently applies to fromAi() calls.
 *
 * The description argument is optional per the fromAi() signature, so an
 * omitted or empty description is valid (not reported). A tool's own missing
 * documentation is a separate concern owned by agent-tool-documentation.
 * The conditional-key case (a key that is an if/then/else expression) was
 * previously a warning here, but the connector requires the key to be a plain
 * reference regardless of which branch would apply at runtime (confirmed
 * against FromAiTaggedParameterExtractor.parameterName() in camunda/camunda),
 * so it has no legitimate reading and moved to agent-fromai-contract as an
 * error. Everything else with no legitimate reading (wrong key type,
 * missing/misplaced toolCall. prefix, multi-segment keys, duplicate keys,
 * function name casing, a description that is not a string literal, wrong
 * context) already lived there.
 */
module.exports = skipInNonExecutableProcess(function() {
  function check() {}

  return annotateRule('agent-fromai-guidance', {
    check
  });
});
