import { DataVerifySignupSetPasswordShort, SanitizedUser, VerifySignupSetPasswordWithShortTokenOptions } from '../types';
import { verifySignupSetPasswordWithShortToken } from '../verify-signup-set-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class VerifySignupSetPasswordShortService extends AuthenticationManagementBase {
  options: VerifySignupSetPasswordWithShortTokenOptions;

  constructor (options: VerifySignupSetPasswordWithShortTokenOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataVerifySignupSetPasswordShort): Promise<SanitizedUser> {
    return await verifySignupSetPasswordWithShortToken(
      this.options,
      data.value.token,
      data.value.user,
      data.value.password,
      data.notifierOptions
    );
  }
}
