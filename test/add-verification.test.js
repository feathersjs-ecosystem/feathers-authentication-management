
const assert = require('chai').assert;
const feathers = require('@feathersjs/feathers');
const authLocalMgnt = require('../src/index');
const { addVerification } = require('../src/index').hooks;
const { defaultVerifyDelay, timeoutEachTest, maxTimeAllTests } = require('./helpers/config');

describe('add-verification.test.js', function () {
  this.timeout(timeoutEachTest);

  let app;
  let context;

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
    };
  });

  describe('basics', () => {
    it('works with no options', async () => {
      app.configure(authLocalMgnt());
      app.setup();

      try {
        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.isString(user.verifyToken, 'verifyToken not String');
        assert.equal(user.verifyToken.length, 30, 'verify token wrong length');
        assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      } catch (err) {
        console.log(err);
        assert(false, 'unexpected error');
      }
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
      };

      try {
        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.isString(user.verifyToken, 'verifyToken not String');
        assert.equal(user.verifyToken.length, 30, 'verify token wrong length');
        assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
        assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      } catch (err) {
        console.log(err);
        assert(false, 'unexpected error');
      }
    });
  });

  describe('long token', () => {
    it('length option works', async () => {
      const options = { longTokenLen: 10 };
      app.configure(authLocalMgnt(options));
      app.setup();

      try {
        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.isString(user.verifyToken, 'verifyToken not String');
        assert.equal(user.verifyToken.length, (options.len || options.longTokenLen) * 2, 'verify token wrong length');
        assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/); // small chance of false negative
        aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
        assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      } catch (err) {
        console.log(err);
        assert(false, 'unexpected error');
      }
    });
  });

  describe('shortToken', () => {
    it('produces digit short token', async () => {
      const options = { shortTokenDigits: true };
      app.configure(authLocalMgnt(options));
      app.setup();

      try {
        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
        assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      } catch (err) {
        console.log(err);
        assert(false, 'unexpected error');
      }
    });

    it('produces alpha short token', async () => {
      const options = { shortTokenDigits: false };
      app.configure(authLocalMgnt(options));
      app.setup();

      try {
        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.notMatch(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
        assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      } catch (err) {
        console.log(err);
        assert(false, 'unexpected error');
      }
    });

    it('length option works with digits', async () => {
      const options = { shortTokenLen: 7 };
      app.configure(authLocalMgnt(options));
      app.setup();

      try {
        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.equal(user.verifyShortToken.length, 7, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
        assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      } catch (err) {
        console.log(err);
        assert(false, 'unexpected error');
      }
    });

    it('length option works with alpha', async () => {
      const options = { shortTokenLen: 9, shortTokenDigits: false };
      app.configure(authLocalMgnt(options));
      app.setup();

      try {
        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.equal(user.verifyShortToken.length, 9, 'verify short token wrong length');
        assert.notMatch(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
        assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      } catch (err) {
        console.log(err);
        assert(false, 'unexpected error');
      }
    });
  });

  describe('patch & update', () => {
    it('works with patch', async () => {
      app.configure(authLocalMgnt());
      app.setup();
      context.method = 'patch';

      try {
        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.isString(user.verifyToken, 'verifyToken not String');
        assert.equal(user.verifyToken.length, 30, 'verify token wrong length');
        assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      } catch (err) {
        console.log(err);
        assert(false, 'unexpected error');
      }
    });

    it('works with update', async () => {
      app.configure(authLocalMgnt());
      app.setup();
      context.method = 'update';

      try {
        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.strictEqual(user.isVerified, false, 'isVerified not false');
        assert.isString(user.verifyToken, 'verifyToken not String');
        assert.equal(user.verifyToken.length, 30, 'verify token wrong length');
        assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
        assert.match(user.verifyShortToken, /^[0-9]+$/);
        aboutEqualDateTime(user.verifyExpires, makeDateTime());
        assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
      } catch (err) {
        console.log(err);
        assert(false, 'unexpected error');
      }
    });

    it('does not modify context if email not updated', async () => {
      app.configure(authLocalMgnt());
      app.setup();
      context.method = 'update';
      context.params.user.email = 'a@a.com';

      try {
        const ctx = await addVerification()(context);
        const user = ctx.data;

        assert.deepEqual(user, { email: 'a@a.com', password: '0000000000' }, 'ctx.data modified');
      } catch (err) {
        console.log(err);
        assert(false, 'unexpected error');
      }
    });
  });
});

function makeDateTime (options1 = {}) {
  return Date.now() + (options1.delay || defaultVerifyDelay);
}

function aboutEqualDateTime (time1, time2, msg, delta = 500) {
  const diff = Math.abs(time1 - time2);
  assert.isAtMost(diff, delta, msg || `times differ by ${diff}ms`);
}
