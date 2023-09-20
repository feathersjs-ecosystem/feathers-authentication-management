
import assert from 'assert';
import { feathers } from '@feathersjs/feathers';
import { MemoryService, type MemoryServiceOptions } from '@feathersjs/memory';
import bcrypt from 'bcryptjs';
import authLocalMgnt, {
  DataVerifySignupSetPasswordShort,
  DataVerifySignupSetPasswordShortWithAction,
  User,
  VerifySignupSetPasswordShortService
} from '../../src/index';
import {
  SpyOn,
  authenticationService as authService
} from '../test-helpers';
import { timeoutEachTest, maxTimeAllTests } from '../test-helpers/config';
import { Application, HookContextTest, ParamsTest } from '../types';

const withAction = (
  data: DataVerifySignupSetPasswordShort
): DataVerifySignupSetPasswordShortWithAction => {
  return {
    action: "verifySignupSetPasswordShort",
    value: {
      password: data.password,
      token: data.token,
      user: data.user
    },
    notifierOptions: data.notifierOptions
  }
}

['_id', 'id'].forEach(idType => {
  const now = Date.now();
  const users = [
    { [idType]: 'a', email: 'a', username: 'aa', isVerified: false, verifyToken: '000', verifyShortToken: '00099', verifyExpires: now + maxTimeAllTests },
    { [idType]: 'b', email: 'b', username: 'bb', isVerified: false, verifyToken: null, verifyShortToken: null, verifyExpires: null },
    { [idType]: 'c', email: 'c', username: 'cc', isVerified: false, verifyToken: '111', verifyShortToken: '11199', verifyExpires: now - maxTimeAllTests },
    { [idType]: 'd', email: 'd', username: 'dd', isVerified: true, verifyToken: '222', verifyShortToken: '22299', verifyExpires: now - maxTimeAllTests },
    { [idType]: 'e',
      email: 'e',
      username: 'ee',
      isVerified: true,
      verifyToken: '800',
      verifyShortToken: '80099',
      verifyExpires: now + maxTimeAllTests,
      verifyChanges: { cellphone: '800' } }
  ];

  ['paginated', 'non-paginated'].forEach(pagination => {
    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataVerifySignupSetPasswordShort, params?: ParamsTest) => {
        return app.service("authManagement").create(withAction(data), params);
      }
    }, {
      name: "authManagement.verifySignupSetPasswordShort",
      callMethod: (app: Application, data: DataVerifySignupSetPasswordShort, params?: ParamsTest) => {
        return app.service("authManagement").verifySignupSetPasswordShort(data, params);
      }
    }, {
      name: "authManagement/verify-signup-set-password-short",
      callMethod: (app: Application, data: DataVerifySignupSetPasswordShort, params?: ParamsTest) => {
        return app.service("authManagement/verify-signup-set-password-short").create(data, params);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`verify-signup-set-password-short.test.ts ${idType} ${pagination} ${name}`, function () {
        this.timeout(timeoutEachTest);

        describe('basic', () => {
          let app: Application;
          let usersService: MemoryService;

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

            app.configure(
              authLocalMgnt({
                identifyUserProps: ['email', 'username'],
                passParams: params => params
              })
            );
            app.use("authManagement/verify-signup-set-password-short", new VerifySignupSetPasswordShortService(app, {
              identifyUserProps: ['email', 'username'],
              passParams: params => params
            }));
            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token and sets password if not verified', async () => {
            const password = '123456';
            const result = await callMethod(app, {
              token: '00099',
              user: { email: users[0].email },
              password
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
          });

          it('verifies valid token and sets password if verifyChanges', async () => {
            const password = '123456';
            const result = await callMethod(app, {
              token: '80099',
              user: { email: users[4].email },
              password
            }) as User;
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
            const result = await callMethod(app, {
              token: '00099',
              user: { username: users[0].username },
              password: '123456'
            }) as User;

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.verifyToken, undefined, 'verifyToken not undefined');
            assert.strictEqual(result.verifyShortToken, undefined, 'verifyShortToken not undefined');
            assert.strictEqual(result.verifyExpires, undefined, 'verifyExpires not undefined');
            assert.strictEqual(result.verifyChanges, undefined, 'verifyChanges not undefined');
          });

          it('handles multiple user ident', async () => {
            const result = await callMethod(app, {
              token: '00099',
              user: { email: users[0].email, username: users[0].username },
              password: '123456'
            }) as User;

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.verifyToken, undefined, 'verifyToken not undefined');
            assert.strictEqual(result.verifyShortToken, undefined, 'verifyShortToken not undefined');
            assert.strictEqual(result.verifyExpires, undefined, 'verifyExpires not undefined');
          });

          it('requires user ident', async () => {
            try {
              const result = await callMethod(app, {
                token: '00099',
                user: {},
                password: '123456'
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User info is not valid. (authLocalMgnt)');
            }
          });

          it('throws on non-configured user ident', async () => {
            try {
              const result = await callMethod(app, {
                token: '00099',
                //TODO: was this right?
                user: { email: undefined, verifyShortToken: '00099' },
                password: '123456'
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User info is not valid. (authLocalMgnt)');
            }
          });

          it('error on unverified user', async () => {
            try {
              const password = '123456';
              const result = await callMethod(app, {
                token: '22299',
                user: { email: users[3].email },
                password
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User is already verified & not awaiting changes.');
            }
          });

          it('error on expired token', async () => {
            try {
              const password = '123456';
              const result = await callMethod(app, {
                token: '11199',
                password,
                user: { username: users[2].username }
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'Verification token has expired.');
            }
          });

          it('error on user not found', async () => {
            try {
              const password = '123456';
              const result = await callMethod(app, {
                token: '999',
                user: { email: '999' },
                password
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User not found.');
            }
          });

          it('error incorrect token', async () => {
            try {
              const password = '123456';
              const result = await callMethod(app, {
                token: '999',
                user: { email: users[0].email },
                password
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'Invalid token. Get for a new one. (authLocalMgnt)');
            }
          });

          it('can use "passParams"', async () => {
            const params = { call: { count: 0 } };

            const password = '123456';
            const result = await callMethod(app, {
              token: '00099',
              user: { email: users[0].email },
              password
            }, params);

            assert.ok(params.call.count > 0, 'passParams not called');
          });
        });

        describe('with notification', () => {
          let spyNotifier;

          let app: Application;
          let usersService: MemoryService;

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
            app.use("authManagement/verify-signup-set-password-short", new VerifySignupSetPasswordShortService(app, {
              notifier: spyNotifier.callWith
            }));

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token and sets password', async () => {
            const password = '123456';
            const result = await callMethod(app, {
              token: '00099',
              user: { email: users[0].email },
              password,
              notifierOptions: { transport: 'sms' },
            }) as User;
            const user = await usersService.get(result.id || result._id);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
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
