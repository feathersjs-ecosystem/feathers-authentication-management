
/* eslint-env node */

const errors = require('@feathersjs/errors');
const debug = require('debug')('authManagement:main');

const checkUniqueness = require('./checkUniqueness');
const resendVerifySignup = require('./resendVerifySignup');
const { verifySignupWithLongToken, verifySignupWithShortToken } = require('./verifySignup');
const sendResetPwd = require('./sendResetPwd');
const { resetPwdWithLongToken, resetPwdWithShortToken } = require('./resetPassword');
const passwordChange = require('./passwordChange');
const identityChange = require('./identityChange');

const { sanitizeUserForClient } = require('./helpers');

const optionsDefault = {
  app: null,
  service: '/users', // need exactly this for test suite
  path: 'authManagement',
  notifier: () => Promise.resolve(),
  longTokenLen: 15, // token's length will be twice this
  shortTokenLen: 6,
  shortTokenDigits: true,
  resetDelay: 1000 * 60 * 60 * 2, // 2 hours
  delay: 1000 * 60 * 60 * 24 * 5, // 5 days
  identifyUserProps: ['email']
};

module.exports = function (options1 = {}) {
  debug('service being configured.');
  const options = Object.assign({}, optionsDefault, options1);
  options.sanitizeUserForClient = options.sanitizeUserForClient || sanitizeUserForClient(options.privateProps);

  return function () {
    return authManagement(options, this);
  };
};

function authManagement (options, app) { // 'function' needed as we use 'this'
  debug('service initialized');
  options.app = app;

  options.app.use(options.path, {
    create (data) {
      debug(`service called. action=${data.action}`);

      switch (data.action) {
        case 'checkUnique':
          return checkUniqueness(options, data.value, data.ownId || null, data.meta || {});
        case 'resendVerifySignup':
          return resendVerifySignup(options, data.value, data.notifierOptions);
        case 'verifySignupLong':
          return verifySignupWithLongToken(options, data.value);
        case 'verifySignupShort':
          return verifySignupWithShortToken(options, data.value.token, data.value.user);
        case 'sendResetPwd':
          return sendResetPwd(options, data.value, data.notifierOptions);
        case 'resetPwdLong':
          return resetPwdWithLongToken(options, data.value.token, data.value.password, data.value.passwordField);
        case 'resetPwdShort':
          return resetPwdWithShortToken(
            options, data.value.token, data.value.user, data.value.password, data.value.passwordField);
        case 'passwordChange':
          return passwordChange(
            options, data.value.user, data.value.oldPassword, data.value.password, data.value.passwordField);
        case 'identityChange':
          return identityChange(
            options, data.value.user, data.value.password, data.value.changes, data.value.passwordField);
        case 'options':
          return Promise.resolve(options);
        default:
          return Promise.reject(new errors.BadRequest(`Action '${data.action}' is invalid.`,
            { errors: { $className: 'badParams' } }));
      }
    }
  });
}
