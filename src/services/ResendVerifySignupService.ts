import { makeDefaultOptions } from '../options';
import resendVerifySignup from '../methods/resend-verify-signup';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  SanitizedUser,
  DataResendVerifySignup,
  ResendVerifySignupServiceOptions
} from '../types';
import type { Application, Params } from '@feathersjs/feathers';

export class ResendVerifySignupService
  extends AuthenticationManagementBase<DataResendVerifySignup, SanitizedUser, ResendVerifySignupServiceOptions> {
  constructor (app: Application, options?: Partial<ResendVerifySignupServiceOptions>) {
    super(app);

    const defaultOptions: ResendVerifySignupServiceOptions = makeDefaultOptions([
      'service',
      'notifier',
      'longTokenLen',
      'shortTokenLen',
      'shortTokenDigits',
      'delay',
      'identifyUserProps',
      'sanitizeUserForClient',
      'passParams'
    ]);

    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataResendVerifySignup, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await resendVerifySignup(
      this.optionsWithApp,
      data.user,
      data.notifierOptions,
      passedParams
    );
  }
}
