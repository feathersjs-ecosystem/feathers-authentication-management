import { makeDefaultOptions } from '../options';
import ensureHasAllKeys from '../helpers/ensure-has-all-keys';
import { resetPwdWithLongToken } from '../methods/reset-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type { SetRequired } from 'type-fest';
import type {
  SanitizedUser,
  ResetPasswordOptions,
  DataResetPwdLong
} from '../types';

export class ResetPwdLongService extends AuthenticationManagementBase<DataResetPwdLong, SanitizedUser> {
  options: ResetPasswordOptions;

  constructor (options: SetRequired<Partial<ResetPasswordOptions>, 'app'>) {
    super();

    ensureHasAllKeys(options, ['app'], this.constructor.name);
    const defaultOptions: Omit<ResetPasswordOptions, 'app'> = makeDefaultOptions([
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
      this.options,
      data.value.token,
      data.value.password,
      data.notifierOptions
    );
  }
}
