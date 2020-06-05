
const assert = require('chai').assert;
const feathers = require('@feathersjs/feathers');
const authManagement = require('../src/index');
const helpers = require('../src/helpers');

const optionsDefault = {
  app: null,
  service: '/users', // need exactly this for test suite
  path: 'authManagement',
  notifier: () => Promise.resolve(),
  longTokenLen: 15, // token's length will be twice this
  shortTokenLen: 6,
  shortTokenDigits: true,
  resetDelay: 1000 * 60 * 60 * 2, // 2 hours
  delay: 1000 * 60 * 60 * 24 * 5, // 5 days
  identifyUserProps: ['email'],
  sanitizeUserForClient: helpers.sanitizeUserForClient
};

const userMgntOptions = {
  service: '/users',
  notifier: () => Promise.resolve(),
  shortTokenLen: 8
};

const orgMgntOptions = {
  service: '/organizations',
  path: 'authManagement/org', // *** specify path for this instance of service
  notifier: () => Promise.resolve(),
  shortTokenLen: 10
};

function services () {
  const app = this;
  app.configure(user);
  app.configure(organization);
}

function user () {
  const app = this;

  app.use('/users', {
    async create (data) { return data; }
  });

  const service = app.service('/users');

  service.hooks({
    before: { create: authManagement.hooks.addVerification() }
  });
}

function organization () {
  const app = this;

  app.use('/organizations', {
    async create (data) { return data; }
  });

  const service = app.service('/organizations');

  service.hooks({
    before: { create: authManagement.hooks.addVerification('authManagement/org') } // *** which one
  });
}

describe('scaffolding.js', () => {
  describe('can configure 1 service', () => {
    let app;

    beforeEach(() => {
      app = feathers();
      app.configure(authManagement(userMgntOptions));
      app.configure(services);
      app.setup();
    });

    it('can create an item', async () => {
      const user = app.service('/users');

      const result = await user.create({ username: 'John Doe' });
      assert.equal(result.username, 'John Doe');
      assert.equal(result.verifyShortToken.length, 8);
    });

    it('can call service', async () => {
      const authLocalMgntService = app.service('authManagement');

      const options = await authLocalMgntService.create({ action: 'options' });

      assert.property(options, 'app');
      assert.property(options, 'notifier');
      delete options.app;
      delete options.notifier;

      const expected = Object.assign({}, optionsDefault, userMgntOptions);
      delete expected.app;
      delete expected.notifier;

      assert.deepEqual(options, expected);
    });
  });

  describe('can configure 2 services', () => {
    let app;

    beforeEach(() => {
      app = feathers();
      app.configure(authManagement(userMgntOptions));
      app.configure(authManagement(orgMgntOptions));
      app.configure(services);
      app.setup();
    });

    it('can create items', async () => {
      const user = app.service('/users');
      const organization = app.service('/organizations');

      // create a user item
      const result = await user.create({ username: 'John Doe' });

      assert.equal(result.username, 'John Doe');
      assert.equal(result.verifyShortToken.length, 8);

      // create an organization item
      const result1 = await organization.create({ organization: 'Black Ice' });

      assert.equal(result1.organization, 'Black Ice');
      assert.equal(result1.verifyShortToken.length, 10);
    });

    it('can call services', async () => {
      const authLocalMgntService = app.service('authManagement'); // *** the default
      const authMgntOrgService = app.service('authManagement/org'); // *** which one

      // call the user instance
      const options = await authLocalMgntService.create({ action: 'options' });

      assert.property(options, 'app');
      assert.property(options, 'notifier');
      delete options.app;
      delete options.notifier;

      const expected = Object.assign({}, optionsDefault, userMgntOptions);
      delete expected.app;
      delete expected.notifier;

      assert.deepEqual(options, expected);

      // call the organization instance
      const options1 = await authMgntOrgService.create({ action: 'options' });
      assert.property(options1, 'app');
      assert.property(options1, 'notifier');
      delete options1.app;
      delete options1.notifier;

      const expected1 = Object.assign({}, optionsDefault, orgMgntOptions);
      delete expected1.app;
      delete expected1.notifier;

      assert.deepEqual(options1, expected1);
    });
  });
});
