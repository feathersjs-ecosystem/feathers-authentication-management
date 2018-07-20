
/* eslint-env node */

const errors = require('@feathersjs/errors');
const debug = require('debug')('authManagement:resetPassword');

const {
  findUser,
  patchUser,
  getUserData,
  ensureObjPropsValid,
  ensureValuesAreStrings,
  hashPassword,
  notifier,
  comparePasswords,
  deconstructId
} = require('./helpers');

module.exports.resetPwdWithLongToken = function (options, params, resetToken, password) {
  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(resetToken, password);

      return resetPassword(options, params, { resetToken }, { resetToken }, password);
    });
};

module.exports.resetPwdWithShortToken = function (options, params, resetShortToken, identifyUser, password) {
  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(resetShortToken, password);
      ensureObjPropsValid(identifyUser, options.identifyUserProps);

      return resetPassword(options, params, identifyUser, { resetShortToken }, password);
    });
};

function resetPassword (options, params, query, tokens, password) {
  debug('resetPassword', query, tokens, password);
  const users = options.app.service(options.service);
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
    userPromise = users.get(id, params).then(data => getUserData(data, checkProps));
  } else if (tokens.resetShortToken) {
    userPromise = findUser(users, query, params).then(data => getUserData(data, checkProps));
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
      return patchUser(users, user, {
        password: hashedPassword,
        resetToken: null,
        resetShortToken: null,
        resetExpires: null
      }, params)
        .then(user1 => notifier(options.notifier, 'resetPwd', user1))
        .then(user1 => sanitizeUserForClient(user1));
    });
}
