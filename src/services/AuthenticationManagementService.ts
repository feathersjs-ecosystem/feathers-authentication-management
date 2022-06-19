import makeDebug from 'debug';
import { BadRequest } from '@feathersjs/errors';

import { makeDefaultOptions } from '../options';
import checkUnique from '../methods/check-unique';
import identityChange from '../methods/identity-change';
import passwordChange from '../methods/password-change';
import resendVerifySignup from '../methods/resend-verify-signup';
import { resetPwdWithLongToken, resetPwdWithShortToken } from '../methods/reset-password';
import sendResetPwd from '../methods/send-reset-pwd';
import {
  verifySignupWithLongToken,
  verifySignupWithShortToken
} from '../methods/verify-signup';
import {
  verifySignupSetPasswordWithLongToken,
  verifySignupSetPasswordWithShortToken
} from '../methods/verify-signup-set-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
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
  SanitizedUser,
  DataCheckUnique,
  DataIdentityChange,
  DataPasswordChange,
  DataResendVerifySignup,
  DataResetPwdLong,
  DataResetPwdShort,
  DataSendResetPwd,
  DataVerifySignupLong,
  DataVerifySignupSetPasswordLong,
  DataVerifySignupSetPasswordShort,
  DataVerifySignupShort
} from '../types';
import type { Application, Params } from '@feathersjs/feathers';

const debug = makeDebug('authLocalMgnt:service');

type AllResultTypes = null | SanitizedUser | AuthenticationManagementServiceOptions | unknown;

