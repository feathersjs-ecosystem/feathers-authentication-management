
/* eslint-env node */

const errors = require('feathers-errors');
const debug = require('debug')('authManagement:passwordChange');

const {
  ensureValuesAreStrings,
  ensureObjPropsValid,
  sanitizeUserForClient,
  hashPassword,
  comparePasswords,
  notifier
} = require('./helpers');

module.exports = function passwordChange (options, identifyUser, oldPassword, password) {
  debug('passwordChange', oldPassword, password);
  const users = options.app.service(options.service);
  const usersIdName = users.id;

  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(oldPassword, password);
      ensureObjPropsValid(identifyUser, options.identifyUserProps);

      return users.find({ query: identifyUser })
        .then(data => (Array.isArray(data) ? data[0] : data.data[0]));
    })
    .then(user1 => Promise.all([
      user1,
      hashPassword(options.app, password),
      comparePasswords(oldPassword, user1.password,
        () => new errors.BadRequest('Current password is incorrect.',
          { errors: { oldPassword: 'Current password is incorrect.' } })
      )
    ]))
    .then(([user1, hashedPassword]) => // value from comparePassword is not needed
      patchUser(user1, {
        password: hashedPassword
      })
    )
    .then(user1 => notifier(options.notifier, 'passwordChange', user1))
    .then(user1 => sanitizeUserForClient(user1));

  function patchUser (user1, patchToUser) {
    return users.patch(user1[usersIdName], patchToUser, {}) // needs users from closure
      .then(() => Object.assign(user1, patchToUser));
  }
};
