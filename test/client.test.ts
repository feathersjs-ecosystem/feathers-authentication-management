import assert from 'assert';
import { Application, feathers } from '@feathersjs/feathers';
import AuthManagement from '../src/client';
import { AuthenticationManagementClient } from '../src/types';

// users DB
const usersDb = [
  { _id: 'a', email: 'bad', password: 'aa', isVerified: false },
  { _id: 'b', email: 'ok', password: 'bb', isVerified: true }
];

let spyData = null;
let spyParams = null;
let spyAuthenticateEmail;
let spyAuthenticatePassword;

// Fake for authManagementService service
const authLocalMgntFake = function () {
  return function authManagement () { // 'function' needed as we use 'this'
    const app = this;
    const path = 'authManagement';

    app.use(path, {
      create (data, params1, cb) {
        spyData = data;
        spyParams = params1;

        return cb ? cb(null) : Promise.resolve();
      }
    });

    app.authenticate = (obj) => {
      spyAuthenticateEmail = obj.email;
      spyAuthenticatePassword = obj.password;

      const index = usersDb[0].email === obj.email ? 0 : 1;

      return Promise.resolve({ data: usersDb[index] });
    };

    app.log = () => {};
  };
};

// Tests
describe('client.test.ts', () => {
  describe('instantiate', () => {
    it('exists', () => {
      assert.strictEqual(typeof AuthManagement, 'function');
    });
  });

  describe('methods', () => {
    let app: Application;
    let authManagement: AuthenticationManagementClient;

    beforeEach(() => {
      app = feathers();
      app.configure(authLocalMgntFake());
      app.setup();
      authManagement = AuthManagement(app);
    });

    it('checkUnique', async () => {
      await authManagement.checkUnique({ username: 'john a' }, null, true);

      assert.deepStrictEqual(spyParams, {});
      assert.deepStrictEqual(spyData, {
        action: 'checkUnique', value: { username: 'john a' }, ownId: null, meta: { noErrMsg: true }
      });
    });

    it('resendVerify', async () => {
      await authManagement.resendVerifySignup({ email: 'a@a.com'}, { b: 'b' });

      assert.deepStrictEqual(spyParams, {});
      assert.deepStrictEqual(spyData, {
        action: 'resendVerifySignup',
        value: { email: 'a@a.com' },
        notifierOptions: { b: 'b' }
      });
    });

    it('verifySignupLong', async () => {
      await authManagement.verifySignupLong('000');

      assert.deepStrictEqual(spyParams, {});
      assert.deepStrictEqual(spyData, { action: 'verifySignupLong', value: '000' });
    });

    it('verifySignupShort', async () => {
      await authManagement.verifySignupShort('000', { email: 'a@a.com' });

      assert.deepStrictEqual(spyParams, {});
      assert.deepStrictEqual(spyData, {
        action: 'verifySignupShort',
        value: { token: '000', user: { email: 'a@a.com' } }
      });
    });

    it('sendResetPwd', async () => {
      await authManagement.sendResetPwd({ email: 'a@a.com'}, { b: 'b' });

      assert.deepStrictEqual(spyParams, {});
      assert.deepStrictEqual(spyData, {
        action: 'sendResetPwd',
        value: { email: 'a@a.com' },
        notifierOptions: { b: 'b' }
      });
    });

    it('resetPwdLong', async () => {
      await authManagement.resetPwdLong('000', '12345678');

      assert.deepStrictEqual(spyParams, {});
      assert.deepStrictEqual(spyData, {
        action: 'resetPwdLong',
        value: { token: '000', password: '12345678' }
      });
    });

    it('resetPwdShort', async () => {
      await authManagement.resetPwdShort('000', { email: 'a@a.com' }, '12345678');

      assert.deepStrictEqual(spyParams, {});
      assert.deepStrictEqual(spyData, {
        action: 'resetPwdShort',
        value: { token: '000', user: { email: 'a@a.com' }, password: '12345678' }
      });
    });

    it('passwordChange', async () => {
      await authManagement.passwordChange('12345678', 'password', { email: 'a' });

      assert.deepStrictEqual(spyData, {
        action: 'passwordChange', value: { user: { email: 'a' }, oldPassword: '12345678', password: 'password' }
      });
    });

    it('identityChange', async () => {
      await authManagement.identityChange('12345678', { email: 'b@b.com' }, { username: 'q' });

      assert.deepStrictEqual(spyData, {
        action: 'identityChange',
        value: { user: { username: 'q' },
          password: '12345678',
          changes: { email: 'b@b.com' } }
      });
    });

    it('authenticate is verified', async () => {
      const result = await authManagement.authenticate('ok', 'bb');

      assert.strictEqual(spyAuthenticateEmail, 'ok');
      assert.strictEqual(spyAuthenticatePassword, 'bb');
      assert.deepStrictEqual(result, usersDb[1]);
    });

    it('authenticate is not verified', async () => {
      try {
        await authManagement.authenticate('bad', '12345678');

        assert.fail('unexpected succeeded.');
      } catch (err) {
        assert.strictEqual(spyAuthenticateEmail, 'bad');
        assert.strictEqual(spyAuthenticatePassword, '12345678');
        assert.notEqual(err, null);
      }
    });
  });
});
