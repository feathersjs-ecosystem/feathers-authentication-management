import { DataVerifySignupSetPasswordLong, SanitizedUser, VerifySignupSetPasswordOptions } from '../types';
import { verifySignupSetPasswordWithLongToken } from '../verify-signup-set-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class VerifySignupSetPasswordLongService extends AuthenticationManagementBase {
  options: VerifySignupSetPasswordOptions;

  constructor (options: VerifySignupSetPasswordOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataVerifySignupSetPasswordLong): Promise<SanitizedUser> {
    return await verifySignupSetPasswordWithLongToken(
      this.options,
      data.value.token,
      data.value.password,
      data.notifierOptions
    );
  }
}
