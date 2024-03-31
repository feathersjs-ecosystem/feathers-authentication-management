// Wrapper for client interface to feathers-authenticate-management

import { defaultPath } from './options';
import type { AuthenticationClient } from '@feathersjs/authentication-client';
import type { Application, NullableId } from '@feathersjs/feathers';

import type {
  AuthenticationManagementClient,
  IdentifyUser,
  User,
  NotifierOptions,
  ClientOptions
} from './types';

declare module '@feathersjs/feathers' {
  interface Application {
    authenticate: AuthenticationClient['authenticate']
    logout: AuthenticationClient['logout']
  }
}

const defaultOptions: ClientOptions = {
  path: defaultPath
};

function makeClient (app: Application, _options?: Partial<ClientOptions>): AuthenticationManagementClient {
  const options: ClientOptions = Object.assign({}, defaultOptions, _options);

  const {
    path
  } = options;

  const authManagement = app.service(path);

  const client: AuthenticationManagementClient = {
    checkUnique: async (identifyUser: IdentifyUser, ownId?: NullableId, ifErrMsg?: boolean) => {
      await authManagement.create({
        action: 'checkUnique',
        value: identifyUser,
        ownId,
        meta: { noErrMsg: ifErrMsg }
      });
    },
    resendVerifySignup: async (identifyUser: IdentifyUser, notifierOptions?: NotifierOptions) => {
      await authManagement.create({
        action: 'resendVerifySignup',
        value: identifyUser,
        notifierOptions
      });
    },
    verifySignupLong: async (verifyToken: string) => {
      await authManagement.create({
        action: 'verifySignupLong',
        value: verifyToken
      });
    },

    verifySignupShort: async (verifyShortToken: string, identifyUser: IdentifyUser) => {
      await authManagement.create({
        action: 'verifySignupShort',
        value: {
          token: verifyShortToken,
          user: identifyUser
        }
      });
    },

    sendResetPwd: async (identifyUser: IdentifyUser, notifierOptions?: NotifierOptions) => {
      await authManagement.create({
        action: 'sendResetPwd',
        value: identifyUser,
        notifierOptions
      });
    },

    resetPwdLong: async (resetToken: string, password: string) => {
      await authManagement.create({
        action: 'resetPwdLong',
        value: {
          password,
          token: resetToken
        }
      });
    },

    resetPwdShort: async (resetShortToken: string, identifyUser: IdentifyUser, password: string) => {
      await authManagement.create({
        action: 'resetPwdShort',
        value: {
          password,
          token: resetShortToken,
          user: identifyUser
        }
      });
    },

    passwordChange: async (oldPassword: string, password: string, identifyUser: IdentifyUser) => {
      await authManagement.create({
        action: 'passwordChange',
        value: {
          oldPassword,
          password,
          user: identifyUser
        }
      });
    },

    identityChange: async (password: string, changesIdentifyUser: Record<string, unknown>, identifyUser: IdentifyUser) => {
      await authManagement.create({
        action: 'identityChange',
        value: {
          user: identifyUser,
          password,
          changes: changesIdentifyUser
        }
      });
    },

    authenticate: async (
      email: string,
      password: string,
      cb?: (err: Error | null, user?: Partial<User>) => void
    ): Promise<unknown> => {
      let cbCalled = false;

      const authResult = await app.authenticate({ type: 'local', email, password });
      const user = authResult.data;

      try {
        if (!user || !user.isVerified) {
          await app.logout();
          return cb && cb(new Error(user ? 'User\'s email is not verified.' : 'No user returned.'));
        }

        if (cb) {
          cbCalled = true;
          return cb(null, user);
        }

        return user;
      } catch (err) {
        if (!cbCalled && cb) {
          cb(err as Error);
        }
      }
    }
  };

  return client;
}

export default makeClient;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = makeClient;
}
