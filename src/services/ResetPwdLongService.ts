import { makeDefaultOptions } from '../options';
import { resetPwdWithLongToken } from '../methods/reset-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  SanitizedUser,
  DataResetPwdLong,
  ResetPasswordServiceOptions
} from '../types';
import type { Application } from '@feathersjs/feathers';

export class ResetPwdLongService
  extends AuthenticationManagementBase<DataResetPwdLong, SanitizedUser, ResetPasswordServiceOptions> {
  constructor (app: Application, options?: Partial<ResetPasswordServiceOptions>) {
    super(app);

    const defaultOptions = makeDefaultOptions([
      'service',
      'skipIsVerifiedCheck',
      'notifier',
      'reuseResetToken',
      'sanitizeUserForClient',
      'passwordField'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataResetPwdLong): Promise<SanitizedUser> {
    return await resetPwdWithLongToken(
      this.optionsWithApp,
      data.value.token,
      data.value.password,
      data.notifierOptions
    );
  }
}
