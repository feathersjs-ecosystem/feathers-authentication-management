
/* global describe, it */
/* eslint  no-shadow: 0, no-var: 0, one-var: 0, one-var-declaration-per-line: 0 */

const assert = require('chai').assert;
const hooks = require('../src/index').hooks;

var hookIn;

describe('hook:isVerified', () => {
  beforeEach(() => {
    hookIn = {
      type: 'before',
      method: 'create',
      params: { user: { email: 'a@a.com', password: '0000000000' } }
    };
  });

  it('works with verified used', () => {
    hookIn.params.user.isVerified = true;

    assert.doesNotThrow(() => { hooks.isVerified()(hookIn); });
  });

  it('throws with unverified user', () => {
    hookIn.params.user.isVerified = false;

    assert.throws(() => { hooks.isVerified()(hookIn); });
  });

  it('throws if addVerification not run', () => {
    assert.throws(() => { hooks.isVerified()(hookIn); });
  });

  it('throws if populate not run', () => {
    delete hookIn.params.user;

    assert.throws(() => { hooks.isVerified()(hookIn); });
  });

  it('throws with damaged hook', () => {
    delete hookIn.params;

    assert.throws(() => { hooks.isVerified()(hookIn); });
  });

  it('throws if not before', () => {
    hookIn.type = 'after';

    assert.throws(() => { hooks.isVerified()(hookIn); });
  });
});
