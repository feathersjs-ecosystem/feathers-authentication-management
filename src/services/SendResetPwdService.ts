import { makeDefaultOptions } from '../options';
import sendResetPwd from '../methods/send-reset-pwd';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  DataSendResetPwd,
  SanitizedUser,
  SendResetPwdServiceOptions
} from '../types';
import type { Application } from '@feathersjs/feathers';

export class SendResetPwdService
  extends AuthenticationManagementBase<DataSendResetPwd, SanitizedUser, SendResetPwdServiceOptions> {

  constructor (app: Application, options?: Partial<SendResetPwdServiceOptions>) {
    super(app);

    const defaultOptions = makeDefaultOptions([
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
      'passwordField'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataSendResetPwd): Promise<SanitizedUser> {
    return await sendResetPwd(
      this.optionsWithApp,
      data.value,
      data.notifierOptions
    );
  }
}
