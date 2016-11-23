
/* global assert, describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0,
no-unused-vars: 0, object-property-newline: 0 */

const assert = require('chai').assert;
const feathersStubs = require('./../test/helpers/feathersStubs');
const verifyResetService = require('../lib/index');
const SpyOn = require('./helpers/basicSpy');

// user DB

const now = Date.now();
const usersDb = [
  // The added time interval must be longer than it takes to run ALL the tests
  { _id: 'a', email: 'a', username: 'aa', isVerified: false, verifyToken: '000', verifyShortToken: '00099', verifyExpires: now + 200000 },
  { _id: 'b', email: 'b', username: 'bb', isVerified: false, verifyToken: null, verifyShortToken: null, verifyExpires: null },
  { _id: 'c', email: 'c', username: 'cc', isVerified: false, verifyToken: '111', verifyShortToken: '11199', verifyExpires: now - 200000 },
  { _id: 'd', email: 'd', username: 'dd', isVerified: true, verifyToken: '222', verifyShortToken: '22299', verifyExpires: now - 200000 },
];

// Tests
['_id', 'id'].forEach(idType => {
  ['paginated', 'non-paginated'].forEach(pagination => {
    describe(`verifySignUpWithShortToken ${pagination} ${idType}`, function () {
      this.timeout(5000);
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
          verifyResetService({
            identifyUserProps: ['email', 'username'],
          }).call(app); // define and attach verifyReset service
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('verifies valid token', (done) => {
          const verifyShortToken = '00099';
          const i = 0;

          verifyReset.create({ action: 'verifySignupShort', value: {
            token: verifyShortToken, user: { email: db[i].email },
          } }, {}, (err, user) => {
            assert.strictEqual(err, null, 'err code set');

            assert.strictEqual(user.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(db[i].isVerified, true, 'isVerified not true');
            assert.strictEqual(db[i].verifyToken, null, 'verifyToken not null');
            assert.strictEqual(db[i].verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(db[i].verifyExpires, null, 'verifyExpires not null');

            done();
          });
        });

        it('user is sanitized', (done) => {
          const verifyShortToken = '00099';
          const i = 0;

          verifyReset.create({ action: 'verifySignupShort', value: {
            token: verifyShortToken, user: { username: db[i].username },
          } }, {}, (err, user) => {
            assert.strictEqual(err, null, 'err code set');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, undefined, 'verifyToken not undefined');
            assert.strictEqual(user.verifyShortToken, undefined, 'verifyShortToken not undefined');
            assert.strictEqual(user.verifyExpires, undefined, 'verifyExpires not undefined');

            done();
          });
        });

        it('handles multiple user ident', (done) => {
          const verifyShortToken = '00099';
          const i = 0;

          verifyReset.create({ action: 'verifySignupShort', value: {
            token: verifyShortToken, user: { email: db[i].email, username: db[i].username },
          } }, {}, (err, user) => {
            assert.strictEqual(err, null, 'err code set');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, undefined, 'verifyToken not undefined');
            assert.strictEqual(user.verifyShortToken, undefined, 'verifyShortToken not undefined');
            assert.strictEqual(user.verifyExpires, undefined, 'verifyExpires not undefined');

            done();
          });
        });

        it('requires user ident', (done) => {
          const verifyShortToken = '00099';
          const i = 0;

          verifyReset.create({ action: 'verifySignupShort', value: {
            token: verifyShortToken, user: {},
          } }, {}, (err, user) => {
            assert.isString(err.message);
            assert.isNotFalse(err.message);

            done();
          });
        });

        it('throws on non-configured user ident', (done) => {
          const verifyShortToken = '00099';
          const i = 0;

          verifyReset.create({ action: 'verifySignupShort', value: {
            token: verifyShortToken, user: { email: db[i].email, verifyShortToken },
          } }, {}, (err, user) => {
            assert.isString(err.message);
            assert.isNotFalse(err.message);

            done();
          });
        });

        it('error on unverified user', (done) => {
          const verifyShortToken = '22299';
          const i = 3;

          verifyReset.create({ action: 'verifySignupShort', value: {
            token: verifyShortToken, user: { email: db[i].email },
          } }, {}, (err, user) => {
            assert.isString(err.message);
            assert.isNotFalse(err.message);

            done();
          });
        });

        it('error on expired token', (done) => {
          const verifyShortToken = '11199';
          const i = 2;

          verifyReset.create({ action: 'verifySignupShort', value: {
            token: verifyShortToken, user: { username: db[i].username } },
          }, {}, (err, user) => {
            assert.isString(err.message);
            assert.isNotFalse(err.message);

            done();
          });
        });

        it('error on user not found', (done) => {
          const verifyShortToken = '999';
          verifyReset.create({ action: 'verifySignupShort', value: {
            token: verifyShortToken, user: { email: '999' },
          } }, {}, (err, user) => {
            assert.isString(err.message);
            assert.isNotFalse(err.message);

            done();
          });
        });

        it('error incorrect token', (done) => {
          const verifyShortToken = '999';
          const i = 0;

          verifyReset.create({
            action: 'verifySignupShort',
            value: { token: verifyShortToken, user: { email: db[i].email } }
          },
            {},
            (err, user) => {
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
        const password = '123456';

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          spyNotifier = new SpyOn(notifier);

          verifyResetService({
            // maybe reset identifyUserProps
            notifier: spyNotifier.callWith,
            testMode: true,
          }).call(app);
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });
        
        it('verifies valid token', (done) => {
          const verifyShortToken = '00099';
          const i = 0;
          
          verifyReset.create({
            action: 'verifySignupShort',
            value: { token: verifyShortToken, user: { email: db[i].email } },
          },
            {},
            (err, user) => {
              assert.strictEqual(err, null, 'err code set');
              
              assert.strictEqual(user.isVerified, true, 'user.isVerified not true');
              
              assert.strictEqual(db[i].isVerified, true, 'isVerified not true');
              assert.strictEqual(db[i].verifyToken, null, 'verifyToken not null');
              assert.strictEqual(db[i].verifyExpires, null, 'verifyExpires not null');
              
              assert.deepEqual(
                spyNotifier.result()[0].args,
                [
                  'verifySignup',
                  Object.assign({}, sanitizeUserForEmail(db[i])),
                  {}
                ]);
              
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
