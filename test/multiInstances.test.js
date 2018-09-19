
/* global assert, describe, it */

const assert = require('chai').assert;
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const authManagement = require('../src/index');
const helpers = require('../src/helpers')

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
  sanitizeUserForClient: helpers.sanitizeUserForClient()
};

const userMgntOptions = {
  service: '/users',
  notifier: () => Promise.resolve(),
  shortTokenLen: 8,
};

const orgMgntOptions = {
  service: '/organizations',
  path: 'authManagement/org', // *** specify path for this instance of service
  notifier: () => Promise.resolve(),
  shortTokenLen: 10,
};

function services() {
  const app = this;
  app.configure(user);
  app.configure(organization);
}

function user() {
  const app = this;

  app.use('/users', {
    create: data => Promise.resolve(data)
  });

  const service = app.service('/users');

  service.hooks({
    before: { create: authManagement.hooks.addVerification() }
  });
}

function organization() {
  const app = this;

  app.use('/organizations', {
    create: data => Promise.resolve(data)
  });

  const service = app.service('/organizations');

  service.hooks({
    before: { create: authManagement.hooks.addVerification('authManagement/org') }, // *** which one
  });
}

describe('multiple services', () => {
  describe('can configure 1 service', () => {
    var app;

    beforeEach(() => {
      app = express(feathers());
      app.configure(authManagement(userMgntOptions))
        .configure(services);
    });

    it('can create an item', (done) => {
      const user = app.service('/users');

      user.create({ username: 'John Doe' })
        .catch(err => {
          console.log(err);
          done(err);
        })
        .then(result => {
          assert.equal(result.username, 'John Doe');
          assert.equal(result.verifyShortToken.length, 8);

          done();
        })
        .catch(done);
    });

    it('can call service', (done) => {
      const userMgnt = app.service('authManagement');

      userMgnt.create({ action: 'options' })
        .catch(err => console.log(err))
        .then(options => {
          assert.property(options, 'app');
          assert.property(options, 'notifier');
          assert.property(options, 'sanitizeUserForClient');
          delete options.app;
          delete options.notifier;
          delete options.sanitizeUserForClient;

          const expected = Object.assign({}, optionsDefault, userMgntOptions);
          delete expected.app;
          delete expected.notifier;
          delete expected.sanitizeUserForClient;

          assert.deepEqual(options, expected);

          done();
        })
        .catch(done);
    });
  });

  describe('can configure 2 services', () => {
    var app;

    beforeEach(() => {
      app = express(feathers());
      app.configure(authManagement(userMgntOptions))
        .configure(authManagement(orgMgntOptions))
        .configure(services);
    });

    it('can create items', (done) => {
      const user = app.service('/users');
      const organization = app.service('/organizations');

      // create a user item
      user.create({ username: 'John Doe' })
        .catch(err => {
          console.log(err);
          done();
        })
        .then(result => {
          assert.equal(result.username, 'John Doe');
          assert.equal(result.verifyShortToken.length, 8);

          // create an organization item
          organization.create({ organization: 'Black Ice' })
            .catch(err => {
              console.log(err);
              done();
            })
            .then(result => {
              assert.equal(result.organization, 'Black Ice');
              assert.equal(result.verifyShortToken.length, 10);

              done();
            });

        });
    });

    it('can call services', (done) => {
      const userMgnt = app.service('authManagement'); // *** the default
      const orgMgnt = app.service('authManagement/org'); // *** which one

      // call the user instance
      userMgnt.create({ action: 'options' })
        .catch(err => console.log(err))
        .then(options => {
          assert.property(options, 'app');
          assert.property(options, 'notifier');
          assert.property(options, 'sanitizeUserForClient');
          delete options.app;
          delete options.notifier;
          delete options.sanitizeUserForClient;

          const expected = Object.assign({}, optionsDefault, userMgntOptions);
          delete expected.app;
          delete expected.notifier;
          delete expected.sanitizeUserForClient;

          assert.deepEqual(options, expected);

          // call the organization instance
          orgMgnt.create({ action: 'options' })
            .catch(err => console.log(err))
            .then(options => {
              assert.property(options, 'app');
              assert.property(options, 'notifier');
              assert.property(options, 'sanitizeUserForClient');
              delete options.app;
              delete options.notifier;
              delete options.sanitizeUserForClient;

              const expected = Object.assign({}, optionsDefault, orgMgntOptions);
              delete expected.app;
              delete expected.notifier;
              delete expected.sanitizeUserForClient;

              assert.deepEqual(options, expected);

              done();
            })
            .catch(done);
        })
        .catch(done);

    });
  });
});
