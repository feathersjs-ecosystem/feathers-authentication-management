import { BadRequest } from '@feathersjs/errors';
import type { Id } from '@feathersjs/feathers';

export function isDateAfterNow (
  date: number | Date,
  delay = 0
): boolean {
  if (date instanceof Date) date = date.getTime();

  return date > Date.now() + delay;
}

export function deconstructId (
  token: string
): string {
  if (!token.includes('___')) {
    throw new BadRequest(
      'Token is not in the correct format.',
      { errors: { $className: 'badParams' } }
    );
  }

  return token.slice(0, token.indexOf('___'));
}

export function concatIDAndHash (
  id: Id,
  token: string
): string {
  return `${id}___${token}`;
}

export function ensureValuesAreStrings (
  ...values: string[]
): void {
  if (!values.every(str => typeof str === 'string')) {
    throw new BadRequest(
      'Expected string value. (authLocalMgnt)',
      { errors: { $className: 'badParams' } }
    );
  }
}

/**
 * Verify that obj1 and obj2 have different 'field' field
 * Returns false if either object is null/undefined
 */
export function ensureFieldHasChanged (
  obj1: Record<string, unknown> | null,
  obj2: Record<string, unknown> | null
): (field: string) => boolean {
  return (obj1 == null || obj2 == null)
    ? () => false
    : field => obj1[field] !== obj2[field];
}

export function ensureObjPropsValid (
  obj: Record<string, unknown>,
  props: string[],
  allowNone?: boolean
): void {
  const keys = Object.keys(obj);
  const valid = keys.every(key => props.includes(key) && typeof obj[key] === 'string');

  if (!valid || (keys.length === 0 && !allowNone)) {
    throw new BadRequest(
      'User info is not valid. (authLocalMgnt)',
      { errors: { $className: 'badParams' } }
    );
  }
}

export {
  getLongToken,
  getShortToken,
  randomBytes,
  randomDigits
} from './crypto';

export { cloneObject } from './clone-object';
export { comparePasswords } from './compare-passwords';
export { getUserData } from './get-user-data';
export { hashPassword } from './hash-password';
export { notify } from './notify';
export { sanitizeUserForClient } from './sanitize-user-for-client';
export { sanitizeUserForNotifier } from './sanitize-user-for-notifier';
