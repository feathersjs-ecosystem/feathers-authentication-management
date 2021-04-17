import makeDebug from 'debug';
import { BadRequest } from '@feathersjs/errors';
import { SetRequired } from 'type-fest';

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
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import {
  AuthenticationManagementData,
  AuthenticationManagementServiceOptions,
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
import ensureHasAllKeys from '../helpers/ensure-has-all-keys';
import { makeDefaultOptions } from '.';

const debug = makeDebug('authLocalMgnt:service');

type AllResultTypes = null | SanitizedUser | AuthenticationManagementServiceOptions | unknown;

export class AuthenticationManagementService extends AuthenticationManagementBase<AuthenticationManagementData, AllResultTypes> {
  docs: unknown;
  options: AuthenticationManagementServiceOptions;

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

  constructor (
    options: SetRequired<Partial<AuthenticationManagementServiceOptions>, 'app'>,
    docs?: unknown
  ) {
    super();

    ensureHasAllKeys(options, ['app'], this.constructor.name);
    const defaultOptions: Omit<AuthenticationManagementServiceOptions, 'app'> = makeDefaultOptions([
      'service',
      'skipIsVerifiedCheck',
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
      'passwordField'
    ]);
    this.options = Object.assign(defaultOptions, options);

    this.docs = docs;

    this.checkUniqueService = new CheckUniqueService(this.options);
    this.identityChangeService = new IdentityChangeService(this.options);
    this.passwordChangeService = new PasswordChangeService(this.options);
    this.resendVerifySignupService = new ResendVerifySignupService(this.options);
    this.resetPwdLongService = new ResetPwdLongService(this.options);
    this.resetPwdShortService = new ResetPwdShortService(this.options);
    this.sendResetPwdService = new SendResetPwdService(this.options);
    this.verifySignupLongService = new VerifySignupLongService(this.options);
    this.verifySignupSetPasswordLongService = new VerifySignupSetPasswordLongService(this.options);
    this.verifySignupSetPasswordShortService = new VerifySignupSetPasswordShortService(this.options);
    this.verifySignupShortService = new VerifySignupShortService(this.options);
  }

  /**
   * check props are unique in the users items.
   * @param data.action action is 'checkUnique'
   * @param data.value {IdentifyUser} the user with properties, e.g. {email, username}. Props with null or undefined are ignored.
   * @param data.ownId excludes your current user from the search
   * @param data.meta.noErrMsg if return an error.message if not unique
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async _create ({ action, value, ownId, meta }: DataCheckUniqueWithAction): Promise<null>
  /**
   * change communications
   * @param action action is 'identityChange'
   * @param value { changes, password, user }
   * @param notifierOptions
   */
  async _create ({ action, value, notifierOptions }: DataIdentityChangeWithAction): Promise<SanitizedUser>
  /**
   * change password
   * @param action action is 'passwordChange'
   * @param value { oldPassword, password, user }
   * @param notifierOptions
   */
  async _create ({ action, value, notifierOptions }: DataPasswordChangeWithAction): Promise<SanitizedUser>
  /**
   * resend sign up verification notification
   * @param action action is 'resendVerifySignup'
   * @param value {IdentifyUser} the user with properties, e.g. {email}, {token: verifyToken}
   * @param notifierOptions options passed to options.notifier, e.g. {preferredComm: 'cellphone'}
   */
  async _create ({ action, value, notifierOptions }: DataResendVerifySignupWithAction): Promise<SanitizedUser>
  /**
   * forgotten password verification with long token
   * @param action action is 'resetPwdLong'
   * @param value { password, token, user }
   * @param notifierOptions
   */
  async _create ({ action, value, notifierOptions }: DataResetPwdLongWithAction): Promise<SanitizedUser>
  /**
   * forgotten password verification with short token
   * @param action action is 'resetPwdShort'
   * @param value { password, token, user }
   * @param notifierOptions
   */
  async _create ({ action, value, notifierOptions }: DataResetPwdShortWithAction): Promise<SanitizedUser>
  /**
   * send forgotten password notification
   * @param action action is 'sendResetPwd'
   * @param value { password, token }
   * @param notifierOptions
   */
  async _create ({ action, value, notifierOptions }: DataSendResetPwdWithAction): Promise<SanitizedUser>
  /**
   * sign up or identityChange verification with long token
   * @param action action is 'verifySignupLong'
   * @param value // compares to user.verifyToken
   * @param notifierOptions options passed to options.notifier, e.g. {preferredComm: 'cellphone'}
   */
  async _create ({ action, value, notifierOptions }: DataVerifySignupLongWithAction): Promise<SanitizedUser>
  /**
   * sign up or identityChange verification with short token
   * @param action action is 'verifySignupShort'
   * @param value { token, user }
   * @param notifierOptions
   */
  async _create ({ action, value, notifierOptions }: DataVerifySignupShortWithAction): Promise<SanitizedUser>
  /**
   * sign up verification and set password  with long token
   * @param action action is 'verifySignupSetPasswordLong'
   * @param value { password, token }
   * @param notifierOptions
   */
  async _create ({ action, value, notifierOptions }: DataVerifySignupSetPasswordLongWithAction): Promise<SanitizedUser>
  /**
   * sign up verification and set password with short token
   * @param action action is 'verifySignupSetPasswordShort'
   * @param value { password, token, user }
   * @param notifierOptions
   */
  async _create ({ action, value, notifierOptions }: DataVerifySignupSetPasswordShortWithAction): Promise<SanitizedUser>
  /**
   * get options for AuthenticationManagement
   * @param action action is 'options'
   */
  async _create ({ action }: DataOptions): Promise<AuthenticationManagementServiceOptions>
  async _create (data: AuthenticationManagementData): Promise<AllResultTypes> {
    debug(`create called. action=${data.action}`);

    try {
      if (data.action === 'checkUnique') {
        return await this.checkUniqueService.create(data);
      } else if (data.action === 'resendVerifySignup') {
        return await this.resendVerifySignupService.create(data);
      } else if (data.action === 'verifySignupLong') {
        return await this.verifySignupLongService.create(data);
      } else if (data.action === 'verifySignupShort') {
        return await this.verifySignupShortService.create(data);
      } else if (data.action === 'verifySignupSetPasswordLong') {
        return await this.verifySignupSetPasswordLongService.create(data);
      } else if (data.action === 'verifySignupSetPasswordShort') {
        return await this.verifySignupSetPasswordShortService.create(data);
      } else if (data.action === 'sendResetPwd') {
        return await this.sendResetPwdService.create(data);
      } else if (data.action === 'resetPwdLong') {
        return await this.resetPwdLongService.create(data);
      } else if (data.action === 'resetPwdShort') {
        return await this.resetPwdShortService.create(data);
      } else if (data.action === 'passwordChange') {
        return await this.passwordChangeService.create(data);
      } else if (data.action === 'identityChange') {
        return await this.identityChangeService.create(data);
      } else if (data.action === 'options') {
        return this.options;
      }
    } catch (err) {
      return await Promise.reject(err);
    }

    // @ts-expect-error this should not be reached
    throw new BadRequest(`Action '${data.action}' is invalid.`, { // eslint-disable-line
      errors: { $className: 'badParams' }
    });
  }
}
