
/* global assert, describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0,
no-unused-vars: 0 */

const assert = require('chai').assert;
const feathers = require('@feathersjs/feathers');
const feathersMemory = require('feathers-memory');
const authLocalMgnt = require('../src/index');
const SpyOn = require('./helpers/basic-spy');
const { saveHash } = require('./../test/helpers/index');
const { hashPassword } = require('../src/helpers')

const now = Date.now();

const makeUsersService = (options) => function (app) {
  app.use('/users', feathersMemory(options));
};

const fieldToHash = 'resetToken';
const users_Id = [
  // The added time interval must be longer than it takes to run ALL the tests
  { _id: 'a', email: 'a', isVerified: true, resetToken: 'a___000', resetExpires: now + 200000 },
  { _id: 'b', email: 'b', isVerified: true, resetToken: null, resetExpires: null },
  { _id: 'c', email: 'c', isVerified: true, resetToken: 'c___111', resetExpires: now - 200000 },
  { _id: 'd', email: 'd', isVerified: false, resetToken: 'd___222', resetExpires: now - 200000 },
];

const usersId = [
  // The added time interval must be longer than it takes to run ALL the tests
  { id: 'a', email: 'a', isVerified: true, resetToken: 'a___000', resetExpires: now + 200000 },
  { id: 'b', email: 'b', isVerified: true, resetToken: null, resetExpires: null },
  { id: 'c', email: 'c', isVerified: true, resetToken: 'c___111', resetExpires: now - 200000 },
  { id: 'd', email: 'd', isVerified: false, resetToken: 'd___222', resetExpires: now - 200000 },
];

// Tests
['_id', 'id'].forEach(idType => {
  ['paginated', 'non-paginated'].forEach(pagination => {
    describe(`resetPwdWithLongToken ${pagination} ${idType}`, function () {
      this.timeout(50000); // ???????????????????????????????????????????????????????????????????????

      describe('basic', () => {
        let app;
        let usersService;
        let authLocalMgntService;
        let db;
        let result;

        beforeEach(async () => {
          app = feathers();
          app.configure(makeUsersService({ id: idType, paginate: pagination === 'paginated' }));
          app.configure(authLocalMgnt({

          }));
          authLocalMgntService = app.service('authManagement');

          // Ugly but makes test much faster
          if (users_Id[0][fieldToHash].length < 15) {
            for (let i = 0, ilen = users_Id.length; i < ilen; i++) {
              const hashed = await hashPassword(app, users_Id[i][fieldToHash]);
              users_Id[i][fieldToHash] = hashed;
              usersId[i][fieldToHash] = hashed;
            }
          }

          usersService = app.service('users');
          await usersService.remove(null);
          db = clone(idType === '_id' ? users_Id : usersId);
          await usersService.create(db);
        });

        it('verifies valid token', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'resetPwdLong',
              value: { token: 'a___000', password: '123456' }
            });
            const user = await usersService.get(result.id || result._id);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.resetToken, null, 'resetToken not null');
            assert.strictEqual(user.resetShortToken, null, 'resetShortToken not null');
            assert.strictEqual(user.resetExpires, null, 'resetExpires not null');
            assert.isString(user.password, 'password not a string');
            assert.equal(user.password.length, 60, 'password wrong length');
          } catch (err) {
            assert.strictEqual(err, null, 'err code set');
          }
        });

        it('user is sanitized', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'resetPwdLong',
              value: { token: 'a___000', password: '123456' }
            });
            const user = await usersService.get(result.id || result._id);

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.resetToken, undefined, 'resetToken not undefined');
            assert.strictEqual(result.resetShortToken, undefined, 'resetShortToken not undefined');
            assert.strictEqual(result.resetExpires, undefined, 'resetExpires not undefined');
            assert.isString(user.password, 'password not a string');
            assert.equal(user.password.length, 60, 'password wrong length');
          } catch (err) {
            assert.strictEqual(err, null, 'err code set');
          }
        });

        it('error on unverified user', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'resetPwdLong',
              value: { token: 'd___222', password: '123456' }
            });

            assert(false, 'unexpected succeeded.');
          } catch (err) {
            assert.isString(err.message);
            assert.isNotFalse(err.message);
          }
        });
/*
        it('error on expired token', (done) => {
          const resetToken = 'c___111';
          authManagement.create({ action: 'resetPwdLong', value: { token: resetToken, password } })
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

        it('error on token not found', (done) => {
          const resetToken = 'a___999';
          authManagement.create({ action: 'resetPwdLong', value: { token: resetToken, password } })
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
        */
      });
/*
      describe('with notification', () => {
        var db;
        var app;
        var users;
        var spyNotifier;
        var authManagement;
        const password = '123456';

        beforeEach((done) => {
          usersDbPromise.then((usersDb) => {
            db = clone(usersDb);
            app = feathersStubs.app();
            users = feathersStubs.users(app, db, ifNonPaginated, idType);
            spyNotifier = new SpyOn(notifier);

            authManagementService({ notifier: spyNotifier.callWith, testMode: true }).call(app);
            authManagement = app.service('authManagement'); // get handle to authManagement

            done();
          });
        });
  
        it('verifies valid token', (done) => {
          const resetToken = 'a___000';
          const i = 0;
    
          authManagement.create({
            action: 'resetPwdLong',
            value: { token: resetToken, password } }
          )
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
      */
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
