
/* eslint no-param-reassign: 0 */

const errors = require('feathers-errors');
const utils = require('feathers-hooks-common/lib/utils');

const { getLongToken, getShortToken } = require('./helpers');

let options = {};

module.exports.hooksInit = (options1) => {
  options = options1;
};

module.exports.addVerification = (options1) => (hook) => {
  utils.checkContext(hook, 'before', 'create');

  const ourOptions = Object.assign({}, options, options1);

  return Promise.all([
    getLongToken(ourOptions.longTokenLen),
    getShortToken(ourOptions.shortTokenLen, ourOptions.shortTokenDigits)
  ])
    .then(([longToken, shortToken]) => {
      hook.data.isVerified = false;
      hook.data.verifyExpires = Date.now() + ourOptions.delay;
      hook.data.verifyToken = longToken;
      hook.data.verifyShortToken = shortToken;
      hook.data.verifyChange = {};

      return hook;
    })
    .catch(err => { throw new errors.GeneralError(err); });
};

module.exports.isVerified = () => (hook) => {
  utils.checkContext(hook, 'before');

  if (!hook.params.user || !hook.params.user.isVerified) {
    throw new errors.BadRequest('User\'s email is not yet verified.');
  }
};

module.exports.removeVerification = (ifReturnTokens) => (hook) => {
  utils.checkContext(hook, 'after');
  const user = (hook.result || {});

  if (!('isVerified' in user) && hook.method === 'create') {
    /* eslint-disable no-console */
    console.warn('Property isVerified not found in user properties. (removeVerification)');
    console.warn('Have you added verify-reset\'s properties to your model? (Refer to README.md)');
    console.warn('Have you added the addVerification hook on users::create?');
    /* eslint-enable */
  }

  if (hook.params.provider && user) { // noop if initiated by server
    delete user.verifyExpires;
    delete user.resetExpires;
    delete user.verifyChange;
    if (!ifReturnTokens) {
      delete user.verifyToken;
      delete user.verifyShortToken;
      delete user.resetToken;
      delete user.resetShortToken;
    }
  }
};
