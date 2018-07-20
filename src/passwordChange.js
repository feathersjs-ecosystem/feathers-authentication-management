
/* eslint-env node */

const errors = require('@feathersjs/errors');
const debug = require('debug')('authManagement:passwordChange');

const {
  findUser,
  patchUser,
  ensureValuesAreStrings,
  ensureObjPropsValid,
  hashPassword,
  comparePasswords,
  notifier
} = require('./helpers');

module.exports = function passwordChange (options, params, identifyUser, oldPassword, password) {
  debug('passwordChange', oldPassword, password);
  const users = options.app.service(options.service);
  const {
    sanitizeUserForClient
  } = options;

  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(oldPassword, password);
      ensureObjPropsValid(identifyUser, options.identifyUserProps);

      return findUser(users, identifyUser, params)
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
      patchUser(users, user1, {
        password: hashedPassword
      }, params)
    )
    .then(user1 => notifier(options.notifier, 'passwordChange', user1))
    .then(user1 => sanitizeUserForClient(user1));
};
