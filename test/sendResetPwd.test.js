
/* global assert, describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0,
no-param-reassign: 0, no-unused-vars: 0  */

const assert = require('chai').assert;
const feathersStubs = require('./../test/helpers/feathersStubs');
const verifyResetService = require('../lib/index');
const SpyOn = require('./helpers/basicSpy');

const defaultResetDelay = 1000 * 60 * 60 * 2; // 2 hours

// user DB

const now = Date.now();
const usersDb = [
  { _id: 'a', email: 'a', isVerified: false, verifyToken: '000', verifyExpires: now + 50000 },
  { _id: 'b', email: 'b', isVerified: true, verifyToken: null, verifyExpires: null },
];

// Tests

['_id', 'id'].forEach(idType => {
  ['paginated', 'non-paginated'].forEach(pagination => {
    describe(`sendResetPwd ${pagination} ${idType}`, () => {
      const ifNonPaginated = pagination === 'non-paginated';

      describe('basic', () => {
        var db;
        var app;
        var users;
        var verifyReset;

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          verifyResetService().call(app); // define and attach verifyReset service
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('updates verified user', (done) => {
          const email = 'b';
          const i = 1;

          verifyReset.create({ action: 'sendResetPwd', value: { email } })
            .then(user => {
              assert.strictEqual(user.isVerified, true, 'user.isVerified not true');
  
              assert.strictEqual(db[i].isVerified, true, 'isVerified not true');
              assert.isString(db[i].resetToken, 'resetToken not String');
              assert.equal(db[i].resetToken.length, 30, 'reset token wrong length');
              assert.equal(db[i].resetShortToken.length, 6, 'reset short token wrong length');
              assert.match(db[i].resetShortToken, /^[0-9]+$/);
              aboutEqualDateTime(db[i].resetExpires, makeDateTime());
  
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });

        it('error on unverified user', (done) => {
          const email = 'a';
          verifyReset.create({ action: 'sendResetPwd', value: { email } })
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

        it('error on email not found', (done) => {
          const email = 'x';
          verifyReset.create({ action: 'sendResetPwd', value: { email } })
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

        it('user is sanitized', (done) => {
          const email = 'b';

          verifyReset.create({ action: 'sendResetPwd', value: { email } })
            .then(user => {
              assert.strictEqual(user.isVerified, true, 'isVerified not true');
              assert.strictEqual(user.resetToken, undefined, 'resetToken not undefined');
              assert.strictEqual(user.resetShortToken, undefined, 'resetToken not undefined');
              assert.strictEqual(user.resetExpires, undefined, 'resetExpires not undefined');
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });
      });

      describe('length can change (digits)', () => {
        var db;
        var app;
        var users;
        var verifyReset;

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          verifyResetService({
            longTokenLen: 10,
            shortTokenLen: 9,
            shortTokenDigits: true,
          }).call(app); // define and attach verifyReset service
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('updates verified user', (done) => {
          const email = 'b';
          const i = 1;

          verifyReset.create({ action: 'sendResetPwd', value: { email } })
            .then(user => {
              assert.strictEqual(user.isVerified, true, 'user.isVerified not true');
  
              assert.strictEqual(db[i].isVerified, true, 'isVerified not true');
              assert.isString(db[i].resetToken, 'resetToken not String');
              assert.equal(db[i].resetToken.length, 20, 'reset token wrong length');
              assert.equal(db[i].resetShortToken.length, 9, 'reset short token wrong length');
              assert.match(db[i].resetShortToken, /^[0-9]+$/);
              aboutEqualDateTime(db[i].resetExpires, makeDateTime());
  
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });
      });

      describe('length can change (alpha)', () => {
        var db;
        var app;
        var users;
        var verifyReset;

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          verifyResetService({
            longTokenLen: 10,
            shortTokenLen: 9,
            shortTokenDigits: false,
          }).call(app); // define and attach verifyReset service
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('updates verified user', (done) => {
          const email = 'b';
          const i = 1;

          verifyReset.create({ action: 'sendResetPwd', value: { email } })
            .then(user => {
              assert.strictEqual(user.isVerified, true, 'user.isVerified not true');
  
              assert.strictEqual(db[i].isVerified, true, 'isVerified not true');
              assert.isString(db[i].resetToken, 'resetToken not String');
              assert.equal(db[i].resetToken.length, 20, 'reset token wrong length');
              assert.equal(db[i].resetShortToken.length, 9, 'reset short token wrong length');
              assert.notMatch(db[i].resetShortToken, /^[0-9]+$/);
              aboutEqualDateTime(db[i].resetExpires, makeDateTime());
  
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });
      });

      describe('with notification', () => {
        var db;
        var app;
        var users;
        var spyNotifier;
        var verifyReset;

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          spyNotifier = new SpyOn(notifier);

          verifyResetService({
            longTokenLen: 15,
            shortTokenLen: 6,
            shortTokenDigits: true,
            notifier: spyNotifier.callWith,
          }).call(app);
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('is called', (done) => {
          const email = 'b';
          const i = 1;
  
          verifyReset.create({
            action: 'sendResetPwd',
            value: { email },
            notifierOptions: { transport: 'sms' }
          })
            .then(user => {
              assert.strictEqual(user.isVerified, true, 'user.isVerified not true');
      
              assert.strictEqual(db[i].isVerified, true, 'isVerified not true');
              assert.isString(db[i].resetToken, 'resetToken not String');
              assert.equal(db[i].resetToken.length, 30, 'reset token wrong length');
              aboutEqualDateTime(db[i].resetExpires, makeDateTime());
      
              assert.deepEqual(
                spyNotifier.result()[0].args,
                [
                  'sendResetPwd',
                  sanitizeUserForEmail(db[i]),
                  { transport: 'sms' }
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

function makeDateTime(options1) {
  options1 = options1 || {};
  return Date.now() + (options1.delay || defaultResetDelay);
}

function aboutEqualDateTime(time1, time2, msg, delta) {
  delta = delta || 500;
  const diff = Math.abs(time1 - time2);
  assert.isAtMost(diff, delta, msg || `times differ by ${diff}ms`);
}

function sanitizeUserForEmail(user) {
  const user1 = clone(user);

  delete user1.password;

  return user1;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
