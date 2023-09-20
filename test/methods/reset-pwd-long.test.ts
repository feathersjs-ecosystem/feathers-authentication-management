import assert from 'assert';
import { feathers } from '@feathersjs/feathers';
import authService from '../test-helpers/authenticationService';

import { MemoryService, type MemoryServiceOptions } from '@feathersjs/memory';
import authLocalMgnt, {
  DataResetPwdLong,
  DataResetPwdLongWithAction,
  AuthenticationManagementService,
  ResetPwdLongService,
  User
} from '../../src/index';
import { Application, HookContextTest, ParamsTest } from '../types';
import { SpyOn } from '../test-helpers';
import { hashPassword } from '../../src/helpers';
import { timeoutEachTest, maxTimeAllTests } from '../test-helpers/config';

const fieldToHash = 'resetToken';

const withAction = (
  data: DataResetPwdLong
): DataResetPwdLongWithAction => {
  return {
    action: "resetPwdLong",
    value: {
      password: data.password,
      token: data.token
    },
    notifierOptions: data.notifierOptions
  }
}

// Tests
['_id', 'id'].forEach(idType => {
  const makeUsers = (): Partial<User>[] => {
    const now = Date.now();
    return [
    // The added time interval must be longer than it takes to run ALL the tests
    {
      [idType]: 'a',
      email: 'a',
      isVerified: true,
      resetToken: 'a___000',
      resetExpires: now + maxTimeAllTests
    },
    {
      [idType]: 'b',
      email: 'b',
      isVerified: true,
      resetToken: undefined,
      resetExpires: undefined
    },
    {
      [idType]: 'c',
      email: 'c',
      isVerified: true,
      resetToken: 'c___111',
      resetExpires: now - maxTimeAllTests
    },
    {
      [idType]: 'd',
      email: 'd',
      isVerified: false,
      resetToken: 'd___222',
      resetExpires: now - maxTimeAllTests
    }
  ]};

  ['paginated', 'non-paginated'].forEach(pagination => {
    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataResetPwdLong, params?: ParamsTest) => {
        return app.service("authManagement").create(withAction(data), params);
      }
    }, {
      name: "authManagement.resetPasswordLong",
      callMethod: (app: Application, data: DataResetPwdLong, params?: ParamsTest) => {
        return app.service("authManagement").resetPasswordLong(data, params);
      }
    }, {
      name: "authManagement/reset-password-long",
      callMethod: (app: Application, data: DataResetPwdLong, params?: ParamsTest) => {
        return app.service("authManagement/reset-password-long").create(data, params);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`reset-pwd-long.test.ts ${idType} ${pagination} ${name}`, function () {
        this.timeout(timeoutEachTest);

        describe('basic', () => {
          let app: Application;
          let usersService: MemoryService;
          const users = makeUsers();

          beforeEach(async () => {
            app = feathers();
            app.use('authentication', authService(app));

            const optionsUsers: Partial<MemoryServiceOptions> = {
              multi: true,
              id: idType
            };
            if (pagination === "paginated") {
              optionsUsers.paginate = { default: 10, max: 50 };
            }
            app.use("users", new MemoryService(optionsUsers))

            app.service("users").hooks({
              before: {
                all: [
                  (context: HookContextTest) => {
                    if ((context.params as any)?.call && "count" in (context.params as any).call) {
                      (context.params as any).call.count++;
                    }
                  }
                ]
              }
            })

            app.configure(authLocalMgnt({
              passParams: params => params
            }));
            app.use("authManagement/reset-password-long", new ResetPwdLongService(app, {
              passParams: params => params
            }));

            app.setup();

            // Ugly but makes test much faster
            if ((users[0][fieldToHash] as string).length < 15) {
              for (let i = 0, ilen = users.length; i < ilen; i++) {
                if (!users[i][fieldToHash]) continue;
                const hashed = await hashPassword(
                  app,
                  (users[i][fieldToHash] as string),
                  'resetToken'
                );
                users[i][fieldToHash] = hashed;
              }
            }

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token', async () => {
            const result = await callMethod(app, {
              token: 'a___000',
              password: '123456'
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(
              result.isVerified,
              true,
              'user.isVerified not true'
            );

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.resetToken, null, 'resetToken not null');
            assert.strictEqual(
              user.resetShortToken,
              null,
              'resetShortToken not null'
            );
            assert.strictEqual(
              user.resetExpires,
              null,
              'resetExpires not null'
            );
            assert.strictEqual(typeof user.password, 'string', 'password not a string');
            assert.strictEqual(user.password.length, 60, 'password wrong length');
          });

          it('user is sanitized', async () => {
            const result = await callMethod(app, {
              token: 'a___000',
              password: '123456'
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(
              result.resetToken,
              undefined,
              'resetToken not undefined'
            );
            assert.strictEqual(
              result.resetShortToken,
              undefined,
              'resetShortToken not undefined'
            );
            assert.strictEqual(
              result.resetExpires,
              undefined,
              'resetExpires not undefined'
            );
            assert.strictEqual(typeof user.password, 'string', 'password not a string');
            assert.strictEqual(user.password.length, 60, 'password wrong length');
          });

          it('error on unverified user', async () => {
            try {
              const result = await callMethod(app, {
                token: 'd___222',
                password: '123456'
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User is not verified.');
            }
          });

          it('error on expired token', async () => {
            try {
              const result = await callMethod(app, {
                token: 'c___111',
                password: '123456'
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'Password reset token has expired.');
            }
          });

          it('error on token not found', async () => {
            try {
              const result = await callMethod(app, {
                token: 'a___999',
                password: '123456'
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'Invalid token. Get for a new one. (authLocalMgnt)')
            }
          });

          it('can use "passParams"', async () => {
            const params = { call: { count: 0 } };
            const result = await callMethod(app, {
              token: 'a___000',
              password: '123456'
            }, params);

            assert.ok(params.call.count > 0, 'passParams not called');
          });
        });

        describe('with notification', () => {
          let app: Application;
          let usersService: MemoryService;
          let authLocalMgntService: AuthenticationManagementService;
          let spyNotifier;
          const users = makeUsers();

          beforeEach(async () => {
            spyNotifier = SpyOn(notifier);

            app = feathers();
            app.use('authentication', authService(app));

            const optionsUsers: Partial<MemoryServiceOptions> = {
              multi: true,
              id: idType
            };
            if (pagination === "paginated") {
              optionsUsers.paginate = { default: 10, max: 50 };
            }
            app.use("users", new MemoryService(optionsUsers))

            app.configure(
              authLocalMgnt({
                notifier: spyNotifier.callWith
              })
            );
            app.use("authManagement/reset-password-long", new ResetPwdLongService(app, {
              notifier: spyNotifier.callWith
            }));
            app.setup();
            authLocalMgntService = app.service('authManagement');

            // Ugly but makes test much faster
            if ((users[0][fieldToHash] as string).length < 15) {
              for (let i = 0, ilen = users.length; i < ilen; i++) {
                if (!users[i][fieldToHash]) continue;
                const hashed = await hashPassword(
                  app,
                  users[i][fieldToHash] as string,
                  'resetToken'
                );
                users[i][fieldToHash] = hashed;
              }
            }

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token', async () => {
            const result = await callMethod(app, {
              token: 'a___000',
              password: '123456',
              notifierOptions: {transport: 'sms'},
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(
              result.isVerified,
              true,
              'user.isVerified not true'
            );

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.resetToken, null, 'resetToken not null');
            assert.strictEqual(
              user.resetExpires,
              null,
              'resetExpires not null'
            );

            assert.strictEqual(typeof user.password, 'string', 'password not a string');
            assert.strictEqual(user.password.length, 60, 'password wrong length');

            assert.deepStrictEqual(spyNotifier.result()[0].args, [
              'resetPwd',
              Object.assign({}, sanitizeUserForEmail(user)),
              {transport: 'sms'}
            ]);
          });

          it('verifies reset with long tokens works with generated tokens', async () => {
            const i = 0;
            await authLocalMgntService.create({ action: 'sendResetPwd', value: { email: users[i].email } });
            await callMethod(app, {
              token: spyNotifier.result()[0].args[1].resetToken,
              password: '123456'
            });
          });

          it('failed reset is expiring the token', async () => {
            const i = 0;
            await authLocalMgntService.create({ action: 'sendResetPwd', value: { email: users[i].email } });

            try {
              await callMethod(app, {
                token: 'a___999', // invalid token
                password: '123456',
                //user: { email: db[i].email },
              });
            } catch {}

            try {
              await callMethod(app, {
                token: spyNotifier.result()[0].args[1].resetToken,
                password: '123456',
                //user: { email: db[i].email },
              });
              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.name, "BadRequest");
              assert.strictEqual(err.message, "Password reset token has expired.");
            }
          });
        });

        describe('with reusable token', () => {
          let app: Application;
          let usersService: MemoryService;
          let authLocalMgntService: AuthenticationManagementService;
          let spyNotifier;
          const users = makeUsers();

          beforeEach(async () => {
            spyNotifier = SpyOn(notifier);

            app = feathers();
            app.use('authentication', authService(app));

            const optionsUsers: Partial<MemoryServiceOptions> = {
              multi: true,
              id: idType
            };
            if (pagination === "paginated") {
              optionsUsers.paginate = { default: 10, max: 50 };
            }
            app.use("users", new MemoryService(optionsUsers))

            app.configure(
              authLocalMgnt({
                notifier: spyNotifier.callWith,
                reuseResetToken: true
              })
            );
            app.use("authManagement/reset-password-long", new ResetPwdLongService(app, {
              notifier: spyNotifier.callWith,
              reuseResetToken: true
            }));

            app.setup();
            authLocalMgntService = app.service('authManagement');

            // Ugly but makes test much faster
            if ((users[0][fieldToHash] as string).length < 15) {
              for (let i = 0, ilen = users.length; i < ilen; i++) {
                if (!users[i][fieldToHash]) continue;
                const hashed = await hashPassword(
                  app,
                  users[i][fieldToHash] as string,
                  'resetToken'
                );
                users[i][fieldToHash] = hashed;
              }
            }

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies reused reset works as expected', async () => {
            const i = 0;
            await authLocalMgntService.create({ action: 'sendResetPwd', value: { email: users[i].email } });
            await authLocalMgntService.create({ action: 'sendResetPwd', value: { email: users[i].email } });
            assert.strictEqual(
              spyNotifier.result()[0].args[1].resetToken,
              spyNotifier.result()[1].args[1].resetToken,
              'resetToken is not the same'
            );

            await callMethod(app, {
              token: spyNotifier.result()[0].args[1].resetToken,
              password: '123456',
              //user: { email: db[i].email },
            });
          });
        });

        describe('not expiring on token error', () => {
          let app: Application;
          let usersService: MemoryService;
          let authLocalMgntService: AuthenticationManagementService;
          let spyNotifier;
          const users = makeUsers();

          beforeEach(async () => {
            spyNotifier = SpyOn(notifier);

            app = feathers();
            app.use('authentication', authService(app));

            const optionsUsers: Partial<MemoryServiceOptions> = {
              multi: true,
              id: idType
            };
            if (pagination === "paginated") {
              optionsUsers.paginate = { default: 10, max: 50 };
            }
            app.use("users", new MemoryService(optionsUsers))

            app.configure(
              authLocalMgnt({
                notifier: spyNotifier.callWith,
                resetAttempts: 1
              })
            );
            app.use("authManagement/reset-password-long", new ResetPwdLongService(app, {
              notifier: spyNotifier.callWith
            }));

            app.setup();
            authLocalMgntService = app.service('authManagement');

            // Ugly but makes test much faster
            if ((users[0][fieldToHash] as string).length < 15) {
              for (let i = 0, ilen = users.length; i < ilen; i++) {
                if (!users[i][fieldToHash]) continue;
                const hashed = await hashPassword(
                  app,
                  users[i][fieldToHash] as string,
                  'resetToken'
                );
                users[i][fieldToHash] = hashed;
              }
            }

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          /**
           * TODO: this test doesn't make any assertions ?
           */
          it('failed reset not expiring the token', async () => {
            const i = 0;
            let user = await app.service("users").get('a');
            await authLocalMgntService.create({ action: 'sendResetPwd', value: { email: users[i].email } });
            user = await app.service("users").get('a');

            try {
              await callMethod(app, {
                token: 'a___999', // invalid token
                password: '123456',
                //user: { email: db[i].email },
              });
            } catch {}

            user = await app.service("users").get('a');

            await callMethod(app, {
              token: spyNotifier.result()[0].args[1].resetToken,
              password: '123456',
              //user: { email: db[i].email },
            });
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
