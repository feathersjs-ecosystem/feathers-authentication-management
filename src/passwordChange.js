
/* eslint-env node */

const errors = require('@feathersjs/errors');
const debug = require('debug')('authManagement:passwordChange');

const {
  ensureValuesAreStrings,
  ensureObjPropsValid,
  hashPassword,
  comparePasswords,
  notifier
} = require('./helpers');

module.exports = function passwordChange (options, identifyUser, oldPassword, password, passwordFieldName) {
  const action = 'passwordChange';
  const passwordField = passwordFieldName || 'password';
  const users = options.app.service(options.service);
  const usersIdName = users.id;
  const errMsg = `Current ${passwordField} is incorrect.`;
  const {
    sanitizeUserForClient
  } = options;

  debug(action, `field<${passwordField}>`, oldPassword, password);

  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(passwordField, oldPassword, password);
      ensureObjPropsValid(identifyUser, options.identifyUserProps);

      return users.find({ query: identifyUser })
        .then(data => (Array.isArray(data) ? data[0] : data.data[0]));
    })
    .then(user1 => Promise.all([
      user1,
      hashPassword(options.app, password),
      comparePasswords(oldPassword, user1[passwordField],
        () => new errors.BadRequest(errMsg,
          { errors: { oldPassword: errMsg } })
      )
    ]))
    .then(([user1, hashedPassword]) => // value from comparePassword is not needed
      patchUser(user1, {
        [passwordField]: hashedPassword
      })
    )
    .then(user1 => notifier(options.notifier, action, user1, { passwordField }))
    .then(user1 => sanitizeUserForClient(user1));

  function patchUser (user1, patchToUser) {
    return users.patch(user1[usersIdName], patchToUser, {}) // needs users from closure
      .then(() => Object.assign(user1, patchToUser));
  }
};
