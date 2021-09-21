import assert from 'assert';
import feathers, { Application } from '@feathersjs/feathers';
import { MemoryServiceOptions, Service } from 'feathers-memory';
import authLocalMgnt, { DataCheckUnique, DataCheckUniqueWithAction } from '../../src/index';
import { timeoutEachTest } from '../test-helpers/config';
import { CheckUniqueService } from '../../src/services';

const withAction = (
  data: DataCheckUnique
): DataCheckUniqueWithAction => {
  //@ts-ignore
  return Object.assign({ action: "checkUnique" }, data)
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
      callMethod: (app: Application, data: DataCheckUnique) => {
        return app.service("authManagement").create(withAction(data));
      }
    }, {
      name: "authManagement.checkUnique",
      callMethod: (app: Application, data: DataCheckUnique) => {
        return app.service("authManagement").checkUnique(data);
      }
    }, {
      name: "authManagement/check-unique",
      callMethod: (app: Application, data: DataCheckUnique) => {
        return app.service("authManagement/check-unique").create(data);
      }
    }].forEach(({ name, callMethod }) => {
      describe(`check-unique.test.ts ${pagination} ${idType} ${name}`, function () {
        this.timeout(timeoutEachTest);

        describe('standard', () => {
          let app: Application;
          let usersService: Service;

          beforeEach(async () => {
            app = feathers();
            app.configure(authLocalMgnt({}));
            app.use("/authManagement/check-unique", new CheckUniqueService({ app }));
            const optionsUsers: Partial<MemoryServiceOptions> = {
              multi: true,
              id: idType
            };
            if (pagination === "paginated") {
              optionsUsers.paginate = { default: 10, max: 50 };
            }
            app.use("/users", new Service(optionsUsers))

            usersService = app.service('users');
            await usersService.remove(null);
            await usersService.create(
              clone(users)
            );
          });

          it('returns a promise', async () => {
            let res = callMethod(app, { value: { username: 'john a' }})
              .then(() => { })
              .catch(() => { });

            assert.ok(res, `no promise returned`);
            assert.strictEqual(typeof res.then, 'function', `not a function`);
          });

          it('handles empty query', async () => {
            await callMethod(app, { value: {} });
          });

          it('handles empty query returning nothing', async () => {
            await callMethod(app, { value: { username: 'hjhjhj' }});
          });

          it('finds single query on single item', async () => {
            try {
              await callMethod(app, { value: { username: 'john a' }});

              assert.fail(`test unexpectedly succeeded`);
            } catch (err) {
              assert.strictEqual(err.message, 'Values already taken.');
              assert.strictEqual(err.errors.username, 'Already taken.');
            }
          });

          it('handles noErrMsg option', async () => {
            try {
              await callMethod(app, {
                value: { username: 'john a' },
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
                await callMethod(app, { value: { username: 'john b' }});

                assert.fail(`${name}: test unexpectedly succeeded`);
              } catch (err) {
                assert.strictEqual(err.message, 'Values already taken.', `${name}: Values already taken.`);
                assert.strictEqual(err.errors.username, 'Already taken.', `${name}: Already taken.`);
              }
          });

          it('finds multiple queries on same item', async () => {
            try {
              await callMethod(app, { value: {
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
              await callMethod(app, { value: {
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
            await callMethod(app, { value: {
              username: undefined,
              email: null
            }});
          });

          it('ignores current user on single item', async () => {
            await callMethod(app, {
              value: { username: 'john a' },
              ownId: 'a'
            });
          });

          it('cannot ignore current user on multiple items', async () => {
            try {
              await callMethod(app, {
                value: { username: 'john b' },
                ownId: 'b'
              });

              assert.fail(`${name}: test unexpectedly succeeded`);
            } catch (err) {
              assert.strictEqual(err.message, 'Values already taken.');
              assert.strictEqual(err.errors.username, 'Already taken.');
            }
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
