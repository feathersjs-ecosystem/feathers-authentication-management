import { makeDefaultOptions } from '../options';
import { verifySignupWithShortToken } from '../methods/verify-signup';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';
import type {
  DataVerifySignupShort,
  SanitizedUser,
  VerifySignupShortServiceOptions
} from '../types';

import type { Application } from '@feathersjs/feathers';

export class VerifySignupShortService
  extends AuthenticationManagementBase<DataVerifySignupShort, SanitizedUser, VerifySignupShortServiceOptions> {
  constructor (app: Application, options?: Partial<VerifySignupShortServiceOptions>) {
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

  async _create (data: DataVerifySignupShort): Promise<SanitizedUser> {
    return await verifySignupWithShortToken(
      this.optionsWithApp,
      data.token,
      data.user,
      data.notifierOptions
    );
  }
}
