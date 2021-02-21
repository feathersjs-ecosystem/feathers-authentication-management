import makeDebug from 'debug';
import sanitizeUserForClient from './helpers/sanitize-user-for-client';
import actionServiceClassMap from './helpers/action-service-class-map';
import {
  AuthenticationManagementOptions,
  AuthenticationManagementOptionsDefault,
  AuthenticationManagementAction
} from './types';
import { AuthenticationManagementService } from './service/AuthenticationManagementService';
import { Application } from '@feathersjs/feathers';

const debug = makeDebug('authLocalMgnt:service');

export const optionsDefault: AuthenticationManagementOptionsDefault = {
  app: null, // value set during configuration
  service: '/users', // need exactly this for test suite
  path: 'authManagement',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifier: async () => {},
  longTokenLen: 15, // token's length will be twice this
  shortTokenLen: 6,
  shortTokenDigits: true,
  resetDelay: 1000 * 60 * 60 * 2, // 2 hours
  delay: 1000 * 60 * 60 * 24 * 5, // 5 days
  resetAttempts: 0,
  reuseResetToken: false,
  identifyUserProps: ['email'],
  sanitizeUserForClient,
  skipIsVerifiedCheck: false,
  passwordField: 'password',
  useSeparateServices: {
    checkUnique: 'authManagement/check-unique',
    identityChange: 'authManagement/identity-change',
    passwordChange: 'authManagement/password-change',
    resendVerifySignup: 'authManagement/resend-verify-signup',
    resetPwdLong: 'authManagement/reset-password-long',
    resetPwdShort: 'authManagement/reset-password-short',
    sendResetPwd: 'authManagement/send-reset-pwd',
    verifySignupLong: 'authManagement/verify-signup-long',
    verifySignupSetPasswordLong: 'authManagement/verify-signup-set-password-long',
    verifySignupSetPasswordShort: 'authManagement/verify-signup-set-password-short',
    verifySignupShort: 'authManagement/verify-signup-short'
  }
};

const setSeparateServicesPaths = (
  path: string,
  options?: Partial<Pick<AuthenticationManagementOptions, 'useSeparateServices'>>
): Partial<Record<AuthenticationManagementAction, string>> => {
  if (options?.useSeparateServices === false) {
    if (options) options.useSeparateServices = {};
    return {};
  }

  if (path.endsWith('/')) { path = path.slice(0, -1); }
  const servicePaths: Record<Exclude<AuthenticationManagementAction, 'options'>, string> = {
    checkUnique: `${path}/check-unique`,
    identityChange: `${path}/identity-change`,
    passwordChange: `${path}/password-change`,
    resendVerifySignup: `${path}/resend-verify-signup`,
    resetPwdLong: `${path}/reset-password-long`,
    resetPwdShort: `${path}/reset-password-short`,
    sendResetPwd: `${path}/send-reset-pwd`,
    verifySignupLong: `${path}/verify-signup-long`,
    verifySignupSetPasswordLong: `${path}/verify-signup-set-password-long`,
    verifySignupSetPasswordShort: `${path}/verify-signup-set-password-short`,
    verifySignupShort: `${path}/verify-signup-short`
  };

  if (
    !options ||
    !Object.prototype.hasOwnProperty.call(options, 'useSeparateServices') ||
    options?.useSeparateServices === true
  ) {
    if (options) options.useSeparateServices = servicePaths;
    return servicePaths;
  }

  const customKeys = (typeof options.useSeparateServices === 'object')
    ? Object.keys(options.useSeparateServices)
    : [];

  for (const key of customKeys) {
    const val = options.useSeparateServices[key];
    if (val === true || !servicePaths[key]) { continue; }
    if (val === false) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete servicePaths[key];
    }
    if (typeof val === 'string') {
      servicePaths[key] = val;
    }
  }

  options.useSeparateServices = servicePaths;
  return servicePaths;
};

export default function authenticationLocalManagement (
  providedOptions?: Partial<AuthenticationManagementOptions>,
  docs?: Record<string, unknown>
): (app: Application) => void {
  debug('service being configured.');

  docs = docs ?? {};

  return function (app) {
    const options: AuthenticationManagementOptions = Object.assign({}, optionsDefault, providedOptions, { app });
    const { path } = options;
    const useSeparateServices = setSeparateServicesPaths(path, providedOptions);
    options.useSeparateServices = useSeparateServices;
    app.use(options.path, new AuthenticationManagementService(options, docs));

    // separate paths

    for (const [action, path] of Object.entries(useSeparateServices)) {
      const Service = actionServiceClassMap[action];
      app.use(path, new Service(options));
    }
  };
}

export { AuthenticationManagementService };
