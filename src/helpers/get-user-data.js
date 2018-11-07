
const errors = require('@feathersjs/errors');

module.exports = getUserData;

function getUserData (data, checks = []) {
  if (Array.isArray(data) ? data.length === 0 : data.total === 0) {
    throw new errors.BadRequest('User not found.',
      { errors: { $className: 'badParams' } });
  }

  const users = Array.isArray(data) ? data : data.data || [ data ];
  const user = users[0];

  if (users.length !== 1) {
    throw new errors.BadRequest('More than 1 user selected.',
      { errors: { $className: 'badParams' } });
  }

  if (checks.includes('isNotVerified') && user.isVerified) {
    throw new errors.BadRequest('User is already verified.',
      { errors: { $className: 'isNotVerified' } });
  }

  if (checks.includes('isNotVerifiedOrHasVerifyChanges') &&
    user.isVerified && !Object.keys(user.verifyChanges || {}).length
  ) {
    throw new errors.BadRequest('User is already verified & not awaiting changes.',
      { errors: { $className: 'nothingToVerify' } });
  }

  if (checks.includes('isVerified') && !user.isVerified) {
    throw new errors.BadRequest('User is not verified.',
      { errors: { $className: 'isVerified' } });
  }

  if (checks.includes('verifyNotExpired') && user.verifyExpires < Date.now()) {
    throw new errors.BadRequest('Verification token has expired.',
      { errors: { $className: 'verifyExpired' } });
  }

  if (checks.includes('resetNotExpired') && user.resetExpires < Date.now()) {
    throw new errors.BadRequest('Password reset token has expired.',
      { errors: { $className: 'resetExpired' } });
  }

  return user;
}
