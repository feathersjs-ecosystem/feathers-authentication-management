import assert from 'assert';
import feathers, { Application } from '@feathersjs/feathers';
import { MemoryServiceOptions, Service } from 'feathers-memory';
import authLocalMgnt, { DataResendVerifySignup, DataResendVerifySignupWithAction } from '../../src/index';
import {
  SpyOn,
  aboutEqualDateTime,
  makeDateTime
} from '../test-helpers';
import { timeoutEachTest } from '../test-helpers/config';
import { AuthenticationManagementService, ResendVerifySignupService } from '../../src/services';

const withAction = (
  data: DataResendVerifySignup
): DataResendVerifySignupWithAction => {
  // @ts-ignore
  return Object.assign({ action: "resendVerifySignup" }, data);
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
      callMethod: (app: Application, data: DataResendVerifySignup) => {
        return app.service("authManagement").create(withAction(data));
      }
    }, {
      name: "authManagement.resendVerifySignup",
      callMethod: (app: Application, data: DataResendVerifySignup) => {
        return app.service("authManagement").resendVerifySignup(data);
      }
    }, {
      name: "authManagement/resend-verify-signup",
      callMethod: (app: Application, data: DataResendVerifySignup) => {
        return app.service("authManagement/resend-verify-signup").create(data);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`resend-verify-signup.test.ts ${idType} ${pagination} ${name}`, function () {
        this.timeout(timeoutEachTest);

        function basicTest1 (desc, values) {
          describe(desc, () => {
            let app: Application;
            let usersService: Service;
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
              app.use("/users", new Service(optionsUsers))

              app.configure(authLocalMgnt({}));
              app.use("authManagement/resend-verify-signup", new ResendVerifySignupService(app))
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
                value: values[0]
              });
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
                value: values[1]
              });

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
                  value: values[2]
                });

                assert.fail('unexpectedly succeeded');
              } catch (err) {
                assert.strictEqual(err.message, 'User is already verified.');
              }
            });

            it('error on email not found', async () => {
              try {
                const result = await callMethod(app, {
                  value: values[3]
                });

                assert.fail('unexpectedly succeeded');
              } catch (err) {
                assert.strictEqual(err.message, 'User not found.');
              }
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
            app.use("/users", new Service(optionsUsers))

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
              value: { verifyToken }
            });
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
            app.use("/users", new Service(optionsUsers))

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
              value: { verifyToken }
            });
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
            app.use("/users", new Service(optionsUsers))

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
              value: { verifyToken }
            });
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
            app.use("/users", new Service(optionsUsers))

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
              value: {
                verifyToken,
                email: 'a'
              }
            });
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
                value: {
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
                value: {
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
            app.use("/users", new Service(optionsUsers))

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
              value: { email },
              notifierOptions: { transport: 'email' }
            });
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
