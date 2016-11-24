
const assert = require('chai').assert;
const randomDigits = require('../src/helpers').randomDigits;
const randomBytes = require('../src/helpers').randomBytes;

describe('randomDigits', () => {
  it('correct length', () => {
    const str = randomDigits(6);
    assert.equal(str.length, 6);
  });

  it('returns different values', () => {
    const str1 = randomDigits(6);
    const str2 = randomDigits(6);

    assert.equal(str1.length, 6);
    assert.equal(str2.length, 6);

    assert.notEqual(str1, str2);
  });
});

describe('randomBytes', () => {
  it('correct length', (done) => {
    randomBytes(10)
      .then(str => {
        assert.equal(str.length, 20);

        done();
      })
      .catch(() => {
        assert.fail(true, false, 'unexpected catch');

        done();
      });
  });

  it('returns different values', (done) => {
    Promise.all([
        randomBytes(10),
        randomBytes(10)
      ])
      .then(([str1, str2]) => {
        assert.equal(str1.length, 20);
        assert.equal(str2.length, 20);
        assert.notEqual(str1, str2);

        done();
      })
      .catch(() => {
        assert.fail(true, false, 'unexpected catch');

        done();
      });
  });
});
