import { DataVerifySignupSetPasswordLong, SanitizedUser, VerifySignupSetPasswordOptions } from '../types';
import { verifySignupSetPasswordWithLongToken } from '../verify-signup-set-password';

export class VerifySignupSetPasswordLongService {
  options: VerifySignupSetPasswordOptions;

  constructor (options: VerifySignupSetPasswordOptions) {
    this.options = options;
  }

  async create (data: DataVerifySignupSetPasswordLong): Promise<SanitizedUser> {
    return await verifySignupSetPasswordWithLongToken(
      this.options,
      data.value.token,
      data.value.password,
      data.notifierOptions
    );
  }
}
