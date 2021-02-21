import { DataVerifySignupShort, SanitizedUser, VerifySignupWithShortTokenOptions } from '../types';
import { verifySignupWithShortToken } from '../verify-signup';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class VerifySignupShortService extends AuthenticationManagementBase {
  options: VerifySignupWithShortTokenOptions;

  constructor (options: VerifySignupWithShortTokenOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataVerifySignupShort): Promise<SanitizedUser> {
    return await verifySignupWithShortToken(
      this.options,
      data.value.token,
      data.value.user,
      data.notifierOptions
    );
  }
}
