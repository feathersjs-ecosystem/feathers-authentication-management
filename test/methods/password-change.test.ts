import assert from 'assert';
import bcrypt from 'bcryptjs';
import { feathers } from '@feathersjs/feathers';
import { MemoryService, type MemoryServiceOptions } from '@feathersjs/memory';
import authLocalMgnt, {
  DataPasswordChange,
  DataPasswordChangeWithAction,
  PasswordChangeService,
  User
} from '../../src/index';
import { authentication as authConfig } from '../test-helpers/config';

import {
  SpyOn,
  authenticationService as authService
} from '../test-helpers';
import { hashPassword } from '../../src/helpers';
import { timeoutEachTest } from '../test-helpers/config';
import { Application, ParamsTest } from '../types';

const withAction = (
  data: DataPasswordChange
): DataPasswordChangeWithAction => {
  return {
    action: "passwordChange",
    value: {
      oldPassword: data.oldPassword,
      password: data.password,
      user: data.user
    },
    notifierOptions: data.notifierOptions
  }
}

// Tests
describe('password-change.ts', function () {
  this.timeout(timeoutEachTest);

  ['_id', 'id'].forEach(idType => {
    const users = [
      {
        [idType]: 'a',
        email: 'a',
        plainPassword: 'aa',
        plainNewPassword: 'xx',
        isVerified: false
      },
      {
        [idType]: 'b',
        email: 'b',
        plainPassword: 'bb',
        plainNewPassword: 'yy',
        isVerified: true
      }
    ];

    describe(`bcrypt ${idType}`, function () {
      let app: Application;

      beforeEach(async () => {
        app = feathers();
        app.use('authentication', authService(app, Object.assign({}, {...authConfig, entity: null})));
        app.setup();

        // Ugly but makes test much faster
        if (!users[0].password) {
          users[0].password = await hashPassword(app, users[0].plainPassword, 'password');
          users[0].newPassword = await hashPassword(app, users[0].plainNewPassword, 'password');
          users[1].password = await hashPassword(app, users[1].plainPassword, 'password');
          users[1].newPassword = await hashPassword(app, users[1].plainNewPassword, 'password');
        }
      });

      it('compare plain passwords to encrypted ones', function () {
        //@ts-ignore
        assert.ok(bcrypt.compareSync(users[0].plainPassword, users[0].password));
        //@ts-ignore
        assert.ok(bcrypt.compareSync(users[1].plainPassword, users[1].password));
      });
    });

    ['paginated', 'non-paginated'].forEach(pagination => {
      [{
        name: "authManagement.create",
        callMethod: (app: Application, data: DataPasswordChange, params?: ParamsTest) => {
          return app.service("authManagement").create(withAction(data), params);
        }
      }, {
        name: "authManagement.passwordChange",
        callMethod: (app: Application, data: DataPasswordChange, params?: ParamsTest) => {
          return app.service("authManagement").passwordChange(data, params);
        }
      }, {
        name: "authManagement/password-change",
        callMethod: (app: Application, data: DataPasswordChange, params?: ParamsTest) => {
          return app.service("authManagement/password-change").create(data, params);
        }
      }].forEach(({ name, callMethod }) => {
        describe(`password-change.test.ts ${idType} ${pagination} ${name}`, () => {
          describe('standard', () => {
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
              app.use("authManagement/password-change", new PasswordChangeService(app, {
                passParams: params => params
              }))

              app.setup();

              usersService = app.service('users');
              await usersService.remove(null);
              await usersService.create(clone(users));
            });

            it('updates verified user', async () => {
              const userRec = clone(users[1]);

              const result = await callMethod(app, {
                user: {
                  email: userRec.email
                },
                oldPassword: userRec.plainPassword,
                password: userRec.plainNewPassword
              }) as User;
              const user = await usersService.get(result[idType]);

              assert.strictEqual(result.isVerified, true, 'isVerified not true');
              assert.ok(bcrypt.compareSync(user.plainNewPassword, user.password), `wrong password [1]`);
            });

            it('updates unverified user', async () => {
              const userRec = clone(users[0]);

              const result = await callMethod(app, {
                user: {
                  email: userRec.email
                },
                oldPassword: userRec.plainPassword,
                password: userRec.plainNewPassword
              }) as User;
              const user = await usersService.get(result[idType]);

              assert.strictEqual(result.isVerified, false, 'isVerified not false');
              assert.ok(bcrypt.compareSync(user.plainNewPassword, user.password), `[0]`);
            });

            it('error on wrong password', async () => {
              try {
                const userRec = clone(users[0]);

                const result = await callMethod(app, {
                  user: {
                    email: userRec.email
                  },
                  oldPassword: 'fdfgfghghj',
                  password: userRec.plainNewPassword
                }) as User;
                await usersService.get(result[idType]);

                assert.fail('unexpected succeeded.');
              } catch (err) {
                assert.strictEqual(err.message, 'Current password is incorrect.');
              }
            });

            it('can use "passParams"', async () => {
              const userRec = clone(users[1]);

              const params = { call: { count: 0 } };

              await callMethod(app, {
                user: {
                  email: userRec.email
                },
                oldPassword: userRec.plainPassword,
                password: userRec.plainNewPassword
              }, params);

              assert.ok(params.call.count > 0, 'hook not called');
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

              app.use("authManagement/password-change", new PasswordChangeService(app, {
                notifier: spyNotifier.callWith
              }))

              app.setup();

              usersService = app.service('users');
              await usersService.remove(null);
              await usersService.create(clone(users));
            });

            it('updates verified user', async () => {
              const userRec = clone(users[1]);

              const result = await callMethod(app, {
                user: {
                  email: userRec.email
                },
                oldPassword: userRec.plainPassword,
                password: userRec.plainNewPassword,
                notifierOptions: {transport: 'sms'},
              }) as User;
              const user = await usersService.get(result[idType]);

              assert.strictEqual(result.isVerified, true, 'isVerified not true');
              assert.ok(bcrypt.compareSync(user.plainNewPassword, user.password), `[1`);
              assert.deepStrictEqual(spyNotifier.result()[0].args, [
                'passwordChange',
                sanitizeUserForEmail(user),
                {transport: 'sms'}
              ]);
            });
          });
        });
      })
    });

    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataPasswordChange, params?: ParamsTest) => {
        return app.service("authManagement").create(withAction(data), params);
      }
    }, {
      name: "authManagement.passwordChange",
      callMethod: (app: Application, data: DataPasswordChange, params?: ParamsTest) => {
        return app.service("authManagement").passwordChange(data, params);
      }
    }, {
      name: "authManagement/password-change",
      callMethod: (app: Application, data: DataPasswordChange, params?: ParamsTest) => {
        return app.service("authManagement/password-change").create(data, params);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`password-change.test.ts ${idType} skipPasswordHash ${name}`, () => {
        describe('standard', () => {
          let app: Application;
          let usersService: MemoryService;

          beforeEach(async () => {
            app = feathers();
            app.use('authentication', authService(app));

            const optionsUsers: Partial<MemoryServiceOptions> = {
              multi: true,
              id: idType
            }; 

            app.use("users", new MemoryService(optionsUsers))

            app.setup();

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('with skipPasswordHash false', async () => {
            app.configure(authLocalMgnt({
              passParams: params => params,
              skipPasswordHash: false,
            }));
            app.use("authManagement/password-change", new PasswordChangeService(app, {
              passParams: params => params,
              skipPasswordHash: false,
            }))


            const userRec = clone(users[1]);

            const result = await callMethod(app, {
              user: {
                email: userRec.email
              },
              oldPassword: userRec.plainPassword,
              password: userRec.plainNewPassword
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'isVerified not true'); 
            assert.notStrictEqual(user.password, result.plainNewPassword, 'password was not hashed');
          });

          it('with skipPasswordHash true', async () => {
            app.configure(authLocalMgnt({
              passParams: params => params,
              skipPasswordHash: true,
            }));
            app.use("authManagement/password-change", new PasswordChangeService(app, {
              passParams: params => params,
              skipPasswordHash: true,
            }))


            const userRec = clone(users[1]);

            const result = await callMethod(app, {
              user: {
                email: userRec.email
              },
              oldPassword: userRec.plainPassword,
              password: userRec.plainNewPassword
            }) as User;
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, 'isVerified not true');
            assert.strictEqual(user.password, result.plainNewPassword, 'password was hashed');
          });
 
        });
      });
    })
  });
});

// Helpers

async function notifier(action, user, notifierOptions, newEmail) {
  return user;
}

function sanitizeUserForEmail(user) {
  const user1 = clone(user);
  delete user1.password;
  return user1;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
