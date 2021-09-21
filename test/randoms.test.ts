import assert from 'assert';
import randomDigits from '../src/helpers/random-digits';
import randomBytes from '../src/helpers/random-bytes';

describe('randoms.test.ts', () => {
  describe('randomDigits', () => {
    it('correct length', () => {
      const str = randomDigits(6);
      assert.strictEqual(str.length, 6);
    });

    it('returns different values', () => {
      const str1 = randomDigits(6);
      const str2 = randomDigits(6);

      assert.strictEqual(str1.length, 6);
      assert.strictEqual(str2.length, 6);

      assert.notEqual(str1, str2);
    });
  });

  describe('randomBytes', () => {
    it('correct length', async () => {
      const str = await randomBytes(10);

      assert.strictEqual(str.length, 20);
    });

    it('returns different values', async () => {
      const str1 = await randomBytes(10);
      const str2 = await randomBytes(10);

      assert.strictEqual(str1.length, 20);
      assert.strictEqual(str2.length, 20);
      assert.notEqual(str1, str2);
    });
  });
});
