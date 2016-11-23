
/* global assert, describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0,
no-param-reassign: 0, no-unused-vars: 0  */

const assert = require('chai').assert;

const feathersStubs = require('./../test/helpers/feathersStubs');
const verifyResetService = require('../lib/index');

// user DB

const usersDb = [
  { _id: 'a', email: 'a', username: 'john a' },
  { _id: 'b', email: 'b', username: 'john b' },
  { _id: 'c', email: 'c', username: 'john b' },
];

// Tests
['_id', 'id'].forEach(idType => {
  ['paginated', 'non-paginated'].forEach(pagination => {
    describe(`checkUniqueness ${pagination} ${idType}`, () => {
      const ifNonPaginated = pagination === 'non-paginated';

      describe('standard', () => {
        var db;
        var app;
        var users;
        var verifyReset;

        beforeEach(() => {
          db = clone(usersDb);
          app = feathersStubs.app();
          users = feathersStubs.users(app, db, ifNonPaginated, idType);
          verifyResetService().call(app); // define and attach verifyReset service
          verifyReset = app.service('verifyReset'); // get handle to verifyReset
        });

        it('returns a promise', () => {
          const res = verifyReset.create({
            action: 'checkUnique',
            value: { username: 'john a' },
          })
            .then(() => {})
            .catch(() => {});
  
          assert.isOk(res, 'no promise returned');
          assert.isFunction(res.then, 'not a function');
        });

        it('handles empty query', function (done) {
          this.timeout(9000);

          verifyReset.create({
            action: 'checkUnique',
            value: {},
          })
            .then(() => {
              done();
            })
            .catch(() => {
              assert.fail(true, false, 'test unexpectedly failed');
            });
        });

        it('handles empty query returning nothing', function (done) {
          this.timeout(9000);

          verifyReset.create({
            action: 'checkUnique',
            value: { username: 'hjhjhj' },
          })
            .then(() => {
              done();
            })
            .catch(() => {
              assert.fail(true, false, 'test unexpectedly failed');
            });
        });

        it('finds single query on single item', function (done) {
          this.timeout(9000);
          const username = 'john a';

          verifyReset.create({
            action: 'checkUnique',
            value: { username },
          })
            .then(() => {
              console.log('1');
              assert.fail(true, false, 'test unexpectedly succeeded');
              
              done();
            })
            .catch(err => {
              assert.equal(err.message, 'Values already taken.');
              assert.equal(err.errors.username, 'Already taken.');

              done();
            });
        });

        it('handles noErrMsg option', function (done) {
          this.timeout(9000);
          const username = 'john a';

          verifyReset.create({
            action: 'checkUnique',
            value: { username },
            meta: { noErrMsg: true },
          })
            .then(() => {
              assert.fail(true, false, 'test unexpectedly succeeded');
            })
            .catch(err => {
              assert.equal(err.message, 'Error'); // feathers default for no error message
              assert.equal(err.errors.username, 'Already taken.');

              done();
            });
        });

        it('finds single query on multiple items', function (done) {
          this.timeout(9000);
          const username = 'john b';

          verifyReset.create({
            action: 'checkUnique',
            value: { username },
          })
            .then(() => {
              assert.fail(true, false, 'test unexpectedly succeeded');
            })
            .catch(err => {
              assert.equal(err.message, 'Values already taken.');
              assert.equal(err.errors.username, 'Already taken.');

              done();
            });
        });

        it('finds multiple queries on same item', function (done) {
          this.timeout(9000);
          const username = 'john a';
          const email = 'a';

          verifyReset.create({
            action: 'checkUnique',
            value: { username, email },
          })
            .then(() => {
              assert.fail(true, false, 'test unexpectedly succeeded');
            })
            .catch(err => {
              assert.equal(err.message, 'Values already taken.');
              assert.equal(err.errors.username, 'Already taken.');

              done();
            });
        });

        it('finds multiple queries on different item', function (done) {
          this.timeout(9000);
          const username = 'john a';
          const email = 'b';

          verifyReset.create({
            action: 'checkUnique',
            value: { username, email },
          })
            .then(() => {
              assert.fail(true, false, 'test unexpectedly succeeded');
            })
            .catch(err => {
              assert.equal(err.message, 'Values already taken.');
              assert.equal(err.errors.username, 'Already taken.');

              done();
            });
        });

        it('ignores null & undefined queries', function (done) {
          this.timeout(9000);

          verifyReset.create({
            action: 'checkUnique',
            value: { username: undefined, email: null },
          })
            .then(() => {
              done();
            })
            .catch(() => {
              assert.fail(true, false, 'test unexpectedly failed');
            });
        });

        it('ignores current user on single item', function (done) {
          this.timeout(9000);
          const username = 'john a';

          verifyReset.create({
            action: 'checkUnique',
            value: { username },
            ownId: 'a',
          })
            .then(() => {
              done();
            })
            .catch(() => {
              assert.fail(true, false, 'test unexpectedly failed');
            });
        });

        it('cannot ignore current user on multiple items', function (done) {
          this.timeout(9000);
          const username = 'john b';

          verifyReset.create({
            action: 'checkUnique',
            value: { username },
            ownId: 'b',
          })
            .then(() => {
              assert.fail(true, false, 'test unexpectedly succeeded');
            })
            .catch(err => {
              assert.equal(err.message, 'Values already taken.');
              assert.equal(err.errors.username, 'Already taken.');

              done();
            });
        });
      });
    });
  });
});

// Helpers

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
