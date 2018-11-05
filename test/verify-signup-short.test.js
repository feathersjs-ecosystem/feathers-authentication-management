
const assert = require('chai').assert;
const feathers = require('@feathersjs/feathers');
const feathersMemory = require('feathers-memory');
const authLocalMgnt = require('../src/index');
const SpyOn = require('./helpers/basic-spy');
const { timeoutEachTest, maxTimeAllTests } = require('./helpers/config');

const now = Date.now();

const makeUsersService = (options) => function (app) {
  app.use('/users', feathersMemory(options));
};

const usersId = [
  { id: 'a', email: 'a', username: 'aa', isVerified: false, verifyToken: '000', verifyShortToken: '00099', verifyExpires: now + maxTimeAllTests },
  { id: 'b', email: 'b', username: 'bb', isVerified: false, verifyToken: null, verifyShortToken: null, verifyExpires: null },
  { id: 'c', email: 'c', username: 'cc', isVerified: false, verifyToken: '111', verifyShortToken: '11199', verifyExpires: now - maxTimeAllTests },
  { id: 'd', email: 'd', username: 'dd', isVerified: true, verifyToken: '222', verifyShortToken: '22299', verifyExpires: now - maxTimeAllTests },
  { id: 'e', email: 'e', username: 'ee', isVerified: true, verifyToken: '800', verifyShortToken: '80099', verifyExpires: now + maxTimeAllTests,
    verifyChanges: { cellphone: '800' } },
];

const users_Id = [
  { _id: 'a', email: 'a', username: 'aa', isVerified: false, verifyToken: '000', verifyShortToken: '00099', verifyExpires: now + maxTimeAllTests },
  { _id: 'b', email: 'b', username: 'bb', isVerified: false, verifyToken: null, verifyShortToken: null, verifyExpires: null },
  { _id: 'c', email: 'c', username: 'cc', isVerified: false, verifyToken: '111', verifyShortToken: '11199', verifyExpires: now - maxTimeAllTests },
  { _id: 'd', email: 'd', username: 'dd', isVerified: true, verifyToken: '222', verifyShortToken: '22299', verifyExpires: now - maxTimeAllTests },
  { _id: 'e', email: 'e', username: 'ee', isVerified: true, verifyToken: '800', verifyShortToken: '80099', verifyExpires: now + maxTimeAllTests,
    verifyChanges: { cellphone: '800' } },
];

