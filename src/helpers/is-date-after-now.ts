export function isDateAfterNow (
  date: number | Date,
  delay = 0
): boolean {
  if (date instanceof Date) date = date.getTime();

  return date > Date.now() + delay;
}
