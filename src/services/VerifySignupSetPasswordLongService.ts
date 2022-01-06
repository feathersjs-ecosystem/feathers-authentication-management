import { makeDefaultOptions } from '../options';
import { verifySignupSetPasswordWithLongToken } from '../methods/verify-signup-set-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import {
  DataVerifySignupSetPasswordLong,
  SanitizedUser,
  VerifySignupSetPasswordLongServiceOptions
} from '../types';
import { Application } from '@feathersjs/feathers';

export class VerifySignupSetPasswordLongService
  extends AuthenticationManagementBase<DataVerifySignupSetPasswordLong, SanitizedUser, VerifySignupSetPasswordLongServiceOptions> {
  constructor (app: Application, options?: Partial<VerifySignupSetPasswordLongServiceOptions>) {
    super(app);

    const defaultOptions = makeDefaultOptions([
      'service',
      'notifier',
      'sanitizeUserForClient',
      'passwordField'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataVerifySignupSetPasswordLong): Promise<SanitizedUser> {
    return await verifySignupSetPasswordWithLongToken(
      this.optionsWithApp,
      data.value.token,
      data.value.password,
      data.notifierOptions
    );
  }
}
