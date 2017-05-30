
/* eslint-env node */

const errors = require('feathers-errors');
const debug = require('debug')('authManagement:identityChange');

const {
  getLongToken,
  getShortToken,
  ensureObjPropsValid,
  comparePasswords,
  notifier
} = require('./helpers');

module.exports = function identityChange (options, identifyUser, password, changesIdentifyUser) {
  // note this call does not update the authenticated user info in hooks.params.user.
  debug('identityChange', password, changesIdentifyUser);
  const users = options.app.service(options.service);
  const usersIdName = users.id;
  const {
    sanitizeUserForClient
  } = options;

  return Promise.resolve()
    .then(() => {
      ensureObjPropsValid(identifyUser, options.identifyUserProps);
      ensureObjPropsValid(changesIdentifyUser, options.identifyUserProps);

      return users.find({ query: identifyUser })
        .then(data => (Array.isArray(data) ? data[0] : data.data[0]));
    })

    .then(user1 => Promise.all([
      user1,
      getLongToken(options.longTokenLen),
      getShortToken(options.shortTokenLen, options.shortTokenDigits),
      comparePasswords(password, user1.password,
        () => new errors.BadRequest('Password is incorrect.',
          { errors: { password: 'Password is incorrect.', $className: 'badParams' } })
      )
    ]))
    .then(([user1, longToken, shortToken]) => {
      const patchToUser = {
        verifyExpires: Date.now() + options.delay,
        verifyToken: longToken,
        verifyShortToken: shortToken,
        verifyChanges: changesIdentifyUser
      };

      return patchUser(user1, patchToUser);
    })
    .then(user1 => notifier(options.notifier, 'identityChange', user1, null))
    .then(user1 => sanitizeUserForClient(user1));

  function patchUser (user1, patchToUser) {
    return users.patch(user1[usersIdName], patchToUser, {}) // needs users from closure
      .then(() => Object.assign(user1, patchToUser));
  }
};
