import { makeDefaultOptions } from '../options';
import sendResetPwd from '../methods/send-reset-pwd';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  DataSendResetPwd,
  SanitizedUser,
  SendResetPwdServiceOptions
} from '../types';
import type { Application, Params } from '@feathersjs/feathers';

export class SendResetPwdService
  extends AuthenticationManagementBase<DataSendResetPwd, SanitizedUser, SendResetPwdServiceOptions> {
  constructor (app: Application, options?: Partial<SendResetPwdServiceOptions>) {
    super(app);

    const defaultOptions: SendResetPwdServiceOptions = makeDefaultOptions([
      'service',
      'identifyUserProps',
      'skipIsVerifiedCheck',
      'reuseResetToken',
      'resetDelay',
      'sanitizeUserForClient',
      'resetAttempts',
      'shortTokenLen',
      'longTokenLen',
      'shortTokenDigits',
      'notifier',
      'passwordField',
      'passParams'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataSendResetPwd, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await sendResetPwd(
      this.optionsWithApp,
      data.user,
      data.notifierOptions,
      passedParams
    );
  }
}
