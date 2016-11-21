
/* global assert, describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0,
no-param-reassign: 0, no-unused-vars: 0  */

const assert = require('chai').assert;
const feathersStubs = require('./../test/helpers/feathersStubs');
const verifyResetService = require('../lib/index');
const VerifyReset = require('../lib/client');

// user DB

const usersDb = [
  { _id: 'a', email: 'bad', password: 'aa', isVerified: false },
  { _id: 'b', email: 'ok', password: 'bb', isVerified: true },
];

// Fake for verifyResetService service

var spyData = null;
var spyParams = null;
var spyAuthenticateEmail;
var spyAuthenticatePassword;

const verifyResetServiceFake = function () {
  return function verifyReset() { // 'function' needed as we use 'this'
    const app = this;
    const path = 'verifyReset';

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

describe('wrapper - instantiate', () => {
  it('exists', () => {
    assert.isFunction(VerifyReset);
  });

  it('has expected methods', () => {
    const db = clone(usersDb);
    const app = feathersStubs.app();
    const users = feathersStubs.users(app, db);
    verifyResetService().call(app);
    const verifyReset = new VerifyReset(app);

    ['checkUnique', 'resendVerifySignup', 'verifySignupLong', 'verifySignupShort', 'sendResetPwd',
      'resetPwdLong', 'resetPwdShort', 'passwordChange', 'emailChange',
    ].forEach(method => {
      assert.isFunction(verifyReset[method], `${method} is not a function`);
    });
  });
});

describe('wrapper - callback methods', () => {
  var app;
  var verifyReset;

  beforeEach(() => {
    app = feathersStubs.app();
    verifyResetServiceFake().call(app);
    verifyReset = new VerifyReset(app);
  });

  it('checkUnique', (done) => {
    verifyReset.checkUnique({ username: 'john a' }, null, true, () => {
      assert.deepEqual(spyParams, {});
      assert.deepEqual(spyData, {
        action: 'checkUnique', value: { username: 'john a' }, ownId: null, meta: { noErrMsg: true },
      });
      
      done();
    });
  });

  it('resendVerify', (done) => {
    verifyReset.resendVerifySignup('a@a.com', { a: 'a' }, () => {
      assert.deepEqual(spyParams, {});
      assert.deepEqual(spyData, {
        action: 'resendVerifySignup',
        value: 'a@a.com',
        notifierOptions: { a: 'a' }
      });
      
      done();
    });
  });

  it('verifySignupLong', (done) => {
    verifyReset.verifySignupLong('000', () => {
      assert.deepEqual(spyParams, {});
      assert.deepEqual(spyData, { action: 'verifySignupLong', value: '000' });
  
      done();
    });
  });
  
  it('verifySignupShort', (done) => {
    verifyReset.verifySignupShort('000', { email: 'a@a.com' }, () => {
      assert.deepEqual(spyParams, {});
      assert.deepEqual(spyData, {
        action: 'verifySignupShort',
        value: { token: '000', user: { email: 'a@a.com' } },
      });
      
      done();
    });
  });
  
  it('sendResetPwd', (done) => {
    verifyReset.sendResetPwd('a@a.com', { a: 'a' }, () => {
      assert.deepEqual(spyParams, {});
      assert.deepEqual(spyData, {
        action: 'sendResetPwd',
        value: 'a@a.com',
        notifierOptions: { a: 'a' }
      });
      
      done();
    });
  });
  
  it('resetPwdLong', (done) => {
    verifyReset.resetPwdLong('000', '12345678', () => {
      assert.deepEqual(spyParams, {});
      assert.deepEqual(spyData, {
        action: 'resetPwdLong',
        value: { token: '000', password: '12345678' }
      });
      
      done();
    });
  });
  
  it('resetPwdShort', (done) => {
    verifyReset.resetPwdShort('000', { email: 'a@a.com' }, '12345678', () => {
      assert.deepEqual(spyParams, {});
      assert.deepEqual(spyData, {
        action: 'resetPwdShort',
        value: { token: '000', user: { email: 'a@a.com' }, password: '12345678' },
      });
      
      done();
    });
  });

  it('passwordChange', (done) => {
    const user = { _id: 'a', email: 'a', password: 'ahjhjhjkhj', isVerified: false };

    verifyReset.passwordChange('12345678', 'password', user, () => {
      assert.deepEqual(spyParams, { user });
      assert.deepEqual(spyData, {
        action: 'passwordChange', value: { oldPassword: '12345678', password: 'password' },
      });
      
      done();
    });
  });

  it('emailChange', (done) => {
    const user = { _id: 'a', email: 'a', password: 'ahjhjhjkhj', isVerified: false };

    verifyReset.emailChange('12345678', 'b@b.com', user, () => {
      assert.deepEqual(spyParams, { user });
      assert.deepEqual(spyData, {
        action: 'emailChange', value: { password: '12345678', email: 'b@b.com' },
      });
      
      done();
    });
  });

  it('authenticate is verified', (done) => {
    verifyReset.authenticate('ok', 'bb', (err, user) => {
      assert.equal(spyAuthenticateEmail, 'ok');
      assert.equal(spyAuthenticatePassword, 'bb');

      assert.equal(err, null);
      assert.deepEqual(user, usersDb[1]);
      
      done();
    });
  });

  it('authenticate is not verified', (done) => {
    verifyReset.authenticate('bad', '12345678', (err, user) => {
      assert.equal(spyAuthenticateEmail, 'bad');
      assert.equal(spyAuthenticatePassword, '12345678');

      assert.notEqual(err, null);
      
      done();
    });
  });
});

describe('wrapper - promise methods', () => {
  var app;
  var verifyReset;
  
  beforeEach(() => {
    app = feathersStubs.app();
    verifyResetServiceFake().call(app);
    verifyReset = new VerifyReset(app);
  });
  
  it('checkUnique', (done) => {
    verifyReset.checkUnique({ username: 'john a' }, null, true)
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, {
          action: 'checkUnique', value: { username: 'john a' }, ownId: null, meta: { noErrMsg: true },
        });
        
        done();
      });
  });
  
  it('resendVerify', (done) => {
    verifyReset.resendVerifySignup('a@a.com', { b: 'b' })
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
    verifyReset.verifySignupLong('000')
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, { action: 'verifySignupLong', value: '000' });
        
        done();
      });
  });
  
  it('verifySignupShort', (done) => {
    verifyReset.verifySignupShort('000', { email: 'a@a.com' })
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
    verifyReset.sendResetPwd('a@a.com', { b: 'b' })
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
    verifyReset.resetPwdLong('000', '12345678')
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, {
          action: 'resetPwdLong',
          value: { token: '000', password: '12345678' }
        });
        
        done();
      });
  });
  
  it('resetPwdShort', (done) => {
    verifyReset.resetPwdShort('000', { email: 'a@a.com' }, '12345678')
      .then(() => {
        assert.deepEqual(spyParams, {});
        assert.deepEqual(spyData, {
          action: 'resetPwdShort',
          value: { token: '000', user: { email: 'a@a.com' }, password: '12345678' },
        });
        
        done();
      });
  });
  
  it('passwordChange', (done) => {
    const user = { _id: 'a', email: 'a', password: 'ahjhjhjkhj', isVerified: false };
    
    verifyReset.passwordChange('12345678', 'password', user)
      .then(() => {
        assert.deepEqual(spyParams, { user });
        assert.deepEqual(spyData, {
          action: 'passwordChange', value: { oldPassword: '12345678', password: 'password' },
        });
        
        done();
      });
  });
  
  it('emailChange', (done) => {
    const user = { _id: 'a', email: 'a', password: 'ahjhjhjkhj', isVerified: false };
    
    verifyReset.emailChange('12345678', 'b@b.com', user)
      .then(() => {
        assert.deepEqual(spyParams, { user });
        assert.deepEqual(spyData, {
          action: 'emailChange', value: { password: '12345678', email: 'b@b.com' },
        });
        
        done();
      });
  });
  
  it('authenticate is verified', (done) => {
    verifyReset.authenticate('ok', 'bb')
      .then(user => {
        assert.equal(spyAuthenticateEmail, 'ok');
        assert.equal(spyAuthenticatePassword, 'bb');
  
        assert.deepEqual(user, usersDb[1]);
        
        done();
      });
  });
  
  it('authenticate is not verified', (done) => {
    verifyReset.authenticate('bad', '12345678')
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
