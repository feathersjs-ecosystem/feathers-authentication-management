import assert from 'assert';
import {
  removeVerification
} from '../../src/hooks';

let context;

describe('remove-verification.test.ts', () => {
  beforeEach(() => {
    context = {
      type: 'after',
      method: 'create',
      params: { provider: 'socketio' },
      result: {
        email: 'a@a.com',
        password: '0000000000',
        isVerified: true,
        verifyToken: '000',
        verifyExpires: Date.now(),
        verifyChanges: {},
        resetToken: '000',
        resetExpires: Date.now()
      }
    };
  });

  it('works with verified user', () => {
    assert.doesNotThrow(() => { removeVerification()(context); });

    const user = context.result;
    assert.ok(user.isVerified);
    assert.strictEqual(user.isVerified, true);
    assert.strictEqual(user.verifyToken, undefined);
    assert.strictEqual(user.verifyExpires, undefined);
    assert.strictEqual(user.resetToken, undefined);
    assert.strictEqual(user.resetExpires, undefined);
    assert.strictEqual(user.verifyChanges, undefined);
  });

  it('works with unverified user', () => {
    context.result.isVerified = false;

    assert.doesNotThrow(() => { removeVerification()(context); });

    const user = context.result;
    assert.strictEqual(user.isVerified, false);
    assert.strictEqual(user.isVerified, false);
    assert.strictEqual(user.verifyToken, undefined);
    assert.strictEqual(user.verifyExpires, undefined);
    assert.strictEqual(user.resetToken, undefined);
    assert.strictEqual(user.resetExpires, undefined);
    assert.strictEqual(user.verifyChanges, undefined);
  });

  it('works if addVerification not run', () => {
    context.result = {};

    assert.doesNotThrow(() => { removeVerification()(context); });
  });

  it('noop if server initiated', () => {
    context.params.provider = undefined;
    assert.doesNotThrow(
      () => { removeVerification()(context); }
    );

    const user = context.result;
    assert.ok(user.isVerified);
    assert.strictEqual(user.isVerified, true);
    assert.ok(user.verifyToken);
    assert.ok(user.verifyExpires);
    assert.ok(user.resetToken);
    assert.ok(user.resetExpires);
    assert.ok(user.verifyChanges);
  });

  it('works with multiple verified user', () => {
    context.result = [context.result, context.result];
    assert.doesNotThrow(() => { removeVerification()(context); });

    context.result.forEach(user => {
      assert.ok(user.isVerified);
      assert.strictEqual(user.isVerified, true);
      assert.strictEqual(user.verifyToken, undefined);
      assert.strictEqual(user.verifyExpires, undefined);
      assert.strictEqual(user.resetToken, undefined);
      assert.strictEqual(user.resetExpires, undefined);
      assert.strictEqual(user.verifyChanges, undefined);
    });
  });

  it('does not throw with damaged hook', () => {
    delete context.result;

    assert.doesNotThrow(() => { removeVerification()(context); });
  });

  it('throws if not after', () => {
    context.type = 'before';

    assert.throws(() => { removeVerification()(context); });
  });
});
