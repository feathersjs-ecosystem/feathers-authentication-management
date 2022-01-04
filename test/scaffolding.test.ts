
import assert from 'assert';
import feathers, { Application } from '@feathersjs/feathers';
import socketio from "@feathersjs/socketio";
import authManagement from '../src/index';
import helpers from '../src/helpers';

import {
  AuthenticationManagementService,
  IdentityChangeService,
  PasswordChangeService,
  ResendVerifySignupService,
  ResetPwdLongService,
  ResetPwdShortService,
  SendResetPwdService,
  VerifySignupLongService,
  VerifySignupSetPasswordLongService,
  VerifySignupSetPasswordShortService,
  VerifySignupShortService,
  CheckUniqueService
} from '../src';
import {
  AuthenticationManagementServiceOptions,
  AuthenticationManagementSetupOptions
} from '../src/types';

import "@feathersjs/transport-commons";

const optionsDefault: AuthenticationManagementServiceOptions = {
  service: '/users', // need exactly this for test suite
  notifier: () => Promise.resolve(),
  longTokenLen: 15, // token's length will be twice this
  shortTokenLen: 6,
  shortTokenDigits: true,
  resetDelay: 1000 * 60 * 60 * 2, // 2 hours
  delay: 1000 * 60 * 60 * 24 * 5, // 5 days
  resetAttempts: 0,
  reuseResetToken: false,
  identifyUserProps: ['email'],
  sanitizeUserForClient: helpers.sanitizeUserForClient,
  skipIsVerifiedCheck: false,
  passwordField: "password"
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
    // @ts-ignore
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
    // @ts-ignore
    before: { create: authManagement.hooks.addVerification('authManagement/org') } // *** which one
  });
}

