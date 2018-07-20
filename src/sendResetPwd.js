
/* eslint-env node */

const debug = require('debug')('authManagement:sendResetPwd');

const {
  findUser,
  patchUser,
  getUserData,
  ensureObjPropsValid,
  getLongToken,
  hashPassword,
  getShortToken,
  notifier,
  concatIDAndHash
} = require('./helpers');

module.exports = function sendResetPwd (options, params, identifyUser, notifierOptions) {
  debug('sendResetPwd');
  const users = options.app.service(options.service);
  const {
    sanitizeUserForClient,
    skipIsVerifiedCheck
  } = options;

  const checkProps = skipIsVerifiedCheck ? [] : ['isVerified'];

  return Promise.resolve()
    .then(() => {
      ensureObjPropsValid(identifyUser, options.identifyUserProps);

      return Promise.all([
        findUser(users, identifyUser, params)
          .then(data => getUserData(data, checkProps)),
        getLongToken(options.longTokenLen),
        getShortToken(options.shortTokenLen, options.shortTokenDigits)
      ]);
    })
    .then(([user, longToken, shortToken]) =>
      Object.assign(user, {
        resetExpires: Date.now() + options.resetDelay,
        resetToken: concatIDAndHash(user[users.id], longToken),
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
    .then(([ user, longToken, shortToken ]) =>
      patchUser(users, user, {
        resetExpires: user.resetExpires,
        resetToken: longToken,
        resetShortToken: shortToken
      }, params)
    )
    .then(user => sanitizeUserForClient(user));
};
