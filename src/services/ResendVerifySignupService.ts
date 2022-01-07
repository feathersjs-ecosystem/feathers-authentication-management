import { makeDefaultOptions } from '../options';
import resendVerifySignup from '../methods/resend-verify-signup';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  SanitizedUser,
  DataResendVerifySignup,
  ResendVerifySignupServiceOptions
} from '../types';
import type { Application } from '@feathersjs/feathers';

export class ResendVerifySignupService
  extends AuthenticationManagementBase<DataResendVerifySignup, SanitizedUser, ResendVerifySignupServiceOptions> {
  constructor (app: Application, options?: Partial<ResendVerifySignupServiceOptions>) {
    super(app);

    const defaultOptions = makeDefaultOptions([
      'service',
      'notifier',
      'longTokenLen',
      'shortTokenLen',
      'shortTokenDigits',
      'delay',
      'identifyUserProps',
      'sanitizeUserForClient'
    ]);

    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataResendVerifySignup): Promise<SanitizedUser> {
    return await resendVerifySignup(
      this.optionsWithApp,
      data.user,
      data.notifierOptions
    );
  }
}
