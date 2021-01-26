import { resetPwdWithShortToken } from '../reset-password';
import { DataResetPwdShort, SanitizedUser, ResetPwdWithShortTokenOptions } from '../types';

export class ResetPwdShortService {
  options: ResetPwdWithShortTokenOptions;

  constructor (options: ResetPwdWithShortTokenOptions) {
    this.options = options;
  }

  async create (data: DataResetPwdShort): Promise<SanitizedUser> {
    return await resetPwdWithShortToken(
      this.options,
      data.value.token,
      data.value.user,
      data.value.password,
      data.notifierOptions
    );
  }
}
