
/* eslint-env node */

const errors = require('feathers-errors');
const debug = require('debug')('authManagement:resetPassword');

const {
  getUserData,
  ensureObjPropsValid,
  ensureValuesAreStrings,
  hashPassword,
  notifier,
  comparePasswords,
  deconstructId
} = require('./helpers');

module.exports.resetPwdWithLongToken = function (options, resetToken, password) {
  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(resetToken, password);

      return resetPassword(options, { resetToken }, { resetToken }, password);
    });
};

module.exports.resetPwdWithShortToken = function (options, resetShortToken, identifyUser, password) {
  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(resetShortToken, password);
      ensureObjPropsValid(identifyUser, options.identifyUserProps);

      return resetPassword(options, identifyUser, { resetShortToken }, password);
    });
};

function resetPassword (options, query, tokens, password) {
  debug('resetPassword', query, tokens, password);
  const users = options.app.service(options.service);
  const usersIdName = users.id;
  const {
    sanitizeUserForClient,
    skipIsVerifiedCheck
  } = options;

  const checkProps = ['resetNotExpired'];
  if (!skipIsVerifiedCheck) {
    checkProps.push('isVerified');
  }

  let userPromise;

  if (tokens.resetToken) {
    let id = deconstructId(tokens.resetToken);
    userPromise = users.get(id).then(data => getUserData(data, checkProps));
  } else if (tokens.resetShortToken) {
    userPromise = users.find({query}).then(data => getUserData(data, checkProps));
  } else {
    return Promise.reject(new errors.BadRequest('resetToken or resetShortToken is missing'));
  }

  return Promise.all([
    userPromise,
    hashPassword(options.app, password)
  ])
    .then(([user, hashPassword]) => {
      let promises = [];

      Object.keys(tokens).forEach((key) => {
        promises.push(comparePasswords(tokens[key], user[key], () => new errors.BadRequest('Reset Token is incorrect.')));
      });

      return Promise.all(promises).then(values => {
        return [user, hashPassword];
      }).catch(reason => {
        return patchUser(user, {
          resetToken: null,
          resetShortToken: null,
          resetExpires: null
        })
          .then(() => {
            throw new errors.BadRequest('Invalid token. Get for a new one. (authManagement)',
              { errors: { $className: 'badParam' } });
          });
      });
    })
    .then(([user, hashedPassword]) => {
      return patchUser(user, {
        password: hashedPassword,
        resetToken: null,
        resetShortToken: null,
        resetExpires: null
      })
        .then(user1 => notifier(options.notifier, 'resetPwd', user1))
        .then(user1 => sanitizeUserForClient(user1));
    });

  function patchUser (user, patchToUser) {
    return users.patch(user[usersIdName], patchToUser, {}) // needs users from closure
      .then(() => Object.assign(user, patchToUser));
  }
}
