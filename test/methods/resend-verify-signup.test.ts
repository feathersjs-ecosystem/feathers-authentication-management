import assert from 'assert';
import { feathers } from '@feathersjs/feathers';
import { MemoryService, type MemoryServiceOptions } from '@feathersjs/memory';
import authLocalMgnt, {
  DataResendVerifySignup,
  DataResendVerifySignupWithAction,
  AuthenticationManagementService,
  ResendVerifySignupService,
  User
} from '../../src/index';
import { Application, ParamsTest } from '../types';
import {
  SpyOn,
  aboutEqualDateTime,
  makeDateTime
} from '../test-helpers';
import { timeoutEachTest } from '../test-helpers/config';

const withAction = (
  data: DataResendVerifySignup
): DataResendVerifySignupWithAction => {
  return {
    action: "resendVerifySignup",
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
      verifyShortToken: '00099',
      verifyExpires: now + 500,
      username: 'Doe'
    },
    {
      [idType]: 'b',
      email: 'b',
      isVerified: true,
      verifyToken: null,
      verifyShortToken: null,
      verifyExpires: null
    },
    {
      [idType]: 'c',
      email: 'c',
      isVerified: true,
      verifyToken: '999',
      verifyShortToken: '99900',
      verifyExpires: null
    } // impossible
  ];

  ['paginated', 'non-paginated'].forEach(pagination => {
    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataResendVerifySignup, params?: ParamsTest) => {
        return app.service("authManagement").create(withAction(data), params);
      }
    }, {
      name: "authManagement.resendVerifySignup",
      callMethod: (app: Application, data: DataResendVerifySignup, params?: ParamsTest) => {
        return app.service("authManagement").resendVerifySignup(data, params);
      }
    }, {
      name: "authManagement/resend-verify-signup",
      callMethod: (app: Application, data: DataResendVerifySignup, params?: ParamsTest) => {
        return app.service("authManagement/resend-verify-signup").create(data, params);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`resend-verify-signup.test.ts ${idType} ${pagination} ${name}`, function () {
        this.timeout(timeoutEachTest);

        function basicTest1 (desc, values) {
          describe(desc, () => {
            let app: Application;
            let usersService: MemoryService;
            let authLocalMgntService: AuthenticationManagementService;

            beforeEach(async () => {
              app = feathers();

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
                    context => {
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
              app.use("authManagement/resend-verify-signup", new ResendVerifySignupService(app, {
                passParams: params => params
              }))
              app.setup();
              authLocalMgntService = app.service('authManagement');

              usersService = app.service('users');
              await usersService.remove(null);
              await usersService.create(clone(users));
            });

            it('authLocalMgnt::create exists', () => {
              assert.strictEqual(typeof authLocalMgntService.create, 'function');
              assert.strictEqual(typeof authLocalMgntService.resendVerifySignup, 'function');
            });

            it('updates unverified user', async () => {
              const result = await callMethod(app, {
                user: values[0]
              }) as User;
              const user = await usersService.get(result[idType]);

              assert.strictEqual(
                result.isVerified,
                false,
                'result.isVerified not false'
              );
              assert.strictEqual(
                user.isVerified,
                false,
                'isVerified not false'
              );
              assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
              assert.strictEqual(
                user.verifyToken.length,
                30,
                'verify token wrong length'
              );
              assert.strictEqual(
                user.verifyShortToken.length,
                6,
                'verify short token wrong length'
              );
              assert.match(user.verifyShortToken, /^[0-9]+$/);
              aboutEqualDateTime(user.verifyExpires, makeDateTime());
            });

            it('sanitizes user', async () => {
              const result = await callMethod(app, {
                user: values[1]
              }) as User;

              assert.strictEqual(
                result.isVerified,
                false,
                'isVerified not false'
              );
              assert.strictEqual(
                result.verifyToken,
                undefined,
                'verifyToken not undefined'
              );
              assert.strictEqual(
                result.verifyShortToken,
                undefined,
                'verifyShortToken not undefined'
              );
              assert.strictEqual(
                result.verifyExpires,
                undefined,
                'verifyExpires not undefined'
              );
            });

            it('error on verified user', async () => {
              try {
                const result = await callMethod(app, {
                  user: values[2]
                });

                assert.fail('unexpectedly succeeded');
              } catch (err) {
                assert.strictEqual(err.message, 'User is already verified.');
              }
            });

            it('error on email not found', async () => {
              try {
                const result = await callMethod(app, {
                  user: values[3]
                });

                assert.fail('unexpectedly succeeded');
              } catch (err) {
                assert.strictEqual(err.message, 'User not found.');
              }
            });

            it('can use "passParams', async () => {
              const params = { call: { count: 0 } };
              const result = await callMethod(app, {
                user: values[0]
              }, params);

              assert.ok(params.call.count > 0, 'params.call.count not > 0');
            });
          });
        }

        basicTest1('emailOrToken is {email}', [
          { email: 'a' },
          { email: 'a' },
          { email: 'b' },
          { email: 'x' }
        ]);

        basicTest1('emailOrToken is {verifyToken}', [
          { verifyToken: '000' },
          { verifyToken: '000' },
          { verifyToken: '999' },
          { verifyToken: 'xxx' }
        ]);

        basicTest1('emailOrToken is {verifyShortToken}', [
          { verifyShortToken: '00099' },
          { verifyShortToken: '00099' },
          { verifyShortToken: '99900' },
          { verifyShortToken: 'xxx' }
        ]);

        describe('emailOrToken is {verifyToken} can change len', () => {
          let app: Application;
          let usersService: MemoryService;

          beforeEach(async () => {
            app = feathers();

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
                longTokenLen: 10
              })
            );
            app.use("authManagement/resend-verify-signup", new ResendVerifySignupService(app, {
              longTokenLen: 10
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(users);
          });

          it('can change', async () => {
            const verifyToken = '000';

            const result = await callMethod(app, {
              user: { verifyToken }
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(
              result.isVerified,
              false,
              'user.isVerified not false'
            );
            assert.strictEqual(user.isVerified, false, 'isVerified not false');
            assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
            assert.strictEqual(
              user.verifyToken.length,
              20,
              'verify token wrong length'
            );
            assert.strictEqual(
              user.verifyShortToken.length,
              6,
              'verify short token wrong length'
            );
            assert.match(user.verifyShortToken, /^[0-9]+$/);
            aboutEqualDateTime(user.verifyExpires, makeDateTime());
          });
        });

        describe('short token (digit) can change length', () => {
          let app: Application;
          let usersService: MemoryService;

          beforeEach(async () => {
            app = feathers();

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
                longTokenLen: 15, // need to reset this
                shortTokenLen: 8
              })
            );
            app.use("authManagement/resend-verify-signup", new ResendVerifySignupService(app, {
              longTokenLen: 15,
              shortTokenLen: 8
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('can change', async () => {
            const verifyToken = '000';

            const result = await callMethod(app, {
              user: { verifyToken }
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(
              result.isVerified,
              false,
              'user.isVerified not false'
            );
            assert.strictEqual(user.isVerified, false, 'isVerified not false');
            assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
            assert.strictEqual(
              user.verifyToken.length,
              30,
              'verify token wrong length'
            );
            assert.strictEqual(
              user.verifyShortToken.length,
              8,
              'verify short token wrong length'
            );
            assert.match(user.verifyShortToken, /^[0-9]+$/);
            aboutEqualDateTime(user.verifyExpires, makeDateTime());
          });
        });

        describe('short token (alpha) can change length', () => {
          let app: Application;
          let usersService: MemoryService;

          beforeEach(async () => {
            app = feathers();

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
                longTokenLen: 15, // need to reset this
                shortTokenLen: 9,
                shortTokenDigits: false
              })
            );
            app.use("authManagement/resend-verify-signup", new ResendVerifySignupService(app, {
              longTokenLen: 15, // need to reset this
              shortTokenLen: 9,
              shortTokenDigits: false
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('can change', async () => {
            const verifyToken = '000';

            const result = await callMethod(app, {
              user: { verifyToken }
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(
              result.isVerified,
              false,
              'user.isVerified not false'
            );
            assert.strictEqual(user.isVerified, false, 'isVerified not false');
            assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
            assert.strictEqual(
              user.verifyToken.length,
              30,
              'verify token wrong length'
            );
            assert.strictEqual(
              user.verifyShortToken.length,
              9,
              'verify short token wrong length'
            );
            assert.doesNotMatch(user.verifyShortToken, /^[0-9]+$/);
            aboutEqualDateTime(user.verifyExpires, makeDateTime());
          });
        });

        describe('use affirming properties', () => {
          let app: Application;
          let usersService: MemoryService;

          beforeEach(async () => {
            app = feathers();

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
                longTokenLen: 15, // need to reset this
                shortTokenLen: 6,
                shortTokenDigits: false
              })
            );
            app.use("authManagement/resend-verify-signup", new ResendVerifySignupService(app, {
              longTokenLen: 15, // need to reset this
              shortTokenLen: 6,
              shortTokenDigits: false
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies when correct', async () => {
            const verifyToken = '000';

            const result = await callMethod(app, {
              user: {
                verifyToken,
                email: 'a'
              }
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(
              result.isVerified,
              false,
              'user.isVerified not false'
            );
            assert.strictEqual(user.isVerified, false, 'isVerified not false');
            assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
            assert.strictEqual(
              user.verifyToken.length,
              30,
              'verify token wrong length'
            );
            assert.strictEqual(
              user.verifyShortToken.length,
              6,
              'verify short token wrong length'
            );
            assert.doesNotMatch(user.verifyShortToken, /^[0-9]+$/);
            aboutEqualDateTime(user.verifyExpires, makeDateTime());
          });

          it('fails when incorrect', async () => {
            const verifyToken = '000';

            try {
              const result = await callMethod(app, {
                user: {
                  verifyToken,
                  email: 'a',
                  username: 'Doexxxxxxx'
                }
              });

              assert.fail('unexpectedly succeeded');
            } catch (err) {
              assert.strictEqual(err.message, 'User info is not valid. (authLocalMgnt)');
            }
          });

          it('fails when hacks attempted', async () => {
            try {
              const result = await callMethod(app, {
                user: {
                  username: 'Doe'
                }
              });

              assert.fail('unexpectedly succeeded');
            } catch (err) {
              assert.strictEqual(err.message, 'User info is not valid. (authLocalMgnt)');
            }
          });
        });

        describe('with notification', () => {
          let app: Application;
          let usersService: MemoryService;
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
            app.use("users", new MemoryService(optionsUsers))

            app.configure(
              authLocalMgnt({
                longTokenLen: 15, // need to reset this
                shortTokenLen: 6, // need to reset this
                shortTokenDigits: true, // need to reset this
                notifier: spyNotifier.callWith
              })
            );
            app.use("authManagement/resend-verify-signup", new ResendVerifySignupService(app, {
              longTokenLen: 15, // need to reset this
              shortTokenLen: 6,
              shortTokenDigits: true,
              notifier: spyNotifier.callWith
            }))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('is called', async () => {
            const email = 'a';

            const result = await callMethod(app, {
              user: { email },
              notifierOptions: { transport: 'email' }
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(
              result.isVerified,
              false,
              'user.isVerified not false'
            );

            assert.strictEqual(user.isVerified, false, 'isVerified not false');
            assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
            assert.strictEqual(
              user.verifyToken.length,
              30,
              'verify token wrong length'
            );
            assert.strictEqual(
              user.verifyShortToken.length,
              6,
              'verify short token wrong length'
            );
            assert.match(user.verifyShortToken, /^[0-9]+$/);
            aboutEqualDateTime(user.verifyExpires, makeDateTime());

            assert.deepStrictEqual(spyNotifier.result()[0].args, [
              'resendVerifySignup',
              sanitizeUserForEmail(user),
              { transport: 'email' }
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
  const user1 = clone(user);
  delete user1.password;
  return user1;
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}
