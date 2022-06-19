import { makeDefaultOptions } from '../options';
import { resetPwdWithLongToken } from '../methods/reset-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  SanitizedUser,
  DataResetPwdLong,
  ResetPasswordServiceOptions
} from '../types';
import type { Application, Params } from '@feathersjs/feathers';

export class ResetPwdLongService
  extends AuthenticationManagementBase<DataResetPwdLong, SanitizedUser, ResetPasswordServiceOptions> {
  constructor (app: Application, options?: Partial<ResetPasswordServiceOptions>) {
    super(app);

    const defaultOptions: ResetPasswordServiceOptions = makeDefaultOptions([
      'service',
      'skipIsVerifiedCheck',
      'notifier',
      'reuseResetToken',
      'sanitizeUserForClient',
      'passwordField',
      'passParams'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataResetPwdLong, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await resetPwdWithLongToken(
      this.optionsWithApp,
      data.token,
      data.password,
      data.notifierOptions,
      passedParams
    );
  }
}
