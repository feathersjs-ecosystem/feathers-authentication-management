import { resetPwdWithShortToken } from '../reset-password';
import { DataResetPwdShort, SanitizedUser, ResetPwdWithShortTokenOptions } from '../types';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class ResetPwdShortService extends AuthenticationManagementBase {
  options: ResetPwdWithShortTokenOptions;

  constructor (options: ResetPwdWithShortTokenOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataResetPwdShort): Promise<SanitizedUser> {
    return await resetPwdWithShortToken(
      this.options,
      data.value.token,
      data.value.user,
      data.value.password,
      data.notifierOptions
    );
  }
}
