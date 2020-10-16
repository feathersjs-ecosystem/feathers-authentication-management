const errors = require('@feathersjs/errors');
const makeDebug = require('debug');
const comparePasswords = require('./helpers/compare-passwords');
const deconstructId = require('./helpers/deconstruct-id');
const ensureObjPropsValid = require('./helpers/ensure-obj-props-valid');
const ensureValuesAreStrings = require('./helpers/ensure-values-are-strings');
const getUserData = require('./helpers/get-user-data');
const hashPassword = require('./helpers/hash-password');
const notifier = require('./helpers/notifier');

const debug = makeDebug('authLocalMgnt:resetPassword');

module.exports = {
  resetPwdWithLongToken,
  resetPwdWithShortToken
};

async function resetPwdWithLongToken (options, resetToken, password, field, notifierOptions = {}) {
  ensureValuesAreStrings(resetToken, password);

  return resetPassword(options, { resetToken }, { resetToken }, password, field, notifierOptions);
}

async function resetPwdWithShortToken (options, resetShortToken, identifyUser, password, field, notifierOptions = {}) {
  ensureValuesAreStrings(resetShortToken, password);
  ensureObjPropsValid(identifyUser, options.identifyUserProps);

  return resetPassword(options, identifyUser, { resetShortToken }, password, field, notifierOptions);
}

async function resetPassword (options, query, tokens, password, field, notifierOptions = {}) {
  debug('resetPassword', query, tokens, password);
  const usersService = options.app.service(options.service);
  const usersServiceIdName = usersService.id;
  let users;

  if (tokens.resetToken) {
    let id = deconstructId(tokens.resetToken);
    users = await usersService.get(id);
  } else if (tokens.resetShortToken) {
    users = await usersService.find({ query });
  } else {
    throw new errors.BadRequest('resetToken and resetShortToken are missing. (authLocalMgnt)', {
      errors: { $className: 'missingToken' }
    });
  }

  const checkProps = options.skipIsVerifiedCheck ? ['resetNotExpired'] : ['resetNotExpired', 'isVerified'];
  const user1 = getUserData(users, checkProps);

  const tokenChecks = Object.keys(tokens).map(key => {
    if (options.reuseResetToken) {
      // Comparing token directly as reused resetToken is not hashed
      if (tokens[key] !== user1[key])
        throw new errors.BadRequest('Reset Token is incorrect. (authLocalMgnt)', {
          errors: {$className: 'incorrectToken'}
        });
    } else {
      return comparePasswords(
        tokens[key],
        user1[key],
        () =>
          new errors.BadRequest('Reset Token is incorrect. (authLocalMgnt)', {
            errors: {$className: 'incorrectToken'}
          })
      );
    }
  });

  try {
    await Promise.all(tokenChecks);
  } catch (err) {
    if (user1.resetAttempts > 0) {
      await usersService.patch(user1[usersServiceIdName], {
        resetAttempts: user1.resetAttempts - 1
      });

      throw err;
    } else {
      await usersService.patch(user1[usersServiceIdName], {
        resetToken: null,
        resetAttempts: null,
        resetShortToken: null,
        resetExpires: null
      });

      throw new errors.BadRequest('Invalid token. Get for a new one. (authLocalMgnt)', {
        errors: { $className: 'invalidToken' }
      });
    }
  }

  const user2 = await usersService.patch(user1[usersServiceIdName], {
    password: await hashPassword(options.app, password, field),
    resetExpires: null,
    resetAttempts: null,
    resetToken: null,
    resetShortToken: null
  });

  const user3 = await notifier(options.notifier, 'resetPwd', user2, notifierOptions);
  return options.sanitizeUserForClient(user3);
}
