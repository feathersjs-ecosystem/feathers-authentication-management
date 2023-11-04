function isStringOfDigits(value: string) {
  return /^\d+$/.test(value);
}

/**
 * Converts a Date or number to a number. If a string is passed, it will be converted to a number if it is a string of digits, otherwise it will be converted to a Date (expects a date ISO string) and then a number.
 * @param dateOrNumber
 * @param fallBack The value to return if the value is undefined or null. Defaults to `0`.
 * @returns
 */
export function dateOrNumberToNumber(dateOrNumber: Date | number | string | undefined | null, fallBack = 0): number {
  if (!dateOrNumber) return fallBack;
  return typeof dateOrNumber === 'number'
    ? dateOrNumber
    : typeof dateOrNumber === 'string'
      ? isStringOfDigits(dateOrNumber)
        ? Number(dateOrNumber)
        : new Date(dateOrNumber).getTime()
    : new Date(dateOrNumber).getTime();
}
