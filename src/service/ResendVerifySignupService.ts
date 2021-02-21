import resendVerifySignup from '../resend-verify-signup';
import { SanitizedUser, ResendVerifySignupOptions, DataResendVerifySignup } from '../types';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class ResendVerifySignupService extends AuthenticationManagementBase {
  options: ResendVerifySignupOptions;

  constructor (options: ResendVerifySignupOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataResendVerifySignup): Promise<SanitizedUser> {
    return await resendVerifySignup(
      this.options,
      data.value,
      data.notifierOptions
    );
  }
}
