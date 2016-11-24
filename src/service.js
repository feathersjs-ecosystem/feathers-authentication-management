
/* eslint-env node */

const errors = require('feathers-errors');
const debug = require('debug')('authManagement:main');

const checkUniqueness = require('./checkUniqueness');
const resendVerifySignup = require('./resendVerifySignup');
const { verifySignupWithLongToken, verifySignupWithShortToken } = require('./verifySignup');
const sendResetPwd = require('./sendResetPwd');
const { resetPwdWithLongToken, resetPwdWithShortToken } = require('./resetPassword');
const passwordChange = require('./passwordChange');
const identityChange = require('./identityChange');
const { helpersInit } = require('./helpers');
const { hooksInit } = require('./hooks');

let optionsDefault = {
  app: null,
  service: '/users', // need exactly this for test suite
  notifier: () => Promise.resolve(),
  longTokenLen: 15, // token's length will be twice this
  shortTokenLen: 6,
  shortTokenDigits: true,
  resetDelay: 1000 * 60 * 60 * 2, // 2 hours
  delay: 1000 * 60 * 60 * 24 * 5, // 5 days
  identifyUserProps: ['email']
};

module.exports = function (options1 = {}) {
  debug('service configured.');

  // create a closure for options so service can be configured for multiple options.service.
  return (() => {
    const options = Object.assign(optionsDefault, options1);
    helpersInit(options);
    hooksInit(options);
    
    return verifyReset;
  
    function verifyReset () { // 'function' needed as we use 'this'
      debug('service initialized');
      options.app = this;
    
      options.app.use('verifyReset', {
        create (data, params, cb) {
          debug(`service called. action=${data.action}`);
          let callbackCalled = false;
          let promise;
        
          switch (data.action) {
            case 'checkUnique':
              promise = checkUniqueness(options, data.value, data.ownId || null, data.meta || {});
              break;
            case 'resendVerifySignup':
              promise = resendVerifySignup(options, data.value, data.notifierOptions);
              break;
            case 'verifySignupLong':
              promise = verifySignupWithLongToken(options, data.value);
              break;
            case 'verifySignupShort':
              promise = verifySignupWithShortToken(options, data.value.token, data.value.user);
              break;
            case 'sendResetPwd':
              promise = sendResetPwd(options, data.value, data.notifierOptions);
              break;
            case 'resetPwdLong':
              promise = resetPwdWithLongToken(options, data.value.token, data.value.password);
              break;
            case 'resetPwdShort':
              promise = resetPwdWithShortToken(
                options, data.value.token, data.value.user, data.value.password
              );
              break;
            case 'passwordChange':
              promise = passwordChange(
                options, data.value.user, data.value.oldPassword, data.value.password
              );
              break;
            case 'identityChange':
              promise = identityChange(
                options, data.value.user, data.value.password, data.value.changes
              );
              break;
            default:
              promise = Promise.reject(new errors.BadRequest(`Action '${data.action}' is invalid.`,
                { errors: { $className: 'badParams' } }));
          }
        
          // The tests mainly use the cb. You'll have to change 100+ tests should you remove this.
          if (cb) {
            // Feathers cannot return an error to the client if we use process.nextTick(cb, err)
            promise
              .then(data1 => {
                callbackCalled = true;
                cb(null, data1);
              })
              .catch(err => {
                if (!callbackCalled) { // don't call cb should cb(null, data) throw
                  callbackCalled = true;
                  cb(err);
                }
              });
          }
        
          return promise;
        }
      });
    }
  })();
};
