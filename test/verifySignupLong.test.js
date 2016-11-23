
/* global assert, describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0,
no-unused-vars: 0 */

const assert = require('chai').assert;
const feathersStubs = require('./../test/helpers/feathersStubs');
const verifyResetService = require('../lib/index');
const SpyOn = require('./helpers/basicSpy');

// user DB

const now = Date.now();
const usersDb = [
  // The added time interval must be longer than it takes to run ALL the tests
  { _id: 'a', email: 'a', isVerified: false, verifyToken: '000', verifyExpires: now + 200000 },
  { _id: 'b', email: 'b', isVerified: false, verifyToken: null, verifyExpires: null },
  { _id: 'c', email: 'c', isVerified: false, verifyToken: '111', verifyExpires: now - 200000 },
  { _id: 'd', email: 'd', isVerified: true, verifyToken: '222', verifyExpires: now - 200000 },
  { _id: 'e', email: 'e', isVerified: true, verifyToken: '800', verifyExpires: now + 200000,
    verifyChanges: { cellphone: '800' } },
];

// Tests
['_id', 'id'].forEach(idType => {
  ['paginated', 'non-paginated'].forEach(pagination => {
    describe(`verifySignupWithLongToken ${pagination} ${idType}`, function () {
      this.timeout(5000);
      const ifNonPaginated = pagination === 'non-paginated';

      describe('basic', () => {
        var db;
        var app;
        var users;
        var verifyReset;
        const password = '123456';

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          verifyResetService().call(app); // define and attach verifyReset service
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('verifies valid token if not verified', (done) => {
          const verifyToken = '000';
          const i = 0;

          verifyReset.create({ action: 'verifySignupLong', value: verifyToken }, {},
            (err, user) => {
              assert.strictEqual(err, null, 'err code set');

              assert.strictEqual(user.isVerified, true, 'user.isVerified not true');

              assert.strictEqual(db[i].isVerified, true, 'isVerified not true');
              assert.strictEqual(db[i].verifyToken, null, 'verifyToken not null');
              assert.strictEqual(db[i].verifyShortToken, null, 'verifyShortToken not null');
              assert.strictEqual(db[i].verifyExpires, null, 'verifyExpires not null');
              assert.deepEqual(db[i].verifyChanges, {}, 'verifyChanges not empty object');

              done();
            });
        });
  
        it('verifies valid token if verifyChanges', (done) => {
          const verifyToken = '800';
          const i = 4;
    
          verifyReset.create({ action: 'verifySignupLong', value: verifyToken }, {},
            (err, user) => {
              assert.strictEqual(err, null, 'err code set');
        
              assert.strictEqual(user.isVerified, true, 'user.isVerified not true');
        
              assert.strictEqual(db[i].isVerified, true, 'isVerified not true');
              assert.strictEqual(db[i].verifyToken, null, 'verifyToken not null');
              assert.strictEqual(db[i].verifyShortToken, null, 'verifyShortToken not null');
              assert.strictEqual(db[i].verifyExpires, null, 'verifyExpires not null');
              assert.deepEqual(db[i].verifyChanges, {}, 'verifyChanges not empty object');
  
              assert.strictEqual(db[i].cellphone, '800', 'cellphone wrong');
        
              done();
            });
        });

        it('user is sanitized', (done) => {
          const verifyToken = '000';
          const i = 0;

          verifyReset.create({ action: 'verifySignupLong', value: verifyToken }, {},
            (err, user) => {
              assert.strictEqual(err, null, 'err code set');

              assert.strictEqual(user.isVerified, true, 'isVerified not true');
              assert.strictEqual(user.verifyToken, undefined, 'verifyToken not undefined');
              assert.strictEqual(user.verifyShortToken, undefined, 'verifyShortToken not undefined');
              assert.strictEqual(user.verifyExpires, undefined, 'verifyExpires not undefined');
              assert.strictEqual(user.verifyChanges, undefined, 'verifyChanges not undefined');
              
              done();
            });
        });

        it('error on verified user without verifyChange', (done) => {
          const verifyToken = '222';
          verifyReset.create({ action: 'verifySignupLong', value: verifyToken }, {},
            (err, user) => {
              assert.isString(err.message);
              assert.isNotFalse(err.message);

              done();
            });
        });

        it('error on expired token', (done) => {
          const verifyToken = '111';
          verifyReset.create({ action: 'verifySignupLong', value: verifyToken }, {},
            (err, user) => {
              assert.isString(err.message);
              assert.isNotFalse(err.message);

              done();
            });
        });

        it('error on token not found', (done) => {
          const verifyToken = '999';
          verifyReset.create({ action: 'verifySignupLong', value: verifyToken }, {},
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

          verifyResetService({ notifier: spyNotifier.callWith, testMode: true }).call(app);
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });
  
        it('verifies valid token', (done) => {
          const verifyToken = '000';
          const i = 0;
    
          verifyReset.create({
              action: 'verifySignupLong',
              value: verifyToken
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
