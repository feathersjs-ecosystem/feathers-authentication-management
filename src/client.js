
/* global module: 0 */
// Wrapper for client interface to feathers-authenticate-management

function VerifyReset (app) { // eslint-disable-line no-unused-vars
  if (!(this instanceof VerifyReset)) {
    return new VerifyReset(app);
  }

  const verifyReset = app.service('verifyReset');

  this.checkUnique = (identifyUser, ownId, ifErrMsg, cb) => verifyReset.create({
    action: 'checkUnique',
    value: identifyUser,
    ownId,
    meta: { noErrMsg: ifErrMsg }
  }, {}, cb);

  this.resendVerifySignup = (identifyUser, notifierOptions, cb) => verifyReset.create({
    action: 'resendVerifySignup',
    value: identifyUser,
    notifierOptions
  }, {}, cb);

  this.verifySignupLong = (verifyToken, cb) => verifyReset.create({
    action: 'verifySignupLong',
    value: verifyToken
  }, {}, cb);

  this.verifySignupShort = (verifyShortToken, identifyUser, cb) => verifyReset.create({
    action: 'verifySignupShort',
    value: { user: identifyUser, token: verifyShortToken }
  }, {}, cb);

  this.sendResetPwd = (identifyUser, notifierOptions, cb) => verifyReset.create({
    action: 'sendResetPwd',
    value: identifyUser,
    notifierOptions
  }, {}, cb);

  this.resetPwdLong = (resetToken, password, cb) => verifyReset.create({
    action: 'resetPwdLong',
    value: { token: resetToken, password }
  }, {}, cb);

  this.resetPwdShort = (resetShortToken, identifyUser, password, cb) => verifyReset.create({
    action: 'resetPwdShort',
    value: { user: identifyUser, token: resetShortToken, password }
  }, {}, cb);

  this.passwordChange = (oldPassword, password, identifyUser, cb) => verifyReset.create({
    action: 'passwordChange',
    value: { user: identifyUser, oldPassword, password }
  }, {}, cb);

  this.identityChange = (password, changesIdentifyUser, identifyUser, cb) => verifyReset.create({
    action: 'identityChange',
    value: { user: identifyUser, password, changes: changesIdentifyUser }
  }, {}, cb);

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
  module.exports = VerifyReset;
}
