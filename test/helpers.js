const assert = require('chai').assert;
const helpers = require('../src/helpers');
const authManagementService = require('../src/index');
const feathersStubs = require('./../test/helpers/feathersStubs');

describe('helpers - sanitization', () => {
  it('allows to stringify sanitized user object', () => {
    const user = {
      id: 1,
      email: 'test@test.test',
      password: '0000000000',
      resetToken: 'aaa'
    };

    const result1 = helpers.sanitizeUserForClient(user);
    const result2 = helpers.sanitizeUserForNotifier(user);

    assert.doesNotThrow(() => JSON.stringify(result1));
    assert.doesNotThrow(() => JSON.stringify(result2));
  });

  it('throws error when stringifying sanitized object with circular reference', () => {
    const user = {
      id: 1,
      email: 'test@test.test',
      password: '0000000000',
      resetToken: 'aaa'
    };

    user.self = user;

    const result1 = helpers.sanitizeUserForClient(user);
    const result2 = helpers.sanitizeUserForNotifier(user);

    assert.throws(() => JSON.stringify(result1), TypeError);
    assert.throws(() => JSON.stringify(result2), TypeError);
  });

  it('allows to stringify sanitized object with circular reference and custom toJSON()', () => {
    const user = {
      id: 1,
      email: 'test@test.test',
      password: '0000000000',
      resetToken: 'aaa',
      toJSON: function () {
        return Object.assign({}, this, { self: undefined });
      }
    };

    user.self = user;

    const result1 = helpers.sanitizeUserForClient(user);
    const result2 = helpers.sanitizeUserForNotifier(user);

    assert.doesNotThrow(() => JSON.stringify(result1));
    assert.doesNotThrow(() => JSON.stringify(result2));
  });

  it('allows to stringify sanitized object with circular reference and custom toObject()', () => {
    const user = {
      id: 1,
      email: 'test@test.test',
      password: '0000000000',
      resetToken: 'aaa',
      toObject: function () {
        return Object.assign({}, this, { self: undefined });
      }
    };

    user.self = user;

    const result1 = helpers.sanitizeUserForClient(user);
    const result2 = helpers.sanitizeUserForNotifier(user);

    assert.doesNotThrow(() => JSON.stringify(result1));
    assert.doesNotThrow(() => JSON.stringify(result2));
  });

  it('allows for customized sanitize function', (done) => {
    function customSanitizeUserForClient (user) {
      const user1 = helpers.sanitizeUserForClient(user);
      delete user1.sensitiveData;
      return user1;
    }
    const app = feathersStubs.app();
    const usersDb = [
      { _id: 'a', email: 'a', username: 'john a', sensitiveData: 'some secret' }
    ];
    feathersStubs.users(app, usersDb, true);
    authManagementService({
      sanitizeUserForClient: customSanitizeUserForClient
    }).call(app); // define and attach authManagement service
    const authManagement = app.service('authManagement'); // get handle to authManagement

    authManagement.create({
      action: 'resendVerifySignup',
      value: { email: 'a' }
    })
      .then((user) => {
        assert.isUndefined(user.sensitiveData);
        done();
      })
      .catch((err) => {
        assert.fail(true, false, err);
      });
  });
});
