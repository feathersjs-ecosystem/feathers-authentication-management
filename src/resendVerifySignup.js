
/* eslint-env node */

const debug = require('debug')('verify-reset:resendVerifySignup');

const {
  getUserData,
  ensureObjPropsValid,
  sanitizeUserForClient,
  getLongToken,
  getShortToken,
  notifier
} = require('./helpers');

// {email}, {verifyToken}, {verifyShortToken},
// {email, verifyToken, verifyShortToken}
module.exports = function resendVerifySignup (options, emailOrToken, notifierOptions) {
  debug('resendVerifySignup', emailOrToken);
  const users = options.app.service(options.service);
  const usersIdName = users.id;

  return Promise.resolve()
    .then(() => {
      ensureObjPropsValid(emailOrToken, ['email', 'verifyToken', 'verifyShortToken']);

      return emailOrToken;
    })
    .then(query =>
      Promise.all([
        users.find({ query })
          .then(data => getUserData(data, ['isNotVerified'])),
        getLongToken(options.longTokenLen),
        getShortToken(options.shortTokenLen, options.shortTokenDigits)
      ])
    )
    .then(([user, longToken, shortToken]) =>
      patchUser(user, {
        isVerified: false,
        verifyExpires: Date.now() + options.delay,
        verifyToken: longToken,
        verifyShortToken: shortToken
      })
    )
    .then(user => notifier(options.notifier, 'resendVerifySignup', user, notifierOptions))
    .then(user => sanitizeUserForClient(user));

  function patchUser (user, patchToUser) {
    return users.patch(user[usersIdName], patchToUser, {}) // needs users from closure
      .then(() => Object.assign(user, patchToUser));
  }
};
