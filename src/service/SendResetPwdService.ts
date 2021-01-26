import sendResetPwd from '../send-reset-pwd';
import { DataSendResetPwd, SanitizedUser, SendResetPwdOptions } from '../types';

export class SendResetPwdService {
  options: SendResetPwdOptions;

  constructor (options: SendResetPwdOptions) {
    this.options = options;
  }

  async create (data: DataSendResetPwd): Promise<SanitizedUser> {
    return await sendResetPwd(
      this.options,
      data.value,
      data.notifierOptions
    );
  }
}
