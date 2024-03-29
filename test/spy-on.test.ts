
import assert from 'assert';
import { SpyOn } from './test-helpers';

describe('spy-on.test.ts', () => {
  it('works with functions without callbacks', () => {
    const spy = SpyOn(test);
    spy.callWith(1, 2, 3);
    spy.callWith(4, 5, 6);

    assert.deepStrictEqual(spy.result(), [
      { args: [1, 2, 3], result: ['y', false, [1, 2, 3]] },
      { args: [4, 5, 6], result: ['y', false, [4, 5, 6]] }
    ]);

    function test (a, b, c) { return ['y', false, [a, b, c]]; }
  });

  it('works with functions with a callback', (done) => {
    const spy = SpyOn(testCb);
    spy.callWithCb(1, 2, 3, (x, y, z) => {
      assert.strictEqual(x, 'a');
      assert.strictEqual(y, true);
      assert.deepStrictEqual(z, [1, 2, 3]);

      spy.callWithCb(8, 9, 0, (x, y, z) => {
        assert.strictEqual(x, 'a');
        assert.strictEqual(y, true);
        assert.deepStrictEqual(z, [8, 9, 0]);

        assert.deepStrictEqual(spy.result(), [
          { args: [1, 2, 3], result: ['a', true, [1, 2, 3]] },
          { args: [8, 9, 0], result: ['a', true, [8, 9, 0]] }
        ]);
        done();
      });
    });

    function testCb (a, b, c, cb) {
      setTimeout(() => (cb('a', true, [a, b, c])), 0);
    }
  });
});
