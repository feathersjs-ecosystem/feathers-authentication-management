import { BadRequest } from '@feathersjs/errors';
import makeDebug from 'debug';
import checkUnique from '../check-unique';
import identityChange from '../identity-change';
import passwordChange from '../password-change';
import resendVerifySignup from '../resend-verify-signup';
import sanitizeUserForClient from '../helpers/sanitize-user-for-client';
import sendResetPwd from '../send-reset-pwd';
import { resetPwdWithLongToken, resetPwdWithShortToken } from '../reset-password';
import { verifySignupWithLongToken, verifySignupWithShortToken } from '../verify-signup';
import { verifySignupSetPasswordWithLongToken, verifySignupSetPasswordWithShortToken } from '../verify-signup-set-password';
import {
  AuthenticationManagementData,
  AuthenticationManagementOptions,
  AuthenticationManagementOptionsDefault,
  DataCheckUniqueWithAction,
  DataIdentityChangeWithAction,
  DataOptions,
  DataPasswordChangeWithAction,
  DataResendVerifySignupWithAction,
  DataResetPwdLongWithAction,
  DataResetPwdShortWithAction,
  DataSendResetPwdWithAction,
  DataVerifySignupLongWithAction,
  DataVerifySignupSetPasswordLongWithAction,
  DataVerifySignupSetPasswordShortWithAction,
  DataVerifySignupShortWithAction,
  SanitizedUser
} from '../types';

const debug = makeDebug('authLocalMgnt:service');

// TODO: move this to options
const passwordField = 'password';

const optionsDefault: AuthenticationManagementOptionsDefault = {
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
  passwordField: 'password'
};

export default function authenticationLocalManagement (
  options1?: Partial<AuthenticationManagementOptions>,
  docs?: Record<string, unknown>
): () => void {
  debug('service being configured.');

  docs = docs ?? {};

  return function () {
    const options = Object.assign({}, optionsDefault, options1, { app: this });
    options.app.use(options.path, new AuthenticationManagementService(options, docs));
  };
}

export class AuthenticationManagementService {
  docs: unknown;
  options: AuthenticationManagementOptions;

  constructor (options: AuthenticationManagementOptions, docs: unknown) {
    this.docs = docs;
    this.options = options;
  }

  async create (data: DataCheckUniqueWithAction): Promise<null>
  async create (data: DataResendVerifySignupWithAction): Promise<SanitizedUser>
  async create (data: DataVerifySignupLongWithAction): Promise<SanitizedUser>
  async create (data: DataVerifySignupShortWithAction): Promise<SanitizedUser>
  async create (data: DataVerifySignupSetPasswordLongWithAction): Promise<SanitizedUser>
  async create (data: DataVerifySignupSetPasswordShortWithAction): Promise<SanitizedUser>
  async create (data: DataSendResetPwdWithAction): Promise<SanitizedUser>
  async create (data: DataResetPwdLongWithAction): Promise<SanitizedUser>
  async create (data: DataResetPwdShortWithAction): Promise<SanitizedUser>
  async create (data: DataPasswordChangeWithAction): Promise<SanitizedUser>
  async create (data: DataIdentityChangeWithAction): Promise<SanitizedUser>
  async create (data: DataOptions): Promise<AuthenticationManagementOptions>
  async create (data: AuthenticationManagementData): Promise<unknown> {
    debug(`create called. action=${data.action}`);

    switch (data.action) {
      case 'checkUnique':
        try {
          return await checkUnique(
            this.options,
            data.value,
            data.ownId ?? null,
            data.meta ?? {}
          );
        } catch (err) {
          return await Promise.reject(err); // support both async and Promise interfaces
        }
      case 'resendVerifySignup':
        try {
          return await resendVerifySignup(
            this.options,
            data.value,
            data.notifierOptions
          );
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'verifySignupLong':
        try {
          return await verifySignupWithLongToken(
            this.options,
            data.value,
            data.notifierOptions
          );
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'verifySignupShort':
        try {
          return await verifySignupWithShortToken(
            this.options,
            data.value.token,
            data.value.user,
            data.notifierOptions
          );
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'verifySignupSetPasswordLong':
        try {
          return await verifySignupSetPasswordWithLongToken(
            this.options,
            data.value.token,
            data.value.password,
            passwordField,
            data.notifierOptions
          );
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'verifySignupSetPasswordShort':
        try {
          return await verifySignupSetPasswordWithShortToken(
            this.options,
            data.value.token,
            data.value.user,
            data.value.password,
            passwordField,
            data.notifierOptions
          );
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'sendResetPwd':
        try {
          return await sendResetPwd(
            this.options,
            data.value,
            passwordField,
            data.notifierOptions
          );
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'resetPwdLong':
        try {
          return await resetPwdWithLongToken(
            this.options,
            data.value.token,
            data.value.password,
            passwordField,
            data.notifierOptions
          );
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'resetPwdShort':
        try {
          return await resetPwdWithShortToken(
            this.options,
            data.value.token,
            data.value.user,
            data.value.password,
            passwordField,
            data.notifierOptions
          );
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'passwordChange':
        try {
          return await passwordChange(
            this.options,
            data.value.user,
            data.value.oldPassword,
            data.value.password,
            passwordField,
            data.notifierOptions
          );
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'identityChange':
        try {
          return await identityChange(
            this.options,
            data.value.user,
            data.value.password,
            data.value.changes,
            passwordField,
            data.notifierOptions
          );
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'options':
        return this.options;
      default:
        // @ts-expect-error this should not be reached
          throw new BadRequest(`Action '${data.action}' is invalid.`, { // eslint-disable-line
          errors: { $className: 'badParams' }
        });
    }
  }
}
