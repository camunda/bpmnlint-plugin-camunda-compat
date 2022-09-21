const camundaCloud10 = {
  formats: [
    'iso8601'
  ]
};

module.exports = {
  camundaCloud10: camundaCloud10,
  camundaCloud11: camundaCloud10,
  camundaCloud12: camundaCloud10,
  camundaCloud13: camundaCloud10,
  camundaCloud80: camundaCloud10,
  camundaCloud81: {
    formats: [
      ...camundaCloud10.formats,
      'cron'
    ]
  }
};
