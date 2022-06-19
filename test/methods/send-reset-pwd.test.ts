import assert from 'assert';
import feathers, { Application, Params } from '@feathersjs/feathers';
import { MemoryServiceOptions, Service } from 'feathers-memory';
import authLocalMgnt, {
  DataSendResetPwd,
  DataSendResetPwdWithAction,
  SendResetPwdService
} from '../../src/index';
import authService from '../test-helpers/authenticationService';

import { timeoutEachTest, maxTimeAllTests } from '../test-helpers/config';
import {
  makeDateTime as helpersMakeDateTime,
  SpyOn,
  aboutEqualDateTime
} from '../test-helpers';
import {  } from '../../src/services';

function makeDateTime(options1?) {
  options1 = options1 || {};
  options1.delay = options1.delay || maxTimeAllTests;
  return helpersMakeDateTime(options1);
}

const withAction = (
  data: DataSendResetPwd
): DataSendResetPwdWithAction => {
  return {
    action: "sendResetPwd",
    value: data.user,
    notifierOptions: data.notifierOptions
  }
}

['_id', 'id'].forEach(idType => {
  const now = Date.now();
  const users = [
    {
      [idType]: 'a',
      email: 'a',
      isVerified: false,
      verifyToken: '000',
      verifyExpires: now + maxTimeAllTests
    },
    {
      [idType]: 'b',
      email: 'b',
      isVerified: true,
      verifyToken: null,
      verifyExpires: null
    }
  ];

  ['paginated', 'non-paginated'].forEach(pagination => {
    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataSendResetPwd, params?: Params) => {
        return app.service("authManagement").create(withAction(data), params);
      }
    }, {
      name: "authManagement.sendResetPassword",
      callMethod: (app: Application, data: DataSendResetPwd, params?: Params) => {
        return app.service("authManagement").sendResetPassword(data, params);
      }
    }, {
      name: "authManagement/send-reset-password",
      callMethod: (app: Application, data: DataSendResetPwd, params?: Params) => {
        return app.service("authManagement/send-reset-password").create(data, params);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`send-reset-pwd.test.ts ${idType} ${pagination} ${name}`, function () {
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

            app.service("/users").hooks({
              before: {
                all: [
                  context => {
                    if (context.params?.call && "count" in context.params.call) {
                      context.params.call.count++;
                    }
                  }
                ]
              }
            })

            app.configure(authLocalMgnt({
              passParams: params => params
            }));
            app.use("authManagement/send-reset-password", new SendResetPwdService(app, {
              passParams: params => params
            }))
            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('updates verified user', async function () {
            const result = await callMethod(app, {
              user: { email: 'b' }
            });
            const user = await usersService.get(result[idType]);
            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(typeof user.resetToken, 'string', 'resetToken not String');
            assert.strictEqual(user.resetToken.length, 60, 'reset token wrong length');
            assert.strictEqual(user.resetShortToken.length, 60, 'reset short token wrong length');
            assert.match(user.resetShortToken, /^\$2[ayb]\$.{56}$/);
            aboutEqualDateTime(user.resetExpires, makeDateTime());
          });

          it('error on unverified user', async function () {
            try {
              const result = await callMethod(app, {
                user: { email: 'a' }
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User is not verified.');
            }
          });

          it('error on email not found', async function () {
            try {
              const result = await callMethod(app, {
                user: { email: 'x' }
              });

              assert.fail('unexpected succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User not found.')
            }
          });

          it('user is sanitized', async function () {
            const result = await callMethod(app, {
              user: { email: 'b' }
            });

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.resetToken, undefined, 'resetToken not undefined');
            assert.strictEqual(result.resetShortToken, undefined, 'resetToken not undefined');
            assert.strictEqual(result.resetExpires, undefined, 'resetExpires not undefined');
          });

          it('can use "passParams"', async function () {
            const params = { call: { count: 0 } };
            const result = await callMethod(app, {
              user: { email: 'b' }
            }, params);

            assert.ok(params.call.count > 0, 'params.call.count not incremented');
          });
        });

        describe('length can change (digits)', () => {
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
                resetDelay: 200,
                reuseResetToken: true,
              })
            );
            app.use("authManagement/send-reset-password", new SendResetPwdService(app, {
              resetDelay: 200,
              reuseResetToken: true,
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('token is reusable with options.reuseResetToken', async function () {
            let result = await callMethod(app, {
              user: { email: 'b' }
            });
            const user1 = await usersService.get(result[idType]);
            result = await callMethod(app, {
              user: { email: 'b' }
            });
            const user2 = await usersService.get(result[idType]);

            assert.strictEqual(user1.resetToken, user2.resetToken, 'reset token has changed');
            assert.strictEqual(user1.resetShortToken, user2.resetShortToken, 'reset short token has changed');
            assert.strictEqual(user1.resetExpires, user2.resetExpires, 'reset expires wrong has changed');
          });

          it('token is not reused after half reset time', async function () {
            let result = await callMethod(app, {
              user: { email: 'b' }
            });
            const user1 = await usersService.get(result[idType]);

            await new Promise(resolve => setTimeout(resolve, 110));
            result = await callMethod(app, {
              user: { email: 'b' }
            });
            const user2 = await usersService.get(result[idType]);

            assert.notEqual(user1.resetToken, user2.resetToken, 'reset token has not changed');
            assert.notEqual(user1.resetShortToken, user2.resetShortToken, 'reset short token has not changed');
            assert.notEqual(user1.resetExpires, user2.resetExpires, 'reset expires wrong has not changed');
          });
        });

        describe('length can change (digits)', () => {
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
                longTokenLen: 10,
                shortTokenLen: 9,
                shortTokenDigits: true
              })
            );
            app.use("authManagement/send-reset-password", new SendResetPwdService(app, {
              longTokenLen: 10,
              shortTokenLen: 9,
              shortTokenDigits: true
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('updates verified user', async function () {
            const result = await callMethod(app, {
              user: { email: 'b' }
            });
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(typeof user.resetToken, 'string', 'resetToken not String');
            assert.strictEqual(user.resetToken.length, 60, 'reset token wrong length');
            assert.strictEqual(user.resetShortToken.length, 60, 'reset short token wrong length');
            assert.match(user.resetShortToken, /^\$2[ayb]\$.{56}$/);
            aboutEqualDateTime(user.resetExpires, makeDateTime());
          });
        });

        describe('length can change (alpha)', () => {
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
                longTokenLen: 10,
                shortTokenLen: 9,
                shortTokenDigits: false
              })
            );
            app.use("authManagement/send-reset-password", new SendResetPwdService(app, {
              longTokenLen: 10,
              shortTokenLen: 9,
              shortTokenDigits: false
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('updates verified user', async function () {
            const result = await callMethod(app, {
              user: { email: 'b' }
            });
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(typeof user.resetToken, 'string', 'resetToken not String');
            assert.strictEqual(user.resetToken.length, 60, 'reset token wrong length');
            assert.strictEqual(user.resetShortToken.length, 60, 'reset short token wrong length');
            assert.match(user.resetShortToken, /^\$2[ayb]\$.{56}$/);
            aboutEqualDateTime(user.resetExpires, makeDateTime());
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
                longTokenLen: 15,
                shortTokenLen: 6,
                shortTokenDigits: true,
                notifier: spyNotifier.callWith
              })
            );
            app.use("authManagement/send-reset-password", new SendResetPwdService(app, {
              longTokenLen: 15,
              shortTokenLen: 6,
              shortTokenDigits: true,
              notifier: spyNotifier.callWith
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('is called', async function () {
            const result = await callMethod(app, {
              user: { email: 'b' },
              notifierOptions: { transport: 'sms' }
            });
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(typeof user.resetToken, 'string', 'resetToken not String');
            assert.strictEqual(user.resetToken.length, 60, 'reset token wrong length');
            assert.match(user.resetToken, /^\$2[ayb]\$.{56}$/);
            aboutEqualDateTime(user.resetExpires, makeDateTime());

            const expected = spyNotifier.result()[0].args;
            expected[1] = Object.assign({}, expected[1], {
              resetToken: user.resetToken,
              resetShortToken: user.resetShortToken
            });

            assert.deepStrictEqual(expected, ['sendResetPwd', sanitizeUserForEmail(user), { transport: 'sms' }]);
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
  const user1 = clone(user);
  delete user1.password;
  return user1;
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}
