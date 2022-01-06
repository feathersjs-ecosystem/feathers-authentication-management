import { makeDefaultOptions } from '../options';
import { resetPwdWithShortToken } from '../methods/reset-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  DataResetPwdShort,
  SanitizedUser,
  ResetPwdWithShortServiceOptions
} from '../types';
import type { Application } from '@feathersjs/feathers';

export class ResetPwdShortService
  extends AuthenticationManagementBase<DataResetPwdShort, SanitizedUser, ResetPwdWithShortServiceOptions> {
  constructor (app: Application, options?: Partial<ResetPwdWithShortServiceOptions>) {
    super(app);

    const defaultOptions = makeDefaultOptions([
      'service',
      'skipIsVerifiedCheck',
      'reuseResetToken',
      'notifier',
      'reuseResetToken',
      'sanitizeUserForClient',
      'passwordField',
      'identifyUserProps'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataResetPwdShort): Promise<SanitizedUser> {
    return await resetPwdWithShortToken(
      this.optionsWithApp,
      data.value.token,
      data.value.user,
      data.value.password,
      data.notifierOptions
    );
  }
}
