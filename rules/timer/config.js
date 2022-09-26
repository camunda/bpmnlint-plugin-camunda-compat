const camundaCloud10Formats = [
  'iso8601'
];

const camundaCloud81Formats = [
  ...camundaCloud10Formats,
  'cron'
];

module.exports = {
  camundaCloud10: {
    formats: camundaCloud10Formats
  },
  camundaCloud81: {
    formats: camundaCloud81Formats
  }
};