['_id', 'id'].forEach(idType => {
  ['paginated', 'non-paginated'].forEach(pagination => {
    describe(`verify-signUp-short.js ${pagination} ${idType}`, function () {
      this.timeout(timeoutEachTest);

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
            identifyUserProps: ['email', 'username'],
          }));
          app.setup();
          authLocalMgntService = app.service('authManagement');

          usersService = app.service('users');
          await usersService.remove(null);
          db = clone(idType === '_id' ? users_Id : usersId);
          await usersService.create(db);
        });

        it('verifies valid token if not verified', async () => {
          try {
            result = await authLocalMgntService.create({ action: 'verifySignupShort', value: {
                token: '00099',
                user: { email: db[0].email },
              }
            });
            const user = await usersService.get(result.id || result._id);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
          } catch (err) {
            console.log(err);
            assert(false, 'err code set');
          }
        });

        it('verifies valid token if verifyChanges', async () => {
          try {
            result = await authLocalMgntService.create({ action: 'verifySignupShort', value: {
                token: '80099',
                user: { email: db[4].email },
              }
            });
            const user = await usersService.get(result.id || result._id);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');

            assert.strictEqual(user.cellphone, '800', 'cellphone wrong');
          } catch (err) {
            console.log(err);
            assert(false, 'err code set');
          }
        });

        it('user is sanitized', async () => {
          try {
            result = await authLocalMgntService.create({ action: 'verifySignupShort', value: {
                token: '00099',
                user: { username: db[0].username },
              }
            });

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.verifyToken, undefined, 'verifyToken not undefined');
            assert.strictEqual(result.verifyShortToken, undefined, 'verifyShortToken not undefined');
            assert.strictEqual(result.verifyExpires, undefined, 'verifyExpires not undefined');
            assert.strictEqual(result.verifyChanges, undefined, 'verifyChanges not undefined');
          } catch (err) {
            console.log(err);
            assert(false, 'err code set');
          }
        });

        it('handles multiple user ident', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'verifySignupShort',
              value: {
                token: '00099',
                user: { email: db[0].email, username: db[0].username },
              }
            });

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.verifyToken, undefined, 'verifyToken not undefined');
            assert.strictEqual(result.verifyShortToken, undefined, 'verifyShortToken not undefined');
            assert.strictEqual(result.verifyExpires, undefined, 'verifyExpires not undefined');
          } catch (err) {
            console.log(err);
            assert(false, 'err code set');
          }
        });

        it('requires user ident', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'verifySignupShort',
              value: {
                token: '00099',
                user: {},
              }
            });

            assert(false, 'unexpectedly succeeded.');
          } catch (err) {
            assert.isString(err.message);
            assert.isNotFalse(err.message);
          }
        });

        it('throws on non-configured user ident', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'verifySignupShort',
              value: {
                token: '00099',
                user: { email: db[i].email, verifyShortToken: '00099' },
              }
            });

            assert(false, 'unexpectedly succeeded.');
          } catch (err) {
            assert.isString(err.message);
            assert.isNotFalse(err.message);
          }
        });

        it('error on unverified user', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'verifySignupShort',
              value: {
                token: '22299',
                user: { email: db[3].email },
              }
            });

            assert(false, 'unexpectedly succeeded.');
          } catch (err) {
            assert.isString(err.message);
            assert.isNotFalse(err.message);
          }
        });

        it('error on expired token', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'verifySignupShort',
              value: {
                token: '11199',
                user: { username: db[2].username } },
            });

            assert(false, 'unexpectedly succeeded.');
          } catch (err) {
            assert.isString(err.message);
            assert.isNotFalse(err.message);
          }
        });

        it('error on user not found', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'verifySignupShort',
              value: {
                token: '999',
                user: { email: '999' },
              }
            });

            assert(false, 'unexpectedly succeeded.');
          } catch (err) {
            assert.isString(err.message);
            assert.isNotFalse(err.message);
          }
        });

        it('error incorrect token', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'verifySignupShort',
              value: { token: '999', user: { email: db[0].email } }
            });

            assert(false, 'unexpectedly succeeded.');
          } catch (err) {
            assert.isString(err.message);
            assert.isNotFalse(err.message);
          }
        });
      });

      describe('with notification', () => {
        let spyNotifier;

        let app;
        let usersService;
        let authLocalMgntService;
        let db;
        let result;

        beforeEach(async () => {
          spyNotifier = new SpyOn(notifier);

          app = feathers();
          app.configure(makeUsersService({ id: idType, paginate: pagination === 'paginated' }));
          app.configure(authLocalMgnt({
            // maybe reset identifyUserProps
            notifier: spyNotifier.callWith,
            testMode: true,
          }));
          app.setup();
          authLocalMgntService = app.service('authManagement');

          usersService = app.service('users');
          await usersService.remove(null);
          db = clone(idType === '_id' ? users_Id : usersId);
          await usersService.create(db);
        });
        
        it('verifies valid token', async () => {
          try {
            result = await authLocalMgntService.create({
              action: 'verifySignupShort',
              value: {
                token: '00099',
                user: { email: db[0].email } },
            });
            const user = await usersService.get(result.id || result._id);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');

            assert.deepEqual( spyNotifier.result()[0].args, [
              'verifySignup',
              Object.assign({}, sanitizeUserForEmail(user)),
              {}
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

function sanitizeUserForEmail(user) {
  const user1 = Object.assign({}, user);

  delete user1.password;

  return user1;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
