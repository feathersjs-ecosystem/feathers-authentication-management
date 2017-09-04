
/* global assert, describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0,
no-unused-vars: 0 */

const assert = require('chai').assert;
const feathersStubs = require('./../test/helpers/feathersStubs');
const authManagementService = require('../src/index');
const SpyOn = require('./helpers/basicSpy');

// user DB

const now = Date.now();
const usersDb = [
  // The added time interval must be longer than it takes to run ALL the tests
  { _id: 'a', email: 'a', username: 'aa', isVerified: true, resetToken: '000', resetShortToken: '00099', resetExpires: now + 200000 },
  { _id: 'b', email: 'b', username: 'bb', isVerified: true, resetToken: null, resetShortToken: null, resetExpires: null },
  { _id: 'c', email: 'c', username: 'cc', isVerified: true, resetToken: '111', resetShortToken: '11199', resetExpires: now - 200000 },
  { _id: 'd', email: 'd', username: 'dd', isVerified: false, resetToken: '222', resetShortToken: '22299', resetExpires: now - 200000 },
];

// Tests
['_id', 'id'].forEach(idType => {
  ['paginated', 'non-paginated'].forEach(pagination => {
    describe(`resetPwdWithShortToken ${pagination} ${idType}`, function () {
      this.timeout(8000);
      const ifNonPaginated = pagination === 'non-paginated';

      describe('basic', () => {
        var db;
        var app;
        var users;
        var authManagement;
        const password = '123456';

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          authManagementService({
            identifyUserProps: ['email', 'username']
          }).call(app); // define and attach authManagement service
          authManagement = app.service('authManagement'); // get handle to authManagement
        });
  
        it('verifies valid token', (done) => {
          const resetShortToken = 'a___00099';
          const i = 0;
    
          authManagement.create({ action: 'resetPwdShort', value: {
            token: resetShortToken, password, user: { email: db[i].email }
          } })
            .then(user => {
              assert.strictEqual(user.isVerified, true, 'user.isVerified not true');
              assert.strictEqual(db[i].isVerified, true, 'isVerified not true');
              assert.strictEqual(db[i].resetToken, null, 'resetToken not null');
              assert.strictEqual(db[i].resetShortToken, null, 'resetShortToken not null');
              assert.strictEqual(db[i].resetExpires, null, 'resetExpires not null');
              assert.isString(db[i].password, 'password not a string');
              assert.equal(db[i].password.length, 60, 'password wrong length');
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });

        it('user is sanitized', (done) => {
          const resetShortToken = 'a___00099';
          const i = 0;

          authManagement.create({ action: 'resetPwdShort', value: {
            token: resetShortToken, password, user: { username: db[i].username }
          } })
            .then(user => {
              assert.strictEqual(user.isVerified, true, 'isVerified not true');
              assert.strictEqual(user.resetToken, undefined, 'resetToken not undefined');
              assert.strictEqual(user.resetShortToken, undefined, 'resetShortToken not undefined');
              assert.strictEqual(user.resetExpires, undefined, 'resetExpires not undefined');
              assert.isString(db[i].password, 'password not a string');
              assert.equal(db[i].password.length, 60, 'password wrong length');
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });

        it('handles multiple user ident', (done) => {
          const resetShortToken = 'a___00099';
          const i = 0;

          authManagement.create({ action: 'resetPwdShort', value: {
            token: resetShortToken, password, user: { email: db[i].email, username: db[i].username }
          } })
            .then(user => {
              assert.strictEqual(user.isVerified, true, 'isVerified not true');
              assert.strictEqual(user.resetToken, undefined, 'resetToken not undefined');
              assert.strictEqual(user.resetShortToken, undefined, 'resetShortToken not undefined');
              assert.strictEqual(user.resetExpires, undefined, 'resetExpires not undefined');
              assert.isString(db[i].password, 'password not a string');
              assert.equal(db[i].password.length, 60, 'password wrong length');
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });

        it('requires user ident', (done) => {
          const resetShortToken = 'a___00099';
          const i = 0;

          authManagement.create({ action: 'resetPwdShort', value: {
            token: resetShortToken, password, user: {}
          } })
            .then(user => {
              assert.fail(true, false);
              done();
            })
            .catch(err => {
              assert.isString(err.message);
              assert.isNotFalse(err.message);
              done();
            });
        });

        it('throws on non-configured user ident', (done) => {
          const resetShortToken = 'a___00099';
          const i = 0;

          authManagement.create({ action: 'resetPwdShort', value: {
            token: resetShortToken, password, user: { email: db[i].email, resetShortToken }
          } })
            .then(user => {
              assert.fail(true, false);
              done();
            })
            .catch(err => {
              assert.isString(err.message);
              assert.isNotFalse(err.message);
              done();
            });
        });

        it('error on unverified user', (done) => {
          const resetShortToken = '22299';
          const i = 3;

          authManagement.create({ action: 'resetPwdShort', value: {
            token: resetShortToken, user: { email: db[i].email }, password
          } })
            .then(user => {
              assert.fail(true, false);
              done();
            })
            .catch(err => {
              assert.isString(err.message);
              assert.isNotFalse(err.message);
              done();
            });
        });

        it('error on expired token', (done) => {
          const resetShortToken = '11199';
          const i = 2;

          authManagement.create({ action: 'resetPwdShort', value: {
            token: resetShortToken, user: { username: db[i].username }, password }
          })
            .then(user => {
              assert.fail(true, false);
              done();
            })
            .catch(err => {
              assert.isString(err.message);
              assert.isNotFalse(err.message);
              done();
            });
        });

        it('error on user not found', (done) => {
          const resetShortToken = '999';
          authManagement.create({ action: 'resetPwdShort', value: {
            token: resetShortToken, user: { email: '999' }, password
          } })
            .then(user => {
              assert.fail(true, false);
              done();
            })
            .catch(err => {
              assert.isString(err.message);
              assert.isNotFalse(err.message);
              done();
            });
        });

        it('error incorrect token', (done) => {
          const resetShortToken = '999';
          const i = 0;

          authManagement.create({ action: 'resetPwdShort', value: {
            token: resetShortToken, user: { email: db[i].email }, password
          } })
            .then(user => {
              assert.fail(true, false);
              done();
            })
            .catch(err => {
              assert.isString(err.message);
              assert.isNotFalse(err.message);
              done();
            });
        });
      });


      describe('with notification', () => {
        var db;
        var app;
        var users;
        var spyNotifier;
        var authManagement;
        const password = '123456';

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          spyNotifier = new SpyOn(notifier);

          authManagementService({
            // maybe reset identifyUserProps
            notifier: spyNotifier.callWith,
            testMode: true
          }).call(app);
          authManagement = app.service('authManagement'); // get handle to authManagement
        });
  
        it('verifies valid token', (done) => {
          const resetShortToken = 'a___00099';
          const i = 0;
    
          authManagement.create({
              action: 'resetPwdShort',
              value: { token: resetShortToken, user: { email: db[i].email }, password } })
            .then(user => {
              assert.strictEqual(user.isVerified, true, 'user.isVerified not true');
  
              assert.strictEqual(db[i].isVerified, true, 'isVerified not true');
              assert.strictEqual(db[i].resetToken, null, 'resetToken not null');
              assert.strictEqual(db[i].resetExpires, null, 'resetExpires not null');
  
              const hash = db[i].password;
              assert.isString(hash, 'password not a string');
              assert.equal(hash.length, 60, 'password wrong length');
  
              assert.deepEqual(
                spyNotifier.result()[0].args,
                [
                  'resetPwd',
                  Object.assign({}, sanitizeUserForEmail(db[i])),
                  {}
                ]);
  
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });
      });
    });
  });
});

// Helpers

function notifier(action, user, notifierOptions, newEmail) {
  return Promise.resolve(user);
}

function sanitizeUserForEmail(user) {
  const user1 = Object.assign({}, user);

  delete user1.password;

  return user1;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
