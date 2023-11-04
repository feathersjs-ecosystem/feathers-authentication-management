function isStringOfDigits(value: string) {
  return /^\d+$/.test(value);
}

export function dateOrNumberToNumber(dateOrNumber: Date | number | string | undefined | null): number {
  if (!dateOrNumber) return 0;
  return typeof dateOrNumber === 'number'
    ? dateOrNumber
    : typeof dateOrNumber === 'string'
      ? isStringOfDigits(dateOrNumber)
        ? Number(dateOrNumber)
        : new Date(dateOrNumber).getTime()
    : new Date(dateOrNumber).getTime();
}
