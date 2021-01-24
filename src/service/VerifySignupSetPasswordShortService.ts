import { DataVerifySignupSetPasswordShort, SanitizedUser, VerifySignupSetPasswordWithShortTokenOptions } from '../types';
import { verifySignupSetPasswordWithShortToken } from '../verify-signup-set-password';

export class VerifySignupSetPasswordShortService {
  options: VerifySignupSetPasswordWithShortTokenOptions;

  constructor (options: VerifySignupSetPasswordWithShortTokenOptions) {
    this.options = options;
  }

  async create (data: DataVerifySignupSetPasswordShort): Promise<SanitizedUser> {
    return await verifySignupSetPasswordWithShortToken(
      this.options,
      data.value.token,
      data.value.user,
      data.value.password,
      this.options.passwordField,
      data.notifierOptions
    );
  }
}
