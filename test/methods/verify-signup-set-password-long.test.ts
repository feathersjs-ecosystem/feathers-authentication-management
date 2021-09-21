
import assert from 'assert';
import feathers, { Application } from '@feathersjs/feathers';
import feathersMemory, { MemoryServiceOptions, Service } from 'feathers-memory';
import bcrypt from 'bcryptjs';
import authLocalMgnt, { DataVerifySignupSetPasswordLong, DataVerifySignupSetPasswordLongWithAction } from '../../src/index';
import {
  SpyOn,
  authenticationService as authService
} from '../test-helpers';
import { timeoutEachTest, maxTimeAllTests } from '../test-helpers/config';
import { AuthenticationManagementService, VerifySignupSetPasswordLongService } from '../../src/services';

const withAction = (
  data: DataVerifySignupSetPasswordLong
): DataVerifySignupSetPasswordLongWithAction => {
  // @ts-ignore
  return Object.assign({ action: "verifySignupSetPasswordLong" }, data);
}

['_id', 'id'].forEach(idType => {
  const now = Date.now();
  const users = [
    { [idType]: 'a', email: 'a', isVerified: false, verifyToken: '000', verifyExpires: now + maxTimeAllTests },
    { [idType]: 'b', email: 'b', isVerified: false, verifyToken: null, verifyExpires: null },
    { [idType]: 'c', email: 'c', isVerified: false, verifyToken: '111', verifyExpires: now - maxTimeAllTests },
    { [idType]: 'd', email: 'd', isVerified: true, verifyToken: '222', verifyExpires: now - maxTimeAllTests },
    { [idType]: 'e', email: 'e', isVerified: true, verifyToken: '800', verifyExpires: now + maxTimeAllTests, verifyChanges: { cellphone: '800' } }
  ];

  ['paginated', 'non-paginated'].forEach(pagination => {
    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataVerifySignupSetPasswordLong) => {
        return app.service("authManagement").create(withAction(data));
      }
    }, {
      name: "authManagement.verifySignupSetPasswordLong",
      callMethod: (app: Application, data: DataVerifySignupSetPasswordLong) => {
        return app.service("authManagement").verifySignupSetPasswordLong(data);
      }
    }, {
      name: "authManagement/verify-signup-set-password-long",
      callMethod: (app: Application, data: DataVerifySignupSetPasswordLong) => {
        return app.service("authManagement/verify-signup-set-password-long").create(data);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`verify-signup-set-password-long.ts ${pagination} ${idType} ${name}`, function () {
        this.timeout(timeoutEachTest);

        describe('basic', () => {
          let app: Application;
          let usersService: Service;

          beforeEach(async () => {
            app = feathers();
            app.use('/authentication', authService(app));

            const optionsUsers: Partial<MemoryServiceOptions> = {
              multi: true,
              id: idType
            };
            if (pagination === "paginated") {
              optionsUsers.paginate = { default: 10, max: 50 };
            }
            app.use("/users", new Service(optionsUsers))

            app.configure(authLocalMgnt({}));
            app.use("authManagement/verify-signup-set-password-long", new VerifySignupSetPasswordLongService({
              app
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token and sets password if not verified', async () => {
            const password = '123456';

            const result = await callMethod(app, {
              value: {
                token: '000',
                password
              }
            });
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
            assert.ok(bcrypt.compareSync(password, user.password), 'password is not hashed value');
          });

          it('verifies valid token and sets password if verifyChanges', async () => {
            const password = '123456';
            const result = await callMethod(app, {
              value: {
                token: '800',
                password
              }
            });
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
            assert.ok(bcrypt.compareSync(password, user.password), 'password is not hashed value');
            assert.strictEqual(user.cellphone, '800', 'cellphone wrong');
          });

          it('user is sanitized', async () => {
            const password = '123456';
            const result = await callMethod(app, {
              value: {
                token: '000',
                password
              }
            });
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.verifyToken, undefined, 'verifyToken not undefined');
            assert.strictEqual(result.verifyShortToken, undefined, 'verifyShortToken not undefined');
            assert.strictEqual(result.verifyExpires, undefined, 'verifyExpires not undefined');
            assert.strictEqual(result.verifyChanges, undefined, 'verifyChanges not undefined');
            assert.ok(bcrypt.compareSync(password, user.password), 'password is not hashed value');
          });

          it('error on verified user without verifyChange', async () => {
            try {
              const result = await callMethod(app, {
                value: {
                  token: '222',
                  password: '12456'
                }
              });

              assert.fail('unexpectedly succeeded');
            } catch (err) {
              assert.strictEqual(err.message, 'User is already verified & not awaiting changes.');
            }
          });

          it('error on expired token', async () => {
            try {
              const result = await callMethod(app, {
                value: {
                  token: '111',
                  password: '123456'
                }
              });

              assert.fail('unexpectedly succeeded');
            } catch (err) {
              assert.strictEqual(err.message, 'Verification token has expired.');
            }
          });

          it('error on token not found', async () => {
            try {
              const result = await callMethod(app, {
                value: {
                  token: '999',
                  password: '123456'
                }
              });

              assert.fail('unexpectedly succeeded');
            } catch (err) {
              assert.strictEqual(err.message, 'User not found.');
            }
          });
        });

        describe('with notification', () => {
          let app: Application;
          let usersService: Service;
          let spyNotifier;

          beforeEach(async () => {
            spyNotifier = SpyOn(notifier);

            app = feathers();
            app.use('/authentication', authService(app));

            const optionsUsers: Partial<MemoryServiceOptions> = {
              multi: true,
              id: idType
            };
            if (pagination === "paginated") {
              optionsUsers.paginate = { default: 10, max: 50 };
            }
            app.use("/users", new Service(optionsUsers))

            app.configure(
              authLocalMgnt({
                notifier: spyNotifier.callWith
              })
            );
            app.use("authManagement/verify-signup-set-password-long", new VerifySignupSetPasswordLongService({
              app,
              notifier: spyNotifier.callWith
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token and sets password', async () => {
            const password = '123456';
            const result = await callMethod(app, {
              value: {
                token: '000',
                password,
              },
              notifierOptions: { transport: 'sms' },
            });
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.ok(bcrypt.compareSync(password, user.password), 'password is not hashed value');
            assert.deepStrictEqual(spyNotifier.result()[0].args, [
              'verifySignupSetPassword',
              Object.assign({}, sanitizeUserForEmail(user)),
              { transport: 'sms' }
            ]);
          });
        });
      });
    });
  });
});

// Helpers

async function notifier (action, user, notifierOptions, newEmail) {
  return user;
}

function sanitizeUserForEmail (user) {
  const user1 = Object.assign({}, user);
  delete user1.password;
  return user1;
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}
