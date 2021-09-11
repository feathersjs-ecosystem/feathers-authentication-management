import { makeDefaultOptions } from '.';
import ensureHasAllKeys from '../helpers/ensure-has-all-keys';

import { verifySignupWithLongToken } from '../methods/verify-signup';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type { SetRequired } from 'type-fest';
import type {
  DataVerifySignupLong,
  SanitizedUser,
  VerifySignupOptions
} from '../types';

export class VerifySignupLongService extends AuthenticationManagementBase<DataVerifySignupLong, SanitizedUser> {
  options: VerifySignupOptions;

  constructor (options: SetRequired<Partial<VerifySignupOptions>, 'app'>) {
    super();

    ensureHasAllKeys(options, ['app'], this.constructor.name);
    const defaultOptions: Omit<VerifySignupOptions, 'app'> = makeDefaultOptions([
      'service',
      'notifier',
      'sanitizeUserForClient'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataVerifySignupLong): Promise<SanitizedUser> {
    return await verifySignupWithLongToken(
      this.options,
      data.value,
      data.notifierOptions
    );
  }
}
