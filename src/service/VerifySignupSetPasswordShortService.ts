import { SetRequired } from 'type-fest';

import { makeDefaultOptions } from '.';
import ensureHasAllKeys from '../helpers/ensure-has-all-keys';
import { DataVerifySignupSetPasswordShort, SanitizedUser, VerifySignupSetPasswordWithShortTokenOptions } from '../types';
import { verifySignupSetPasswordWithShortToken } from '../verify-signup-set-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class VerifySignupSetPasswordShortService extends AuthenticationManagementBase {
  options: VerifySignupSetPasswordWithShortTokenOptions;

  constructor (options: SetRequired<Partial<VerifySignupSetPasswordWithShortTokenOptions>, 'app'>) {
    super();

    ensureHasAllKeys(options, ['app'], this.constructor.name);
    const defaultOptions: Omit<VerifySignupSetPasswordWithShortTokenOptions, 'app'> = makeDefaultOptions([
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
      this.options,
      data.value.token,
      data.value.user,
      data.value.password,
      data.notifierOptions
    );
  }
}
