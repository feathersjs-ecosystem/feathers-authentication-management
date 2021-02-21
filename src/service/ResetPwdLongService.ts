import { resetPwdWithLongToken } from '../reset-password';
import { SanitizedUser, ResetPasswordOptions, DataResetPwdLong } from '../types';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class ResetPwdLongService extends AuthenticationManagementBase {
  options: ResetPasswordOptions;

  constructor (options: ResetPasswordOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataResetPwdLong): Promise<SanitizedUser> {
    return await resetPwdWithLongToken(
      this.options,
      data.value.token,
      data.value.password,
      data.notifierOptions
    );
  }
}
