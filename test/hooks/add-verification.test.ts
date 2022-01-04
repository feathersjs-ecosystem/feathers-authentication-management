import assert from 'assert';
import feathers, { Application, HookContext } from '@feathersjs/feathers';
import authLocalMgnt, { AuthenticationManagementService } from "../../src/index";
import { addVerification } from '../../src/hooks';
import { timeoutEachTest } from '../test-helpers/config';
import {
  makeDateTime,
  aboutEqualDateTime
} from '../test-helpers';

describe('add-verification.test.ts', function () {
  describe("default path", function() {
    this.timeout(timeoutEachTest);

    let app: Application;
    let context: HookContext;

    beforeEach(() => {
      app = feathers();

      context = {
        type: 'before',
        method: 'create',
        data: { email: 'a@a.com', password: '0000000000' },
        app,
        params: {
          user: { email: 'b@b.com' }
        }
      } as any as HookContext;
    });

    describe('basics', () => {
      it('works with no options', async () => {
        app.configure(authLocalMgnt());
        app.setup();

        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
        assert.strictEqual(user.verifyToken.length, 30, 'verify token wrong length');
        assert.strictEqual(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      });

      it('delay option works', async () => {
        const options = { delay: 1000 * 60 * 60 * 24 * 5 }; // 5 days
        app.configure(authLocalMgnt(options));
        app.setup();

        context = {
          type: 'before',
          method: 'create',
          data: { email: 'a@a.com', password: '0000000000' },
          app
        } as any as HookContext;

        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
        assert.strictEqual(user.verifyToken.length, 30, 'verify token wrong length');
        assert.strictEqual(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
        assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      });
    });

    describe('long token', () => {
      it('length option works', async () => {
        const options = { longTokenLen: 10 };
        app.configure(authLocalMgnt(options));
        app.setup();

        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
        assert.strictEqual(user.verifyToken.length, (options.longTokenLen) * 2, 'verify token wrong length');
        assert.strictEqual(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/); // small chance of false negative
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      });
    });

    describe('shortToken', () => {
      it('produces digit short token', async () => {
        const options = { shortTokenDigits: true };
        app.configure(authLocalMgnt(options));
        app.setup();

        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.strictEqual(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      });

      it('produces alpha short token', async () => {
        const options = { shortTokenDigits: false };
        app.configure(authLocalMgnt(options));
        app.setup();

        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.strictEqual(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.doesNotMatch(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      });

      it('length option works with digits', async () => {
        const options = { shortTokenLen: 7 };
        app.configure(authLocalMgnt(options));
        app.setup();

        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.strictEqual(user.verifyShortToken.length, 7, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      });

      it('length option works with alpha', async () => {
        const options = { shortTokenLen: 9, shortTokenDigits: false };
        app.configure(authLocalMgnt(options));
        app.setup();

        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.strictEqual(user.verifyShortToken.length, 9, 'verify short token wrong length');
        assert.doesNotMatch(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      });
    });

    describe('patch & update', () => {
      it('works with patch', async () => {
        app.configure(authLocalMgnt());
        app.setup();
        //@ts-ignore
        context.method = 'patch';

        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
        assert.strictEqual(user.verifyToken.length, 30, 'verify token wrong length');
        assert.strictEqual(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      });

      it('works with update', async () => {
        app.configure(authLocalMgnt());
        app.setup();
        //@ts-ignore
        context.method = 'update';

        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
        assert.strictEqual(user.verifyToken.length, 30, 'verify token wrong length');
        assert.strictEqual(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      });

      it('does not modify context if email not updated', async () => {
        app.configure(authLocalMgnt());
        app.setup();
        //@ts-ignore
        context.method = 'update';
        context.params.user.email = 'a@a.com';

        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.deepStrictEqual(user, { email: 'a@a.com', password: '0000000000' }, 'ctx.data modified');
      });
    });
  });

  describe("custom path", function() {
    this.timeout(timeoutEachTest);

    let app: Application;
    let context: HookContext;

    beforeEach(() => {
      app = feathers();

      context = {
        type: 'before',
        method: 'create',
        data: { email: 'a@a.com', password: '0000000000' },
        app,
        params: {
          user: { email: 'b@b.com' }
        }
      } as any as HookContext;
    });

    it('works with no options', async () => {
      app.use("custom-path", new AuthenticationManagementService(app));
      app.setup();

      const ctx = await addVerification("custom-path")(context);
      const user = ctx.data;

      assert.strictEqual(user.isVerified, false, 'isVerified not false');
      assert.strictEqual(typeof user.verifyToken, 'string', 'verifyToken not String');
      assert.strictEqual(user.verifyToken.length, 30, 'verify token wrong length');
      assert.strictEqual(user.verifyShortToken.length, 6, 'verify short token wrong length');
      assert.match(user.verifyShortToken, /^[0-9]+$/);
      aboutEqualDateTime(user.verifyExpires, makeDateTime());
      assert.deepStrictEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
    });
  });
});
