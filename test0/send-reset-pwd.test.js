
const assert = require('chai').assert;
const feathers = require('@feathersjs/feathers');
const feathersMemory = require('feathers-memory');
const authLocalMgnt = require('../src/index');
const SpyOn = require('./helpers/basic-spy');

const defaultResetDelay = 1000 * 60 * 60 * 2; // 2 hours
const now = Date.now();
const timeout = 10000;

const makeUsersService = (options) => function (app) {
  app.use('/users', feathersMemory(options));
};

const usersId = [
  { id: 'a', email: 'a', isVerified: false, verifyToken: '000', verifyExpires: now + 50000 },
  { id: 'b', email: 'b', isVerified: true, verifyToken: null, verifyExpires: null },
];

const users_Id = [
  { _id: 'a', email: 'a', isVerified: false, verifyToken: '000', verifyExpires: now + 50000 },
  { _id: 'b', email: 'b', isVerified: true, verifyToken: null, verifyExpires: null },
];

['_id', 'id'].forEach(idType => {
  ['paginated', 'non-paginated'].forEach(pagination => {
    describe(`sendResetPwd ${pagination} ${idType}`, () => {
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

          usersService = app.service('users');
          await usersService.remove(null);
          db = clone(idType === '_id' ? users_Id : usersId);
          await usersService.create(db);
        });

        it('updates verified user', async function () {
          this.timeout(timeout);

          try {
            result = await authLocalMgntService.create({
              action: 'sendResetPwd',
              value: { email: 'b' }
            });
            const user = await usersService.get(result.id || result._id);
            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.isString(user.resetToken, 'resetToken not String');
            assert.equal(user.resetToken.length, 60, 'reset token wrong length');
            assert.equal(user.resetShortToken.length, 60, 'reset short token wrong length');
            assert.match(user.resetShortToken, /^\$2[ayb]\$.{56}$/);
            aboutEqualDateTime(user.resetExpires, makeDateTime());
          } catch (err) {
            console.log(err);
            assert(false, 'err code set');
          }
        });

        it('error on unverified user', async function () {
          this.timeout(timeout);

          try {
            result = await authLocalMgntService.create({
              action: 'sendResetPwd',
              value: { email: 'a' }
            });

            assert(false, 'unexpected succeeded.');
          } catch (err) {
            assert.isString(err.message);
            assert.isNotFalse(err.message);
          }
        });

        it('error on email not found', async function () {
          this.timeout(timeout);

          try {
            result = await authLocalMgntService.create({
              action: 'sendResetPwd',
              value: { email: 'x' }
            });

            assert(false, 'unexpected succeeded.');
          } catch (err) {
            assert.isString(err.message);
            assert.isNotFalse(err.message);
          }
        });

        it('user is sanitized', async function () {
          this.timeout(timeout);

          try {
            result = await authLocalMgntService.create({
              action: 'sendResetPwd',
              value: { email: 'b' }
            });

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.resetToken, undefined, 'resetToken not undefined');
            assert.strictEqual(result.resetShortToken, undefined, 'resetToken not undefined');
            assert.strictEqual(result.resetExpires, undefined, 'resetExpires not undefined');
          } catch (err) {
            assert(false, 'err code set');
          }
        });
      });

      describe('length can change (digits)', () => {
        let app;
        let usersService;
        let authLocalMgntService;
        let db;
        let result;

        beforeEach(async () => {
          app = feathers();
          app.configure(makeUsersService({ id: idType, paginate: pagination === 'paginated' }));
          app.configure(authLocalMgnt({
            longTokenLen: 10,
            shortTokenLen: 9,
            shortTokenDigits: true,
          }));
          authLocalMgntService = app.service('authManagement');

          usersService = app.service('users');
          await usersService.remove(null);
          db = clone(idType === '_id' ? users_Id : usersId);
          await usersService.create(db);
        });

        it('updates verified user', async function () {
        this.timeout(timeout);

        try {
          result = await authLocalMgntService.create({
            action: 'sendResetPwd',
            value: { email: 'b' }
          });
          const user = await usersService.get(result.id || result._id);

          assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

          assert.strictEqual(user.isVerified, true, 'isVerified not true');
          assert.isString(user.resetToken, 'resetToken not String');
          assert.equal(user.resetToken.length, 60, 'reset token wrong length');
          assert.equal(user.resetShortToken.length, 60, 'reset short token wrong length');
          assert.match(user.resetShortToken, /^\$2[ayb]\$.{56}$/);
          aboutEqualDateTime(user.resetExpires, makeDateTime());
        } catch (err) {
          assert(false, 'err code set');
        }
        });
      });

      describe('length can change (alpha)', () => {
        let app;
        let usersService;
        let authLocalMgntService;
        let db;
        let result;

        beforeEach(async () => {
          app = feathers();
          app.configure(makeUsersService({ id: idType, paginate: pagination === 'paginated' }));
          app.configure(authLocalMgnt({
            longTokenLen: 10,
            shortTokenLen: 9,
            shortTokenDigits: false,
          }));
          authLocalMgntService = app.service('authManagement');

          usersService = app.service('users');
          await usersService.remove(null);
          db = clone(idType === '_id' ? users_Id : usersId);
          await usersService.create(db);
        });

        it('updates verified user', async function () {
          this.timeout(timeout);

          try {
            result = await authLocalMgntService.create({
              action: 'sendResetPwd',
              value: { email: 'b' }
            });
            const user = await usersService.get(result.id || result._id);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.isString(user.resetToken, 'resetToken not String');
            assert.equal(user.resetToken.length, 60, 'reset token wrong length');
            assert.equal(user.resetShortToken.length, 60, 'reset short token wrong length');
            assert.match(user.resetShortToken, /^\$2[ayb]\$.{56}$/);
            aboutEqualDateTime(user.resetExpires, makeDateTime());
          } catch (err) {
            assert(false, 'err code set');
          }
        });
      });

      describe('with notification', () => {
        let app;
        let usersService;
        let authLocalMgntService;
        let db;
        let result;
        let spyNotifier;

        beforeEach(async () => {
          spyNotifier = new SpyOn(notifier);

          app = feathers();
          app.configure(makeUsersService({ id: idType, paginate: pagination === 'paginated' }));
          app.configure(authLocalMgnt({
            longTokenLen: 15,
            shortTokenLen: 6,
            shortTokenDigits: true,
            notifier: spyNotifier.callWith,
          }));
          authLocalMgntService = app.service('authManagement');

          usersService = app.service('users');
          await usersService.remove(null);
          db = clone(idType === '_id' ? users_Id : usersId);
          await usersService.create(db);
        });

        it('is called', async function () {
          this.timeout(timeout);

          try {
            result = await authLocalMgntService.create({
              action: 'sendResetPwd',
              value: { email: 'b' },
              notifierOptions: { transport: 'sms' }
            });
            const user = await usersService.get(result.id || result._id);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.isString(user.resetToken, 'resetToken not String');
            assert.equal(user.resetToken.length, 60, 'reset token wrong length');
            assert.match(user.resetToken, /^\$2[ayb]\$.{56}$/);
            aboutEqualDateTime(user.resetExpires, makeDateTime());

            const expected = spyNotifier.result()[0].args
            expected[1] = Object.assign({}, expected[1], {
              resetToken: user.resetToken,
              resetShortToken: user.resetShortToken
            });

            assert.deepEqual(expected, [
              'sendResetPwd',
              sanitizeUserForEmail(user),
              { transport: 'sms' }
            ]);
          } catch (err) {
            console.log(err);
            assert(false, 'err code set');
          }
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
  delta = delta || timeout;
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
