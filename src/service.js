
/* eslint-env node */

const errors = require('feathers-errors');
const debug = require('debug')('verify-reset:main');

const checkUniqueness = require('./checkUniqueness');
const resendVerifySignup = require('./resendVerifySignup');
const { verifySignupWithLongToken, verifySignupWithShortToken } = require('./verifySignup');
const sendResetPwd = require('./sendResetPwd');
const { resetPwdWithLongToken, resetPwdWithShortToken } = require('./resetPassword');
const passwordChange = require('./passwordChange');
const identityChange = require('./identityChange');
const { helpersInit } = require('./helpers');
const { hooksInit } = require('./hooks');

let options = {
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

/**
 * Feathers-service-verify-reset service to verify user's email, and to reset forgotten password.
 *
 * @param {Object?} options1 - for service
 *
 * options1.notifier - function(type, user, notifierOptions, newEmail, cb)
 *    type                    type of notification
 *      'resendVerifySignup'    from resendVerifySignup API call
 *      'verifySignup'          from verifySignupLong and verifySignupShort API calls
 *      'sendResetPwd'          from sendResetPwd API call
 *      'resetPwd'              from resetPwdLong and resetPwdShort API calls
 *      'passwordChange'        from passwordChange API call
 *      'identityChange'        from identityChange API call
 *    user            user's item, minus password.
 *    notifierOptions notifierOptions option from resendVerifySignup and sendResetPwd API calls
 *    newEmail        the new email address from identityChange API call
 *
 *    notifier needs to handle at least the resendVerifySignup and sendResetPwd notifications.
 *
 * options1.longTokenLen
 *    - Half the length of the long token. Default is 15, giving 30-char tokens.
 * options1.shortTokenLen
 *    - Length of short token. Default is 6.
 * options1.shortTokenDigits
 *    - Short token is digits if true, else alphanumeric. Default is true.
 * options1.delay
 *    - Duration for sign up email verification token in ms. Default is 5 days.
 * options1.resetDelay
 *    - Duration for password reset token in ms. Default is 2 hours.
 * options1.identifyUserProps
 *    - A 6-digit short token is more susceptible to brute force attack than a 30-char token.
 *    Therefore the verifySignupShort and resetPwdShort API calls require the user be identified
 *    using a find-query-like object. To prevent this itself from being an attack vector,
 *    identifyUserProps is an array of valid properties allowed in that query object.
 *    The default is ['email']. You may change it to ['email', 'username'] if you want to
 *    identify users by {email} or {username} or {email, username}.
 *
 * @returns {Function} Featherjs service
 *
 * (A) THE SERVICE
 * The service creates and maintains the following properties in the user item:
 *    isVerified        if the user's email addr has been verified (boolean)
 *    verifyToken       the 30-char token generated for email addr verification (string)
 *    verifyTokenShort  the 6-digit token generated for email addr verification (string)
 *    verifyExpires     when the email addr token expire (Date)
 *    resetToken        the 30-char token generated for forgotten password reset (string)
 *    resetTokenShort   the 6-digit token generated for forgotten password reset (string)
 *    resetExpires      when the forgotten password token expire (Date)
 *
 * The service is configured on the server with
 * app.configure(authentication)
 *   .configure(verifyReset({ notifier }))
 *   .configure(user);
 *
 * It may be called on the client using
 * - (A1) Feathers method calls,
 * - (A2) provided service wrappers,
 * - (A3) HTTP fetch **(docs todo)**
 * - (A4) React's Redux
 * - (A5) Vue 2.0 **(docs todo)**
 *
 * **(A1) USING FEATHERS' METHOD CALLS**
 * Method calls return a Promise unless a callback is provided.
 *
 * const verifyReset = app.service('/verifyReset/:action/:value');
 * verifyReset.create({ action, value, ... [, cb]});
 *
 * // check props are unique in the users items
 * verifyReset.create({ action: 'checkUnique',
 *   value: uniques, // e.g. {email, username}. Props with null or undefined are ignored.
 *   ownId, // excludes your current user from the search
 *   meta: { noErrMsg }, // if return an error.message if not unique
 * }, {}, cb)
 *
 * // resend email verification notification
 * verifyReset.create({ action: 'resendVerifySignup',
 *   value: emailOrToken, // email, {email}, {token}
 *   notifierOptions: {}, // options passed to options1.notifier, e.g. {transport: 'sms'}
 * }, {}, cb)
 *
 * // email addr verification with long token
 * verifyReset.create({ action: 'verifySignupLong',
 *   value: token, // compares to .verifyToken
 * }, {}, cb)
 *
 * // email addr verification with short token
 * verifyReset.create({ action: 'verifySignupShort',
 *   value: {
 *     token, // compares to .verifyTokenShort
 *     user: {} // identify user, e.g. {email: 'a@a.com'}. See options1.identifyUserProps.
 *   }
 * }, {}, cb)
 *
 * // send forgotten password notification
 * verifyReset.create({ action: 'sendResetPwd',
 *   value: email,
 *   notifierOptions: {}, // options passed to options1.notifier, e.g. {transport: 'sms'}
 * }, {}, cb)
 *
 * // forgotten password verification with long token
 * verifyReset.create({ action: 'resetPwdLong',
 *   value: {
 *     token, // compares to .resetToken
 *     password, // new password
 *   },
 * }, {}, cb)
 *
 * // forgotten password verification with short token
 * verifyReset.create({ action: 'resetPwdShort',
 *   value: {
 *     token, // compares to .resetTokenShort
 *     password, // new password
 *     user: {} // identify user, e.g. {email: 'a@a.com'}. See options1.identifyUserProps.
 *   },
 * }, {}, cb)
 *
 * // change password
 * verifyReset.create({ action: 'passwordChange',
 *   value: {
 *     oldPassword, // old password for verification
 *     password, // new password
 *   },
 * }, { user }, cb)
 *
 * // change email
 * verifyReset.create({ action: 'identityChange',
 *   value: {
 *     password, // current password for verification
 *     email, // new email
 *   },
 * }, { user }, cb)
 *
 * // Authenticate user and log on if user is verified.
 * let cbCalled = false;
 * app.authenticate({ type: 'local', email, password })
 *   .then((result) => {
 *     const user = result.data;
 *     if (!user || !user.isVerified) {
 *       app.logout();
 *       cb(new Error(user ? 'User\'s email is not verified.' : 'No user returned.'));
 *       return;
 *     }
 *     cbCalled = true;
 *     cb(null, user);
 *   })
 *   .catch((err) => {
 *     if (!cbCalled) { cb(err); } // ignore throws from .then( cb(null, user) )
 *   });
 *
 *
 * **(A2) PROVIDED SERVICE WRAPPERS**
 * The wrappers return a Promise unless a callback is provided.
 * See example/ for a working example of wrapper usage.
 *
 * <script src=".../feathers-service-verify-reset/lib/client.js"></script>
 *   or
 * import VerifyRest from 'feathers-service-verify-reset/lib/client';
 *
 * const app = feathers() ...
 * const verifyReset = new VerifyReset(app);
 *
 * // check props are unique in the users items
 * verifyReset.checkUnique(uniques, ownId, ifErrMsg, cb)
 *
 * // resend email verification notification
 * verifyReset.resendVerifySignup(emailOrToken, notifierOptions, cb)
 *
 * // email addr verification with long token
 * verifyReset.verifySignupLong(token, cb)
 *
 * // email addr verification with short token
 * verifyReset.verifySignupShort(token, userFind, cb)
 *
 * // send forgotten password notification
 * verifyReset.sendResetPwd(email, notifierOptions, cb)
 *
 * // forgotten password verification with long token
 * verifyReset.resetPwdLong(token, password, cb)
 *
 * // forgotten password verification with short token
 * verifyReset.resetPwdShort(token, userFind, password, cb)
 *
 * // change password
 * verifyReset.passwordChange(oldPassword, password, user, cb)
 *
 * // change email
 * verifyReset.identityChange(password, email, user, cb)
 *
 * // Authenticate user and log on if user is verified.
 * verifyReset.authenticate(email, password, cb)
 *
 *
 * **(A3) HTTP FETCH (docs todo)**
 * // check props are unique in the users items
 * // Set params just like (A1).
 * fetch('/verifyReset/:action/:value', {
 *   method: 'POST', headers: { Accept: 'application/json' },
 *   body: JSON.stringify({ action: 'checkUnique', value: uniques, ownId, meta: { noErrMsg } })
 * })
 *   .then(data => { ... }).catch(err => { ... });
 *
 *
 * **(A4) REACT'S REDUX**
 * See feathers-reduxify-services for information about state, etc.
 * See feathers-starter-react-redux-login-roles for a working example.
 *
 * (A4.1) Dispatching services
 * import feathers from 'feathers-client';
 * import reduxifyServices, { getServicesStatus } from 'feathers-reduxify-services';
 * const app = feathers().configure(feathers.socketio(socket)).configure(feathers.hooks());
 * const services = reduxifyServices(app, ['users', 'verifyReset', ...]);
 * ...
 * // hook up Redux reducers
 * export default combineReducers({
 *   users: services.users.reducer,
 *   verifyReset: services.verifyReset.reducer,
 * });
 * ...
 *
 * // email addr verification with long token
 * // Feathers is now 100% compatible with Redux. Use just like (A1).
 * store.dispatch(services.verifyReset.create({ action: 'verifySignupLong',
 *     value: token, // compares to .verifyToken
 *   }, {})
 * );
 *
 * (A4.2) Dispatching authentication. User must be verified to sign in.
 * const reduxifyAuthentication = require('feathers-reduxify-authentication');
 * const signin = reduxifyAuthentication(app, { isUserAuthorized: (user) => user.isVerified });
 *
 * // Sign in with the JWT currently in localStorage
 * if (localStorage['feathers-jwt']) {
 *   store.dispatch(signin.authenticate()).catch(err => { ... });
 * }
 *
 * // Sign in with credentials
 * store.dispatch(signin.authenticate({ type: 'local', email, password }))
 *   .then(() => { ... )
 *   .catch(err => { ... });
 *
 *
 * **(A5) VUE 2.0 (docs todo)**
 *
 *
 * (B) HOOKS
 * This service itself does not handle creation of a new user account nor the sending of the initial
 * email verification request.
 * Instead hooks are provided for you to use with the 'users' service 'create' method.
 *
 * const verifyHooks = require('feathers-service-verify-reset').verifyResetHooks;
 * export.before = {
 *   create: [
 *     auth.hashPassword(),
 *     verifyHooks.addVerification() // adds .isVerified, .verifyExpires, .verifyToken props
 *   ]
 * };
 * export.after = {
 *   create: [
 *     hooks.remove('password'),
 *     aHookToEmailYourVerification(),
 *     verifyHooks.removeVerification() // removes verification/reset fields other than .isVerified
 *   ]
 * };
 *
 *
 * A hook is provided to ensure the user's email addr is verified:
 *
 * const auth = require('feathers-authentication').hooks;
 * const verify = require('feathers-service-verify-reset').hooks;
 * export.before = {
 *   create: [
 *     auth.verifyToken(),
 *     auth.populateUser(),
 *     auth.restrictToAuthenticated(),
 *     verify.isVerified()
 *   ]
 * };
 *
 *
 * (C) SECURITY
 * - The user must be identified when the short token is used, making the short token less appealing
 * as an attack vector.
 * - The long and short tokens are erased on successful verification and password reset attempts.
 * New tokens must be acquired for another attempt.
 * - API params are verified to be strings. If the param is an object, the values of its props are
 * verified to be strings.
 * - options1.identifyUserProps restricts the prop names allowed in param objects.
 *
 * (D) CONFIGURABLE:
 * The length of the "30-char" token is configurable.
 * The length of the "6-digit" token is configurable. It may also be configured as alphanumeric.
 *
 * (E) MIGRATION FROM 0.8.0
 * A few changes are needed to migrate to 1.0.0. Names were standardized throughout the
 * new version and these had to be changed.
 *
 * options1.notifier signature
 *   was (type, user1, params, cb)
 *   now (type, user1, notifierOptions, newEmail, cb)
 * options1.notifier param 'type'
 *   'resend'   now 'resendVerifySignup'
 *   'verify'   now 'verifySignup'
 *   'forgot'   now 'sendResetPwd'
 *   'reset'    now 'resetPwd'
 *   'password' now 'passwordChange'
 *   'email'    now 'emailChange'
 *
 * Error messages used to return
 *   new errors.BadRequest('Password is incorrect.',
 *     { errors: { password: 'Password is incorrect.' } })
 * This was hacky although convenient if the names matched your UI. Now they return
 *   new errors.BadRequest('Password is incorrect.',
 *     { errors: { password: 'Password is incorrect.', $className: 'badParams' } })
 * or even
 *   new errors.BadRequest('Password is incorrect.',
 *     { errors: { $className: 'badParams' } })
 * Set your local UI errors based on the $className value.
 *
 * The following are deprecated but remain working. They will be removed in the future.
 * options1
 *   emailer    uses options1.notifier
 * API param 'action'
 *   'unique'   uses 'checkUnique'
 *   'resend'   uses 'resendVerifySignup'
 *   'verify'   uses 'verifySignupLong'
 *   'forgot'   uses 'sendResetPwd'
 *   'reset'    uses 'resetPwdLong'
 *   'password' uses 'passwordChange'
 *   'email'    uses 'emailChange'
 * client wrapper
 *   .unique            uses .checkUnique
 *   .verifySignUp      uses .verifySignupLong
 *   .sendResetPassword uses .sendResetPwd
 *   .saveResetPassword uses .resetPwdLong
 *   .changePassword    uses .passwordChange
 *   .changeEmail       uses .emailChange
 *
 * The service now uses the route /verifyreset rather than /verifyReset/:action/:value
 *
 */
module.exports = function (options1 = {}) {
  debug('service configured.');

  options = Object.assign(options, options1);
  helpersInit(options);
  hooksInit(options);

  return function verifyReset () { // 'function' needed as we use 'this'
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
              options, data.value.user, data.value.password, data.value.change
            );
            break;
          default:
            promise = Promise.reject(new errors.BadRequest(`Action '${data.action}' is invalid.`,
                { errors: { $className: 'badParams' } }));
        }

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
  };
};
