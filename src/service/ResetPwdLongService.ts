import { resetPwdWithLongToken } from '../reset-password';
import { SanitizedUser, ResetPasswordOptions, DataResetPwdLong } from '../types';

export class ResetPwdLongService {
  options: ResetPasswordOptions;

  constructor (options: ResetPasswordOptions) {
    this.options = options;
  }

  async create (data: DataResetPwdLong): Promise<SanitizedUser> {
    return await resetPwdWithLongToken(
      this.options,
      data.value.token,
      data.value.password,
      data.notifierOptions
    );
  }
}
