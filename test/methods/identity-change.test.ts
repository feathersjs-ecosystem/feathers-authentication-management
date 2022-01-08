import assert from 'assert';
import feathers, { Application } from '@feathersjs/feathers';
import { MemoryServiceOptions, Service } from 'feathers-memory';
import authLocalMgnt, {
  DataIdentityChange,
  DataIdentityChangeWithAction,
  IdentityChangeService
} from '../../src/index';
import {
  SpyOn,
  authenticationService as authService
} from '../test-helpers';
import { hashPassword } from '../../src/helpers';
import { timeoutEachTest } from '../test-helpers/config';

const withAction = (
  data: DataIdentityChange
): DataIdentityChangeWithAction => {
  return {
    action: "identityChange",
    value: {
      changes: data.changes,
      password: data.password,
      user: data.user
    },
    notifierOptions: data.notifierOptions
  }
}

// Tests
['_id', 'id'].forEach(idType => {
  // users DB
  const users = [
    { [idType]: 'a', email: 'a', plainPassword: 'aa', isVerified: false },
    { [idType]: 'b', email: 'b', plainPassword: 'bb', isVerified: true }
  ];

  ['paginated', 'non-paginated'].forEach(pagination => {
    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataIdentityChange) => {
        return app.service("authManagement").create(withAction(data));
      }
    }, {
      name: "authManagement.identityChange",
      callMethod: (app: Application, data: DataIdentityChange) => {
        return app.service("authManagement").identityChange(data);
      }
    }, {
      name: "authManagement/identity-change",
      callMethod: (app: Application, data: DataIdentityChange) => {
        return app.service("authManagement/identity-change").create(data);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`identity-change.test.ts ${idType} ${pagination} ${name}`, function () {
        this.timeout(timeoutEachTest);

        describe('standard', () => {
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
            app.use("/users", new Service(optionsUsers));
            app.configure(authLocalMgnt({}));
            app.use("authManagement/identity-change", new IdentityChangeService(app))
            app.setup();
            usersService = app.service('users');

            // Ugly but makes test much faster
            if (!users[0].password) {
              users[0].password = await hashPassword(
                app,
                users[0].plainPassword,
                'password'
              );
              users[1].password = await hashPassword(
                app,
                users[1].plainPassword,
                'password'
              );
            }

            await usersService.remove(null);
            await usersService.create(clone(users));
          });

          it('updates verified user', async () => {
            const userRec = clone(users[1]);

            const result = await callMethod(app, {
              user: { email: userRec.email },
              password: userRec.plainPassword,
              changes: { email: 'b@b' }
            });
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true);
            assert.strictEqual(user.email, userRec.email);
          });

          it('updates unverified user', async () => {
            const userRec = clone(users[0]);

            const result = await callMethod(app, {
              user: { email: userRec.email },
              password: userRec.plainPassword,
              changes: { email: 'a@a' }
            });
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, false);
            assert.strictEqual(user.email, userRec.email);
          });

          it('error on wrong password', async () => {
            const userRec = clone(users[0]);

            await assert.rejects(
              callMethod(app, {
                user: { email: userRec.email },
                password: 'ghghghg',
                changes: { email: 'a@a' }
              }),
              (err: any) => {
                assert.strictEqual(err.name, "BadRequest");
                assert.strictEqual(err.message, "Password is incorrect.");
                return true;
              }
            )
          });
        });

        describe('with notification', () => {
          let spyNotifier;

          let app: Application;
          let usersService: Service;

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
            app.use("authManagement/identity-change", new IdentityChangeService(app, {
              notifier: spyNotifier.callWith
            }));
            app.setup();
            usersService = app.service('users');

            await usersService.remove(null);
            await usersService.create(clone(users));

          });

          it('updates verified user', async () => {
            const userRec = clone(users[1]);

            const result = await callMethod(app, {
              user: { email: userRec.email },
              password: userRec.plainPassword,
              changes: { email: 'b@b' },
              notifierOptions: { transport: 'sms' }
            });
            const user = await usersService.get(result[idType]);

            assert.strictEqual(result.isVerified, true, `'${name}': isVerified not true`);

            assert.strictEqual(user.email, userRec.email, `'${name}': email is corrent`);
            assert.deepStrictEqual(user.verifyChanges, { email: 'b@b' });

            const spy = spyNotifier.result()[0].args;

            assert.deepStrictEqual(spy, [
              'identityChange',
              Object.assign(
                {},
                sanitizeUserForEmail(result),
                extractProps(
                  user,
                  'verifyExpires',
                  'verifyToken',
                  'verifyShortToken',
                  'verifyChanges'
                )
              ),
              { transport: "sms" },
            ]);

            assert.strictEqual(user.isVerified, true, `'${name}': isVerified not false`);
            assert.strictEqual(typeof user.verifyToken, "string", `'${name}': verifyToken not String`);
            assert.strictEqual(
              user.verifyToken.length,
              30,
              `'${name}': verify token wrong length`
            );
            assert.strictEqual(
              user.verifyShortToken.length,
              6,
              `'${name}': verify short token wrong length`
            );

            const match = user.verifyShortToken.match(/^[0-9]+$/);

            assert.strictEqual(match[0].length, 6, `'${name}': matches number`);
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

function extractProps (obj, ...rest) {
  const res = {};
  rest.forEach(key => {
    res[key] = obj[key];
  });
  return res;
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}
