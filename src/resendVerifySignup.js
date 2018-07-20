
/* eslint-env node */

const debug = require('debug')('authManagement:resendVerifySignup');

const {
  findUser,
  patchUser,
  getUserData,
  ensureObjPropsValid,
  getLongToken,
  getShortToken,
  notifier
} = require('./helpers');

// {email}, {cellphone}, {verifyToken}, {verifyShortToken},
// {email, cellphone, verifyToken, verifyShortToken}
module.exports = function resendVerifySignup (options, params, identifyUser, notifierOptions) {
  debug('resendVerifySignup', identifyUser);
  const users = options.app.service(options.service);
  const {
    sanitizeUserForClient
  } = options;

  return Promise.resolve()
    .then(() => {
      ensureObjPropsValid(identifyUser,
        options.identifyUserProps.concat('verifyToken', 'verifyShortToken')
      );

      return identifyUser;
    })
    .then(query =>
      Promise.all([
        findUser(users, query, params)
          .then(data => getUserData(data, ['isNotVerified'])),
        getLongToken(options.longTokenLen),
        getShortToken(options.shortTokenLen, options.shortTokenDigits)
      ])
    )
    .then(([user, longToken, shortToken]) =>
      patchUser(users, user, {
        isVerified: false,
        verifyExpires: Date.now() + options.delay,
        verifyToken: longToken,
        verifyShortToken: shortToken
      }, params)
    )
    .then(user => notifier(options.notifier, 'resendVerifySignup', user, notifierOptions))
    .then(user => sanitizeUserForClient(user));
};
