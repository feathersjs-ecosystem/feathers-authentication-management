
/* eslint-env node */

const debug = require('debug')('authManagement:sendResetPwd');

const {
  getUserData,
  ensureObjPropsValid,
  getLongToken,
  hashPassword,
  getShortToken,
  notifier,
  concatIDAndHash
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
        resetToken: concatIDAndHash(user[usersIdName], longToken),
        resetShortToken: concatIDAndHash(user[usersIdName], shortToken)
      })
    )
    .then(user => notifier(options.notifier, 'sendResetPwd', user, notifierOptions).then(() => user))
    .then(user => Promise.all([
      Promise.resolve(user),
      hashPassword(options.app, user.resetToken),
      hashPassword(options.app, user.resetShortToken)
    ])
    )
    .then(([ user, longToken, shortToken ]) =>
      patchUser(user, {
        resetExpires: user.resetExpires,
        resetToken: longToken,
        resetShortToken: shortToken
      })
    )
    .then(user => sanitizeUserForClient(user));

  function patchUser (user, patchToUser) {
    return users.patch(user[usersIdName], patchToUser, {}) // needs users from closure
      .then(() => Object.assign(user, patchToUser));
  }
};
