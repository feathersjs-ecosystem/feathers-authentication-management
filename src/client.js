
// Wrapper for client interface to feathers-authenticate-management

function AuthManagement (app) { // eslint-disable-line no-unused-vars
  if (!(this instanceof AuthManagement)) {
    return new AuthManagement(app);
  }

  const authManagement = app.service('authManagement');

  this.checkUnique = async (identifyUser, ownId, ifErrMsg) => await authManagement.create({
    action: 'checkUnique',
    value: identifyUser,
    ownId,
    meta: { noErrMsg: ifErrMsg }
  }, {});

  this.resendVerifySignup = async (identifyUser, notifierOptions) => await authManagement.create({
    action: 'resendVerifySignup',
    value: identifyUser,
    notifierOptions
  }, {});

  this.verifySignupLong = async (verifyToken) => await authManagement.create({
    action: 'verifySignupLong',
    value: verifyToken
  }, {});

  this.verifySignupShort = async (verifyShortToken, identifyUser) => await authManagement.create({
    action: 'verifySignupShort',
    value: { user: identifyUser, token: verifyShortToken }
  }, {});

  this.sendResetPwd = async (identifyUser, notifierOptions) => await authManagement.create({
    action: 'sendResetPwd',
    value: identifyUser,
    notifierOptions
  }, {});

  this.resetPwdLong = async (resetToken, password) => await authManagement.create({
    action: 'resetPwdLong',
    value: { token: resetToken, password }
  }, {});

  this.resetPwdShort = async (resetShortToken, identifyUser, password) => await authManagement.create({
    action: 'resetPwdShort',
    value: { user: identifyUser, token: resetShortToken, password }
  }, {});

  this.passwordChange = async (oldPassword, password, identifyUser) => await authManagement.create({
    action: 'passwordChange',
    value: { user: identifyUser, oldPassword, password }
  }, {});

  this.identityChange = async (password, changesIdentifyUser, identifyUser) => await authManagement.create({
    action: 'identityChange',
    value: { user: identifyUser, password, changes: changesIdentifyUser }
  }, {});

  this.authenticate = async (email, password, cb) => {
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
