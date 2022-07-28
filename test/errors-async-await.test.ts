import assert from 'assert';
import errors from '@feathersjs/errors';

describe('errors-async-await.test.ts', () => {
  describe('1 deep', () => {
    describe('call as async function', () => {
      it('successful', async () => {
        try {
          const result = await service('ok');
          assert.strictEqual(result, 'service ok');
        } catch (err) {
          assert.fail(`unexpected error: ${err.message}`);
        }
      });

      it('throw', async () => {
        try {
          const result = await service('throw');
          assert.strictEqual(result, 'service ok');
        } catch (err) {
          assert.strictEqual(err.message, 'service throw');
        }
      });
    });

    describe('call expecting Promise', () => {
      it('successful', () => {
        return service('ok')
          .then(result => {
            assert.strictEqual(result, 'service ok');
          })
          .catch(err => {
            assert.fail(`unexpected error: ${err.message}`);
          });
      });

      it('throw', () => {
        return service('throw')
          .then(result => {
            assert.fail(`unexpectedly succeeded`);
          })
          .catch(err => {
            assert.strictEqual(err.message, 'service throw');
          });
      });
    });
  });

  describe('2 deep', () => {
    describe('call as async function', () => {
      it('successful', async () => {
        try {
          const result = await service('passwordChange', 'ok');
          assert.strictEqual(result, 'passwordChange ok');
        } catch (err) {
          assert.fail(`unexpected error: ${err.message}`);
        }
      });

      it('throw', async () => {
        try {
          const result = await service('passwordChange', 'throw');
          assert.strictEqual(result, 'service ok');
        } catch (err) {
          assert.strictEqual(err.message, 'passwordChange throw');
        }
      });
    });

    describe('call expecting Promise', () => {
      it('successful', () => {
        return service('passwordChange', 'ok')
          .then(result => {
            assert.strictEqual(result, 'passwordChange ok');
          })
          .catch(err => {
            assert.fail(`unexpected error: ${err.message}`);
          });
      });

      it('throw', () => {
        return service('passwordChange', 'throw')
          .then(result => {
            assert.fail(`unexpectedly succeeded`);
          })
          .catch(err => {
            assert.strictEqual(err.message, 'passwordChange throw');
          });
      });
    });
  });

  describe('3 deep', () => {
    describe('call as async function', () => {
      it('successful', async () => {
        try {
          const result = await service('passwordChange', 'ensureValuesAreStrings', 'ok');
          assert.strictEqual(result, 'ensureValuesAreStrings ok');
        } catch (err) {
          assert.fail(`unexpected error: ${err.message}`);
        }
      });

      it('throw', async () => {
        try {
          const result = await service('passwordChange', 'ensureValuesAreStrings', 'throw');
          assert.strictEqual(result, 'service ok');
        } catch (err) {
          assert.strictEqual(err.message, 'ensureValuesAreStrings throw');
        }
      });
    });

    describe('call expecting Promise', () => {
      it('successful', () => {
        return service('passwordChange', 'ensureValuesAreStrings', 'ok')
          .then(result => {
            assert.strictEqual(result, 'ensureValuesAreStrings ok');
          })
          .catch(err => {
            assert.fail(`unexpected error: ${err.message}`);
          });
      });

      it('throw', () => {
        return service('passwordChange', 'ensureValuesAreStrings', 'throw')
          .then(result => {
            assert.fail(`unexpectedly succeeded`);
          })
          .catch(err => {
            assert.strictEqual(err.message, 'ensureValuesAreStrings throw');
          });
      });
    });
  });
});

async function service (action, param1?, param2?) {
  switch (action) {
    case 'ok':
      return 'service ok';
    case 'passwordChange':
      try {
        return await passwordChange(param1, param2);
      } catch (err) {
        return Promise.reject(err);
      }
    case 'throw':
      throw new errors.BadRequest('service throw');
    default:
      throw new errors.BadRequest('service throw default');
  }
}

async function passwordChange (param1, param2) {
  switch (param1) {
    case 'ok':
      return 'passwordChange ok';
    case 'throw':
      throw new errors.BadRequest('passwordChange throw');
    case 'ensureValuesAreStrings':
      return await ensureValuesAreStrings(param2);
    default:
      throw new errors.BadRequest('passwordChange throw default');
  }
}

async function ensureValuesAreStrings (param2) {
  switch (param2) {
    case 'ok':
      return 'ensureValuesAreStrings ok';
    case 'throw':
      throw new errors.BadRequest('ensureValuesAreStrings throw');
    default:
      throw new errors.BadRequest('ensureValuesAreStrings throw default');
  }
}
