import { makeDefaultOptions } from '../options';

import { verifySignupWithLongToken } from '../methods/verify-signup';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  DataVerifySignupLong,
  SanitizedUser,
  VerifySignupLongServiceOptions
} from '../types';
import { Application } from '@feathersjs/feathers';

export class VerifySignupLongService
  extends AuthenticationManagementBase<DataVerifySignupLong, SanitizedUser, VerifySignupLongServiceOptions> {
  constructor (app: Application, options?: Partial<VerifySignupLongServiceOptions>) {
    super(app);

    const defaultOptions = makeDefaultOptions([
      'service',
      'notifier',
      'sanitizeUserForClient'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataVerifySignupLong): Promise<SanitizedUser> {
    return await verifySignupWithLongToken(
      this.optionsWithApp,
      data.token,
      data.notifierOptions
    );
  }
}
