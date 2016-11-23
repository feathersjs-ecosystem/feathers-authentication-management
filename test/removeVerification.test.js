
/* global assert, describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0 */

const assert = require('chai').assert;
const hooks = require('../lib/index').hooks;

var hookIn;

describe('hook:remove verification', () => {
  beforeEach(() => {
    hookIn = {
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
        resetExpires: Date.now(),
      },
    };
  });

  it('works with verified user', () => {
    assert.doesNotThrow(() => { hooks.removeVerification()(hookIn); });

    const user = hookIn.result;
    assert.property(user, 'isVerified');
    assert.equal(user.isVerified, true);
    assert.notProperty(user, 'verifyToken');
    assert.notProperty(user, 'verifyExpires');
    assert.notProperty(user, 'resetToken');
    assert.notProperty(user, 'resetExpires');
    assert.notProperty(user, 'verifyChanges');
  });

  it('works with unverified used', () => {
    hookIn.result.isVerified = false;

    assert.doesNotThrow(() => { hooks.removeVerification()(hookIn); });

    const user = hookIn.result;
    assert.property(user, 'isVerified');
    assert.equal(user.isVerified, false);
    assert.notProperty(user, 'verifyToken');
    assert.notProperty(user, 'verifyExpires');
    assert.notProperty(user, 'resetToken');
    assert.notProperty(user, 'resetExpires');
    assert.notProperty(user, 'verifyChanges');
  });

  it('works if addVerification not run', () => {
    hookIn.result = {};

    assert.doesNotThrow(() => { hooks.removeVerification()(hookIn); });
  });

  it('noop if server initiated', () => {
    hookIn.params.provider = undefined;
    assert.doesNotThrow(() => { hooks.removeVerification()(hookIn); });

    const user = hookIn.result;
    assert.property(user, 'isVerified');
    assert.equal(user.isVerified, true);
    assert.property(user, 'verifyToken');
    assert.property(user, 'verifyExpires');
    assert.property(user, 'resetToken');
    assert.property(user, 'resetExpires');
    assert.property(user, 'verifyChanges');
  });

  it('throws with damaged hook', () => {
    delete hookIn.result;

    assert.doesNotThrow(() => { hooks.removeVerification()(hookIn); });
  });

  it('throws if not after', () => {
    hookIn.type = 'before';

    assert.throws(() => { hooks.removeVerification()(hookIn); });
  });
});
