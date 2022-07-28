import assert from "assert";

function aboutEqualDateTime (
  time1: number | Date,
  time2: number | Date,
  msg?: string,
  delta?: number
) {
  delta = delta || 600;
  //@ts-ignore
  const diff = Math.abs(time1 - time2);
  assert.ok(diff <= delta, msg || `times differ by ${diff}ms`);
}

export default aboutEqualDateTime;
