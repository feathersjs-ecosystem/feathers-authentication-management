import { makeDefaultOptions } from '../options';
import { verifySignupSetPasswordWithShortToken } from '../methods/verify-signup-set-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  DataVerifySignupSetPasswordShort,
  SanitizedUser,
  VerifySignupSetPasswordShortServiceOptions
} from '../types';
import type { Application } from '@feathersjs/feathers';

export class VerifySignupSetPasswordShortService
  extends AuthenticationManagementBase<DataVerifySignupSetPasswordShort, SanitizedUser, VerifySignupSetPasswordShortServiceOptions> {
  constructor (app: Application, options?: Partial<VerifySignupSetPasswordShortServiceOptions>) {
    super(app);

    const defaultOptions = makeDefaultOptions([
      'service',
      'notifier',
      'sanitizeUserForClient',
      'passwordField',
      'identifyUserProps'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataVerifySignupSetPasswordShort): Promise<SanitizedUser> {
    return await verifySignupSetPasswordWithShortToken(
      this.optionsWithApp,
      data.token,
      data.user,
      data.password,
      data.notifierOptions
    );
  }
}
