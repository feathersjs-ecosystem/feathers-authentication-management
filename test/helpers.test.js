const assert = require('chai').assert;
const feathers = require('@feathersjs/feathers');
const feathersMemory = require('feathers-memory');
const authLocalMgnt = require('../src/index');
const helpers = require('../src/helpers');
const authManagementService = require('../src/index');

const makeUsersService = options =>
  function (app) {
    Object.assign(options, { multi: true });
    app.use('/users', feathersMemory(options));
  };

const users_Id = [
  { _id: 'a', email: 'a', username: 'john a', sensitiveData: 'some secret' }
];

describe('helpers.js - sanitization', () => {
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

  it('allows for customized sanitize function', async () => {
    const app = feathers();
    app.configure(makeUsersService({ id: '_id' }));
    app.configure(
      authLocalMgnt({
        sanitizeUserForClient: customSanitizeUserForClient
      })
    );
    app.setup();
    const authManagement = app.service('authManagement');

    const usersService = app.service('users');
    await usersService.remove(null);
    await usersService.create(users_Id);

    const result = await authManagement.create({
      action: 'resendVerifySignup',
      value: { email: 'a' }
    });

    assert.isUndefined(result.sensitiveData);
  });
});

function customSanitizeUserForClient (user) {
  const user1 = helpers.sanitizeUserForClient(user);
  delete user1.sensitiveData;
  return user1;
}
