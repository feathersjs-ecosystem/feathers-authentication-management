import assert from 'assert';
import feathers, { Application } from '@feathersjs/feathers';
import { MemoryServiceOptions, Service } from 'feathers-memory';
import authLocalMgnt, { DataResetPwdShort, DataResetPwdShortWithAction } from '../../src/index';

import {
  SpyOn,
  authenticationService as authService
} from '../test-helpers';
import { hashPassword } from '../../src/helpers';
import { timeoutEachTest, maxTimeAllTests } from '../test-helpers/config';
import { AuthenticationManagementService, ResetPwdShortService } from '../../src/services';

const fieldToHash = 'resetShortToken';

const withAction = (
  data: DataResetPwdShort
): DataResetPwdShortWithAction => {
  return {
    action: "resetPwdShort",
    value: {
      password: data.password,
      token: data.token,
      user: data.user
    },
    notifierOptions: data.notifierOptions
  }
}

// Tests
['_id' /* 'id' */].forEach(idType => {
  const now = Date.now();
  const users = [
    // The added time interval must be longer than it takes to run ALL the tests
    {
      [idType]: 'a',
      email: 'a',
      username: 'aa',
      isVerified: true,
      resetToken: '000',
      resetShortToken: '00099',
      resetExpires: now + maxTimeAllTests
    },
    {
      [idType]: 'b',
      email: 'b',
      username: 'bb',
      isVerified: true,
      resetToken: null,
      resetShortToken: null,
      resetExpires: null
    },
    {
      [idType]: 'c',
      email: 'c',
      username: 'cc',
      isVerified: true,
      resetToken: '111',
      resetShortToken: '11199',
      resetExpires: now - maxTimeAllTests
    },
    {
      [idType]: 'd',
      email: 'd',
      username: 'dd',
      isVerified: false,
      resetToken: '222',
      resetShortToken: '22299',
      resetExpires: now - maxTimeAllTests
    }
  ];
  ['paginated' /* 'non-paginated' */].forEach(pagination => {
    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataResetPwdShort) => {
        return app.service("authManagement").create(withAction(data));
      }
    }, {
      name: "authManagement.resetPasswordShort",
      callMethod: (app: Application, data: DataResetPwdShort) => {
        return app.service("authManagement").resetPasswordShort(data);
      }
    }, {
      name: "authManagement/reset-password-short",
      callMethod: (app: Application, data: DataResetPwdShort) => {
        return app.service("authManagement/reset-password-short").create(data);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`reset-pwd-short.test.ts ${idType} ${pagination} ${name}`, function () {
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

            app.configure(
              authLocalMgnt({
                identifyUserProps: ['email', 'username']
              })
            );
            app.use("authManagement/reset-password-short", new ResetPwdShortService(app, {
              identifyUserProps: ['email', 'username']
            }));

            app.setup();

            // Ugly but makes test much faster
            if (users[0][fieldToHash].length < 15) {
              for (let i = 0, ilen = users.length; i < ilen; i++) {
                if (!users[i][fieldToHash]) continue;
                const hashed = await hashPassword(
                  app,
                  users[i][fieldToHash],
                  'resetShortToken'
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
              token: '00099',
              password: '123456',
              user: {
                username: users[0].username
              }
            });
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
              token: '00099',
              password: '123456',
              user: {
                username: users[0].username
              }
            });
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

          it('handles multiple user ident', async () => {
            const result = await callMethod(app, {
              token: '00099',
              password: '123456',
              user: {
                email: users[0].email,
                username: users[0].username
              }
            });
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

          it('requires user ident', async () => {
            try {
              const result = await callMethod(app, {
                token: '00099',
                password: '123456',
                user: {}
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User info is not valid. (authLocalMgnt)');
            }
          });

          it('throws on non-configured user ident', async () => {
            try {
              const result = await callMethod(app, {
                token: '00099',
                password: '123456',
                user: {
                  email: users[0].email,
                  resetShortToken: '00099'
                }
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User info is not valid. (authLocalMgnt)');
            }
          });

          it('error on unverified user', async () => {
            try {
              const result = await callMethod(app, {
                token: '22299',
                password: '123456',
                user: {
                  email: users[3].email
                }
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User is not verified.');
            }
          });

          it('error on expired token', async () => {
            try {
              const result = await callMethod(app, {
                token: '11199',
                password: '123456',
                user: {
                  username: users[2].username
                }
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'Password reset token has expired.');
            }
          });

          it('error on user not found', async () => {
            try {
              const result = await callMethod(app, {
                token: '999',
                password: '123456',
                user: {
                  email: '999'
                }
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User not found.')
            }
          });

          it('error incorrect token', async () => {
            try {
              const result = await callMethod(app, {
                token: '999',
                password: '123456',
                user: {
                  email: users[0].email
                }
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'Invalid token. Get for a new one. (authLocalMgnt)');
            }
          });
        });

        describe('with notification', () => {
          let app: Application;
          let usersService: Service;
          let authLocalMgntService: AuthenticationManagementService;
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
                // maybe reset identifyUserProps
                notifier: spyNotifier.callWith
              })
            );
            app.use("authManagement/reset-password-short", new ResetPwdShortService(app, {
              notifier: spyNotifier.callWith
            }));

            app.setup();
            authLocalMgntService = app.service('authManagement');

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token', async () => {
            const result = await callMethod(app, {
              token: '00099',
              password: '123456',
              user: {
                email: users[0].email
              },
              notifierOptions: {transport: 'sms'},
            });
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

          it('verifies reset with short tokens works with generated tokens', async () => {
            const i = 0;
            await authLocalMgntService.create({ action: 'sendResetPwd', value: { email: users[i].email } });
            await callMethod(app, {
              token: spyNotifier.result()[0].args[1].resetShortToken,
              password: '123456',
              user: { email: users[i].email }
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
