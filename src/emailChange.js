
/* eslint-env node */

const errors = require('feathers-errors');
const debug = require('debug')('verify-reset:passwordChange');

const {
  ensureValuesAreStrings,
  sanitizeUserForClient,
  comparePasswords,
  notifier
} = require('./helpers');

module.exports = function emailChange (options, user, password, email) {
  // note this call does not update the authenticated user info in hooks.params.user.
  debug('emailChange', password, email);
  const users = options.app.service(options.service);
  const usersIdName = users.id;

  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(password, email);

      return users.find({ query: { [usersIdName]: user[usersIdName] } })
        .then(data => (Array.isArray(data) ? data[0] : data.data[0]));
    })

    .then(user1 => Promise.all([
      user1,
      comparePasswords(password, user1.password,
        () => new errors.BadRequest('Password is incorrect.',
          { errors: { password: 'Password is incorrect.', $className: 'badParams' } })
      )
    ]))
    .then(([user1]) => notifier(options.notifier, 'emailChange', user1, null, email))
    .then(user1 => patchUser(user1, { email }))
    .then(user1 => sanitizeUserForClient(user1));

  function patchUser (user1, patchToUser) {
    return users.patch(user1[usersIdName], patchToUser, {}) // needs users from closure
      .then(() => Object.assign(user1, patchToUser));
  }
};
