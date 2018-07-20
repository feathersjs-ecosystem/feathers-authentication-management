
/* eslint-env node */

const errors = require('@feathersjs/errors');
const debug = require('debug')('authManagement:verifySignup');

const {
  findUser,
  patchUser,
  getUserData,
  ensureObjPropsValid,
  ensureValuesAreStrings,
  notifier
} = require('./helpers');

module.exports.verifySignupWithLongToken = function (options, params, verifyToken) {
  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(verifyToken);

      return verifySignup(options, params, { verifyToken }, { verifyToken });
    });
};

module.exports.verifySignupWithShortToken = function (options, params, verifyShortToken, identifyUser) {
  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(verifyShortToken);
      ensureObjPropsValid(identifyUser, options.identifyUserProps);

      return verifySignup(options, params, identifyUser, { verifyShortToken });
    });
};

function verifySignup (options, params, query, tokens) {
  debug('verifySignup', query, tokens);
  const users = options.app.service(options.service);
  const {
    sanitizeUserForClient
  } = options;

  return findUser(users, query, params)
    .then(data => getUserData(data, ['isNotVerifiedOrHasVerifyChanges', 'verifyNotExpired']))
    .then(user => {
      if (!Object.keys(tokens).every(key => tokens[key] === user[key])) {
        return eraseVerifyProps(user, user.isVerified)
          .then(() => {
            throw new errors.BadRequest('Invalid token. Get for a new one. (authManagement)',
              { errors: { $className: 'badParam' } });
          });
      }

      return eraseVerifyProps(user, user.verifyExpires > Date.now(), user.verifyChanges || {})
        .then(user1 => notifier(options.notifier, 'verifySignup', user1))
        .then(user1 => sanitizeUserForClient(user1));
    });

  function eraseVerifyProps (user, isVerified, verifyChanges) {
    const patchToUser = Object.assign({}, verifyChanges || {}, {
      isVerified,
      verifyToken: null,
      verifyShortToken: null,
      verifyExpires: null,
      verifyChanges: {}
    });

    return patchUser(users, user, patchToUser, params);
  }
}
