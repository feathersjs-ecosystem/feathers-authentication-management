
/* eslint-env node */

const debug = require('debug')('authManagement:sendResetPwd');

const {
  getUserData,
  ensureObjPropsValid,
  getLongToken,
  hashPassword,
  getShortToken,
  notifier,
  constructUserToken
} = require('./helpers');

module.exports = function sendResetPwd (options, identifyUser, notifierOptions) {
  debug('sendResetPwd');
  const users = options.app.service(options.service);
  const usersIdName = users.id;
  const {
    sanitizeUserForClient,
    skipIsVerifiedCheck
  } = options;

  const checkProps = skipIsVerifiedCheck ? [] : ['isVerified'];

  return Promise.resolve()
    .then(() => {
      ensureObjPropsValid(identifyUser, options.identifyUserProps);
      // Get user and generate tokens
      return Promise.all([
        users.find({ query: identifyUser })
          .then(data => getUserData(data, checkProps)),
        getLongToken(options.longTokenLen),
        getShortToken(options.shortTokenLen, options.shortTokenDigits)
      ]);
    })
    .then(([user, longToken, shortToken]) =>
      Object.assign(user, {
        resetExpires: Date.now() + options.resetDelay,
        // Long token is used to identify the user by integrating his ID
        // First create a clear one for the notifier because it will then be encrypted in DB to avoid hacking
        resetToken: constructUserToken(user[usersIdName], longToken),
        resetShortToken: shortToken
      })
    )
    .then(user => notifier(options.notifier, 'sendResetPwd', user, notifierOptions).then(() => user))
    .then(user => Promise.all([
      user,
      hashPassword(options.app, user.resetToken),
      hashPassword(options.app, user.resetShortToken)
    ])
    )
    .then(([user, hashedLongToken, hashedShortToken]) => {
      return patchUser(user, {
        resetExpires: user.resetExpires,
        resetToken: hashedLongToken,
        resetShortToken: hashedShortToken
      });
    })
    .then(user => sanitizeUserForClient(user));

  function patchUser (user, patchToUser) {
    return users.patch(user[usersIdName], patchToUser, {}) // needs users from closure
      .then(() => Object.assign(user, patchToUser));
  }
};
