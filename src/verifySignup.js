
/* eslint-env node */

const errors = require('feathers-errors');
const debug = require('debug')('verify-reset:verifySignup');

const {
  getUserData,
  ensureObjPropsValid,
  ensureValuesAreStrings,
  sanitizeUserForClient,
  notifier
} = require('./helpers');

module.exports.verifySignupWithLongToken = function (options, verifyToken) {
  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(verifyToken);

      return verifySignup(options, { verifyToken }, { verifyToken });
    });
};

module.exports.verifySignupWithShortToken = function (options, verifyShortToken, findUser) {
  return Promise.resolve()
    .then(() => {
      ensureValuesAreStrings(verifyShortToken);
      ensureObjPropsValid(findUser, options.userPropsForShortToken);

      return verifySignup(options, findUser, { verifyShortToken });
    });
};

function verifySignup (options, query, tokens) {
  debug('verifySignup', query, tokens);
  const users = options.app.service(options.service);
  const usersIdName = users.id;

  return users.find({ query })
    .then(data => getUserData(data, ['isNotVerified', 'verifyNotExpired']))
    .then(user => {
      if (!Object.keys(tokens).every(key => tokens[key] === user[key])) {
        return patchUser(user, {
          verifyToken: null,
          verifyShortToken: null,
          verifyExpires: null
        })
          .then(() => {
            throw new errors.BadRequest('Invalid token. Get for a new one. (verify-reset)',
              { errors: { $className: 'badParam' } });
          });
      }

      return patchUser(user, {
        isVerified: user.verifyExpires > Date.now(),
        verifyToken: null,
        verifyShortToken: null,
        verifyExpires: null
      })
        .then(user1 => notifier(options.notifier, 'verifySignup', user1))
        .then(user1 => sanitizeUserForClient(user1));
    });

  function patchUser (user, patchToUser) {
    return users.patch(user[usersIdName], patchToUser, {}) // needs users from closure
      .then(() => Object.assign(user, patchToUser));
  }
}
