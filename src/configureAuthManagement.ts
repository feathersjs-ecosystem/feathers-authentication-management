import makeDebug from 'debug';

import actionServiceClassMap from './helpers/action-service-class-map';
import {
  AuthenticationManagementAction,
  AuthenticationManagementConfigureOptions,
  AuthenticationManagementServiceOptions,
  AuthenticationManagementServiceOptionsDefault
} from './types';
import { AuthenticationManagementService } from './service/AuthenticationManagementService';
import { Application } from '@feathersjs/feathers';
import { makeDefaultOptions } from './service';

const debug = makeDebug('authLocalMgnt:service');

const getSeparateServicesPaths = (
  path: string,
  options?: Partial<Pick<AuthenticationManagementConfigureOptions, 'useSeparateServices'>>
): Partial<Record<AuthenticationManagementAction, string>> => {
  if (options?.useSeparateServices === false) {
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

  return servicePaths;
};

export const defaultConfigureOptions = {
  path: 'authManagement',
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

export const makeDefaultConfigureOptions = (): AuthenticationManagementConfigureOptions => {
  const defaultServiceOptions: AuthenticationManagementServiceOptionsDefault = makeDefaultOptions([
    'service',
    'notifier',
    'longTokenLen',
    'shortTokenLen',
    'shortTokenDigits',
    'resetDelay',
    'delay',
    'resetAttempts',
    'reuseResetToken',
    'identifyUserProps',
    'sanitizeUserForClient',
    'skipIsVerifiedCheck',
    'passwordField'
  ]);

  return Object.assign({}, defaultServiceOptions, defaultConfigureOptions);
};

export default function authenticationLocalManagement (
  providedOptions?: Partial<AuthenticationManagementConfigureOptions>,
  docs?: Record<string, unknown>
): (app: Application) => void {
  debug('service being configured.');

  docs = docs ?? {};

  return function (app) {
    const defaultOptions = makeDefaultConfigureOptions();
    const options: AuthenticationManagementServiceOptions & AuthenticationManagementConfigureOptions = Object.assign(
      {},
      defaultOptions,
      providedOptions,
      {
        app
      });
    const { path } = options;
    const useSeparateServices = getSeparateServicesPaths(path, providedOptions);
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
