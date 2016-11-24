
/* global assert, describe, it */
/* eslint  no-param-reassign: 0, no-shadow: 0, no-unused-vars: 0, no-var: 0, one-var: 0,
one-var-declaration-per-line: 0 */

const util = require('util');

const assert = require('chai').assert;
const feathersStubs = require('./../test/helpers/feathersStubs');
const verifyResetService = require('../src/index');
const SpyOn = require('./../test/helpers/basicSpy');

const defaultVerifyDelay = 1000 * 60 * 60 * 24 * 5; // 5 days

// user DB

const now = Date.now();
const usersDb = [
  { _id: 'a', email: 'a', isVerified: false, verifyToken: '000', verifyShortToken: '00099', verifyExpires: now + 50000, username: 'Doe' },
  { _id: 'b', email: 'b', isVerified: true, verifyToken: null, verifyShortToken: null, verifyExpires: null },
  { _id: 'c', email: 'c', isVerified: true, verifyToken: '999', verifyShortToken: '99900', verifyExpires: null }, // impossible
];

// Tests

['_id', 'id'].forEach(idType => {
  ['paginated', 'non-paginated'].forEach(pagination => {
    describe(`resendVerifySignup ${pagination} ${idType}`, () => {
      const ifNonPaginated = pagination === 'non-paginated';

      function basicTest1(desc, values) {
        describe(desc, () => {
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

          it('verifyReset::create exists', () => {
            assert.isFunction(verifyReset.create);
          });
  
          it('updates unverified user', (done) => {
            const i = 0;
    
            verifyReset.create({ action: 'resendVerifySignup', value: values[0] })
              .then(user => {
                assert.strictEqual(user.isVerified, false, 'user.isVerified not false');
                assert.strictEqual(db[i].isVerified, false, 'isVerified not false');
                assert.isString(db[i].verifyToken, 'verifyToken not String');
                assert.equal(db[i].verifyToken.length, 30, 'verify token wrong length');
                assert.equal(db[i].verifyShortToken.length, 6, 'verify short token wrong length');
                assert.match(db[i].verifyShortToken, /^[0-9]+$/);
                aboutEqualDateTime(db[i].verifyExpires, makeDateTime());
                done();
              })
              .catch(err => {
                assert.strictEqual(err, null, 'err code set');
                done();
              });
          });
  
          it('sanitizes user', (done) => {
            verifyReset.create({ action: 'resendVerifySignup', value: values[1] })
              .then(user => {
                assert.strictEqual(user.isVerified, false, 'isVerified not false');
                assert.strictEqual(user.verifyToken, undefined, 'verifyToken not undefined');
                assert.strictEqual(user.verifyShortToken, undefined, 'verifyShortToken not undefined');
                assert.strictEqual(user.verifyExpires, undefined, 'verifyExpires not undefined');
                done();
              })
              .catch(err => {
                assert.strictEqual(err, null, 'err code set');
                done();
              });
          });

          it('error on verified user', (done) => {
            verifyReset.create({ action: 'resendVerifySignup', value: values[2] })
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
            verifyReset.create({ action: 'resendVerifySignup', value: values[3] })
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
      }

      basicTest1('emailOfToken is {email}', [
        { email: 'a' },
        { email: 'a' },
        { email: 'b' },
        { email: 'x' }
      ]);

      basicTest1('emailOfToken is {verifyToken}', [
        { verifyToken: '000' },
        { verifyToken: '000' },
        { verifyToken: '999' },
        { verifyToken: 'xxx' },
      ]);

      basicTest1('emailOfToken is {verifyShortToken}', [
        { verifyShortToken: '00099' },
        { verifyShortToken: '00099' },
        { verifyShortToken: '99900' },
        { verifyShortToken: 'xxx' },
      ]);

      describe('emailOfToken is {verifyToken} can change len', () => {
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
          }).call(app); // define and attach verifyReset service
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('can change', (done) => {
          const verifyToken = '000';
          const i = 0;

          verifyReset.create({ action: 'resendVerifySignup', value: { verifyToken } })
            .then(user => {
              assert.strictEqual(user.isVerified, false, 'user.isVerified not false');
              assert.strictEqual(db[i].isVerified, false, 'isVerified not false');
              assert.isString(db[i].verifyToken, 'verifyToken not String');
              assert.equal(db[i].verifyToken.length, 20, 'verify token wrong length');
              assert.equal(db[i].verifyShortToken.length, 6, 'verify short token wrong length');
              assert.match(db[i].verifyShortToken, /^[0-9]+$/);
              aboutEqualDateTime(db[i].verifyExpires, makeDateTime());
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });
      });

      describe('short token (digit) can change length', () => {
        var db;
        var app;
        var users;
        var verifyReset;

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          verifyResetService({
            longTokenLen: 15, // need to reset this
            shortTokenLen: 8,
          }).call(app); // define and attach verifyReset service
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('can change', (done) => {
          const verifyToken = '000';
          const i = 0;

          verifyReset.create({ action: 'resendVerifySignup', value: { verifyToken } })
            .then(user => {
              assert.strictEqual(user.isVerified, false, 'user.isVerified not false');
              assert.strictEqual(db[i].isVerified, false, 'isVerified not false');
              assert.isString(db[i].verifyToken, 'verifyToken not String');
              assert.equal(db[i].verifyToken.length, 30, 'verify token wrong length');
              assert.equal(db[i].verifyShortToken.length, 8, 'verify short token wrong length');
              assert.match(db[i].verifyShortToken, /^[0-9]+$/);
              aboutEqualDateTime(db[i].verifyExpires, makeDateTime());
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });
      });

      describe('short token (alpha) can change length', () => {
        var db;
        var app;
        var users;
        var verifyReset;

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          verifyResetService({
            longTokenLen: 15, // need to reset this
            shortTokenLen: 9,
            shortTokenDigits: false,
          }).call(app); // define and attach verifyReset service
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('can change', (done) => {
          const verifyToken = '000';
          const i = 0;

          verifyReset.create({ action: 'resendVerifySignup', value: { verifyToken } })
            .then(user => {
              assert.strictEqual(user.isVerified, false, 'user.isVerified not false');
              assert.strictEqual(db[i].isVerified, false, 'isVerified not false');
              assert.isString(db[i].verifyToken, 'verifyToken not String');
              assert.equal(db[i].verifyToken.length, 30, 'verify token wrong length');
              assert.equal(db[i].verifyShortToken.length, 9, 'verify short token wrong length');
              assert.notMatch(db[i].verifyShortToken, /^[0-9]+$/);
              aboutEqualDateTime(db[i].verifyExpires, makeDateTime());
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });
      });

      describe('use affirming properties', () => {
        var db;
        var app;
        var users;
        var verifyReset;

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          verifyResetService({
            longTokenLen: 15, // need to reset this
            shortTokenLen: 6,
            shortTokenDigits: false,
          }).call(app); // define and attach verifyReset service
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });
  
        it('verifies when correct', (done) => {
          const verifyToken = '000';
          const i = 0;
    
          verifyReset.create({ action: 'resendVerifySignup', value: {
            verifyToken, email: 'a'
          } })
            .then(user => {
              assert.strictEqual(user.isVerified, false, 'user.isVerified not false');
              assert.strictEqual(db[i].isVerified, false, 'isVerified not false');
              assert.isString(db[i].verifyToken, 'verifyToken not String');
              assert.equal(db[i].verifyToken.length, 30, 'verify token wrong length');
              assert.equal(db[i].verifyShortToken.length, 6, 'verify short token wrong length');
              assert.notMatch(db[i].verifyShortToken, /^[0-9]+$/);
              aboutEqualDateTime(db[i].verifyExpires, makeDateTime());
              done();
            })
            .catch(err => {
              assert.strictEqual(err, null, 'err code set');
              done();
            });
        });

        it('fails when incorrect', (done) => {
          const verifyToken = '000';
          const i = 0;

          verifyReset.create({ action: 'resendVerifySignup', value: {
            verifyToken, email: 'a', username: 'Doexxxxxxx'
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

        it('fails when hacks attempted', (done) => {
          const verifyToken = '000';
          const i = 0;

          verifyReset.create({ action: 'resendVerifySignup', value: {
            username: 'Doe'
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
        var verifyReset;

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          spyNotifier = new SpyOn(notifier);

          verifyResetService({
            longTokenLen: 15, // need to reset this
            shortTokenLen: 6, // need to reset this
            shortTokenDigits: true, // need to reset this
            notifier: spyNotifier.callWith
          }).call(app);
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });
  
        it('is called', (done) => {
          const email = 'a';
          const i = 0;
  
          verifyReset.create({
              action: 'resendVerifySignup',
              value: { email },
              notifierOptions: { transport: 'email' }
            })
            .then(user => {
              assert.strictEqual(user.isVerified, false, 'user.isVerified not false');
              assert.strictEqual(db[i].isVerified, false, 'isVerified not false');
              assert.isString(db[i].verifyToken, 'verifyToken not String');
              assert.equal(db[i].verifyToken.length, 30, 'verify token wrong length');
              assert.equal(db[i].verifyShortToken.length, 6, 'verify short token wrong length');
              assert.match(db[i].verifyShortToken, /^[0-9]+$/);
              aboutEqualDateTime(db[i].verifyExpires, makeDateTime());
              assert.deepEqual(
                spyNotifier.result()[0].args,
                [
                  'resendVerifySignup',
                  sanitizeUserForEmail(db[i]),
                  { transport: 'email' }
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
  return Date.now() + (options1.delay || defaultVerifyDelay);
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
