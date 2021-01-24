import resendVerifySignup from '../resend-verify-signup';
import { SanitizedUser, ResendVerifySignupOptions, DataResendVerifySignup } from '../types';

export class ResendVerifySignupService {
  options: ResendVerifySignupOptions;

  constructor (options: ResendVerifySignupOptions) {
    this.options = options;
  }

  async create (data: DataResendVerifySignup): Promise<SanitizedUser> {
    return await resendVerifySignup(
      this.options,
      data.value,
      data.notifierOptions
    );
  }
}
