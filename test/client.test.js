
/* global assert, describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0,
no-param-reassign: 0, no-unused-vars: 0  */

const assert = require('chai').assert;
const feathersStubs = require('./../test/helpers/feathersStubs');
const AuthManagement = require('../src/client');

// user DB

const usersDb = [
  { _id: 'a', email: 'bad', password: 'aa', isVerified: false },
  { _id: 'b', email: 'ok', password: 'bb', isVerified: true },
];

// Fake for authManagementService service

var spyData = null;
var spyParams = null;
var spyAuthenticateEmail;
var spyAuthenticatePassword;

const verifyResetServiceFake = function () {
  return function authManagement() { // 'function' needed as we use 'this'
    const app = this;
    const path = 'authManagement';

    app.use(path, {
      create(data, params1, cb) {
        spyData = data;
        spyParams = params1;
        
        return cb ? cb(null) : Promise.resolve();
      },
    });

    app.authenticate = (obj) => {
      spyAuthenticateEmail = obj.email;
      spyAuthenticatePassword = obj.password;

      const index = usersDb[0].email === obj.email ? 0 : 1;
  
      return Promise.resolve({ data: usersDb[index] });
    };

    app.log = () => {};
  };
};

// Tests

describe('client - instantiate', () => {
  it('exists', () => {
    assert.isFunction(AuthManagement);
  });
});

describe('client - promise methods', () => {
  var app;
  var authManagement;
  
  beforeEach(() => {
    app = feathersStubs.app();
    verifyResetServiceFake().call(app);
    authManagement = new AuthManagement(app);
  });
  
  it('checkUnique', (done) => {
    authManagement.checkUnique({ username: 'john a' }, null, true)
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, {
          action: 'checkUnique', value: { username: 'john a' }, ownId: null, meta: { noErrMsg: true },
        });
        
        done();
      });
  });
  
  it('resendVerify', (done) => {
    authManagement.resendVerifySignup('a@a.com', { b: 'b' })
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, {
          action: 'resendVerifySignup',
          value: 'a@a.com',
          notifierOptions: { b: 'b' }
        });
        
        done();
      });
  });
  
  it('verifySignupLong', (done) => {
    authManagement.verifySignupLong('000')
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, { action: 'verifySignupLong', value: '000' });
        
        done();
      });
  });
  
  it('verifySignupShort', (done) => {
    authManagement.verifySignupShort('000', { email: 'a@a.com' })
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, {
          action: 'verifySignupShort',
          value: { token: '000', user: { email: 'a@a.com' } },
        });
        
        done();
      });
  });
  
  it('sendResetPwd', (done) => {
    authManagement.sendResetPwd('a@a.com', { b: 'b' })
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, {
          action: 'sendResetPwd',
          value: 'a@a.com',
          notifierOptions: { b: 'b' }
        });
        
        done();
      });
  });
  
  it('resetPwdLong', (done) => {
    authManagement.resetPwdLong('000', '12345678')
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, {
          action: 'resetPwdLong',
          value: { token: '000', password: '12345678', passwordField: undefined }
        });
        
        done();
      });
  });
  
  it('resetPwdShort', (done) => {
    authManagement.resetPwdShort('000', { email: 'a@a.com' }, '12345678')
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, {
          action: 'resetPwdShort',
          value: { token: '000', user: { email: 'a@a.com' }, password: '12345678', passwordField: undefined },
        });
        
        done();
      });
  });
  
  it('passwordChange', (done) => {
    authManagement.passwordChange('12345678', 'password', { email: 'a' })
      .then(() => {
        assert.deepEqual(spyData, {
          action: 'passwordChange', value: { user: { email: 'a' }, oldPassword: '12345678', password: 'password', passwordField: undefined },
        });
        
        done();
      });
  });
  
  it('identityChange', (done) => {
    authManagement.identityChange('12345678', { email: 'b@b.com' }, { username: 'q' })
      .then(() => {
        assert.deepEqual(spyData, {
          action: 'identityChange', value: { user: { username: 'q' }, password: '12345678', passwordField: undefined,
            changes: { email: 'b@b.com' } },
        });
        
        done();
      });
  });
  
  it('authenticate is verified', (done) => {
    authManagement.authenticate('ok', 'bb')
      .then(user => {
        assert.equal(spyAuthenticateEmail, 'ok');
        assert.equal(spyAuthenticatePassword, 'bb');
  
        assert.deepEqual(user, usersDb[1]);
        
        done();
      });
  });
  
  it('authenticate is not verified', (done) => {
    authManagement.authenticate('bad', '12345678')
      .catch(err => {
        assert.equal(spyAuthenticateEmail, 'bad');
        assert.equal(spyAuthenticatePassword, '12345678');
        
        assert.notEqual(err, null);
        
        done();
      });
  });
});

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