describe('scaffolding.test.ts', () => {
  describe('can setup 1 service using app.configure', () => {
    let app: Application;

    beforeEach(() => {
      app = feathers();
      app.configure(socketio());
      app.configure(authManagement(userMgntOptions));
      app.configure(services);
      app.setup();
    });

    it('can create an item', async () => {
      const usersService = app.service('/users');

      const user = await usersService.create({ username: 'John Doe' });
      assert.strictEqual(user.username, 'John Doe');
      assert.strictEqual(user.verifyShortToken.length, 8);
    });

    it('can call service', async () => {
      const authLocalMgntService: AuthenticationManagementService = app.service('authManagement');

      const { options } = authLocalMgntService;

      assert.ok(authLocalMgntService.app);
      assert.ok(options.notifier);
      delete options.notifier;

      const expected = Object.assign({}, optionsDefault, userMgntOptions);
      delete expected.notifier;

      assert.deepStrictEqual(options, expected);
    });

    it('create({ action: "options" }) returns options', async () => {
      const authLocalMgntService: AuthenticationManagementService = app.service('authManagement');

      const { options } = authLocalMgntService;

      assert.deepStrictEqual(
        await authLocalMgntService.create({ action: 'options' }),
        options
      );
    });

    it('rejects with no action', async () => {
      const authLocalMgntService: AuthenticationManagementService = app.service('authManagement');

      await assert.rejects(
        //@ts-ignore
        authLocalMgntService.create(),
        "rejects without object"
      )

      await assert.rejects(
        //@ts-ignore
        authLocalMgntService.create({}),
        "rejects with empty object"
      )

      await assert.rejects(
        authLocalMgntService.create({
          //@ts-ignore
          action: "topSecretActionThatDefinitelyDoesntExist"
        }),
        "rejects with unknown action"
      )
    });

    it("does not call publish on authManagement", async () => {
      const usersService = app.service('/users');

      const authManagementService = app.service("authManagement")

      assert.ok(authManagementService, "registered the service");

      let calledUserEvent = false;
      let calledAuthMgmtEvent = false;

      app.publish((data, context) => {
        if (context.path === "users") {
          calledUserEvent = true;
        }
        if (context.path === "authManagement") {
          calledAuthMgmtEvent = true;
          throw "it should not get here";
        }
      });

      await usersService.create({ username: 'John Doe' });
      await new Promise(resolve => setTimeout(resolve, 50));
      assert.strictEqual(calledUserEvent, true, "published user data");
      assert.strictEqual(calledAuthMgmtEvent, false, "not published authManagement data");
    });
  });

  describe('can setup 1 service using app.use', () => {
    let app: Application;

    beforeEach(() => {
      app = feathers();
      app.configure(socketio());
      app.use("/authManagement", new AuthenticationManagementService(app, userMgntOptions));
      app.configure(services);
      app.setup();
    });

    it('can create an item', async () => {
      const usersService = app.service('/users');

      const user = await usersService.create({ username: 'John Doe' });
      assert.strictEqual(user.username, 'John Doe');
      assert.strictEqual(user.verifyShortToken.length, 8);
    });

    it('can call service', async () => {
      const authLocalMgntService: AuthenticationManagementService = app.service('authManagement');

      const { options } = authLocalMgntService;

      assert.ok(authLocalMgntService.app);
      assert.ok(options.notifier);
      delete options.notifier;

      const expected = Object.assign({}, optionsDefault, userMgntOptions);
      delete expected.notifier;

      assert.deepStrictEqual(options, expected);
    });

    it('create({ action: "options" }) returns options', async () => {
      const authLocalMgntService: AuthenticationManagementService = app.service('authManagement');

      const { options } = authLocalMgntService;

      assert.deepStrictEqual(
        await authLocalMgntService.create({ action: 'options' }),
        options
      );
    });

    it('rejects with no action', async () => {
      const authLocalMgntService: AuthenticationManagementService = app.service('authManagement');

      await assert.rejects(
        //@ts-ignore
        authLocalMgntService.create(),
        "rejects without object"
      )

      await assert.rejects(
        //@ts-ignore
        authLocalMgntService.create({}),
        "rejects with empty object"
      )

      await assert.rejects(
        authLocalMgntService.create({
          //@ts-ignore
          action: "topSecretActionThatDefinitelyDoesntExist"
        }),
        "rejects with unknown action"
      )
    });

    it("does not call publish on authManagement", async () => {
      const usersService = app.service('/users');

      const authManagementService = app.service("authManagement")

      assert.ok(authManagementService, "registered the service");

      let calledUserEvent = false;
      let calledAuthMgmtEvent = false;

      app.publish((data, context) => {
        if (context.path === "users") {
          calledUserEvent = true;
        }
        if (context.path === "authManagement") {
          calledAuthMgmtEvent = true;
          throw "it should not get here";
        }
      });

      await usersService.create({ username: 'John Doe' });
      await new Promise(resolve => setTimeout(resolve, 50));
      assert.strictEqual(calledUserEvent, true, "published user data");
      assert.strictEqual(calledAuthMgmtEvent, false, "not published authManagement data");
    });
  });


  describe('can setup 2 services', () => {
    let app: Application;

    beforeEach(() => {
      app = feathers();
      app.configure(authManagement(userMgntOptions));
      app.configure(authManagement(orgMgntOptions));
      app.configure(services);
      app.setup();
    });

    it('can create items', async () => {
      const usersService = app.service('/users');
      const organizationsService = app.service('/organizations');

      // create a user item
      const result = await usersService.create({ username: 'John Doe' });

      assert.strictEqual(result.username, 'John Doe');
      assert.strictEqual(result.verifyShortToken.length, 8);

      // create an organization item
      const result1 = await organizationsService.create({ organization: 'Black Ice' });

      assert.strictEqual(result1.organization, 'Black Ice');
      assert.strictEqual(result1.verifyShortToken.length, 10);
    });

    it('can call services', async () => {
      const authLocalMgntService: AuthenticationManagementService = app.service('authManagement'); // *** the default
      const authMgntOrgService: AuthenticationManagementService = app.service('authManagement/org'); // *** which one

      // call the user instance
      const { options } = authLocalMgntService;

      assert.ok(authLocalMgntService.app);
      assert.ok(options.notifier);
      delete options.notifier;

      const expected = Object.assign({}, optionsDefault, userMgntOptions);
      delete expected.notifier;

      assert.deepStrictEqual(options, expected);

      // call the organization instance
      const options1 = authMgntOrgService.options;

      assert.ok(authMgntOrgService.app);
      assert.ok(options1.notifier);
      delete options1.notifier;

      const expected1 = Object.assign({}, optionsDefault, orgMgntOptions);
      delete expected1.notifier;

      assert.deepStrictEqual(options1, expected1);
    });
  });

  describe('services independently', () => {
    it("can register all services independently at custom routes", () => {
      const app = feathers();
      app.configure(services);
      app.use("am", new AuthenticationManagementService(app));
      app.use("am/2", new IdentityChangeService(app));
      app.use("am/3", new PasswordChangeService(app));
      app.use("am/4", new ResendVerifySignupService(app));
      app.use("am/5", new ResetPwdLongService(app));
      app.use("am/6", new ResetPwdShortService(app));
      app.use("am/7", new SendResetPwdService(app));
      app.use("am/8", new VerifySignupLongService(app));
      app.use("am/9", new VerifySignupSetPasswordLongService(app));
      app.use("am/10", new VerifySignupSetPasswordShortService(app));
      app.use("am/11", new VerifySignupShortService(app));
      app.use("am/1", new CheckUniqueService(app));
      app.setup();

      const servicePaths = Object.keys(app.services);

      const expected = [
        "am", "am/1", "am/2", "am/3", "am/4", "am/5", "am/6", "am/7", "am/8", "am/9", "am/10", "am/11"
      ]

      expected.forEach(path => {
        assert.ok(servicePaths.includes(path), `registered '${path}' correctly`);
      })
    });

    it("fails without options: app", () => {
      const app = feathers();
      app.configure(services);
      const classes = [
        AuthenticationManagementService,
        CheckUniqueService,
        IdentityChangeService,
        PasswordChangeService,
        ResendVerifySignupService,
        ResetPwdLongService,
        ResetPwdShortService,
        SendResetPwdService,
        VerifySignupLongService,
        VerifySignupSetPasswordLongService,
        VerifySignupSetPasswordShortService,
        VerifySignupShortService,
      ];

      classes.forEach(Service => {
        //@ts-expect-error
        assert.throws(() => new Service());
      });
    })
  });
});
