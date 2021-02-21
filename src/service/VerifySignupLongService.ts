import { DataVerifySignupLong, SanitizedUser, VerifySignupOptions } from '../types';
import { verifySignupWithLongToken } from '../verify-signup';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class VerifySignupLongService extends AuthenticationManagementBase {
  options: VerifySignupOptions;

  constructor (options: VerifySignupOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataVerifySignupLong): Promise<SanitizedUser> {
    return await verifySignupWithLongToken(
      this.options,
      data.value,
      data.notifierOptions
    );
  }
}
