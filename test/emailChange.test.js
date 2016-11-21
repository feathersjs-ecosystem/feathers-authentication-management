
/* global assert, describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0,
no-param-reassign: 0, no-unused-vars: 0  */

const assert = require('chai').assert;
const bcrypt = require('bcryptjs');
const auth = require('feathers-authentication').hooks;

const feathersStubs = require('./../test/helpers/feathersStubs');
const verifyResetService = require('../lib/index');
const SpyOn = require('./../test/helpers/basicSpy');

// user DB

const usersDb = [
  { _id: 'a', email: 'a', plainPassword: 'aa', isVerified: false },
  { _id: 'b', email: 'b', plainPassword: 'bb', isVerified: true },
];

describe('emailChange - setup', () => {
  it('encode passwords', function (done) {
    this.timeout(9000);

    Promise.all([
      encrypt(feathersStubs.app(), usersDb[0].plainPassword)
        .then(password => {
          usersDb[0].password = password;
        }),
      encrypt(feathersStubs.app(), usersDb[1].plainPassword)
        .then(password => {
          usersDb[1].password = password;
        }),
    ])
      .then(() => {
        done();
      })
      .catch(err => console.log('encode', err)); // eslint-disable-line no-console
  });

  it('compare plain passwords to encrypted ones', function () {
    this.timeout(9000);

    assert.isOk(bcrypt.compareSync(usersDb[0].plainPassword, usersDb[0].password), '[0]');
    assert.isOk(bcrypt.compareSync(usersDb[1].plainPassword, usersDb[1].password), '[1]');
  });
});

// Tests

['_id', 'id'].forEach(idType => {
  ['paginated', 'non-paginated'].forEach(pagination => {
    describe(`emailChange ${pagination} ${idType}`, () => {
      const ifNonPaginated = pagination === 'non-paginated';

      describe('standard', () => {
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

        it('updates verified user', function (done) {
          this.timeout(9000);
          const i = 1;
          const user = clone(db[i]);
          const email = 'b@b';

          verifyReset.create({
            action: 'emailChange', value: { password: user.plainPassword, email },
          }, { user }, (err, user) => {
            assert.strictEqual(err, null, 'err code set');
            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.equal(db[i].email, email);

            done();
          });
        });

        it('updates unverified user', function (done) {
          this.timeout(9000);
          const i = 0;
          const user = clone(db[i]);
          const email = 'a@a';

          verifyReset.create({
            action: 'emailChange', value: { password: user.plainPassword, email },
          }, { user }, (err, user) => {
            assert.strictEqual(err, null, 'err code set');
            assert.strictEqual(user.isVerified, false, 'isVerified not false');
            assert.equal(db[i].email, email);

            done();
          });
        });

        it('error on wrong password', function (done) {
          this.timeout(9000);
          const i = 0;
          const user = clone(db[i]);
          const email = 'a@a';

          verifyReset.create({
            action: 'emailChange', value: { password: 'ghghghg', email },
          }, { user }, (err, user) => {
            assert.isString(err.message);
            assert.isNotFalse(err.message);

            done();
          });
        });
      });

      describe('with email', () => {
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

          verifyResetService({ notifier: spyNotifier.callWith }).call(app); // attach verifyReset
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('updates verified user', function (done) {
          this.timeout(9000);
          const i = 1;
          const paramsUser = clone(db[i]);
          const oldEmail = db[i].email;
          const email = 'b@b';
          const emailUser = clone(db[i]);
          emailUser.newEmail = email;
  
          verifyReset.create(
            { action: 'emailChange', value: { password: paramsUser.plainPassword, email } },
            { user: paramsUser },
            (err, user) => {
              assert.strictEqual(err, null, 'err code set');
              assert.strictEqual(user.isVerified, true, 'isVerified not true');
              assert.equal(db[i].email, email);
  
              assert.deepEqual(
                spyNotifier.result()[0].args,
                [
                  'emailChange',
                  Object.assign(
                    sanitizeUserForEmail(db[i]),
                    { email: oldEmail, newEmail: email }
                  ),
                  {},
                  email,
                ],
              );
  
              done();
            });
        });
      });
    });
  });
});

// Helpers

function encrypt(app, password) {
  const hook = {
    type: 'before',
    data: { password },
    params: { provider: null },
    app: {
      get(str) {
        return app.get(str);
      },
    },
  };
  return auth.hashPassword()(hook)
    .then(hook1 => hook1.data.password)
    .catch(err => console.log('encrypt', err)); // eslint-disable-line no-console
}

function notifier(action, user, notifierOptions, newEmail) {
  return Promise.resolve(user);
}

function sanitizeUserForEmail(user) {
  const user1 = clone(user);

  delete user1.password;

  return user1;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
