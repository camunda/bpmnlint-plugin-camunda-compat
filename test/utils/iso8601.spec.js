const { expect } = require('chai');

const {
  getCycleStartDate,
  parseDate,
  validateCycle,
  validateDate,
  validateDuration
} = require('../../rules/utils/iso8601');


describe('utils/iso8601', function() {

  describe('#validateDate', function() {

    // given
    const VALID = [
      '2019-01-01T00:00:00Z',
      '2019-01-01T00:00:00+01:00',
      '2019-01-01T00:00:00-01:00',
      '2019-01-01T00:00:00Z',
      '2019-01-01T00:00:00+01:00',
      '2019-01-01T00:00:00-01:00',
      '2019-01-01T00:00:00+01:00[Europe/Berlin]',
      '2019-01-01T00:00:00+00:00[UTC]',
      '2019-01-01T00:00:00+00:00[Zulu]',
      '2019-01-01T00:00:00+00:00[WET]',
      '1970-01-01T00:00:00Z',

      // fractional seconds
      '2019-01-01T00:00:00.1Z',
      '2019-01-01T00:00:00.000Z',
      '2019-01-01T00:00:00.123456789Z',
      '2019-01-01T00:00:00.000+01:00',
      '2019-01-01T00:00:00.000-01:00',

      // optional seconds
      '2019-01-01T00:00Z',
      '2019-01-01T00:00+01:00',

      // zone ID with Z
      '2019-01-01T00:00:00Z[UTC]',
      '2019-01-01T00:00:00Z[Europe/Berlin]',

      // offsets up to 18 hours
      '2019-01-01T00:00:00+14:00',
      '2019-01-01T00:00:00+18:00',
      '2019-01-01T00:00:00-18:00'
    ];
    for (const valid of VALID) {
      it(`should return 'true' for valid ISO 8601 date: ${valid}`, function() {

        // then
        expect(validateDate(valid)).to.be.true;
      });
    }

    // given
    const INVALID = [
      'INVALID',
      '2019-01-01T00:00:00[Europe/Berlin]',
      '2019-13-01T00:00:00Z',
      '2019-01-01T23:70:00Z',
      '2019-01-01T23:00:70Z',

      // invalid date
      '2019-04-31T00:00:00Z',
      '2019-02-29T00:00:00Z',
      '2022-02-29T00:00:00Z',
      '2020-02-31T00:00:00Z',

      // local time is not supported
      '2019-01-01T00:00:00',
      '2019-01-01T00:00',
      '2019-01-01T00:00:00.000',

      // invalid fractional seconds
      '2019-01-01T00:00:00.0000000000Z',
      '2019-01-01T00:00.5Z',

      // offset out of range
      '2019-01-01T00:00:00+18:01',
      '2019-01-01T00:00:00+19:00',
      '2019-01-01T00:00:00-18:01',

      // unsupported in Zeebe
      '2019-01-01T00:00:00+01:00@Europe/Berlin',
    ];
    for (const invalid of INVALID) {
      it(`should return 'false' for invalid ISO 8601 date: ${invalid}`, function() {

        // then
        expect(validateDate(invalid)).to.be.false;
      });
    }
  });


  describe('#validateCycle', function() {

    // given
    const VALID = [
      'R5/P1Y2M10DT2H30M',
      'R/P1Y2M10DT2H30M',
      'R-1/P1Y2M10DT2H30M',
      'R0/P1Y2M10DT2H30M',
      'R3/P1W',
      'R3/2024-01-01T12:00:00Z/P1D',
      'R5/2024-01-01T12:00:00Z/P1Y2M10DT2H30M',
      'R/2024-01-01T12:00:00+02:00[Europe/Berlin]/P1D',
      'R/2024-01-01T12:00:00.123Z/P1D',
      'R/2024-01-01T12:00Z/P1D',
      'R/2024-01-01T12:00:00Z[UTC]/P1D',
      'R/2024-01-01T12:00:00+14:00/P1D'
    ];
    for (const valid of VALID) {
      it(`should return 'true' for valid ISO 8601 cycle: ${valid}`, function() {

        // then
        expect(validateCycle(valid)).to.be.true;
      });
    }

    // given
    const INVALID = [
      'INVALID',
      'R3/PT1W',

      // unsupported in Zeebe
      'R-2/P1Y2M10DT2H30M'
    ];
    for (const invalid of INVALID) {
      it(`should return 'false' for invalid ISO 8601 cycle: ${invalid}`, function() {

        // then
        expect(validateCycle(invalid)).to.be.false;
      });
    }
  });


  describe('#validateDuration', function() {

    // given
    const VALID = [
      'P1Y',
      'P1Y2M',
      'P1Y2M10D',
      'P1Y2M10DT2H',
      'P1Y2M10DT2H30M',
      'P1Y2M10DT2H30M2S',
      'P1Y2M10DT2S',
      'PT2H30M',
      'PT1S',
      'PT1s',
      'P1W',
      'P1WT2H30M'
    ];
    for (const valid of VALID) {
      it(`should return 'true' for valid ISO 8601 duration: ${valid}`, function() {

        // then
        expect(validateDuration(valid)).to.be.true;
      });
    }

    // given
    const INVALID = [
      'INVALID',
      'P1S',
      'P1Y2F',
      '1S',
      'T2M',
      'P',
      'PT',
      'P2DT',
      'P1W1Y',

      // unsupported in Zeebe
      '2007-03-01T13:00:00Z/2008-05-11T15:30:00Z',
      '2007-03-01T13:00:00Z/P1Y2M10DT2H30M',
      'P1Y2M10DT2H30M/2008-05-11T15:30:00Z'
    ];
    for (const invalid of INVALID) {
      it(`should return 'false' for invalid ISO 8601 duration: ${invalid}`, function() {

        // then
        expect(validateDuration(invalid)).to.be.false;
      });
    }
  });


  describe('#getCycleStartDate', function() {

    // given
    const WITH_START_DATE = {
      'R/2026-01-01T02:00:00Z/P1M': '2026-01-01T02:00:00Z',
      'R5/2026-01-01T02:00:00+10:00/PT1H': '2026-01-01T02:00:00+10:00',
      'R/2026-01-01T02:00:00+10:00[Australia/Melbourne]/P1M': '2026-01-01T02:00:00+10:00[Australia/Melbourne]',
      'R/2026-01-01T02:00:00.123Z/P1M': '2026-01-01T02:00:00.123Z',
      'R/2026-01-01T02:00Z/P1M': '2026-01-01T02:00Z',
      'R/2026-01-01T02:00:00Z[UTC]/P1M': '2026-01-01T02:00:00Z[UTC]',
      'R/2026-01-01T02:00:00+14:00/P1M': '2026-01-01T02:00:00+14:00'
    };
    for (const [ cycle, startDate ] of Object.entries(WITH_START_DATE)) {
      it(`should return start date of ISO 8601 cycle: ${cycle}`, function() {

        // then
        expect(getCycleStartDate(cycle)).to.equal(startDate);
      });
    }

    // given
    const WITHOUT_START_DATE = [
      'R/P1D',
      'R5/PT10S',
      '0 0 9-17 * * MON-FRI',
      '=foo',
      'R/2019-02-29T00:00:00Z/P1D',
      'INVALID'
    ];
    for (const cycle of WITHOUT_START_DATE) {
      it(`should return 'null' for cycle without (valid) start date: ${cycle}`, function() {

        // then
        expect(getCycleStartDate(cycle)).to.be.null;
      });
    }
  });


  describe('#parseDate', function() {

    // given
    const VALID = {
      '2025-01-01T09:00:00Z': '2025-01-01T09:00:00.000Z',
      '2025-01-01T09:00:00+01:00': '2025-01-01T08:00:00.000Z',
      '2026-01-01T02:00:00+10:00[Australia/Melbourne]': '2025-12-31T16:00:00.000Z',
      '2025-01-01T09:00:00.1Z': '2025-01-01T09:00:00.100Z',
      '2025-01-01T09:00:00.12Z': '2025-01-01T09:00:00.120Z',
      '2025-01-01T09:00:00.123Z': '2025-01-01T09:00:00.123Z',
      '2025-01-01T09:00:00.123456789Z': '2025-01-01T09:00:00.123Z',
      '2025-01-01T09:00Z': '2025-01-01T09:00:00.000Z',
      '2025-01-01T09:00:00Z[UTC]': '2025-01-01T09:00:00.000Z',
      '2025-01-01T09:00:00+14:00': '2024-12-31T19:00:00.000Z',
      '2025-01-01T09:00:00-18:00': '2025-01-02T03:00:00.000Z'
    };
    for (const [ date, expected ] of Object.entries(VALID)) {
      it(`should parse ISO 8601 date: ${date}`, function() {

        // then
        expect(parseDate(date).toISOString()).to.equal(expected);
      });
    }

    // given
    const INVALID = [
      null,
      '',
      'INVALID',
      '=foo',
      '2019-02-29T00:00:00Z',
      '2019-01-01T00:00:00',
      '2019-01-01T00:00:00+19:00'
    ];
    for (const invalid of INVALID) {
      it(`should return 'null' for invalid ISO 8601 date: ${invalid}`, function() {

        // then
        expect(parseDate(invalid)).to.be.null;
      });
    }
  });
});
