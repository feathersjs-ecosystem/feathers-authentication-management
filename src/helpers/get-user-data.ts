import { BadRequest } from '@feathersjs/errors';

import type {
  UsersArrayOrPaginated,
  User
} from '../types';

export default function getUserData (
  data: UsersArrayOrPaginated,
  fieldsToChecks?: string[]
): User {
  fieldsToChecks ??= [];
  if (Array.isArray(data) ? data.length === 0 : data.total === 0) {
    throw new BadRequest(
      'User not found.',
      { errors: { $className: 'badParams' } }
    );
  }

  const users = Array.isArray(data) ? data : data.data;
  const user = users[0];

  if (users.length !== 1) {
    throw new BadRequest(
      'More than 1 user selected.',
      { errors: { $className: 'badParams' } }
    );
  }

  if (
    fieldsToChecks.includes('isNotVerified') &&
    user.isVerified
  ) {
    throw new BadRequest(
      'User is already verified.',
      { errors: { $className: 'isNotVerified' } }
    );
  }

  if (
    fieldsToChecks.includes('isNotVerifiedOrHasVerifyChanges') &&
    user.isVerified &&
    !Object.keys(user.verifyChanges || {}).length
  ) {
    throw new BadRequest(
      'User is already verified & not awaiting changes.',
      { errors: { $className: 'nothingToVerify' } }
    );
  }

  if (
    fieldsToChecks.includes('isVerified') &&
    !user.isVerified
  ) {
    throw new BadRequest(
      'User is not verified.',
      { errors: { $className: 'isVerified' } }
    );
  }

  if (
    fieldsToChecks.includes('verifyNotExpired') &&
    user.verifyExpires < Date.now()
  ) {
    throw new BadRequest(
      'Verification token has expired.',
      { errors: { $className: 'verifyExpired' } }
    );
  }

  if (
    fieldsToChecks.includes('resetNotExpired') &&
    user.resetExpires < Date.now()
  ) {
    throw new BadRequest(
      'Password reset token has expired.',
      { errors: { $className: 'resetExpired' } }
    );
  }

  return user;
}
