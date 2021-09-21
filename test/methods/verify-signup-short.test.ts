import assert from 'assert';
import feathers, { Application } from '@feathersjs/feathers';
import { MemoryServiceOptions, Service } from 'feathers-memory';
import authLocalMgnt, { DataVerifySignupShort, DataVerifySignupShortWithAction } from '../../src/index';
import { SpyOn } from '../test-helpers';
import { timeoutEachTest, maxTimeAllTests } from '../test-helpers/config';
import { AuthenticationManagementService, VerifySignupShortService } from '../../src/services';

const withAction = (
  data: DataVerifySignupShort
): DataVerifySignupShortWithAction => {
  //@ts-ignore
  return Object.assign({ action: "verifySignupShort" }, data);
}

['_id', 'id'].forEach(idType => {
  const now = Date.now();
  const users = [
    {
      [idType]: 'a',
      email: 'a',
      username: 'aa',
      isVerified: false,
      verifyToken: '000',
      verifyShortToken: '00099',
      verifyExpires: now + maxTimeAllTests
    },
    {
      [idType]: 'b',
      email: 'b',
      username: 'bb',
      isVerified: false,
      verifyToken: null,
      verifyShortToken: null,
      verifyExpires: null
    },
    {
      [idType]: 'c',
      email: 'c',
      username: 'cc',
      isVerified: false,
      verifyToken: '111',
      verifyShortToken: '11199',
      verifyExpires: now - maxTimeAllTests
    },
    {
      [idType]: 'd',
      email: 'd',
      username: 'dd',
      isVerified: true,
      verifyToken: '222',
      verifyShortToken: '22299',
      verifyExpires: now - maxTimeAllTests
    },
    {
      [idType]: 'e',
      email: 'e',
      username: 'ee',
      isVerified: true,
      verifyToken: '800',
      verifyShortToken: '80099',
      verifyExpires: now + maxTimeAllTests,
      verifyChanges: { cellphone: '800' }
    }
  ];

  ['paginated', 'non-paginated'].forEach(pagination => {
    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataVerifySignupShort) => {
        return app.service("authManagement").create(withAction(data));
      }
    }, {
      name: "authManagement.verifySignupShort",
      callMethod: (app: Application, data: DataVerifySignupShort) => {
        return app.service("authManagement").verifySignupShort(data);
      }
    }, {
      name: "authManagement/verify-signup-short",
      callMethod: (app: Application, data: DataVerifySignupShort) => {
        return app.service("authManagement/verify-signup-short").create(data);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`verify-signUp-short.ts ${pagination} ${idType} ${name}`, function () {
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
            app.use("/users", new Service(optionsUsers))

            app.configure(
              authLocalMgnt({
                identifyUserProps: ['email', 'username']
              })
            );
            app.use("authManagement/verify-signup-short", new VerifySignupShortService({
              app,
              identifyUserProps: ['email', 'username']
            }))
            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token if not verified', async () => {
            const result = await callMethod(app, {
              value: {
                token: '00099',
                user: { email: users[0].email }
              }
            });
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
              value: {
                token: '80099',
                user: { email: users[4].email }
              }
            });
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
              value: {
                token: '00099',
                user: { username: users[0].username }
              }
            });

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.verifyToken, undefined, 'verifyToken not undefined');
            assert.strictEqual(result.verifyShortToken, undefined, 'verifyShortToken not undefined');
            assert.strictEqual(result.verifyExpires, undefined, 'verifyExpires not undefined');
            assert.strictEqual(result.verifyChanges, undefined, 'verifyChanges not undefined');
          });

          it('handles multiple user ident', async () => {
            const result = await callMethod(app, {
              value: {
                token: '00099',
                user: { email: users[0].email, username: users[0].username }
              }
            });

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(result.verifyToken, undefined, 'verifyToken not undefined');
            assert.strictEqual(result.verifyShortToken, undefined, 'verifyShortToken not undefined');
            assert.strictEqual(result.verifyExpires, undefined, 'verifyExpires not undefined');
          });

          it('requires user ident', async () => {
            try {
              const result = await callMethod(app, {
                value: {
                  token: '00099',
                  user: {}
                }
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User info is not valid. (authLocalMgnt)');
            }
          });

          it('throws on non-configured user ident', async () => {
            try {
              const result = await callMethod(app, {
                value: {
                  token: '00099',
                  // was this right?
                  user: { email: undefined, verifyShortToken: '00099' }
                }
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User info is not valid. (authLocalMgnt)');
            }
          });

          it('error on unverified user', async () => {
            try {
              const result = await callMethod(app, {
                value: {
                  token: '22299',
                  user: { email: users[3].email }
                }
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User is already verified & not awaiting changes.');
            }
          });

          it('error on expired token', async () => {
            try {
              const result = await callMethod(app, {
                value: {
                  token: '11199',
                  user: { username: users[2].username }
                }
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'Verification token has expired.');
            }
          });

          it('error on user not found', async () => {
            try {
              const result = await callMethod(app, {
                value: {
                  token: '999',
                  user: { email: '999' }
                }
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'User not found.');
            }
          });

          it('error incorrect token', async () => {
            try {
              const result = await callMethod(app, {
                value: { token: '999', user: { email: users[0].email } }
              });

              assert.fail('unexpectedly succeeded.');
            } catch (err) {
              assert.strictEqual(err.message, 'Invalid token. Get for a new one. (authLocalMgnt)');
            }
          });
        });

        describe('with notification', () => {
          let spyNotifier;

          let app: Application;
          let usersService: Service;

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
                // maybe reset identifyUserProps
                notifier: spyNotifier.callWith
              })
            );
            app.use("authManagement/verify-signup-short", new VerifySignupShortService({
              app,
              notifier: spyNotifier.callWith
            }))
            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('verifies valid token', async () => {
            const result = await callMethod(app, {
              value: {
                token: '00099',
                user: { email: users[0].email },
              },
              notifierOptions: { transport: 'sms' },
            });
            const user = await usersService.get(result.id || result._id);

            assert.strictEqual(result.isVerified, true, 'user.isVerified not true');

            assert.strictEqual(user.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.verifyToken, null, 'verifyToken not null');
            assert.strictEqual(user.verifyShortToken, null, 'verifyShortToken not null');
            assert.strictEqual(user.verifyExpires, null, 'verifyExpires not null');
            assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');

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