export class AuthenticationManagementService
  extends AuthenticationManagementBase<AuthenticationManagementData, AllResultTypes, AuthenticationManagementServiceOptions> {
  constructor (
    app: Application,
    options?: Partial<AuthenticationManagementServiceOptions>
  ) {
    super(app);

    const defaultOptions = makeDefaultOptions();
    this.options = Object.assign({}, defaultOptions, options);
  }

  async _checkUnique (data: DataCheckUnique, params?: Params): Promise<unknown> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await checkUnique(
      this.optionsWithApp,
      data.user,
      data.ownId,
      data.meta,
      passedParams
    );
  }

  async checkUnique (data: DataCheckUnique, params?: Params): Promise<unknown> {
    return await this._checkUnique(data, params);
  }

  async _identityChange (data: DataIdentityChange, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await identityChange(
      this.optionsWithApp,
      data.user,
      data.password,
      data.changes,
      data.notifierOptions,
      passedParams
    );
  }

  async identityChange (data: DataIdentityChange, params?: Params): Promise<SanitizedUser> {
    return await this._identityChange(data, params);
  }

  async _passwordChange (data: DataPasswordChange, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await passwordChange(
      this.optionsWithApp,
      data.user,
      data.oldPassword,
      data.password,
      data.notifierOptions,
      passedParams
    );
  }

  async passwordChange (data: DataPasswordChange, params?: Params): Promise<SanitizedUser> {
    return await this._passwordChange(data, params);
  }

  async _resendVerifySignup (data: DataResendVerifySignup, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await resendVerifySignup(
      this.optionsWithApp,
      data.user,
      data.notifierOptions,
      passedParams
    );
  }

  async resendVerifySignup (data: DataResendVerifySignup, params?: Params): Promise<SanitizedUser> {
    return await this._resendVerifySignup(data, params);
  }

  async _resetPasswordLong (data: DataResetPwdLong, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await resetPwdWithLongToken(
      this.optionsWithApp,
      data.token,
      data.password,
      data.notifierOptions,
      passedParams
    );
  }

  async resetPasswordLong (data: DataResetPwdLong, params?: Params): Promise<SanitizedUser> {
    return await this._resetPasswordLong(data, params);
  }

  async _resetPasswordShort (data: DataResetPwdShort, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await resetPwdWithShortToken(
      this.optionsWithApp,
      data.token,
      data.user,
      data.password,
      data.notifierOptions,
      passedParams
    );
  }

  async resetPasswordShort (data: DataResetPwdShort, params?: Params): Promise<SanitizedUser> {
    return await this._resetPasswordShort(data, params);
  }

  async _sendResetPassword (data: DataSendResetPwd, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await sendResetPwd(
      this.optionsWithApp,
      data.user,
      data.notifierOptions,
      passedParams
    );
  }

  async sendResetPassword (data: DataSendResetPwd, params?: Params): Promise<SanitizedUser> {
    return await this._sendResetPassword(data, params);
  }

  async _verifySignupLong (data: DataVerifySignupLong, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await verifySignupWithLongToken(
      this.optionsWithApp,
      data.token,
      data.notifierOptions,
      passedParams
    );
  }

  async verifySignupLong (data: DataVerifySignupLong, params?: Params): Promise<SanitizedUser> {
    return await this._verifySignupLong(data, params);
  }

  async _verifySignupShort (data: DataVerifySignupShort, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await verifySignupWithShortToken(
      this.optionsWithApp,
      data.token,
      data.user,
      data.notifierOptions,
      passedParams
    );
  }

  async verifySignupShort (data: DataVerifySignupShort, params?: Params): Promise<SanitizedUser> {
    return await this._verifySignupShort(data, params);
  }

  async _verifySignupSetPasswordLong (data: DataVerifySignupSetPasswordLong, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await verifySignupSetPasswordWithLongToken(
      this.optionsWithApp,
      data.token,
      data.password,
      data.notifierOptions,
      passedParams
    );
  }

  async verifySignupSetPasswordLong (data: DataVerifySignupSetPasswordLong, params?: Params): Promise<SanitizedUser> {
    return await this._verifySignupSetPasswordLong(data, params);
  }

  async _verifySignupSetPasswordShort (data: DataVerifySignupSetPasswordShort, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await verifySignupSetPasswordWithShortToken(
      this.optionsWithApp,
      data.token,
      data.user,
      data.password,
      data.notifierOptions,
      passedParams
    );
  }

  async verifySignupSetPasswordShort (data: DataVerifySignupSetPasswordShort, params?: Params): Promise<SanitizedUser> {
    return await this._verifySignupSetPasswordShort(data, params);
  }

  /**
   * check props are unique in the users items.
   * @param data.action action is 'checkUnique'
   * @param data.value {IdentifyUser} the user with properties, e.g. {email, username}. Props with null or undefined are ignored.
   * @param data.ownId excludes your current user from the search
   * @param data.meta.noErrMsg if return an error.message if not unique
   */
  async _create (data: DataCheckUniqueWithAction, params?: Params): Promise<null>;
  /**
   * change communications
   * @param action action is 'identityChange'
   * @param value { changes, password, user }
   * @param notifierOptions
   */
  async _create (data: DataIdentityChangeWithAction, params?: Params): Promise<SanitizedUser>;
  /**
   * change password
   * @param action action is 'passwordChange'
   * @param value { oldPassword, password, user }
   * @param notifierOptions
   */
  async _create (data: DataPasswordChangeWithAction, params?: Params): Promise<SanitizedUser>;
  /**
   * resend sign up verification notification
   * @param action action is 'resendVerifySignup'
   * @param value {IdentifyUser} the user with properties, e.g. {email}, {token: verifyToken}
   * @param notifierOptions options passed to options.notifier
   */
  async _create (data: DataResendVerifySignupWithAction, params?: Params): Promise<SanitizedUser>;
  /**
   * forgotten password verification with long token
   * @param action action is 'resetPwdLong'
   * @param value { password, token, user }
   * @param notifierOptions
   */
  async _create (data: DataResetPwdLongWithAction, params?: Params): Promise<SanitizedUser>;
  /**
   * forgotten password verification with short token
   * @param action action is 'resetPwdShort'
   * @param value { password, token, user }
   * @param notifierOptions
   */
  async _create (data: DataResetPwdShortWithAction, params?: Params): Promise<SanitizedUser>;
  /**
   * send forgotten password notification
   * @param action action is 'sendResetPwd'
   * @param value { password, token }
   * @param notifierOptions
   */
  async _create (data: DataSendResetPwdWithAction, params?: Params): Promise<SanitizedUser>;
  /**
   * sign up or identityChange verification with long token
   * @param action action is 'verifySignupLong'
   * @param value // compares to user.verifyToken
   * @param notifierOptions options passed to options.notifier
   */
  async _create (data: DataVerifySignupLongWithAction): Promise<SanitizedUser>;
  /**
   * sign up or identityChange verification with short token
   * @param action action is 'verifySignupShort'
   * @param value { token, user }
   * @param notifierOptions
   */
  async _create (data: DataVerifySignupShortWithAction, params?: Params): Promise<SanitizedUser>;
  /**
   * sign up verification and set password  with long token
   * @param action action is 'verifySignupSetPasswordLong'
   * @param value { password, token }
   * @param notifierOptions
   */
  async _create (data: DataVerifySignupSetPasswordLongWithAction, params?: Params): Promise<SanitizedUser>;
  /**
   * sign up verification and set password with short token
   * @param action action is 'verifySignupSetPasswordShort'
   * @param value { password, token, user }
   * @param notifierOptions
   */
  async _create (data: DataVerifySignupSetPasswordShortWithAction, params?: Params): Promise<SanitizedUser>;
  /**
   * get options for AuthenticationManagement
   * @param action action is 'options'
   */
  async _create (data: DataOptions, params?: Params): Promise<AuthenticationManagementServiceOptions>;
  async _create (data: AuthenticationManagementData, params?: Params): Promise<AllResultTypes> {
    debug(`create called. action=${data.action}`);

    try {
      if (data.action === 'checkUnique') {
        return await this._checkUnique({
          user: data.value,
          meta: data.meta,
          ownId: data.ownId
        }, params);
      } else if (data.action === 'resendVerifySignup') {
        return await this._resendVerifySignup({
          user: data.value,
          notifierOptions: data.notifierOptions
        }, params);
      } else if (data.action === 'verifySignupLong') {
        return await this._verifySignupLong({
          token: data.value,
          notifierOptions: data.notifierOptions
        }, params);
      } else if (data.action === 'verifySignupShort') {
        return await this._verifySignupShort({
          token: data.value.token,
          user: data.value.user,
          notifierOptions: data.notifierOptions
        }, params);
      } else if (data.action === 'verifySignupSetPasswordLong') {
        return await this._verifySignupSetPasswordLong({
          password: data.value.password,
          token: data.value.token,
          notifierOptions: data.notifierOptions
        }, params);
      } else if (data.action === 'verifySignupSetPasswordShort') {
        return await this._verifySignupSetPasswordShort({
          password: data.value.password,
          token: data.value.token,
          user: data.value.user,
          notifierOptions: data.notifierOptions
        }, params);
      } else if (data.action === 'sendResetPwd') {
        return await this._sendResetPassword({
          user: data.value,
          notifierOptions: data.notifierOptions
        }, params);
      } else if (data.action === 'resetPwdLong') {
        return await this._resetPasswordLong({
          password: data.value.password,
          token: data.value.token,
          notifierOptions: data.notifierOptions
        }, params);
      } else if (data.action === 'resetPwdShort') {
        return await this._resetPasswordShort({
          password: data.value.password,
          token: data.value.token,
          user: data.value.user,
          notifierOptions: data.notifierOptions
        }, params);
      } else if (data.action === 'passwordChange') {
        return await this._passwordChange({
          oldPassword: data.value.oldPassword,
          password: data.value.password,
          user: data.value.user,
          notifierOptions: data.notifierOptions
        }, params);
      } else if (data.action === 'identityChange') {
        return await this._identityChange({
          changes: data.value.changes,
          password: data.value.password,
          user: data.value.user,
          notifierOptions: data.notifierOptions
        }, params);
      } else if (data.action === 'options') {
        return this.options;
      }
    } catch (err) {
      return await Promise.reject(err);
    }

    throw new BadRequest(
      //@ts-expect-error action is of type never
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Action '${data.action}' is invalid.`,
      { errors: { $className: 'badParams' } }
    );
  }
}
