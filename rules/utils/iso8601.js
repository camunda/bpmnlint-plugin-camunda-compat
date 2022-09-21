const ISO_DATE_REGEX = /^\d{4}(-\d\d){2}T(\d\d:){2}\d\d(Z|([+-]\d\d:\d\d)(\[\w+\/\w+\])?)?$/;
const ISO_DURATION = 'P(\\d+(\\.\\d+)?[Yy])?(\\d+(\\.\\d+)?[Mm])?(\\d+(\\.\\d+)?[Dd])?(T(\\d+(\\.\\d+)?[Hh])?(\\d+(\\.\\d+)?[Mm])?(\\d+(\\.\\d+)?[Ss])?)?$';
const ISO_DURATION_REGEX = new RegExp(`^${ISO_DURATION}$`);
const ISO_CYCLE = `R(-1|\\d+)?/${ISO_DURATION}`;
const ISO_CYCLE_REGEX = new RegExp(`^${ISO_CYCLE}$`);

module.exports = {
  validateCycle,
  validateDate,
  validateDuration
};

function validateCycle(value) {
  return ISO_CYCLE_REGEX.test(value);
}

function validateDate(value) {
  return ISO_DATE_REGEX.test(value);
}

function validateDuration(value) {
  return ISO_DURATION_REGEX.test(value);
}
