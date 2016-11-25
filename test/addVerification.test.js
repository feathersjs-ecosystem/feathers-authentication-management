
/* global assert, describe, it */
/* eslint no-param-reassign: 0, no-shadow: 0, no-var: 0, one-var: 0,
 one-var-declaration-per-line: 0 */

const assert = require('chai').assert;
const authManagement = require('../src/index');
const hooks = require('../src/index').hooks;

const defaultVerifyDelay = 1000 * 60 * 60 * 24 * 5; // 5 days

var hookIn;
var options;

describe('hook:addVerification', () => {
  beforeEach(() => {
    hookIn = {
      type: 'before',
      method: 'create',
      data: { email: 'a@a.com', password: '0000000000' },
    };
    options = {};
    authManagement();
  });
  
  describe('basics', () => {
    it('works with no options', (done) => {
      hooks.addVerification()(hookIn)
        .then(hook => {
          const user = hook.data;
          
          assert.strictEqual(user.isVerified, false, 'isVerified not false');
          assert.isString(user.verifyToken, 'verifyToken not String');
          assert.equal(user.verifyToken.length, 30, 'verify token wrong length');
          assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
          assert.match(user.verifyShortToken, /^[0-9]+$/);
          aboutEqualDateTime(user.verifyExpires, makeDateTime());
          assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
          
          done();
        })
        .catch(() => {
          assert.fail(true, false, 'unexpected error');
          
          done();
        });
    });
    
    it('delay option works', (done) => {
      options = { delay: 1000 * 60 * 60 * 24 * 15 }; // 5 days}
      
      hooks.addVerification(options)(hookIn)
        .then(hook => {
          const user = hook.data;
          
          assert.strictEqual(user.isVerified, false, 'isVerified not false');
          assert.isString(user.verifyToken, 'verifyToken not String');
          assert.equal(user.verifyToken.length, 30, 'verify token wrong length');
          assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
          assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
          assert.match(user.verifyShortToken, /^[0-9]+$/);
          aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
          assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
          
          done();
        })
        .catch(() => {
          assert.fail(true, false, 'unexpected error');
          
          done();
        });
    });
  });
  
  describe('long token', () => {
    it('length option works', (done) => {
      options = { longTokenLen: 10 };
      hooks.addVerification(options)(hookIn)
        .then(hook => {
          const user = hook.data;
          
          assert.strictEqual(user.isVerified, false, 'isVerified not false');
          assert.isString(user.verifyToken, 'verifyToken not String');
          assert.equal(user.verifyToken.length, (options.len || options.longTokenLen) * 2, 'verify token wrong length');
          assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
          assert.match(user.verifyShortToken, /^[0-9]+$/); // small chance of false negative
          aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
          assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
          
          done();
        })
        .catch(() => {
          assert.fail(true, false, 'unexpected error');
          
          done();
        });
    });
  });
  
  describe('shortToken', () => {
    it('produces digit short token', (done) => {
      options = { shortTokenDigits: true };
      hooks.addVerification(options)(hookIn)
        .then(hook => {
          const user = hook.data;
          
          assert.strictEqual(user.isVerified, false, 'isVerified not false');
          assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
          assert.match(user.verifyShortToken, /^[0-9]+$/);
          aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
          assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
          
          done();
        })
        .catch(() => {
          assert.fail(true, false, 'unexpected error');
          
          done();
        });
    });
    
    it('produces alpha short token', (done) => {
      options = { shortTokenDigits: false };
      hooks.addVerification(options)(hookIn)
        .then(hook => {
          const user = hook.data;
          
          assert.strictEqual(user.isVerified, false, 'isVerified not false');
          assert.equal(user.verifyShortToken.length, 6, 'verify short token wrong length');
          assert.notMatch(user.verifyShortToken, /^[0-9]+$/);
          aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
          assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
          
          done();
        })
        .catch(() => {
          assert.fail(true, false, 'unexpected error');
          
          done();
        });
    });
    
    it('length option works with digits', (done) => {
      options = { shortTokenLen: 7 };
      hooks.addVerification(options)(hookIn)
        .then(hook => {
          const user = hook.data;
          
          assert.strictEqual(user.isVerified, false, 'isVerified not false');
          assert.equal(user.verifyShortToken.length, 7, 'verify short token wrong length');
          assert.match(user.verifyShortToken, /^[0-9]+$/);
          aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
          assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
          
          done();
        })
        .catch(() => {
          assert.fail(true, false, 'unexpected error');
          
          done();
        });
    });
    
    it('length option works with alpha', (done) => {
      options = { shortTokenLen: 9, shortTokenDigits: false };
      hooks.addVerification(options)(hookIn)
        .then(hook => {
          const user = hook.data;
          
          assert.strictEqual(user.isVerified, false, 'isVerified not false');
          assert.equal(user.verifyShortToken.length, 9, 'verify short token wrong length');
          assert.notMatch(user.verifyShortToken, /^[0-9]+$/);
          aboutEqualDateTime(user.verifyExpires, makeDateTime(options));
          assert.deepEqual(user.verifyChanges, {}, 'verifyChanges not empty object');
          
          done();
        })
        .catch(() => {
          assert.fail(true, false, 'unexpected error');
          
          done();
        });
    });
  });
  
  
  it('throws if not before', () => {
    hookIn.type = 'after';
    
    assert.throws(() => { hooks.isVerified()(hookIn); });
  });
  
  it('throws if not create', () => {
    hookIn.method = 'update';
    
    assert.throws(() => { hooks.isVerified()(hookIn); });
  });
});

function makeDateTime(options1) {
  options1 = options1 || {};
  return Date.now() + (options1.delay || defaultVerifyDelay);
}

function aboutEqualDateTime(time1, time2, msg, delta) {
  delta = delta || 500;
  const diff = Math.abs(time1 - time2);
  assert.isAtMost(diff, delta, msg || `times differ by ${diff}ms`);
}
