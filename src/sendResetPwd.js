
/* eslint-env node */

const debug = require('debug')('verify-reset:sendResetPwd');

const {
  getUserData,
  ensureValuesAreStrings,
  sanitizeUserForClient,
  getLongToken,
  getShortToken,
  notifier
} = require('./helpers');

module.exports = function sendResetPwd (options, email, notifierOptions) {
  debug('sendResetPwd');
  const users = options.app.service(options.service);
  const usersIdName = users.id;

  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(email);

      return Promise.all([
        users.find({ query: { email } })
          .then(data => getUserData(data, ['isVerified'])),
        getLongToken(options.longTokenLen),
        getShortToken(options.shortTokenLen, options.shortTokenDigits)
      ]);
    })
    .then(([user, longToken, shortToken]) =>
      patchUser(user, {
        resetExpires: Date.now() + options.resetDelay,
        resetToken: longToken,
        resetShortToken: shortToken
      })
    )
    .then(user => notifier(options.notifier, 'sendResetPwd', user, notifierOptions))
    .then(user => sanitizeUserForClient(user));

  function patchUser (user, patchToUser) {
    return users.patch(user[usersIdName], patchToUser, {}) // needs users from closure
      .then(() => Object.assign(user, patchToUser));
  }
};
