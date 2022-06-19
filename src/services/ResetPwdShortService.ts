import { makeDefaultOptions } from '../options';
import { resetPwdWithShortToken } from '../methods/reset-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  DataResetPwdShort,
  SanitizedUser,
  ResetPwdWithShortServiceOptions
} from '../types';
import type { Application, Params } from '@feathersjs/feathers';

export class ResetPwdShortService
  extends AuthenticationManagementBase<DataResetPwdShort, SanitizedUser, ResetPwdWithShortServiceOptions> {
  constructor (app: Application, options?: Partial<ResetPwdWithShortServiceOptions>) {
    super(app);

    const defaultOptions: ResetPwdWithShortServiceOptions = makeDefaultOptions([
      'service',
      'skipIsVerifiedCheck',
      'reuseResetToken',
      'notifier',
      'reuseResetToken',
      'sanitizeUserForClient',
      'passwordField',
      'identifyUserProps',
      'passParams'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataResetPwdShort, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await resetPwdWithShortToken(
      this.optionsWithApp,
      data.token,
      data.user,
      data.password,
      data.notifierOptions,
      passedParams
    );
  }
}
