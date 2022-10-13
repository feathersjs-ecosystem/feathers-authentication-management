import assert from 'assert';
import { feathers } from '@feathersjs/feathers';
import { MemoryServiceOptions, Service } from 'feathers-memory';
import authLocalMgnt, {
  DataVerifySignupLong,
  DataVerifySignupLongWithAction,
  User,
  VerifySignupLongService
} from '../../src/index';
import {SpyOn} from '../test-helpers';
import { timeoutEachTest, maxTimeAllTests } from '../test-helpers/config';
import { Application, HookContextTest, ParamsTest } from '../types';

const withAction = (
  data: DataVerifySignupLong
): DataVerifySignupLongWithAction => {
  return {
    action: "verifySignupLong",
    value: data.token,
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
      isVerified: false,
      verifyToken: null,
      verifyExpires: null
    },
    {
      [idType]: 'c',
      email: 'c',
      isVerified: false,
      verifyToken: '111',
      verifyExpires: now - maxTimeAllTests
    },
    {
      [idType]: 'd',
      email: 'd',
      isVerified: true,
      verifyToken: '222',
      verifyExpires: now - maxTimeAllTests
    },
    {
      [idType]: 'e',
      email: 'e',
      isVerified: true,
      verifyToken: '800',
      verifyExpires: now + maxTimeAllTests,
      verifyChanges: { cellphone: '800' }
    }
  ];

  ['paginated', 'non-paginated'].forEach(pagination => {
    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataVerifySignupLong, params?: ParamsTest) => {
        return app.service("authManagement").create(withAction(data), params);
      }
    }, {
      name: "authManagement.verifySignupLong",
      callMethod: (app: Application, data: DataVerifySignupLong, params?: ParamsTest) => {
        return app.service("authManagement").verifySignupLong(data, params);
      }
    }, {
      name: "authManagement/verify-signup-long",
      callMethod: (app: Application, data: DataVerifySignupLong, params?: ParamsTest) => {
        return app.service("authManagement/verify-signup-long").create(data, params);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`verify-signup-long.test.ts ${idType} ${pagination} ${name}`, function () {
        this.timeout(timeoutEachTest);

        describe('basic', () => {
          let app: Application;
          let usersService: Service;

          beforeEach(async () => {
            app = feathers();

            const optionsUsers: Partial<MemoryServiceOptions> = {
              multi: true,
              id: idType
            };
            if (pagination === "paginated") {
              optionsUsers.paginate = { default: 10, max: 50 };
            }
            app.use("users", new Service(optionsUsers))

            app.service("users").hooks({
              before: {
                all: [
                  (context: HookContextTest) => {
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
            app.use("authManagement/verify-signup-long", new VerifySignupLongService(app, {
              passParams: params => params
            }));
            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token if not verified', async () => {
            const result = await callMethod(app, {
              token: '000'
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
          });

          it('verifies valid token if verifyChanges', async () => {
            const result = await callMethod(app, {
              token: '800'
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');

            assert.strictEqual(user.cellphone, '800', 'cellphone wrong');
          });

          it('user is sanitized', async () => {
            const result = await callMethod(app, {
              token: '000'
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.verifyToken, undefined, 'verifyToken not undefined');
            assert.strictEqual(result.verifyShortToken, undefined, 'verifyShortToken not undefined');
            assert.strictEqual(result.verifyExpires, undefined, 'verifyExpires not undefined');
            assert.strictEqual(result.verifyChanges, undefined, 'verifyChanges not undefined');
          });

          it('error on verified user without verifyChange', async () => {
            try {
              const result = await callMethod(app, {
                token: '222'
              });

              assert.fail('unexpectedly succeeded');
            } catch (err) {
              assert.strictEqual(err.message, 'User is already verified & not awaiting changes.');
            }
          });

          it('error on expired token', async () => {
            try {
              const result = await callMethod(app, {
                token: '111'
              });

              assert.fail('unexpectedly succeeded');
            } catch (err) {
              assert.strictEqual(err.message, 'Verification token has expired.');
            }
          });

          it('error on token not found', async () => {
            try {
              const result = await callMethod(app, {
                token: '999'
              });

              assert.fail('unexpectedly succeeded');
            } catch (err) {
              assert.strictEqual(err.message, 'User not found.');
            }
          });

          it('can use "passParams"', async () => {
            const params = { call: { count: 0 } };
            const result = await callMethod(app, {
              token: '000'
            }, params);

            assert.ok(params.call.count > 0, 'params.call.count not incremented');
          });
        });

        describe('with notification', () => {
          let app: Application;
          let usersService: Service;
          let spyNotifier;

          beforeEach(async () => {
            spyNotifier = SpyOn(notifier);

            app = feathers();

            const optionsUsers: Partial<MemoryServiceOptions> = {
              multi: true,
              id: idType
            };
            if (pagination === "paginated") {
              optionsUsers.paginate = { default: 10, max: 50 };
            }
            app.use("users", new Service(optionsUsers))

            app.configure(
              authLocalMgnt({
                notifier: spyNotifier.callWith
              })
            );
            app.use("authManagement/verify-signup-long", new VerifySignupLongService(app, {
              notifier: spyNotifier.callWith
            }));

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token', async () => {
            const result = await callMethod(app, {
              token: '000',
              notifierOptions: { transport: 'sms' }
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');

            assert.deepStrictEqual(spyNotifier.result()[0].args, [
              'verifySignup',
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
