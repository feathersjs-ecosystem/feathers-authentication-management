import { BadRequest } from '@feathersjs/errors';
import makeDebug from 'debug';
import sanitizeUserForClient from '../helpers/sanitize-user-for-client';
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
import { CheckUniqueService } from './CheckUniqueService';
import { IdentityChangeService } from './IdentityChangeService';
import { ResendVerifySignupService } from './ResendVerifySignupService';
import { ResetPwdLongService } from './ResetPwdLongService';
import { ResetPwdShortService } from './ResetPwdShortService';
import { SendResetPwdService } from './SendResetPwdService';
import { VerifySignupLongService } from './VerifySignupLongService';
import { VerifySignupSetPasswordLongService } from './VerifySignupSetPasswordLongService';
import { VerifySignupSetPasswordShortService } from './VerifySignupSetPasswordShortService';
import { VerifySignupShortService } from './VerifySignupShort';
import { PasswordChangeService } from './PasswordChangeService';

const debug = makeDebug('authLocalMgnt:service');

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
  checkUniqueService: CheckUniqueService;
  identityChangeService: IdentityChangeService;
  passwordChangeService: PasswordChangeService;
  resendVerifySignupService: ResendVerifySignupService;
  resetPwdLongService: ResetPwdLongService;
  resetPwdShortService: ResetPwdShortService;
  sendResetPwdService: SendResetPwdService;
  verifySignupLongService: VerifySignupLongService;
  verifySignupSetPasswordLongService: VerifySignupSetPasswordLongService;
  verifySignupSetPasswordShortService: VerifySignupSetPasswordShortService;
  verifySignupShortService: VerifySignupShortService;

  constructor (options: AuthenticationManagementOptions, docs: unknown) {
    this.docs = docs;
    this.options = options;

    this.checkUniqueService = new CheckUniqueService(options);
    this.identityChangeService = new IdentityChangeService(options);
    this.passwordChangeService = new PasswordChangeService(options);
    this.resendVerifySignupService = new ResendVerifySignupService(options);
    this.resetPwdLongService = new ResetPwdLongService(options);
    this.resetPwdShortService = new ResetPwdShortService(options);
    this.sendResetPwdService = new SendResetPwdService(options);
    this.verifySignupLongService = new VerifySignupLongService(options);
    this.verifySignupSetPasswordLongService = new VerifySignupSetPasswordLongService(options);
    this.verifySignupSetPasswordShortService = new VerifySignupSetPasswordShortService(options);
    this.verifySignupShortService = new VerifySignupShortService(options);
  }

  /**
   * check props are unique in the users items.
   */
  async create (data: DataCheckUniqueWithAction): Promise<null>
  /**
   * resend sign up verification notification
   */
  async create (data: DataResendVerifySignupWithAction): Promise<SanitizedUser>
  /**
   * sign up or identityChange verification with long token
   */
  async create (data: DataVerifySignupLongWithAction): Promise<SanitizedUser>
  /**
   * sign up or identityChange verification with short token
   */
  async create (data: DataVerifySignupShortWithAction): Promise<SanitizedUser>
  /**
   * sign up verification and set password  with long token
   */
  async create (data: DataVerifySignupSetPasswordLongWithAction): Promise<SanitizedUser>
  /**
   * sign up verification and set password with short token
   */
  async create (data: DataVerifySignupSetPasswordShortWithAction): Promise<SanitizedUser>
  /**
   * send forgotten password notification
   */
  async create (data: DataSendResetPwdWithAction): Promise<SanitizedUser>
  /**
   * forgotten password verification with long token
   */
  async create (data: DataResetPwdLongWithAction): Promise<SanitizedUser>
  /**
   * forgotten password verification with short token
   */
  async create (data: DataResetPwdShortWithAction): Promise<SanitizedUser>
  /**
   * change password
   */
  async create (data: DataPasswordChangeWithAction): Promise<SanitizedUser>
  /**
   * change communications
   */
  async create (data: DataIdentityChangeWithAction): Promise<SanitizedUser>
  /**
   * get options for AuthenticationManagement
   */
  async create (data: DataOptions): Promise<AuthenticationManagementOptions>
  async create (data: AuthenticationManagementData): Promise<unknown> {
    debug(`create called. action=${data.action}`);

    switch (data.action) {
      case 'checkUnique':
        try {
          return await this.checkUniqueService.create(data);
        } catch (err) {
          return await Promise.reject(err); // support both async and Promise interfaces
        }
      case 'resendVerifySignup':
        try {
          return await this.resendVerifySignupService.create(data);
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'verifySignupLong':
        try {
          return await this.verifySignupLongService.create(data);
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'verifySignupShort':
        try {
          return await this.verifySignupShortService.create(data);
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'verifySignupSetPasswordLong':
        try {
          return await this.verifySignupSetPasswordLongService.create(data);
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'verifySignupSetPasswordShort':
        try {
          return await this.verifySignupSetPasswordShortService.create(data);
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'sendResetPwd':
        try {
          return await this.sendResetPwdService.create(data);
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'resetPwdLong':
        try {
          return await this.resetPwdLongService.create(data);
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'resetPwdShort':
        try {
          return await this.resetPwdShortService.create(data);
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'passwordChange':
        try {
          return await this.passwordChangeService.create(data);
        } catch (err) {
          return await Promise.reject(err);
        }
      case 'identityChange':
        try {
          return await this.identityChangeService.create(data);
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
