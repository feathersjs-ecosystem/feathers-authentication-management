import assert from 'assert';
import feathers, { Application, Params } from '@feathersjs/feathers';
import { MemoryServiceOptions, Service } from 'feathers-memory';
import authLocalMgnt, {
  DataCheckUnique,
  DataCheckUniqueWithAction,
  CheckUniqueService
} from '../../src/index';
import { timeoutEachTest } from '../test-helpers/config';

const withAction = (
  data: DataCheckUnique
): DataCheckUniqueWithAction => {
  return {
    action: "checkUnique",
    meta: data.meta,
    value: data.user,
    ownId: data.ownId
  }
}

['_id', 'id'].forEach(idType => {
  const users = [
    { [idType]: 'a', email: 'a', username: 'john a' },
    { [idType]: 'b', email: 'b', username: 'john b' },
    { [idType]: 'c', email: 'c', username: 'john b' }
  ];

  ['paginated', 'non-paginated'].forEach(pagination => {
    [{
      name: "authManagement.create",
      callMethod: (app: Application, data: DataCheckUnique, params?: Params) => {
        return app.service("authManagement").create(withAction(data), params);
      }
    }, {
      name: "authManagement.checkUnique",
      callMethod: (app: Application, data: DataCheckUnique, params?: Params) => {
        return app.service("authManagement").checkUnique(data, params);
      }
    }, {
      name: "authManagement/check-unique",
      callMethod: (app: Application, data: DataCheckUnique, params?: Params) => {
        return app.service("authManagement/check-unique").create(data, params);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`check-unique.test.ts ${idType} ${pagination} ${name}`, function () {
        this.timeout(timeoutEachTest);

        describe('standard', () => {
          let app: Application;
          let usersService: Service;

          beforeEach(async () => {
            app = feathers();
            app.configure(authLocalMgnt({
              passParams: params => params
            }));
            app.use("/authManagement/check-unique", new CheckUniqueService(app, {
              passParams: params => params
            }));
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

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(
              clone(users)
            );
          });

          it('returns a promise', async () => {
            let res = callMethod(app, { user: { username: 'john a' }})

            assert.ok(res instanceof Promise, `no promise returned`);
          });

          it('handles empty query', async () => {
            await callMethod(app, { user: {} });
          });

          it('handles empty query returning nothing', async () => {
            await callMethod(app, { user: { username: 'hjhjhj' }});
          });

          it('finds single query on single item', async () => {
            try {
              await callMethod(app, { user: { username: 'john a' }});

              assert.fail(`test unexpectedly succeeded`);
            } catch (err) {
              assert.strictEqual(err.message, 'Values already taken.');
              assert.strictEqual(err.errors.username, 'Already taken.');
            }
          });

          it('handles noErrMsg option', async () => {
            try {
              await callMethod(app, {
                user: { username: 'john a' },
                meta: { noErrMsg: true }
              });

              assert.fail(`${name}: test unexpectedly succeeded`);
            } catch (err) {
              assert.strictEqual(err.message, 'Error', `${name}: Error`); // feathers default for no error message
              assert.strictEqual(err.errors.username, 'Already taken.', `${name}: Already taken.`);
            }
          });

          it('finds single query on multiple items', async () => {
              try {
                await callMethod(app, { user: { username: 'john b' }});

                assert.fail(`${name}: test unexpectedly succeeded`);
              } catch (err) {
                assert.strictEqual(err.message, 'Values already taken.', `${name}: Values already taken.`);
                assert.strictEqual(err.errors.username, 'Already taken.', `${name}: Already taken.`);
              }
          });

          it('finds multiple queries on same item', async () => {
            try {
              await callMethod(app, { user: {
                username: 'john a', email: 'a'
              }});

              assert.fail(`${name}: test unexpectedly succeeded`);
            } catch (err) {
              assert.strictEqual(err.message, 'Values already taken.', `${name}: Values already taken.`);
              assert.strictEqual(err.errors.username, 'Already taken.', `${name}: Already taken.`);
            }
          });

          it('finds multiple queries on different item', async () => {
            try {
              await callMethod(app, { user: {
                username: 'john a',
                email: 'b'
              }});

              assert.fail(`${name}: test unexpectedly succeeded`);
            } catch (err) {
              assert.strictEqual(err.message, 'Values already taken.', `${name}: Values already taken.`);
              assert.strictEqual(err.errors.username, 'Already taken.', `${name}: Already taken.`);
            }
          });

          it('ignores null & undefined queries', async () => {
            await callMethod(app, { user: {
              username: undefined,
              email: null
            }});
          });

          it('ignores current user on single item', async () => {
            await callMethod(app, {
              user: { username: 'john a' },
              ownId: 'a'
            });
          });

          it('can use "passParams"', async () => {
            try {
              await callMethod(app, {
                user: { username: 'john b' },
                ownId: 'b'
              });

              assert.fail(`${name}: test unexpectedly succeeded`);
            } catch (err) {
              assert.strictEqual(err.message, 'Values already taken.');
              assert.strictEqual(err.errors.username, 'Already taken.');
            }
          });

          it('handles empty query returning nothing', async () => {
            const params = { call: { count: 0 } };
            await callMethod(app, { user: { username: 'hjhjhj' }}, params);
            assert.ok(params.call.count > 0, `${name}: count not incremented`);
          });
        });
      });
    });
  });
});

// Helpers

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}
