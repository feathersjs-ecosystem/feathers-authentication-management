import { assert } from "console";
import { dateOrNumberToNumber } from "../../src/helpers/date-or-number-to-number";

describe('date-or-number-to-number', () => {
  it('should return 0 for undefined', () => {
    assert(dateOrNumberToNumber(undefined) === 0);
  });

  it('should return 0 for null', () => {
    assert(dateOrNumberToNumber(null) === 0);
  });

  it('should return default for undefined', () => {
    assert(dateOrNumberToNumber(undefined, 1) === 1);
  });

  it('should return default for null', () => {
    assert(dateOrNumberToNumber(null, 1) === 1);
  });

  it('should return 0 for 0', () => {
    assert(dateOrNumberToNumber(0) === 0);
  });

  it('should return 0 for "0"', () => {
    assert(dateOrNumberToNumber('0') === 0);
  });

  it('should return number for a date', () => {
    assert(dateOrNumberToNumber(new Date(0)) === 0);
  });

  it('should return a number for a dateISOString', () => {
    assert(dateOrNumberToNumber(new Date(0).toISOString()) === 0);
  });
});
