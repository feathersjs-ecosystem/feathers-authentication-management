import { BadRequest } from '@feathersjs/errors';
import { dateOrNumberToNumber } from './date-or-number-to-number';
import type {
  UsersArrayOrPaginated,
  User,
  GetUserDataCheckProps
} from '../types';

function checkOneUser (users: User[]): User {
  if (users.length === 0) {
    throw new BadRequest(
      'User not found.',
      { errors: { $className: 'badParams' } }
    );
  }

  if (users.length !== 1) {
    throw new BadRequest(
      'More than 1 user selected.',
      { errors: { $className: 'badParams' } }
    );
  }

  return users[0];
}

function checkUserChecks (
  user: User,
  checks?: GetUserDataCheckProps
): void {
  checks = checks || [];

  if (
    checks.includes('isNotVerified') &&
    user.isVerified
  ) {
    throw new BadRequest(
      'User is already verified.',
      { errors: { $className: 'isNotVerified' } }
    );
  }

  if (
    checks.includes('isNotVerifiedOrHasVerifyChanges') &&
    user.isVerified &&
    !Object.keys(user.verifyChanges || {}).length
  ) {
    throw new BadRequest(
      'User is already verified & not awaiting changes.',
      { errors: { $className: 'nothingToVerify' } }
    );
  }

  if (
    checks.includes('isVerified') &&
    !user.isVerified
  ) {
    throw new BadRequest(
      'User is not verified.',
      { errors: { $className: 'isVerified' } }
    );
  }

  if (
    checks.includes('verifyNotExpired') &&
    dateOrNumberToNumber(user.verifyExpires) < Date.now()
  ) {
    throw new BadRequest(
      'Verification token has expired.',
      { errors: { $className: 'verifyExpired' } }
    );
  }

  if (
    checks.includes('resetNotExpired') &&
    dateOrNumberToNumber(user.resetExpires) < Date.now()
  ) {
    throw new BadRequest(
      'Password reset token has expired.',
      { errors: { $className: 'resetExpired' } }
    );
  }
}

export function getUserData (
  data: UsersArrayOrPaginated,
  checks?: GetUserDataCheckProps
): User {
  const users = Array.isArray(data) ? data : data.data;

  const user = checkOneUser(users);

  checkUserChecks(user, checks);

  return user;
}
