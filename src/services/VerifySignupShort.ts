import { makeDefaultOptions } from '.';
import ensureHasAllKeys from '../helpers/ensure-has-all-keys';
import { verifySignupWithShortToken } from '../methods/verify-signup';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import { SetRequired } from 'type-fest';
import {
  DataVerifySignupShort,
  SanitizedUser,
  VerifySignupWithShortTokenOptions
} from '../types';

export class VerifySignupShortService extends AuthenticationManagementBase<DataVerifySignupShort, SanitizedUser> {
  options: VerifySignupWithShortTokenOptions;

  constructor (options: SetRequired<Partial<VerifySignupWithShortTokenOptions>, 'app'>) {
    super();

    ensureHasAllKeys(options, ['app'], this.constructor.name);
    const defaultOptions: Omit<VerifySignupWithShortTokenOptions, 'app'> = makeDefaultOptions([
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
      this.options,
      data.value.token,
      data.value.user,
      data.notifierOptions
    );
  }
}
