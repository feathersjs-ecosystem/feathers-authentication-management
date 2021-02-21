import sendResetPwd from '../send-reset-pwd';
import { DataSendResetPwd, SanitizedUser, SendResetPwdOptions } from '../types';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class SendResetPwdService extends AuthenticationManagementBase {
  options: SendResetPwdOptions;

  constructor (options: SendResetPwdOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataSendResetPwd): Promise<SanitizedUser> {
    return await sendResetPwd(
      this.options,
      data.value,
      data.notifierOptions
    );
  }
}
