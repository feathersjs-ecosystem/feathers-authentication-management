
/* global module: 0 */
// Wrapper for client interface to feathers-authenticate-management

function AuthManagement (app) { // eslint-disable-line no-unused-vars
  if (!(this instanceof AuthManagement)) {
    return new AuthManagement(app);
  }

  const authManagement = app.service('authManagement');

  this.checkUnique = (identifyUser, ownId, ifErrMsg) => authManagement.create({
    action: 'checkUnique',
    value: identifyUser,
    ownId,
    meta: { noErrMsg: ifErrMsg }
  }, {});

  this.resendVerifySignup = (identifyUser, notifierOptions) => authManagement.create({
    action: 'resendVerifySignup',
    value: identifyUser,
    notifierOptions
  }, {});

  this.verifySignupLong = (verifyToken) => authManagement.create({
    action: 'verifySignupLong',
    value: verifyToken
  }, {});

  this.verifySignupShort = (verifyShortToken, identifyUser) => authManagement.create({
    action: 'verifySignupShort',
    value: { user: identifyUser, token: verifyShortToken }
  }, {});

  this.sendResetPwd = (identifyUser, notifierOptions, passwordField) => authManagement.create({
    action: 'sendResetPwd',
    value: identifyUser,
    passwordField,
    notifierOptions
  }, {});

  this.resetPwdLong = (resetToken, password, passwordField) => authManagement.create({
    action: 'resetPwdLong',
    value: { token: resetToken, password, passwordField }
  }, {});

  this.resetPwdShort = (resetShortToken, identifyUser, password, passwordField) => authManagement.create({
    action: 'resetPwdShort',
    value: { user: identifyUser, token: resetShortToken, password, passwordField }
  }, {});

  this.passwordChange = (oldPassword, password, identifyUser, passwordField) => authManagement.create({
    action: 'passwordChange',
    value: { user: identifyUser, oldPassword, password, passwordField }
  }, {});

  this.identityChange = (password, changesIdentifyUser, identifyUser, passwordField) => authManagement.create({
    action: 'identityChange',
    value: { user: identifyUser, password, changes: changesIdentifyUser, passwordField }
  }, {});

  this.authenticate = (email, password, cb) => {
    let cbCalled = false;

    return app.authenticate({ type: 'local', email, password })
      .then(result => {
        const user = result.data;

        if (!user || !user.isVerified) {
          app.logout();
          return cb(new Error(user ? 'User\'s email is not verified.' : 'No user returned.'));
        }

        if (cb) {
          cbCalled = true;
          return cb(null, user);
        }

        return user;
      })
      .catch((err) => {
        if (!cbCalled) {
          cb(err);
        }
      });
  };
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = AuthManagement;
}
